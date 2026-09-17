"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#0B0D10] text-[#F1F2F3] antialiased">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px]">
        {/* Mobile top bar — hamburger to open permanent sidebar */}
        <header className="lg:hidden sticky top-0 z-20 h-12 bg-[#0E1116] border-b border-[#1B202A] flex items-center justify-between px-4 shrink-0">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-[#1A1F2B] text-[#9CA3AF] hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[13px] font-bold tracking-[-0.02em] text-white">SOLI</span>
          <div className="w-5" />
        </header>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
