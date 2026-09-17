"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  Scale,
  Search,
  FileText,
  UploadCloud,
  Sparkles,
  LayoutGrid,
  BookOpen,
  Gavel,
  Layers,
  Library,
  ArrowUp,
  ArrowUpRight,
  Copy,
  Check,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
  X,
  PanelRightClose,
  PanelRightOpen,
  Square,
} from "lucide-react";
import { DefaultChatTransport } from "ai";
import { listDocuments, getRagStats, Document, RAGSource } from "@/lib/api";

type UIMessageWithData = {
  id: string;
  role: "user" | "assistant" | "system";
  content?: string;
  parts?: { type: string; text?: string; delta?: string; data?: unknown }[];
  annotations?: unknown[];
};

function getText(m: UIMessageWithData): string {
  if (typeof m.content === "string" && m.content) return m.content;
  if (Array.isArray(m.parts)) {
    return m.parts
      .filter((p) => p.type === "text" || p.type === "text-delta")
      .map((p) => p.text ?? p.delta ?? "")
      .join("");
  }
  return "";
}

function getSources(m: UIMessageWithData): RAGSource[] {
  if (Array.isArray(m.parts)) {
    const p = m.parts.find((x) => x.type === "data-sources");
    if (p && Array.isArray((p as { data?: unknown }).data)) {
      return (p as { data: RAGSource[] }).data;
    }
  }
  if (Array.isArray(m.annotations)) {
    for (const a of m.annotations as { type?: string; sources?: RAGSource[] }[]) {
      if (a?.type === "sources" && Array.isArray(a.sources)) return a.sources;
    }
  }
  return [];
}

// ── Citation & Source Helpers ────────────────────────────────────────────────

function getSourceType(source: RAGSource): string {
  const title = (source.document_title || "").toLowerCase();
  const act = (source.act_number || "").toLowerCase();
  const sec = (source.section_title || "").toLowerCase();

  if (
    title.includes("judgment") ||
    title.includes("judgement") ||
    title.includes(" vs ") ||
    title.includes(" v. ") ||
    title.includes("order") ||
    title.includes("appeal")
  ) {
    return "JUDGMENT";
  }
  if (
    title.includes("rules") ||
    title.includes("regulation") ||
    title.includes("notification") ||
    sec.includes("rule")
  ) {
    return "REGULATION";
  }
  if (title.includes("act") || act.includes("act") || sec.includes("section")) {
    return "ACT";
  }
  if (title.includes("commentary") || title.includes("book") || title.includes("treatise")) {
    return "BOOK";
  }
  if (title.includes("case file") || title.includes("file")) {
    return "CASE FILE";
  }
  return "DOCUMENT";
}

function formatSectionShort(sectionTitle: string | null): string {
  if (!sectionTitle) return "";
  const secMatch = sectionTitle.match(/Section\s+(\d+[a-zA-Z]*)/i);
  if (secMatch) return `§${secMatch[1]}`;
  const ruleMatch = sectionTitle.match(/Rule\s+(\d+[a-zA-Z]*)/i);
  if (ruleMatch) return `Rule ${ruleMatch[1]}`;
  const artMatch = sectionTitle.match(/Article\s+(\d+[a-zA-Z]*)/i);
  if (artMatch) return `Art. ${artMatch[1]}`;
  if (sectionTitle.includes(":")) return sectionTitle.split(":")[0].trim();
  return sectionTitle.slice(0, 16);
}

// ── Inline Citation with Hover Preview Tooltip ───────────────────────────────

function CitationBadge({
  num,
  source,
  isHighlighted,
  onClick,
  onHoverChange,
}: {
  num: number;
  source?: RAGSource;
  isHighlighted: boolean;
  onClick: () => void;
  onHoverChange?: (n: number | null) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(true);
    onHoverChange?.(num);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
      onHoverChange?.(null);
    }, 200);
  };

  const sourceType = source ? getSourceType(source) : "STATUTE";

  return (
    <div
      className="relative inline-flex align-baseline group/citation"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "inline-flex" }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(false);
          onClick();
        }}
        aria-label={`Source ${num}: ${source?.document_title || "Reference"}`}
        className={`inline-flex items-center justify-center min-w-[18px] h-[17px] px-1 rounded-[4px] text-[11px] font-semibold tracking-tight transition-all duration-150 align-baseline cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#818CF8] ${
          isHighlighted
            ? "bg-[#6366F1] text-white shadow-xs ring-1 ring-[#818CF8]"
            : "bg-[#6366F1]/15 text-[#A5B4FC] hover:bg-[#6366F1]/30 hover:text-white border border-[#6366F1]/30"
        }`}
      >
        {num}
      </button>

      {/* Hover Preview Tooltip */}
      {showTooltip && source && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-[280px] sm:w-[320px] max-w-[calc(100vw-32px)] p-3.5 rounded-xl bg-[#0F121A] border border-[#262E40] shadow-2xl text-left pointer-events-auto animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2433]">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded text-[10px] font-bold grid place-items-center bg-[#6366F1] text-white">
                {num}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#818CF8]">
                {sourceType}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowTooltip(false);
                onClick();
              }}
              className="text-[11px] font-medium text-[#818CF8] hover:text-[#A5B4FC] transition-colors cursor-pointer"
            >
              Open drawer →
            </button>
          </div>

          <div className="mt-2 text-[12.5px] font-semibold text-white leading-snug line-clamp-2">
            {source.document_title}
          </div>

          {source.section_title && (
            <div className="mt-1 text-[11.5px] text-[#A5B4FC] font-medium line-clamp-1">
              {source.section_title}
            </div>
          )}

          {source.content_preview && (
            <div className="mt-2 text-[11px] leading-relaxed text-[#9CA3AF] line-clamp-3 bg-[#090C12] p-2 rounded-lg border border-[#181D2A] font-mono">
              &ldquo;{source.content_preview.slice(0, 160)}...&rdquo;
            </div>
          )}

          <div className="mt-2.5 pt-2 border-t border-[#181D2A] flex items-center justify-between text-[11px]">
            <span className="text-[#6B7280]">Verified Legal Source</span>
            <Link
              href={source.document_id ? `/documents/${source.document_id}` : "/documents"}
              className="inline-flex items-center gap-1 text-[#818CF8] hover:text-white transition-colors"
              onClick={() => setShowTooltip(false)}
            >
              Open document <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function InlineFormatting({
  text,
  sources,
  highlightedSourceNum,
  onCitationClick,
  onCitationHover,
}: {
  text: string;
  sources?: RAGSource[];
  highlightedSourceNum?: number | null;
  onCitationClick?: (n: number) => void;
  onCitationHover?: (n: number | null) => void;
}) {
  if (!text) return null;
  const parts = text.split(/(\[(?:Source\s*)?\d+(?:\s*,\s*(?:Source\s*)?\d+)*\]|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, i) => {
        const citationMatch = part.match(/^\[((?:(?:Source\s*)?\d+\s*,\s*)*(?:Source\s*)?\d+)\]$/);
        if (citationMatch) {
          const numMatches = citationMatch[1].match(/\d+/g);
          if (numMatches && numMatches.length > 0) {
            return (
              <span key={i} className="inline-flex items-baseline gap-0.5 mx-0.5 align-baseline">
                {numMatches.map((numStr) => {
                  const n = parseInt(numStr, 10);
                  const src = sources?.find((s) => s.source_number === n) || sources?.[n - 1];
                  return (
                    <CitationBadge
                      key={n}
                      num={n}
                      source={src}
                      isHighlighted={highlightedSourceNum === n}
                      onClick={() => onCitationClick?.(n)}
                      onHoverChange={onCitationHover}
                    />
                  );
                })}
              </span>
            );
          }
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
          return (
            <em key={i} className="italic text-[#D1D5DB]">
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-[#161B24] border border-[#242C3C] font-mono text-[13px] text-[#E5E7EB]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Legal Research Answer Formatter ──────────────────────────────────────────

function FormattedLegalAnswer({
  text,
  sources,
  isStreaming,
  highlightedSourceNum,
  onCitationClick,
  onCitationHover,
}: {
  text: string;
  sources?: RAGSource[];
  isStreaming?: boolean;
  highlightedSourceNum?: number | null;
  onCitationClick?: (n: number) => void;
  onCitationHover?: (n: number | null) => void;
}) {
  if (!text) {
    if (isStreaming) {
      return (
        <div className="space-y-3 py-3">
          <div className="flex items-center gap-2 text-[13px] text-[#818CF8]">
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-ping" />
            <span className="font-medium">Researching connected sources...</span>
          </div>
          <div className="space-y-2.5 pt-1 max-w-[720px]">
            <div className="h-3.5 bg-[#161B26] rounded-md animate-pulse w-full" />
            <div className="h-3.5 bg-[#161B26] rounded-md animate-pulse w-11/12" />
            <div className="h-3.5 bg-[#161B26] rounded-md animate-pulse w-3/4" />
          </div>
        </div>
      );
    }
    return (
      <div className="py-2 text-[13.5px] text-[#9CA3AF] italic">
        No textual response recorded. Please enter a research query below.
      </div>
    );
  }

  const rawBlocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-5 text-[#E5E7EB] text-[15.5px] leading-[1.74]">
      {rawBlocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const isLastBlock = bIdx === rawBlocks.length - 1;

        // Headings — support # to ###### and plain legal section titles
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const content = headingMatch[2].trim();
          if (level === 1) {
            return (
              <h2 key={bIdx} className="text-[18px] font-bold text-white mt-8 mb-3 pb-2.5 border-b border-[#1E232E] tracking-[-0.01em]">
                <InlineFormatting
                  text={content}
                  sources={sources}
                  highlightedSourceNum={highlightedSourceNum}
                  onCitationClick={onCitationClick}
                  onCitationHover={onCitationHover}
                />
              </h2>
            );
          }
          if (level === 2) {
            return (
              <h3 key={bIdx} className="text-[15.5px] font-semibold text-white mt-7 mb-2.5">
                <InlineFormatting
                  text={content}
                  sources={sources}
                  highlightedSourceNum={highlightedSourceNum}
                  onCitationClick={onCitationClick}
                  onCitationHover={onCitationHover}
                />
              </h3>
            );
          }
          if (level <= 4) {
            return (
              <h4 key={bIdx} className="text-[12.5px] font-bold uppercase tracking-[0.07em] text-[#A5B4FC] mt-6 mb-2 border-l-2 border-[#6366F1]/40 pl-2.5">
                <InlineFormatting
                  text={content}
                  sources={sources}
                  highlightedSourceNum={highlightedSourceNum}
                  onCitationClick={onCitationClick}
                  onCitationHover={onCitationHover}
                />
              </h4>
            );
          }
          return (
            <h5 key={bIdx} className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF] mt-5 mb-1.5">
              <InlineFormatting
                text={content}
                sources={sources}
                highlightedSourceNum={highlightedSourceNum}
                onCitationClick={onCitationClick}
                onCitationHover={onCitationHover}
              />
            </h5>
          );
        }

        // Plain section titles without markdown — e.g. "Section 73: Compensation..." or "Executive Overview"
        const isPlainSectionHeading =
          !trimmed.includes("\n") &&
          trimmed.length < 110 &&
          !trimmed.endsWith(".") &&
          !/provides that|entitled to|burden of proof/i.test(trimmed) &&
          (/^Section\s+\d+\s*[:—–]/i.test(trimmed) ||
            /^(Executive Overview|Comprehensive Statutory Analysis|Structured Principles|Strict Grounding|Length & Depth|In conclusion)/i.test(trimmed));
        if (isPlainSectionHeading) {
          const isSection = /^Section\s+\d+/i.test(trimmed);
          return isSection ? (
            <h3 key={bIdx} className="text-[15px] font-semibold text-[#E0E7FF] mt-7 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#6366F1] shrink-0" />
              <InlineFormatting
                text={trimmed}
                sources={sources}
                highlightedSourceNum={highlightedSourceNum}
                onCitationClick={onCitationClick}
                onCitationHover={onCitationHover}
              />
            </h3>
          ) : (
            <h2 key={bIdx} className="text-[16px] font-bold text-white mt-8 mb-2.5 tracking-[-0.01em]">
              <InlineFormatting
                text={trimmed}
                sources={sources}
                highlightedSourceNum={highlightedSourceNum}
                onCitationClick={onCitationClick}
                onCitationHover={onCitationHover}
              />
            </h2>
          );
        }

        // Blockquotes / Statutory Extracts
        if (trimmed.startsWith(">")) {
          const q = trimmed
            .split("\n")
            .map((l) => l.replace(/^>\s?/, ""))
            .join("\n");
          return (
            <blockquote
              key={bIdx}
              className="border-l-2 border-[#6366F1] bg-[#121620] rounded-r-lg pl-4 py-3 my-3 text-[#D1D5DB] text-[14.5px] leading-relaxed"
            >
              <InlineFormatting
                text={q}
                sources={sources}
                highlightedSourceNum={highlightedSourceNum}
                onCitationClick={onCitationClick}
                onCitationHover={onCitationHover}
              />
            </blockquote>
          );
        }

        const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);

        // Clause Lists (e.g. (a), (b), (i), (ii))
        const isClauseList =
          lines.length > 0 && lines.every((l) => /^\([a-z0-9ivx]+\)/i.test(l));
        if (isClauseList) {
          return (
            <div key={bIdx} className="space-y-3.5 my-3.5">
              {lines.map((line, lIdx) => {
                const m = line.match(/^(\([a-z0-9ivx]+\))\s*(.*)$/i);
                const tag = m ? m[1] : `(${lIdx + 1})`;
                const content = m ? m[2] : line;
                const idx = String(lIdx + 1).padStart(2, "0");

                return (
                  <div key={lIdx} className="flex items-start gap-3.5 py-1">
                    <span className="text-[11px] font-mono font-semibold text-[#818CF8] bg-[#161B26] px-2 py-0.5 rounded border border-[#242C3D] shrink-0 mt-1 select-none">
                      {idx}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-[#E5E7EB] leading-[1.74]">
                        <InlineFormatting
                          text={content}
                          sources={sources}
                          highlightedSourceNum={highlightedSourceNum}
                          onCitationClick={onCitationClick}
                          onCitationHover={onCitationHover}
                        />
                      </p>
                      <span className="inline-block text-[11px] font-mono text-[#8B93A2] bg-[#12151E] px-2 py-0.5 rounded border border-[#1E232E]">
                        Clause {tag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Standard Numbered Lists (1., 2., 3.)
        const isNumberedList =
          lines.length > 0 && lines.every((l) => /^\d+[\.\)]\s+/.test(l));
        if (isNumberedList) {
          return (
            <div key={bIdx} className="space-y-3.5 my-3.5">
              {lines.map((line, lIdx) => {
                const content = line.replace(/^\d+[\.\)]\s+/, "");
                const idx = String(lIdx + 1).padStart(2, "0");

                return (
                  <div key={lIdx} className="flex items-start gap-3.5 py-1">
                    <span className="text-[11px] font-mono font-semibold text-[#818CF8] bg-[#161B26] px-2 py-0.5 rounded border border-[#242C3D] shrink-0 mt-1 select-none">
                      {idx}
                    </span>
                    <p className="flex-1 text-[#E5E7EB] leading-[1.74]">
                      <InlineFormatting
                        text={content}
                        sources={sources}
                        highlightedSourceNum={highlightedSourceNum}
                        onCitationClick={onCitationClick}
                        onCitationHover={onCitationHover}
                      />
                    </p>
                  </div>
                );
              })}
            </div>
          );
        }

        // Bullet Lists
        const isBulletList =
          lines.length > 0 && lines.every((l) => /^[-*•]\s+/.test(l));
        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-2.5 my-3 pl-1">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mt-2.5 shrink-0" />
                  <span className="flex-1 leading-[1.74]">
                    <InlineFormatting
                      text={line.replace(/^[-*•]\s+/, "")}
                      sources={sources}
                      highlightedSourceNum={highlightedSourceNum}
                      onCitationClick={onCitationClick}
                      onCitationHover={onCitationHover}
                    />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // Definition Lists — e.g. "Burden of Proof: Section 73 places..."
        const isDefinitionList =
          lines.length > 1 && lines.every(l => /^[^:]{2,36}:\s*\S/.test(l) && l.length < 360);
        if (isDefinitionList) {
          return (
            <dl key={bIdx} className="my-4 space-y-3 rounded-xl border border-[#1F242E] bg-[#0F121A] p-4">
              {lines.map((line, lIdx) => {
                const sep = line.indexOf(":");
                const term = line.slice(0, sep).trim();
                const def = line.slice(sep + 1).trim();
                return (
                  <div key={lIdx} className="flex flex-col sm:flex-row gap-1 sm:gap-4 py-1.5 border-b border-[#1A1F2B] last:border-0">
                    <dt className="text-[12px] font-bold tracking-[0.04em] uppercase text-[#A5B4FC] shrink-0 sm:w-[150px] sm:text-right">{term}</dt>
                    <dd className="text-[14px] leading-[1.7] text-[#E5E7EB] flex-1 min-w-0">
                      <InlineFormatting
                        text={def}
                        sources={sources}
                        highlightedSourceNum={highlightedSourceNum}
                        onCitationClick={onCitationClick}
                        onCitationHover={onCitationHover}
                      />
                    </dd>
                  </div>
                );
              })}
            </dl>
          );
        }

        return (
          <div key={bIdx} className="leading-[1.74] text-[#E5E7EB]">
            <InlineFormatting
              text={trimmed}
              sources={sources}
              highlightedSourceNum={highlightedSourceNum}
              onCitationClick={onCitationClick}
              onCitationHover={onCitationHover}
            />
            {isStreaming && isLastBlock && (
              <span className="inline-block w-2 h-4 bg-[#6366F1] animate-pulse ml-1 align-middle" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Compact Sources Strip Under the Answer ───────────────────────────────────

function SourceStrip({
  sources,
  highlightedIndex,
  onSourceClick,
  onHoverChange,
}: {
  sources: RAGSource[];
  highlightedIndex: number | null;
  onSourceClick: (num: number) => void;
  onHoverChange?: (num: number | null) => void;
}) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-7 pt-5 border-t border-[#1C2230]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#8B93A2] uppercase select-none">
          <BookOpen className="w-3.5 h-3.5 text-[#6366F1]" />
          <span>Sources</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#141822] border border-[#202736] text-[#818CF8]">
            {sources.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSourceClick(1)}
          className="text-[11px] font-medium text-[#818CF8] hover:text-[#A5B4FC] transition-colors cursor-pointer"
        >
          View all in drawer →
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {sources.map((src, idx) => {
          const num = idx + 1;
          const isHighlighted = highlightedIndex === num;
          const shortSection = formatSectionShort(src.section_title);

          return (
            <button
              key={src.chunk_id || idx}
              type="button"
              id={`source-strip-chip-${num}`}
              onClick={() => onSourceClick(num)}
              onMouseEnter={() => onHoverChange?.(num)}
              onMouseLeave={() => onHoverChange?.(null)}
              className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-150 cursor-pointer text-xs group ${
                isHighlighted
                  ? "bg-[#181D2A] border border-[#6366F1] ring-1 ring-[#6366F1]/50 text-white shadow-xs"
                  : "bg-[#11141B] hover:bg-[#151924] border border-[#1C212B] hover:border-[#2C364A] text-[#D1D5DB]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded text-[10px] font-bold grid place-items-center shrink-0 transition-colors ${
                  isHighlighted
                    ? "bg-[#6366F1] text-white"
                    : "bg-[#191E2B] text-[#818CF8] group-hover:bg-[#6366F1] group-hover:text-white"
                }`}
              >
                {num}
              </span>
              <span className="font-medium truncate max-w-[140px] sm:max-w-[190px]">
                {src.document_title}
              </span>
              {shortSection && (
                <span className="text-[11px] font-mono text-[#818CF8] shrink-0">
                  · {shortSection}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Overlay Slide-out Source Detail Drawer ───────────────────────────────────

function SourceDrawer({
  sources,
  open,
  selectedSourceNum,
  onClose,
  onSelectSource,
}: {
  sources: RAGSource[];
  open: boolean;
  selectedSourceNum: number | null;
  onClose: () => void;
  onSelectSource: (num: number) => void;
}) {
  const drawerListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected source when opened or selected
  useEffect(() => {
    if (open && selectedSourceNum && drawerListRef.current) {
      const el = document.getElementById(`drawer-source-${selectedSourceNum}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [open, selectedSourceNum]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay Backdrop — subtle so user can still see answer behind */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[1.5px] transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
    </>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export default function RAGChatPage() {
  const pathname = usePathname();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<{ total_chunks: number } | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>(() => { if (typeof window !== "undefined") return localStorage.getItem("soli-selectedDocId") || "all"; return "all"; });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [activeSources, setActiveSources] = useState<RAGSource[] | null>(null);
  const [sourceDrawerOpen, setSourceDrawerOpen] = useState(false);
  const [selectedSourceNum, setSelectedSourceNum] = useState<number | null>(null);
  const [hoveredSourceNum, setHoveredSourceNum] = useState<number | null>(null);
  const highlightedSourceNum = hoveredSourceNum ?? selectedSourceNum;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: { selectedDocId } }),
  } as unknown as never);

  const isLoading = status === "submitted" || status === "streaming";
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const onScope = (e: Event) => { const d = (e as CustomEvent).detail as string; if (d) setSelectedDocId(d); };
    window.addEventListener("soli-scope-change", onScope as EventListener);
    const onStorage = () => { const v = localStorage.getItem("soli-selectedDocId"); if (v) setSelectedDocId(v); };
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener("soli-scope-change", onScope as EventListener); window.removeEventListener("storage", onStorage); };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([listDocuments().catch(() => [] as Document[]), getRagStats().catch(() => null)]).then(([docs, s]) => {
      if (active) {
        setDocuments(docs as Document[]);
        if (s) setStats({ total_chunks: s.total_chunks });
      }
    });
    const onFocus = () => {
      listDocuments().catch(() => [] as Document[]).then(docs => { if (active) setDocuments(docs as Document[]); });
      getRagStats().catch(() => null).then(s => { if (active && s) setStats({ total_chunks: s.total_chunks }); });
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  // Hydrate chat messages from localStorage, pruning any empty assistant responses
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soli-chat-messages");
      if (saved) {
        const parsed = JSON.parse(saved) as UIMessageWithData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validMessages = parsed.filter((m) => {
            if (m.role === "assistant") {
              const txt = getText(m);
              return Boolean(txt && txt.trim().length > 0);
            }
            return true;
          });
          if (validMessages.length > 0) {
            setMessages(validMessages as unknown as never);
            const lastAssistant = [...validMessages].reverse().find((m) => m.role === "assistant");
            if (lastAssistant) {
              const srcs = getSources(lastAssistant as UIMessageWithData);
              setActiveSources(srcs);
            }
          }
        }
      }
    } catch {}
    setIsHydrated(true);
  }, [setMessages]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (messages.length > 0) {
        localStorage.setItem("soli-chat-messages", JSON.stringify(messages));
      } else {
        localStorage.removeItem("soli-chat-messages");
      }
    } catch {}
  }, [messages, isHydrated]);

  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant") as
      | UIMessageWithData
      | undefined;
    if (lastAssistant) {
      const sources = getSources(lastAssistant);
      setActiveSources(sources);
    } else {
      setActiveSources(null);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(Math.max(el.scrollHeight, 60), 180) + "px";
  }, [input]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input } as unknown as never, { body: { selectedDocId } } as unknown as never);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      sendMessage({ text: input } as unknown as never, { body: { selectedDocId } } as unknown as never);
      setInput("");
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage({ text: prompt } as unknown as never, { body: { selectedDocId } } as unknown as never);
  };

  const handleCitationClick = (n: number) => {
    setSelectedSourceNum(n);
    setSourceDrawerOpen(true);
  };

  const selectedDocTitle =
    selectedDocId === "all"
      ? "All Documents"
      : documents.find((d) => d.id === selectedDocId)?.title || "Selected Document";
  const hasConversation = messages.length > 0;

  const firstUserMessage = messages.find((m) => m.role === "user");
  const firstUserQuery = firstUserMessage
    ? getText(firstUserMessage as UIMessageWithData)
    : "Legal Research Session";

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant") as
    | UIMessageWithData
    | undefined;
  const lastAssistantText = lastAssistant ? getText(lastAssistant) : "";

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden bg-[#0B0D10]">
      {/* ── MAIN AREA — 2 SEPARATE DIVS (Chat + Sources) ────────────────────── */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* CHAT INTERFACE DIV — separate scrollbar, input fixed at bottom */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0B0D10] border-r border-[#1B202A]/0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2.5 border-b border-[#1A1F2B] bg-[#0E1116] shrink-0">
          <button
            className="inline-flex items-center gap-1.5 text-[13px] text-[#E5E7EB] px-2.5 py-1.5 rounded-md border border-[#222836] bg-[#141822]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{selectedDocTitle}</span>
          </button>
          {hasConversation && (
            <button
              onClick={() => {
                setMessages([] as never);
                setActiveSources(null);
              }}
              className="text-[13px] text-[#9CA3AF] hover:text-white inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Top Research Session Header (Clean, Compact, Informative) */}
        {hasConversation && (
          <div className="px-6 py-2.5 border-b border-[#1A1F2B] bg-[#0C0E14] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] uppercase text-[#818CF8] shrink-0">
                <Scale className="w-3.5 h-3.5 text-[#6366F1]" />
                <span>Legal Research</span>
              </div>
              <span className="text-[#374151] select-none">•</span>
              <span className="text-[13px] font-medium text-white truncate max-w-[520px]">
                {firstUserQuery}
              </span>
              {activeSources && activeSources.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSourceNum(1);
                    setSourceDrawerOpen(true);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#131722] hover:bg-[#1A2030] border border-[#202736] hover:border-[#6366F1]/50 text-[#8B93A2] hover:text-[#A5B4FC] shrink-0 cursor-pointer transition-colors"
                  title="View sources in drawer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  {activeSources.length} sources
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMessages([] as never);
                  setActiveSources(null);
                  setSourceDrawerOpen(false);
                  setSelectedSourceNum(null);
                }}
                className="text-xs text-[#8B93A2] hover:text-white px-2.5 py-1 rounded-md hover:bg-[#161B26] flex items-center gap-1 transition-colors cursor-pointer"
                title="New research session"
              >
                <RotateCcw className="w-3 h-3" />
                <span>New Query</span>
              </button>
            </div>
          </div>
        )}

          {/* ── Center Content Area with Scrollable Conversation & Bottom Composer ── */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Conversation */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              <div className="max-w-[820px] w-full mx-auto min-w-0">
              {!hasConversation ? (
                /* Empty State - Minimal & Focused */
                <div className="pt-16 sm:pt-28 pb-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] grid place-items-center shadow-lg shadow-[#6366F1]/20 mb-5">
                    <Scale className="w-6 h-6 text-white" strokeWidth={2.2} />
                  </div>
                  <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] text-white leading-tight">
                    Indian Legal Research Workspace
                  </h1>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-[#9CA3AF] max-w-[540px]">
                    Ask questions across your indexed Indian Acts, statutory provisions, and judicial precedents. Answers are directly synthesized and citation-grounded.
                  </p>
                </div>
              ) : (
                /* Active Conversation Flow (Substantial, Professional Research Document Layout) */
                <div className="space-y-10 pb-6">
                  {messages.map((m, mIdx) => {
                    const isUser = m.role === "user";
                    const text = getText(m as UIMessageWithData);
                    const sources = !isUser ? getSources(m as UIMessageWithData) : [];
                    const isStreaming =
                      isLoading && m.id === messages[messages.length - 1]?.id && m.role === "assistant";

                    return (
                      <div key={m.id || mIdx} className="space-y-6">
                        {isUser ? (
                          /* User Query (Aligned Right within Central Column, Elevated Surface) */
                          <div className="flex justify-end pt-1">
                            <div className="max-w-[720px] w-full bg-[#161A24] border border-[#222938] text-white rounded-2xl rounded-br-sm p-4 sm:p-5 shadow-xs">
                              <p className="text-[15px] sm:text-[15.5px] leading-relaxed whitespace-pre-wrap font-medium text-[#F3F4F6]">
                                {text}
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Soli Response: Native Soli Hierarchy (Header -> Answer with Citations -> Source Strip -> Follow-ups) */
                          <div className="w-full pt-1">
                            {/* ── Soli Response Header ── */}
                            <div className="flex items-center justify-between pb-3 border-b border-[#1C2230] mb-5">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#4F46E5] grid place-items-center shadow-xs shrink-0">
                                  <Scale className="w-4 h-4 text-white" strokeWidth={2.2} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[15px] font-bold text-white tracking-tight">
                                    Soli
                                  </span>
                                  <span className="text-[11px] font-medium text-[#818CF8]">
                                    Legal Research Assistant
                                  </span>
                                </div>
                                {sources.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedSourceNum(1);
                                      setSourceDrawerOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#161B26] hover:bg-[#1F2535] border border-[#242C3D] hover:border-[#6366F1]/50 text-[#A5B4FC] hover:text-white transition-all cursor-pointer select-none"
                                    title="Open sources drawer"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                                    <span>{sources.length} sources · Grounded</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {text && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(text, m.id)}
                                    className="p-1.5 rounded-lg hover:bg-[#1A1F2B] text-[#8B93A2] hover:text-white border border-transparent hover:border-[#222836] transition-colors cursor-pointer"
                                    title="Copy answer"
                                  >
                                    {copiedId === m.id ? (
                                      <Check className="w-4 h-4 text-[#22C55E]" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Main Answer Area - Detailed Legal Output with Inline Citations */}
                            <div className="min-w-0">
                              <FormattedLegalAnswer
                                text={text}
                                sources={sources}
                                isStreaming={isStreaming}
                                highlightedSourceNum={highlightedSourceNum}
                                onCitationClick={(n) => {
                                  setSelectedSourceNum(n);
                                  setSourceDrawerOpen(true);
                                }}
                                onCitationHover={(n) => setHoveredSourceNum(n)}
                              />
                            </div>

                            {/* Compact Sources Strip Under the Answer */}
                            {!isStreaming && sources.length > 0 && (
                              <SourceStrip
                                sources={sources}
                                highlightedIndex={highlightedSourceNum}
                                onSourceClick={(n) => {
                                  setSelectedSourceNum(n);
                                  setSourceDrawerOpen(true);
                                }}
                                onHoverChange={(n) => setHoveredSourceNum(n)}
                              />
                            )}

                            {/* Follow-up Exploration Actions */}
                            {!isStreaming && sources.length > 0 && (
                              <div className="mt-5 pt-4 border-t border-[#1A1F2C] flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-medium text-[#6B7280] mr-1 select-none">
                                  Explore further:
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePromptClick(
                                      `Explain ${sources[0]?.section_title || "Section 73"} in detail with statutory conditions`
                                    )
                                  }
                                  className="px-3 py-1 rounded-full bg-[#131620] border border-[#202634] text-[11.5px] font-medium text-[#9CA3AF] hover:text-white hover:border-[#6366F1] hover:bg-[#181D29] transition-all cursor-pointer"
                                >
                                  Explore {formatSectionShort(sources[0]?.section_title) || "Section 73"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePromptClick(
                                      "Compare the remedies available under Section 73 versus Section 74 of the Indian Contract Act."
                                    )
                                  }
                                  className="px-3 py-1 rounded-full bg-[#131620] border border-[#202634] text-[11.5px] font-medium text-[#9CA3AF] hover:text-white hover:border-[#6366F1] hover:bg-[#181D29] transition-all cursor-pointer"
                                >
                                  Compare §§ 73 & 74
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePromptClick(
                                      "Find judgments on breach of contract and compensation."
                                    )
                                  }
                                  className="px-3 py-1 rounded-full bg-[#131620] border border-[#202634] text-[11.5px] font-medium text-[#9CA3AF] hover:text-white hover:border-[#6366F1] hover:bg-[#181D29] transition-all cursor-pointer"
                                >
                                  Find related judgments
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Active Generation Skeleton when waiting for response */}
                  {isLoading && !lastAssistantText && (
                    <div className="w-full pt-2 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#4F46E5] grid place-items-center shadow-xs shrink-0">
                          <Scale className="w-4 h-4 text-white animate-pulse" strokeWidth={2.2} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold text-white tracking-tight">
                              Soli
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#161B26] border border-[#242C3D] text-[#818CF8]">
                              Legal Research Assistant
                            </span>
                          </div>
                          <div className="text-[11.5px] text-[#818CF8] flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-ping" />
                            <span>Researching connected sources...</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 max-w-[760px]">
                        <div className="h-4 bg-[#141822] rounded-md animate-pulse w-full" />
                        <div className="h-4 bg-[#141822] rounded-md animate-pulse w-11/12" />
                        <div className="h-4 bg-[#141822] rounded-md animate-pulse w-4/5" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* ── STICKY COMPOSER — fixed at bottom of CHAT DIV, separate scrollbar ── */}
          <div className="shrink-0 sticky bottom-0 z-10 px-4 sm:px-8 pt-3 pb-4 bg-[#0B0D10] border-t border-[#181D26]">
            <div className="max-w-[820px] w-full mx-auto">
              <form
                onSubmit={onSubmit}
                className="bg-[#131722] border border-[#222938] hover:border-[#2C3548] focus-within:border-[#6366F1] focus-within:ring-2 focus-within:ring-[#6366F1]/20 rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Soli about an Act, section, judgment, or precedent..."
                  rows={2}
                  className="w-full resize-none bg-transparent border-0 text-[15px] leading-relaxed text-white placeholder:text-[#6B7280] outline-none min-h-[64px] max-h-[180px] px-5 pt-4 pb-2.5"
                />

                <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#0F121A] border-t border-[#1A1F2C]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider select-none">
                      Scope:
                    </span>
                    <div className="relative min-w-0 max-w-[260px]">
                      <select
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        className="w-full appearance-none text-[12px] bg-[#141822] border border-[#202736] rounded-lg pl-3 pr-7 py-1.5 text-[#E5E7EB] font-medium outline-none cursor-pointer truncate hover:border-[#2C364B] transition-colors"
                      >
                        <option value="all">All Documents</option>
                        {documents.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-[11px] text-[#6B7280]">
                      Shift+Enter for newline
                    </span>

                    {isLoading ? (
                      <button
                        type="button"
                        onClick={() => stop()}
                        className="w-9 h-9 rounded-xl grid place-items-center bg-[#EF4444] text-white hover:bg-[#DC2626] transition-all cursor-pointer shadow-sm"
                        title="Stop generating"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className={`w-9 h-9 rounded-xl grid place-items-center transition-all ${
                          input.trim()
                            ? "bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-md shadow-[#6366F1]/20 cursor-pointer active:scale-95"
                            : "bg-[#1A1F2C] text-[#525A6B] cursor-not-allowed"
                        }`}
                        title="Send research query"
                      >
                        <ArrowUp className="w-4 h-4" strokeWidth={2.4} />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide-out Source Detail Drawer ── */}
      <SourceDrawer
        sources={activeSources || []}
        open={sourceDrawerOpen}
        selectedSourceNum={selectedSourceNum}
        onClose={() => setSourceDrawerOpen(false)}
        onSelectSource={(n) => setSelectedSourceNum(n)}
      />
      </div>
    </div>
  );
}