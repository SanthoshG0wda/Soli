"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Scale,
  FileText,
  UploadCloud,
  Search,
  BookOpen,
  Gavel,
  Layers,
  Library,
  ChevronDown,
  MessageSquare,
  CheckSquare,
  ShieldCheck,
} from "lucide-react";
import { listDocuments, Document } from "@/lib/api";

export default function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("all");

  useEffect(() => {
    listDocuments().catch(() => [] as Document[]).then(setDocuments);
    const saved = typeof window !== "undefined" ? localStorage.getItem("soli-selectedDocId") : null;
    if (saved) setSelectedDocId(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("soli-selectedDocId", selectedDocId);
    window.dispatchEvent(new CustomEvent("soli-scope-change", { detail: selectedDocId }));
  }, [selectedDocId]);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 lg:hidden"
        />
      )}
      <aside
        className={`${
          open ? "flex" : "hidden"
        } lg:flex fixed left-0 top-0 bottom-0 z-30 w-[240px] shrink-0 bg-[#0E1116] border-r border-[#1B202A] flex-col overflow-hidden`}
      >
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {/* Brand */}
          <div className="px-4 py-3.5 border-b border-[#1A1F2B]">
            <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg bg-[#6366F1] grid place-items-center shadow-[0_0_0_1px_rgba(99,102,241,0.3)]">
                <Scale className="w-4 h-4 text-white" strokeWidth={1.9} />
              </div>
              <div className="leading-none">
                <div className="text-[13px] font-bold tracking-[-0.02em] text-white">SOLI</div>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#818CF8] mt-0.5">Legal AI</div>
              </div>
            </Link>
          </div>

          {/* Workspace */}
          <div className="px-3 pt-4">
            <div className="px-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-[#6B7280]">Workspace</div>
            <nav className="mt-2 space-y-1">
              <Link
                href="/chat"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname === "/chat" ? "bg-[#161B26] text-white font-semibold shadow-xs" : "text-[#9CA3AF] hover:text-white hover:bg-[#13161F]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MessageSquare className={`w-4 h-4 ${pathname === "/chat" ? "text-[#6366F1]" : "text-[#6B7280]"}`} />
                  Chat
                </span>
                {pathname === "/chat" && <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />}
              </Link>
              <Link
                href="/documents"
                onClick={onClose}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname === "/documents" || (pathname.startsWith("/documents/") && pathname !== "/documents/new" && pathname !== "/documents/checklist")
                    ? "bg-[#161B26] text-white"
                    : "text-[#9CA3AF] hover:text-white hover:bg-[#13161F]"
                }`}
              >
                <FileText className={`w-4 h-4 ${pathname === "/documents" || (pathname.startsWith("/documents/") && pathname !== "/documents/new" && pathname !== "/documents/checklist") ? "text-[#6366F1]" : "text-[#6B7280]"}`} />
                <span>Documents</span>
              </Link>
              <Link
                href="/documents/checklist"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname === "/documents/checklist"
                    ? "bg-[#161B26] text-white font-semibold shadow-xs"
                    : "text-[#9CA3AF] hover:text-white hover:bg-[#13161F]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <CheckSquare className={`w-4 h-4 ${pathname === "/documents/checklist" ? "text-[#6366F1]" : "text-[#6B7280]"}`} />
                  <span>Corpus Checklist</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/30">8-Tier</span>
              </Link>
              <Link href="/documents/new" onClick={onClose} className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${pathname === "/documents/new" ? "bg-[#161B26] text-white" : "text-[#9CA3AF] hover:text-white hover:bg-[#13161F]"}`}>
                <UploadCloud className={`w-4 h-4 ${pathname === "/documents/new" ? "text-[#6366F1]" : "text-[#6B7280]"}`} />
                <span>Upload</span>
              </Link>
              <Link
                href="/evaluation"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname === "/evaluation"
                    ? "bg-[#161B26] text-white font-semibold shadow-xs"
                    : "text-[#9CA3AF] hover:text-white hover:bg-[#13161F]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 ${pathname === "/evaluation" ? "text-emerald-400" : "text-[#6B7280]"}`} />
                  <span>Benchmark & Trust</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Audit</span>
              </Link>
            </nav>
          </div>

          <div className="mx-4 mt-4 h-px bg-[#181D26]" />

          {/* Knowledge Base — now functional: filters Documents */}
          <div className="px-3 pt-4">
            <div className="px-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-[#6B7280]">Knowledge Base</div>
            <nav className="mt-2 space-y-0.5 text-xs text-[#9CA3AF]">
              <Link href="/documents?filter=act" onClick={onClose} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#13161F] hover:text-white cursor-pointer transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Acts</span>
              </Link>
              <Link href="/documents?filter=judgment" onClick={onClose} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#13161F] hover:text-white cursor-pointer transition-colors">
                <Gavel className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Judgments</span>
              </Link>
              <Link href="/documents?filter=regulation" onClick={onClose} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#13161F] hover:text-white cursor-pointer transition-colors">
                <Layers className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Rules & Regulations</span>
              </Link>
              <Link href="/documents?filter=book" onClick={onClose} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#13161F] hover:text-white cursor-pointer transition-colors">
                <Library className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Legal Books</span>
              </Link>
              <Link href="/documents?filter=case" onClick={onClose} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#13161F] hover:text-white cursor-pointer transition-colors">
                <FileText className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Case Files</span>
              </Link>
            </nav>
          </div>

          {pathname === "/chat" && (
            <div className="px-3 pt-4">
              <div className="px-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase text-[#6B7280]">Search Scope</div>
              <div className="relative mt-2">
                <select
                  value={selectedDocId}
                  onChange={e => setSelectedDocId(e.target.value)}
                  className="w-full appearance-none text-[12.5px] bg-[#141822] border border-[#1F2533] rounded-lg pl-3 pr-8 py-2 text-white focus:outline-none focus:border-[#6366F1] cursor-pointer"
                >
                  <option value="all">All Documents</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              </div>
            </div>
          )}

          <div className="flex-1 min-h-6" />

          {/* Status footer */}
          <div className="p-3 border-t border-[#1A1F2B] mt-auto">
            <div className="rounded-xl border border-[#1F2533] bg-[#121620] p-3">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" />
                Knowledge Base Connected
              </div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="shrink-0 border-t border-[#1A1F2B] bg-[#0E1014] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#6366F1] text-white grid place-items-center text-[11px] font-bold">AK</div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[12px] font-semibold text-white truncate">Advocate Workspace</div>
              <div className="text-[11px] text-[#6B7280] truncate">research@soli.legal</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
