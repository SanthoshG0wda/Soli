"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, FileText, UploadCloud, MessageSquare } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const items = [
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/documents/new", label: "Upload", icon: UploadCloud },
    { href: "/chat", label: "Chat", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 h-12 bg-[#0E1014] border-b border-[#1F242E] shrink-0">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-md bg-[#6366F1] flex items-center justify-center shadow-[0_0_0_1px_rgba(99,102,241,0.3)]">
              <Scale className="w-3.5 h-3.5 text-white" strokeWidth={1.9} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[14px] font-semibold tracking-[-0.02em] text-white">Soli</span>
              <span className="hidden sm:inline text-[10px] tracking-[0.11em] uppercase text-[#6B7280] font-medium">Legal Research</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {items.map((it) => {
              const Icon = it.icon;
              const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] leading-none transition-colors ${active ? "bg-[#151820] text-white border border-[#252A33] shadow-sm" : "text-[#9AA0A8] hover:text-white hover:bg-[#151820] border border-transparent"}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-[#6366F1]" : "text-[#6B7280]"}`} strokeWidth={active ? 2 : 1.7} />
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="w-7 h-7 rounded-full bg-[#1E222B] border border-[#252A33] text-white grid place-items-center text-[11px] font-semibold">AK</button>
          <Link href="/chat" className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#6366F1] text-white text-[13px] font-medium">
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </Link>
        </div>
      </div>

      <div className="md:hidden flex items-center gap-1 px-2 py-1.5 border-t border-[#1F242E] bg-[#0E1014] overflow-x-auto">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] whitespace-nowrap border ${active ? "bg-[#151820] text-white border-[#252A33]" : "text-[#9AA0A8] border-transparent"}`}>
              <it.icon className="w-3.5 h-3.5" />{it.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
