"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, ExternalLink, ArrowLeft, Trash2, Loader2, X, Download } from "lucide-react";
import { getDocument, deleteDocument, Document, ApiError, getDownloadDocumentUrl } from "@/lib/api";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let m = true;
    getDocument(id).then(d => { if (m) { setDocument(d); setLoading(false); } }).catch((e: unknown) => { if (m) { setError((e as ApiError).message || "Failed to load."); setLoading(false); } });
    return () => { m = false; };
  }, [id]);

  const handleDelete = async () => {
    if (!document) return;
    setDeleting(true);
    try {
      await deleteDocument(document.id);
      router.push("/documents");
      router.refresh();
    } catch (e: unknown) {
      setError((e as ApiError).message || "Failed to delete document.");
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="max-w-[760px] mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/documents" className="inline-flex items-center gap-1.5 text-[13px] text-[#9AA0A8] hover:text-white"><ArrowLeft className="w-3.5 h-3.5" /> Library</Link>
        {document && !loading && (
          <div className="flex items-center gap-2">
            <a
              href={getDownloadDocumentUrl(document.id)}
              download={document.original_filename}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-xl border border-[#232936] bg-[#151820] text-[#D1D5DB] hover:text-white hover:bg-[#1C222F] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#818CF8]" /> Download Clean PDF
            </a>
            <button
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-xl border border-[#1F242E] bg-[#151820] text-[#9AA0A8] hover:text-[#FCA5A5] hover:border-[#7f1d1d] hover:bg-[#450a0a]/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        )}
      </div>

      {loading && <div className="rounded-2xl border border-[#1F242E] bg-[#101216] p-8 text-center text-[13px] text-[#6B7280]">Loading document…</div>}
      {error && <div className="rounded-xl bg-[#450a0a] border border-[#7f1d1d] px-3 py-2.5 text-[13px] text-[#FCA5A5] flex items-center justify-between"><span>{error}</span><button onClick={() => setError(null)} className="text-[#FCA5A5] hover:text-white ml-3">×</button></div>}

      {document && !loading && (
        <>
          <div className="rounded-2xl border border-[#1F242E] bg-[#101216] p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#151820] border border-[#1F242E] grid place-items-center shrink-0"><FileText className="w-5 h-5 text-[#6366F1]" /></div>
              <div className="min-w-0 flex-1">
                <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-white leading-tight">{document.title}</h1>
                <p className="text-[12px] text-[#9AA0A8] mt-1 truncate">{document.act_number || document.original_filename}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-mono text-[#818CF8] bg-[#6366F1]/10 px-2 py-0.5 rounded border border-[#6366F1]/20">
                    {document.original_filename}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">· Indexed {new Date(document.uploaded_at).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={getDownloadDocumentUrl(document.id)}
                download={document.original_filename}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download Standardized PDF
              </a>
              {document.source_url && (
                <a href={document.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#9AA0A8] hover:text-white px-2 py-1">
                  View Source Link <ExternalLink className="w-3 h-3 text-[#6366F1]" />
                </a>
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-[#1F242E] flex items-center justify-between">
              <span className="text-[11px] text-[#6B7280]">Vector embeddings and citations are active in Soli RAG search.</span>
              <button onClick={() => setConfirmOpen(true)} className="text-[11px] font-medium text-[#F87171] hover:text-[#FCA5A5] hover:underline">Remove from Knowledge Base</button>
            </div>
          </div>
        </>
      )}

      {confirmOpen && document && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close dialog" onClick={() => !deleting && setConfirmOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[440px] rounded-2xl border border-[#1F242E] bg-[#101216] shadow-xl overflow-hidden">
            <div className="px-5 pt-5 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#450a0a] border border-[#7f1d1d] grid place-items-center shrink-0">
                <Trash2 className="w-4 h-4 text-[#F87171]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[14px] font-semibold text-white">Remove document?</h2>
                <p className="text-[12px] leading-5 text-[#9AA0A8] mt-1">
                  <span className="font-medium text-white break-words">“{document.title}”</span> will be permanently deleted from your Knowledge Base and all associated RAG chunks will be removed from the vector database.
                </p>
              </div>
              <button onClick={() => !deleting && setConfirmOpen(false)} className="shrink-0 w-7 h-7 grid place-items-center rounded-lg hover:bg-[#191C23] text-[#6B7280] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-5 py-4 mt-2 flex items-center justify-end gap-2 bg-[#0E1014] border-t border-[#1F242E]">
              <button onClick={() => setConfirmOpen(false)} disabled={deleting} className="px-4 py-2 rounded-xl text-[13px] font-medium bg-[#151820] border border-[#1F242E] text-[#9AA0A8] hover:text-white disabled:opacity-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium bg-[#DC2626] hover:bg-[#B91C1C] text-white disabled:opacity-50 min-w-[108px] justify-center">
                {deleting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Removing…</> : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
