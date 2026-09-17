"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, UploadCloud, Search, Trash2, Loader2, AlertTriangle, X, CheckSquare, Scale } from "lucide-react";
import { listDocuments, deleteDocument, Document, ApiError } from "@/lib/api";

export default function DocumentsListPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const [confirmDoc, setConfirmDoc] = useState<Document | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      setError(null);
    } catch (err: unknown) {
      setError((err as ApiError).message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    listDocuments()
      .then(docs => { if (active) setDocuments(docs); })
      .catch((err: unknown) => { if (active) setError((err as ApiError).message || "Failed to load documents."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleDelete = async () => {
    if (!confirmDoc) return;
    setDeletingId(confirmDoc.id);
    setError(null);
    try {
      await deleteDocument(confirmDoc.id);
      setDocuments(prev => prev.filter(d => d.id !== confirmDoc.id));
      setNotification(`Removed “${confirmDoc.title}” from library and RAG database.`);
      setConfirmDoc(null);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = documents.filter(d => {
    const matchesQuery = !query || d.title.toLowerCase().includes(query.toLowerCase()) || (d.act_number || "").toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (!filter || filter === "all") return true;
    const hay = (d.title + " " + (d.act_number || "") + " " + d.original_filename).toLowerCase();
    if (filter === "act") return hay.includes("act") || !!d.act_number;
    if (filter === "judgment") return hay.includes("judgment") || hay.includes("judgement") || hay.includes(" vs ") || hay.includes("court");
    if (filter === "regulation") return hay.includes("rule") || hay.includes("regulation");
    if (filter === "book") return hay.includes("book") || hay.includes("commentary");
    if (filter === "case") return hay.includes("case");
    return true;
  });

  return (
    <div className="max-w-[1160px] mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-white">Documents</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/documents/checklist"
            className="inline-flex items-center gap-1.5 bg-[#151922] hover:bg-[#1E2430] border border-[#232936] text-[#A5B4FC] hover:text-white px-3.5 py-2 rounded-xl text-[13px] font-medium transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" /> Corpus Checklist
          </Link>
          <Link
            href="/documents/new"
            className="inline-flex items-center gap-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-[13px] font-medium transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Upload
          </Link>
        </div>
      </div>

      {/* Corpus Checklist Blueprint Callout Banner */}
      <div className="rounded-2xl border border-[#6366F1]/30 bg-radial from-[#1A1F2C] to-[#10131A] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#6366F1]/20 border border-[#6366F1]/30 grid place-items-center shrink-0">
            <Scale className="w-4 h-4 text-[#A5B4FC]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-white">
              Soli 8-Layer Criminal & Cybercrime Corpus Checklist
            </div>
            <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">
              Track the collection of ~90–135 high-value sources: BNS, BNSS, BSA, IT Act, CERT-In directions, and landmark electronic evidence case law.
            </p>
          </div>
        </div>
        <Link
          href="/documents/checklist"
          className="shrink-0 text-[12px] font-medium text-white bg-[#6366F1] hover:bg-[#4F46E5] px-3.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
        >
          Open To-Do Tracker →
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search documents…" className="w-full bg-[#151820] border border-[#1F242E] rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1]/40" />
      </div>

      {notification && <div className="bg-[#052e16] border border-[#14532d] rounded-xl px-3 py-2 flex items-center justify-between text-[13px] text-[#86EFAC]"><span>{notification}</span><button onClick={() => setNotification(null)} className="text-[#4ADE80] hover:text-white">×</button></div>}
      {error && <div className="bg-[#450a0a] border border-[#7f1d1d] rounded-xl px-3 py-2 text-[13px] text-[#FCA5A5] flex items-center justify-between"><span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />{error}</span><button onClick={() => setError(null)} className="ml-2 text-[#F87171] underline">Dismiss</button></div>}

      {loading ? (
        <div className="rounded-2xl border border-[#1F242E] bg-[#101216] p-12 text-center">
          <div className="w-6 h-6 rounded-full border-2 border-[#1F242E] border-t-[#6366F1] animate-spin mx-auto" />
          <p className="text-[13px] text-[#6B7280] mt-3">Loading library…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1F242E] bg-[#101216] p-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#151820] border border-[#1F242E] grid place-items-center mx-auto"><FileText className="w-5 h-5 text-[#4B5563]" /></div>
          <p className="text-[13px] font-medium text-white mt-3">No documents found</p>
          <p className="text-[12px] text-[#6B7280] mt-1">{query ? "Try a different search" : "Upload a PDF to build your library."}</p>
          {!query && <Link href="/documents/new" className="inline-flex mt-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-[13px] font-medium">Upload PDF</Link>}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1F242E] bg-[#101216] overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1.7fr_0.9fr] gap-3 px-4 py-2.5 bg-[#0E1014] border-b border-[#1F242E] text-[11px] font-semibold tracking-[0.06em] uppercase text-[#6B7280]">
            <span>Document</span><span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-[#1F242E]">
            {filtered.map(doc => (
              <div key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#151820] transition-colors group">
                <Link href={`/documents/${doc.id}`} className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-white group-hover:text-[#A5B4FC] truncate">{doc.title}</div>
                  <div className="text-[11px] text-[#6B7280] truncate">{doc.act_number || doc.original_filename}</div>
                </Link>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link href={`/documents/${doc.id}`} className="hidden sm:inline-flex text-[12px] font-medium text-[#9AA0A8] hover:text-white border border-[#1F242E] rounded-lg px-3 py-1.5 hover:bg-[#191C23]">View</Link>
                  <button
                    onClick={() => setConfirmDoc(doc)}
                    disabled={!!deletingId}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#1F242E] bg-[#151820] text-[#6B7280] hover:text-[#FCA5A5] hover:border-[#7f1d1d] hover:bg-[#450a0a]/30 disabled:opacity-50 transition-colors"
                    title={`Remove ${doc.title}`}
                    aria-label={`Remove ${doc.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal — dark premium */}
      {confirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close dialog" onClick={() => !deletingId && setConfirmDoc(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[440px] rounded-2xl border border-[#1F242E] bg-[#101216] shadow-xl overflow-hidden">
            <div className="px-5 pt-5 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#450a0a] border border-[#7f1d1d] grid place-items-center shrink-0">
                <Trash2 className="w-4 h-4 text-[#F87171]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[14px] font-semibold text-white">Remove document?</h2>
                <p className="text-[12px] leading-5 text-[#9AA0A8] mt-1">
                  <span className="font-medium text-white break-words">“{confirmDoc.title}”</span> will be permanently removed from your Knowledge Base and RAG vector database. Chunks and embeddings will be deleted. This cannot be undone.
                </p>
                {confirmDoc.act_number && <p className="text-[11px] font-mono text-[#6B7280] mt-1">{confirmDoc.act_number} · {confirmDoc.original_filename}</p>}
              </div>
              <button onClick={() => !deletingId && setConfirmDoc(null)} className="shrink-0 w-7 h-7 grid place-items-center rounded-lg hover:bg-[#191C23] text-[#6B7280] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-5 py-4 mt-2 flex items-center justify-end gap-2 bg-[#0E1014] border-t border-[#1F242E]">
              <button onClick={() => setConfirmDoc(null)} disabled={!!deletingId} className="px-4 py-2 rounded-xl text-[13px] font-medium bg-[#151820] border border-[#1F242E] text-[#9AA0A8] hover:text-white hover:bg-[#191C23] disabled:opacity-50">Cancel</button>
              <button onClick={handleDelete} disabled={!!deletingId} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium bg-[#DC2626] hover:bg-[#B91C1C] text-white disabled:opacity-50 min-w-[96px] justify-center">
                {deletingId === confirmDoc.id ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Removing…</> : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
