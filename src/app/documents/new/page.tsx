"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UploadCloud, X, FileText, ShieldCheck, CheckSquare, Zap, Loader2, Sparkles } from "lucide-react";
import { uploadDocument, fetchDocumentFromUrl, ApiError } from "@/lib/api";

function sanitizeFilenamePreview(title: string): string {
  const cleaned = title
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${cleaned.slice(0, 80) || "document"}.pdf`;
}

function markChecklistUploaded(
  itemId: string | null,
  docTitle: string,
  actNumber: string,
  sourceUrl: string
) {
  const keys = [
    "soli_corpus_checklist_v4",
    "soli_corpus_checklist_v3",
    "soli_corpus_checklist_v2",
    "soli_corpus_checklist_v1",
  ];

  const normDocTitle = docTitle.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) continue;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) continue;

      let changed = false;
      const updated = parsed.map((item: any) => {
        const matchesId = itemId && item.id === itemId;
        const matchesUrl =
          sourceUrl &&
          (item.sourceUrl === sourceUrl || item.altSourceUrl === sourceUrl);
        const matchesCitation =
          actNumber &&
          item.citation &&
          item.citation.toLowerCase().trim() === actNumber.toLowerCase().trim();

        let matchesTitle = false;
        if (item.title) {
          const normItemTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (normDocTitle && normItemTitle) {
            matchesTitle =
              normDocTitle === normItemTitle ||
              (Math.min(normDocTitle.length, normItemTitle.length) >= 8 &&
                (normDocTitle.includes(normItemTitle) || normItemTitle.includes(normDocTitle)));
          }
        }

        if (matchesId || matchesUrl || matchesCitation || matchesTitle) {
          changed = true;
          return { ...item, status: "uploaded" };
        }
        return item;
      });

      if (changed) {
        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }

  try {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("soli_checklist_updated"));
  } catch {
    // ignore
  }
}

function UploadDocumentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab: "fetch" (in-platform from URL) vs "upload" (local file)
  const [ingestMode, setIngestMode] = useState<"fetch" | "upload">("fetch");

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [actNumber, setActNumber] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [itemId, setItemId] = useState<string | null>(null);
  const [isFromChecklist, setIsFromChecklist] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  useEffect(() => {
    const qTitle = searchParams.get("title");
    const qActNumber = searchParams.get("act_number");
    const qSourceUrl = searchParams.get("source_url");
    const qItemId = searchParams.get("item_id");
    const qMode = searchParams.get("mode");

    if (qTitle) setTitle(qTitle);
    if (qActNumber) setActNumber(qActNumber);
    if (qSourceUrl) setSourceUrl(qSourceUrl);
    if (qItemId) setItemId(qItemId);

    if (qTitle || qActNumber || qSourceUrl || qItemId) {
      setIsFromChecklist(true);
      if (qMode === "upload") {
        setIngestMode("upload");
      } else if (qSourceUrl) {
        setIngestMode("fetch");
      }
    }
  }, [searchParams]);

  const validateAndSetFile = (selectedFile: File) => {
    setApiError(null);
    const hasPdfExt = selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!hasPdfExt) {
      setFile(null);
      setFileError("Only PDF files are accepted.");
      return;
    }
    if (selectedFile.size === 0) {
      setFile(null);
      setFileError("File is empty.");
      return;
    }
    setFile(selectedFile);
    setFileError(null);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " "));
    }
  };

  const isFormValid =
    title.trim().length > 0 &&
    (ingestMode === "fetch"
      ? sourceUrl.trim().length > 0
      : !!file && !fileError && actNumber.trim().length > 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isProcessing) return;
    setIsProcessing(true);
    setUploadProgress(0);
    setApiError(null);

    try {
      let createdDoc;
      if (ingestMode === "fetch") {
        // Direct in-platform fetch & index
        createdDoc = await fetchDocumentFromUrl({
          url: sourceUrl.trim(),
          title: title.trim(),
          act_number: actNumber.trim() || undefined,
        });
      } else {
        // Local file upload
        if (!file) return;
        createdDoc = await uploadDocument(
          {
            file,
            title: title.trim(),
            act_number: actNumber.trim(),
            source_url: sourceUrl.trim(),
          },
          (p) => setUploadProgress(p)
        );
      }

      // Mark as uploaded in all checklist storage keys
      markChecklistUploaded(itemId, title.trim(), actNumber.trim(), sourceUrl.trim());

      router.push(`/documents/${createdDoc.id}`);
    } catch (err: unknown) {
      setIsProcessing(false);
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        // Document is already indexed in the system! Update checklist!
        markChecklistUploaded(itemId, title.trim(), actNumber.trim(), sourceUrl.trim());
      }
      setApiError(apiErr);
    }
  };

  return (
    <div className="max-w-[680px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-white">Ingest Legal Document</h1>
          <p className="text-[12px] text-[#6B7280] mt-0.5">
            Auto-standardizes file naming, parses text, and indexes into Soli RAG citations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFromChecklist && (
            <Link
              href="/documents/checklist"
              className="text-[12.5px] text-[#A5B4FC] hover:text-white border border-[#6366F1]/30 bg-[#6366F1]/10 rounded-xl px-3 py-1.5 inline-flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Checklist
            </Link>
          )}
          <Link
            href="/documents"
            className="text-[13px] text-[#9AA0A8] hover:text-white border border-[#1F242E] bg-[#151820] rounded-xl px-3 py-1.5"
          >
            ← Library
          </Link>
        </div>
      </div>

      {isFromChecklist && (
        <div className="rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/30 px-3.5 py-2.5 text-[12.5px] text-[#C7D2FE] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#818CF8] shrink-0" />
            <span>Pre-filled from your <strong>Criminal & Cybercrime Blueprint</strong>. Ready to ingest.</span>
          </span>
          <Link href="/documents/checklist" className="underline text-white font-medium hover:text-[#A5B4FC] text-xs shrink-0">
            View Checklist
          </Link>
        </div>
      )}

      {apiError?.status === 409 && apiError.duplicateDetail && (
        <div className="rounded-xl bg-[#422006] border border-[#78350f] px-4 py-3 text-[13px] text-[#FDBA74]">
          Document already exists: “{apiError.duplicateDetail.existing_document_title}”.{" "}
          <Link href={`/documents/${apiError.duplicateDetail.existing_document_id}`} className="underline text-white font-medium">
            View in Library →
          </Link>
        </div>
      )}
      {apiError && apiError.status !== 409 && (
        <div className="rounded-xl bg-[#450a0a] border border-[#7f1d1d] px-4 py-2.5 text-[13px] text-[#FCA5A5]">
          {apiError.message}
        </div>
      )}

      {/* Ingestion Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#101216] border border-[#1F242E] rounded-2xl">
        <button
          type="button"
          onClick={() => setIngestMode("fetch")}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium transition-all ${
            ingestMode === "fetch"
              ? "bg-[#6366F1] text-white shadow-xs"
              : "text-[#9AA0A8] hover:text-white"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>In-Platform Ingest (From URL)</span>
        </button>
        <button
          type="button"
          onClick={() => setIngestMode("upload")}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium transition-all ${
            ingestMode === "upload"
              ? "bg-[#6366F1] text-white shadow-xs"
              : "text-[#9AA0A8] hover:text-white"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Local File</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1F242E] bg-[#101216] overflow-hidden">
        <div className="p-6 space-y-5">
          {/* TAB 1: Direct In-Platform Fetch */}
          {ingestMode === "fetch" && (
            <div className="rounded-xl bg-[#141822] border border-[#232A38] p-4 space-y-3">
              <div className="flex items-center gap-2 text-white font-medium text-[13px]">
                <Zap className="w-4 h-4 text-[#818CF8]" />
                <span>Zero-Download Ingestion</span>
              </div>
              <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
                Soli will fetch the official PDF or judgment text directly from the link, standardize the filename, and index it into RAG without requiring you to visit external websites or rename files.
              </p>

              <div>
                <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase text-[#9AA0A8] mb-1.5">
                  Direct Source / PDF / Portal URL *
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://www.mha.gov.in/… or https://escr.sci.gov.in/…"
                  required
                  disabled={isProcessing}
                  className="w-full bg-[#0B0C0F] border border-[#1F242E] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1]/40"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Upload Local File */}
          {ingestMode === "upload" && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isProcessing) setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]);
                }}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-7 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-[#6366F1] bg-[#6366F1]/10"
                    : file
                    ? "border-[#22C55E]/30 bg-[#052e16]/20"
                    : "border-[#1F242E] bg-[#0B0C0F] hover:border-[#252A33] hover:bg-[#0E1014]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
                  }}
                  disabled={isProcessing}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/20 grid place-items-center mx-auto">
                      <FileText className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <div className="text-[13px] font-medium text-white break-all">{file.name}</div>
                    <div className="text-[12px] text-[#6B7280]">{(file.size / 1024).toFixed(1)} KB · PDF</div>
                    {!isProcessing && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="inline-flex items-center gap-1 text-[12px] text-[#9AA0A8] hover:text-white mt-1"
                      >
                        <X className="w-3 h-3" /> Change File
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-[#151820] border border-[#1F242E] grid place-items-center mx-auto">
                      <UploadCloud className="w-5 h-5 text-[#6B7280]" />
                    </div>
                    <div className="text-[13px] font-medium text-white">
                      Drop local PDF or <span className="text-[#6366F1] underline">browse</span>
                    </div>
                    <div className="text-[12px] text-[#4B5563]">Any filename accepted (auto-standardized by Soli)</div>
                  </div>
                )}
              </div>
              {fileError && <p className="text-[12px] text-[#F87171]">{fileError}</p>}
            </div>
          )}

          {/* Common Fields: Title, Act Number, Source URL */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase text-[#9AA0A8] mb-1.5">
                Document Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bharatiya Nyaya Sanhita, 2023"
                required
                disabled={isProcessing}
                className="w-full bg-[#0B0C0F] border border-[#1F242E] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1]/40"
              />
            </div>

            {/* Live Filename Standardization Preview */}
            {title.trim() && (
              <div className="rounded-xl bg-[#131620] border border-[#1F2636] px-3 py-2 flex items-center justify-between text-[11.5px]">
                <span className="text-[#9CA3AF] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
                  Auto-Standardized Filename:
                </span>
                <span className="font-mono text-[#A5B4FC] font-medium">
                  {sanitizeFilenamePreview(title)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase text-[#9AA0A8] mb-1.5">
                  Act Number / Citation
                </label>
                <input
                  value={actNumber}
                  onChange={(e) => setActNumber(e.target.value)}
                  placeholder="e.g. Act No. 45 of 2023"
                  disabled={isProcessing}
                  className="w-full bg-[#0B0C0F] border border-[#1F242E] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1]/40"
                />
              </div>

              {ingestMode === "upload" && (
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.06em] uppercase text-[#9AA0A8] mb-1.5">
                    Source Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://mha.gov.in/…"
                    disabled={isProcessing}
                    className="w-full bg-[#0B0C0F] border border-[#1F242E] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1]/40"
                  />
                </div>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="rounded-xl bg-[#151820] border border-[#1F242E] p-3 space-y-2">
              <div className="flex justify-between text-[12px] text-[#9AA0A8]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#818CF8]" />
                  {ingestMode === "fetch"
                    ? "Downloading from source, standardizing filename & indexing into RAG…"
                    : `Uploading & chunking… ${uploadProgress}%`}
                </span>
                {ingestMode === "upload" && <span className="font-mono text-white">{uploadProgress}%</span>}
              </div>
              <div className="w-full h-1.5 bg-[#0B0C0F] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-[#6366F1] transition-all ${
                    ingestMode === "fetch" ? "w-3/4 animate-pulse" : ""
                  }`}
                  style={ingestMode === "upload" ? { width: `${uploadProgress}%` } : undefined}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#0E1014] border-t border-[#1F242E] flex items-center justify-between">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#4B5563]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Automatic filename cleaning · Private RAG embedding
          </span>
          <button
            type="submit"
            disabled={!isFormValid || isProcessing}
            className={`ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium text-white transition-all ${
              isFormValid && !isProcessing
                ? "bg-[#6366F1] hover:bg-[#4F46E5] shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
                : "bg-[#1F242E] text-[#4B5563] cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ingesting…
              </>
            ) : ingestMode === "fetch" ? (
              <>
                <Zap className="w-3.5 h-3.5" /> Fetch & Ingest In-Platform
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" /> Upload & Standardize
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewDocumentPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[640px] mx-auto p-12 text-center text-[13px] text-[#6B7280]">
          Loading ingestion form…
        </div>
      }
    >
      <UploadDocumentForm />
    </Suspense>
  );
}
