"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpRight,
  UploadCloud,
  Search,
  Plus,
  RotateCcw,
  Download,
  Upload,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Scale,
  ShieldCheck,
  Check,
  FolderTree,
  FileCode,
  BookMarked,
  HelpCircle,
  Zap,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  fetchDocumentFromUrl,
  getProxyDownloadUrl,
  uploadDocument,
  listDocuments,
  Document as SoliDocument,
  ApiError,
} from "@/lib/api";
import {
  CORPUS_LAYERS,
  INITIAL_CORPUS_ITEMS,
  CorpusItem,
  ChecklistStatus,
  Priority,
  CASE_METADATA_SCHEMA,
  LEGAL_ONTOLOGY_CATEGORIES,
  STATUTORY_CROSSWALK,
  CORPUS_FOLDER_TREE,
} from "@/lib/corpusChecklistData";

const STORAGE_KEY = "soli_corpus_checklist_v4";

function normalizeMatchText(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesCorpusItem(item: CorpusItem, doc: SoliDocument): boolean {
  if (doc.source_url && (doc.source_url === item.sourceUrl || doc.source_url === item.altSourceUrl)) {
    return true;
  }
  if (doc.act_number && item.citation && normalizeMatchText(doc.act_number) === normalizeMatchText(item.citation)) {
    return true;
  }
  const normDocTitle = normalizeMatchText(doc.title);
  const normItemTitle = normalizeMatchText(item.title);
  if (normDocTitle && normItemTitle) {
    if (normDocTitle === normItemTitle) return true;
    if (normDocTitle.includes(normItemTitle) || normItemTitle.includes(normDocTitle)) {
      if (Math.min(normDocTitle.length, normItemTitle.length) >= 8) {
        return true;
      }
    }
  }
  return false;
}

export default function CorpusChecklistPage() {
  const [items, setItems] = useState<CorpusItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState<"checklist" | "reference">("checklist");
  const [refSubTab, setRefSubTab] = useState<"metadata" | "ontology" | "crosswalk" | "tree">("metadata");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Expanded items state
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Add custom item modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCitation, setNewCitation] = useState("");
  const [newLayer, setNewLayer] = useState(CORPUS_LAYERS[0].id);
  const [newPriority, setNewPriority] = useState<Priority>("P0");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceLabel, setNewSourceLabel] = useState("");
  const [newWhy, setNewWhy] = useState("");
  const [newSections, setNewSections] = useState("");

  // Notification / toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-platform direct ingestion state
  const [ingestingId, setIngestingId] = useState<string | null>(null);

  // Direct local file upload state
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Batch auto-ingest state
  const [batchIngesting, setBatchIngesting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; title: string } | null>(null);

  // Sync checklist with documents already in Soli database
  const syncWithDatabase = async () => {
    try {
      const docs = await listDocuments();
      if (!docs || docs.length === 0) return;

      setItems((prevItems) => {
        let changed = false;
        const updated = prevItems.map((item) => {
          if (item.status === "uploaded") return item;
          const matched = docs.some((doc) => matchesCorpusItem(item, doc));
          if (matched) {
            changed = true;
            return { ...item, status: "uploaded" as ChecklistStatus };
          }
          return item;
        });
        if (changed) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prevItems;
      });
    } catch {
      // Backend might be starting up
    }
  };

  const handleDirectFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    item: CorpusItem
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please select a PDF document.");
      return;
    }

    setUploadingId(item.id);
    try {
      await uploadDocument({
        file,
        title: item.title,
        act_number: item.citation,
        source_url: item.sourceUrl,
      });
      updateItemStatus(item.id, "uploaded");
      showToast(`“${item.title}” successfully uploaded & indexed in Soli!`);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        updateItemStatus(item.id, "uploaded");
        showToast(`“${item.title}” was already indexed in your library.`);
      } else {
        showToast(`Upload failed: ${apiErr.message || "Please check the file"}`);
      }
    } finally {
      setUploadingId(null);
    }
  };

  const handleDirectIngest = async (item: CorpusItem) => {
    if (ingestingId) return;
    setIngestingId(item.id);
    try {
      await fetchDocumentFromUrl({
        url: item.sourceUrl,
        title: item.title,
        act_number: item.citation,
      });
      updateItemStatus(item.id, "uploaded");
      showToast(`“${item.title}” downloaded, standardized & indexed in Soli!`);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        updateItemStatus(item.id, "uploaded");
        showToast(`“${item.title}” is already indexed in your library.`);
      } else {
        showToast(`Could not direct-fetch: ${apiErr.message || "Please use manual upload"}`);
      }
    } finally {
      setIngestingId(null);
    }
  };

  const handleBatchIngestP0 = async () => {
    const p0Pending = items.filter((it) => it.priority === "P0" && it.status !== "uploaded");
    if (p0Pending.length === 0) {
      showToast("All P0 core items are already indexed in Soli!");
      return;
    }

    if (
      !confirm(
        `Soli will auto-fetch, standardize canonical names & index ${p0Pending.length} core P0 documents directly into your platform without opening external sites. Continue?`
      )
    ) {
      return;
    }

    setBatchIngesting(true);
    let completed = 0;
    for (let i = 0; i < p0Pending.length; i++) {
      const item = p0Pending[i];
      setBatchProgress({ current: i + 1, total: p0Pending.length, title: item.title });
      try {
        await fetchDocumentFromUrl({
          url: item.sourceUrl,
          title: item.title,
          act_number: item.citation,
        });
        updateItemStatus(item.id, "uploaded");
        completed++;
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        if (apiErr.status === 409) {
          updateItemStatus(item.id, "uploaded");
          completed++;
        }
      }
    }
    setBatchIngesting(false);
    setBatchProgress(null);
    showToast(`Batch completed: ${completed} of ${p0Pending.length} core statutes indexed in Soli!`);
  };

  // Load from localStorage on mount & sync with database
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("soli_corpus_checklist_v3") ||
        localStorage.getItem("soli_corpus_checklist_v2") ||
        localStorage.getItem("soli_corpus_checklist_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge newly updated official URLs from INITIAL_CORPUS_ITEMS with user progress status
          const savedMap = new Map(parsed.map((item: CorpusItem) => [item.id, item]));
          const merged = INITIAL_CORPUS_ITEMS.map((initial) => {
            const existing = savedMap.get(initial.id);
            if (!existing) return initial;
            return {
              ...initial,
              status: existing.status || "pending",
            };
          });
          const customItems = parsed.filter((item: CorpusItem) => item.isCustom);
          setItems([...merged, ...customItems]);
          setIsLoaded(true);
          syncWithDatabase();
          return;
        }
      }
    } catch {
      // ignore JSON errors
    }
    setItems(INITIAL_CORPUS_ITEMS);
    setIsLoaded(true);
    syncWithDatabase();
  }, []);

  // Sync whenever window refocuses or another tab/page completes an upload
  useEffect(() => {
    const handleRefocusOrUpdate = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        }
      } catch {}
      syncWithDatabase();
    };

    window.addEventListener("focus", handleRefocusOrUpdate);
    window.addEventListener("soli_checklist_updated", handleRefocusOrUpdate);
    window.addEventListener("storage", handleRefocusOrUpdate);

    return () => {
      window.removeEventListener("focus", handleRefocusOrUpdate);
      window.removeEventListener("soli_checklist_updated", handleRefocusOrUpdate);
      window.removeEventListener("storage", handleRefocusOrUpdate);
    };
  }, []);

  // Save to localStorage when items update
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage quota or private window
    }
  }, [items, isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle item status
  const updateItemStatus = (id: string, newStatus: ChecklistStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const cycleStatus = (id: string, current: ChecklistStatus) => {
    const nextStatusMap: Record<ChecklistStatus, ChecklistStatus> = {
      pending: "in_progress",
      in_progress: "collected",
      collected: "uploaded",
      uploaded: "pending",
    };
    updateItemStatus(id, nextStatusMap[current]);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Reset to default
  const handleReset = () => {
    if (confirm("Reset checklist to default Soli Criminal & Cybercrime template? Custom items will be cleared.")) {
      setItems(INITIAL_CORPUS_ITEMS);
      localStorage.removeItem(STORAGE_KEY);
      showToast("Checklist reset to default template.");
    }
  };

  // Export JSON
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `soli_corpus_checklist_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Checklist exported as JSON.");
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          showToast(`Imported ${parsed.length} items successfully.`);
        }
      } catch {
        alert("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Add custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const selectedLayerObj = CORPUS_LAYERS.find((l) => l.id === newLayer);
    const customItem: CorpusItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      citation: newCitation.trim() || "User Added Document",
      layer: newLayer,
      category: selectedLayerObj?.title || "Custom Documents",
      priority: newPriority,
      status: "pending",
      sourceUrl: newSourceUrl.trim() || "https://www.indiacode.nic.in/",
      officialSourceLabel: newSourceLabel.trim() || "Official Legal Source",
      whyItMatters: newWhy.trim() || "Added to Soli criminal & cybercrime research corpus.",
      focusSections: newSections
        ? newSections.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      tags: ["Custom", newPriority],
      isCustom: true,
    };

    setItems((prev) => [customItem, ...prev]);
    setShowAddModal(false);
    setNewTitle("");
    setNewCitation("");
    setNewSourceUrl("");
    setNewSourceLabel("");
    setNewWhy("");
    setNewSections("");
    showToast(`Added “${customItem.title}” to checklist.`);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedLayer !== "all" && item.layer !== selectedLayer) return false;
      if (selectedPriority !== "all" && item.priority !== selectedPriority) return false;
      if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCitation = item.citation.toLowerCase().includes(q);
        const matchSections = item.focusSections?.some((s) => s.toLowerCase().includes(q));
        const matchWhy = item.whyItMatters.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchCitation && !matchSections && !matchWhy && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedLayer, selectedPriority, selectedStatus, searchQuery]);

  // Statistics
  const totalCount = items.length;
  const collectedCount = items.filter((i) => i.status === "collected" || i.status === "uploaded").length;
  const uploadedCount = items.filter((i) => i.status === "uploaded").length;
  const inProgressCount = items.filter((i) => i.status === "in_progress").length;
  const pendingCount = items.filter((i) => i.status === "pending").length;

  const p0Items = items.filter((i) => i.priority === "P0");
  const p0Ready = p0Items.filter((i) => i.status === "collected" || i.status === "uploaded").length;
  const p0Percent = p0Items.length ? Math.round((p0Ready / p0Items.length) * 100) : 0;

  const overallPercent = totalCount ? Math.round((collectedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1F2C] border border-[#6366F1]/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-[13px] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-radial from-[#1A1E2B] to-[#0E1116] border border-[#1E2430] p-6 sm:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/30 text-[11px] font-semibold tracking-wider text-[#A5B4FC] uppercase">
              <Scale className="w-3.5 h-3.5" />
              Soli Knowledge Base Blueprint
            </div>
            <h1 className="text-[24px] sm:text-[28px] font-semibold text-white tracking-[-0.02em]">
              Criminal & Cybercrime Ingestion Checklist
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#9CA3AF] max-w-[700px] leading-relaxed">
              Curated 8-layer legal architecture covering modern criminal codes (BNS, BNSS, BSA), the IT Act, CERT-In directions, landmark electronic evidence jurisprudence, and financial cyber regulations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Auto-Ingest All Core P0 Statutes */}
            <button
              disabled={batchIngesting || !!ingestingId}
              onClick={handleBatchIngestP0}
              title="Automatically fetch, standardize canonical names & index all core P0 statutes into Soli knowledge base"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {batchIngesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting Core ({batchProgress?.current}/{batchProgress?.total})…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current text-yellow-300" />
                  <span>Auto-Ingest Core P0 Statutes</span>
                </>
              )}
            </button>

            <Link
              href="/documents/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-medium bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm transition-colors"
            >
              <Zap className="w-3.5 h-3.5" /> Direct Ingest (URL)
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-medium bg-[#151922] border border-[#232936] text-[#D1D5DB] hover:text-white hover:bg-[#1C222F] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
            <Link
              href="/documents/new?mode=upload"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-medium bg-[#151922] border border-[#232936] text-[#D1D5DB] hover:text-white hover:bg-[#1C222F] transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#818CF8]" /> Upload Local File
            </Link>
            <div className="h-6 w-px bg-[#232936] hidden sm:block mx-1" />
            <button
              onClick={handleExport}
              title="Export checklist JSON"
              className="p-2 rounded-xl bg-[#151922] border border-[#232936] text-[#9CA3AF] hover:text-white hover:bg-[#1C222F] transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              title="Import checklist JSON"
              className="p-2 rounded-xl bg-[#151922] border border-[#232936] text-[#9CA3AF] hover:text-white hover:bg-[#1C222F] transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleReset}
              title="Reset checklist"
              className="p-2 rounded-xl bg-[#151922] border border-[#232936] text-[#9CA3AF] hover:text-[#F87171] hover:bg-[#450a0a]/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Batch Ingest Progress Banner */}
        {batchProgress && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-4 space-y-2 text-white shadow-lg">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Auto-Ingestion in Progress: Item {batchProgress.current} of {batchProgress.total}
              </span>
              <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
            </div>
            <p className="text-sm font-medium text-emerald-100 truncate">
              Fetching, standardizing name & indexing: <span className="text-white font-semibold">{batchProgress.title}</span>
            </p>
            <div className="w-full h-1.5 bg-emerald-900/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Background glow decorative accent */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 bg-[#6366F1]/10 rounded-full blur-3xl" />
      </div>

      {/* Progress & Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-4 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Overall Ingestion Progress
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[24px] font-bold text-white tracking-tight">
              {collectedCount} <span className="text-[13px] text-[#6B7280] font-normal">/ {totalCount} items</span>
            </span>
            <span className="text-[13px] font-semibold text-[#818CF8]">{overallPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#181D26] rounded-full overflow-hidden">
            <div className="h-full bg-[#6366F1] transition-all duration-500" style={{ width: `${overallPercent}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-4 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            P0 Must-Have Completion
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[24px] font-bold text-[#F43F5E] tracking-tight">
              {p0Ready} <span className="text-[13px] text-[#6B7280] font-normal">/ {p0Items.length} core</span>
            </span>
            <span className="text-[13px] font-semibold text-[#FB7185]">{p0Percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#181D26] rounded-full overflow-hidden">
            <div className="h-full bg-[#F43F5E] transition-all duration-500" style={{ width: `${p0Percent}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-4 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Target v1 Corpus Scale
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[24px] font-bold text-white tracking-tight">
              ~90–135 <span className="text-[13px] text-[#6B7280] font-normal">sources</span>
            </span>
            <span className="text-[12px] font-medium text-[#34D399] bg-[#064E3B]/40 px-2 py-0.5 rounded-md border border-[#059669]/30">
              High-Value V1
            </span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] truncate">
            {uploadedCount} indexed in Soli RAG · {inProgressCount} in progress
          </p>
        </div>

        <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-4 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Status Breakdown
          </div>
          <div className="flex items-center gap-3 text-[12px] pt-1">
            <span className="flex items-center gap-1.5 text-[#34D399]">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" /> {uploadedCount} indexed
            </span>
            <span className="flex items-center gap-1.5 text-[#F59E0B]">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> {inProgressCount} active
            </span>
            <span className="flex items-center gap-1.5 text-[#6B7280]">
              <span className="w-2 h-2 rounded-full bg-[#6B7280]" /> {pendingCount} pending
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280]">Official India Code, MeitY & SCI links verified</p>
        </div>
      </div>

      {/* Main View Switcher: Checklist vs Reference Tools */}
      <div className="flex items-center justify-between border-b border-[#1E2430] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("checklist")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
              activeTab === "checklist"
                ? "bg-[#6366F1] text-white shadow-xs"
                : "text-[#9CA3AF] hover:text-white hover:bg-[#151922]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Checklist Tracker ({filteredItems.length})
          </button>
          <button
            onClick={() => setActiveTab("reference")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
              activeTab === "reference"
                ? "bg-[#6366F1] text-white shadow-xs"
                : "text-[#9CA3AF] hover:text-white hover:bg-[#151922]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Reference & Architecture (4 Views)
          </button>
        </div>

        <span className="text-[12px] text-[#6B7280] hidden sm:inline-block">
          Saved automatically to browser storage
        </span>
      </div>

      {/* CHECKLIST TAB */}
      {activeTab === "checklist" && (
        <div className="space-y-4">
          {/* Official Sources Notice */}
          <div className="rounded-xl bg-[#131722] border border-[#232E44] px-4 py-3 flex items-start gap-3 text-[12.5px] text-[#C7D2FE]">
            <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/30 grid place-items-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#60A5FA]" />
            </div>
            <div className="min-w-0 flex-1 leading-relaxed">
              <span className="font-semibold text-white">Direct Ingestion & Canonical Filenames Enabled:</span> Every item now connects directly to its <strong>unique, specific PDF or judgment text</strong> (Legislative Department, MeitY, CERT-In, RBI, and Indian Kanoon). Use <strong>“1-Click Ingest”</strong> to index directly into Soli without visiting external websites, or click <strong>“Clean File”</strong> to download with canonical title (e.g. <code>Bharatiya_Nyaya_Sanhita_2023.pdf</code>)—no manual renaming needed.
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search statutes, sections (e.g. 66D, 65B, 43A), cases, keywords…"
                  className="w-full bg-[#151922] border border-[#232936] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-white placeholder:text-[#525B6C] focus:outline-none focus:border-[#6366F1]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Layer Dropdown */}
              <div className="relative sm:w-[260px]">
                <select
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  className="w-full appearance-none bg-[#151922] border border-[#232936] rounded-xl px-3.5 py-2.5 text-[12.5px] text-white focus:outline-none focus:border-[#6366F1] cursor-pointer"
                >
                  <option value="all">All 8 Layers & Categories</option>
                  {CORPUS_LAYERS.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.title} ({layer.priority})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              </div>
            </div>

            {/* Status & Priority Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#181D26]">
              <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
                <span className="text-[#6B7280] mr-1 font-medium">Status:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "in_progress", label: "In Progress" },
                  { id: "collected", label: "Collected (Local)" },
                  { id: "uploaded", label: "Indexed in Soli" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStatus(st.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedStatus === st.id
                        ? "bg-[#6366F1] text-white font-medium"
                        : "bg-[#151922] text-[#9CA3AF] hover:text-white hover:bg-[#1C222F]"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[11.5px]">
                <span className="text-[#6B7280] mr-1 font-medium">Priority:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "P0", label: "P0 (Must Have)", color: "text-[#FB7185]" },
                  { id: "P1", label: "P1 (High)", color: "text-[#FBBF24]" },
                ].map((pr) => (
                  <button
                    key={pr.id}
                    onClick={() => setSelectedPriority(pr.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedPriority === pr.id
                        ? "bg-[#252C3A] text-white font-medium border border-[#3E4759]"
                        : "bg-[#151922] text-[#9CA3AF] hover:text-white"
                    }`}
                  >
                    <span className={pr.color}>{pr.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist Items List */}
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1E2430] bg-[#10131A] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#151922] border border-[#232936] grid place-items-center mx-auto">
                <Search className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div className="text-[14px] font-semibold text-white">No items match your filter</div>
              <p className="text-[12px] text-[#6B7280] max-w-sm mx-auto">
                Try searching for another section, resetting the layer filter, or click &ldquo;Add Item&rdquo; to insert a custom statute or judgment.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLayer("all");
                  setSelectedPriority("all");
                  setSelectedStatus("all");
                }}
                className="inline-flex text-[12px] font-medium text-[#818CF8] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isExpanded = !!expandedIds[item.id];
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all ${
                      item.status === "uploaded"
                        ? "border-[#1F3D2B] bg-[#0B1510]/80"
                        : item.status === "collected"
                        ? "border-[#23354C] bg-[#0E1520]/80"
                        : item.status === "in_progress"
                        ? "border-[#3D3418] bg-[#1A160D]/80"
                        : "border-[#1E2430] bg-[#10131A] hover:border-[#272F3E]"
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Checkbox + Info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => cycleStatus(item.id, item.status)}
                          title={`Status: ${item.status}. Click to cycle.`}
                          className="mt-0.5 shrink-0 transition-transform active:scale-90 focus:outline-none"
                        >
                          {item.status === "uploaded" && (
                            <div className="w-5 h-5 rounded-md bg-[#22C55E] text-black grid place-items-center shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          {item.status === "collected" && (
                            <div className="w-5 h-5 rounded-md bg-[#3B82F6] text-white grid place-items-center shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          {item.status === "in_progress" && (
                            <div className="w-5 h-5 rounded-md bg-[#F59E0B] text-black grid place-items-center shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          )}
                          {item.status === "pending" && (
                            <Circle className="w-5 h-5 text-[#4B5563] hover:text-[#9CA3AF]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Priority Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold tracking-wide uppercase ${
                                item.priority === "P0"
                                  ? "bg-[#F43F5E]/15 text-[#FB7185] border border-[#F43F5E]/30"
                                  : "bg-[#F59E0B]/15 text-[#FCD34D] border border-[#F59E0B]/30"
                              }`}
                            >
                              {item.priority} {item.priority === "P0" ? "MUST HAVE" : "HIGH"}
                            </span>

                            {/* Category Badge */}
                            <span className="text-[11px] font-medium text-[#9CA3AF] bg-[#151922] px-2 py-0.5 rounded-md border border-[#232936]">
                              {item.category}
                            </span>

                            {/* Status Pill */}
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                item.status === "uploaded"
                                  ? "bg-[#22C55E]/15 text-[#86EFAC]"
                                  : item.status === "collected"
                                  ? "bg-[#3B82F6]/15 text-[#93C5FD]"
                                  : item.status === "in_progress"
                                  ? "bg-[#F59E0B]/15 text-[#FDE68A]"
                                  : "text-[#6B7280]"
                              }`}
                            >
                              {item.status === "uploaded"
                                ? "Indexed in Soli"
                                : item.status === "collected"
                                ? "File Collected"
                                : item.status === "in_progress"
                                ? "In Progress"
                                : "Pending Download"}
                            </span>
                          </div>

                          {/* Title & Citation */}
                          <div className="pt-0.5">
                            <h3 className="text-[15px] font-semibold text-white tracking-[-0.01em] leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-[12px] font-mono text-[#818CF8] mt-0.5">
                              {item.citation} ·{" "}
                              <span className="text-[#9CA3AF] font-sans">
                                {item.officialSourceLabel}
                              </span>
                            </p>
                          </div>

                          {/* Why It Matters snippet */}
                          <p className="text-[12.5px] text-[#9CA3AF] leading-relaxed line-clamp-2">
                            {item.whyItMatters}
                          </p>

                          {/* Focus Sections Chips */}
                          {item.focusSections && item.focusSections.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {item.focusSections.slice(0, 5).map((sec, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-mono bg-[#141822] text-[#CBD5E1] border border-[#232A38] px-2 py-0.5 rounded-md"
                                >
                                  {sec}
                                </span>
                              ))}
                              {item.focusSections.length > 5 && (
                                <span className="text-[11px] text-[#818CF8] px-1 font-medium">
                                  +{item.focusSections.length - 5} more sections
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E2430]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* 1-Click Ingest In-Platform Button */}
                          {item.status === "uploaded" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold bg-[#052e16] text-[#86EFAC] border border-[#14532d]">
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> Indexed
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={!!ingestingId || batchIngesting}
                              onClick={() => handleDirectIngest(item)}
                              title="Download, standardize filename & index directly inside Soli (No external tabs needed)"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {ingestingId === item.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Ingesting…</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 fill-current" />
                                  <span>1-Click Ingest</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Download Clean Standardized File (No Renaming Needed) */}
                          <a
                            href={getProxyDownloadUrl(item.sourceUrl, item.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download directly with clean standardized legal filename (No manual renaming needed)"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium bg-[#151922] border border-[#232936] text-[#A5B4FC] hover:text-white hover:bg-[#1E2538] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-[#818CF8]" />
                            <span>Clean File</span>
                          </a>

                          {/* Upload Local PDF directly right on the card */}
                          {item.status !== "uploaded" && (
                            <label
                              title="Upload your downloaded PDF directly for this item (No navigation needed)"
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium bg-[#151922] border border-[#232936] text-[#D1D5DB] hover:text-white hover:bg-[#1C222F] transition-colors cursor-pointer ${
                                uploadingId === item.id ? "opacity-60 pointer-events-none" : ""
                              }`}
                            >
                              {uploadingId === item.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#818CF8]" />
                                  <span>Uploading…</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="w-3.5 h-3.5 text-[#818CF8]" />
                                  <span>Upload PDF</span>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => handleDirectFileUpload(e, item)}
                                    className="hidden"
                                    disabled={!!uploadingId}
                                  />
                                </>
                              )}
                            </label>
                          )}

                          {/* Full Form / Customize Upload Link */}
                          {item.status !== "uploaded" && (
                            <Link
                              href={`/documents/new?item_id=${encodeURIComponent(
                                item.id
                              )}&mode=upload&title=${encodeURIComponent(
                                item.title
                              )}&act_number=${encodeURIComponent(
                                item.citation
                              )}&source_url=${encodeURIComponent(item.sourceUrl)}`}
                              title="Open full upload form to customize title/citation"
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11.5px] font-medium text-[#9CA3AF] hover:text-white hover:bg-[#1C222F] transition-colors"
                            >
                              <span>Customize</span>
                            </Link>
                          )}

                          {/* Official Source Link (Direct unique document link) */}
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Direct Source: ${item.officialSourceLabel}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium bg-[#151922] border border-[#232936] text-[#9CA3AF] hover:text-white hover:bg-[#1C222F] transition-colors"
                          >
                            <span>Source</span>
                            <ArrowUpRight className="w-3 h-3 text-[#818CF8]" />
                          </a>

                          {/* Alternate Source / Mirror Link if available */}
                          {item.altSourceUrl && (
                            <a
                              href={item.altSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Mirror / Alternate: ${item.altSourceLabel || "Alternate Source"}`}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11.5px] font-medium bg-[#121620] border border-[#1E2536] text-[#9CA3AF] hover:text-[#C7D2FE] hover:bg-[#1C222F] transition-colors"
                            >
                              <span>{item.altSourceLabel ? item.altSourceLabel.split(" ")[0] : "Alt"}</span>
                              <ArrowUpRight className="w-2.5 h-2.5 text-[#6B7280]" />
                            </a>
                          )}
                        </div>

                        {/* Status Select dropdown */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              updateItemStatus(item.id, e.target.value as ChecklistStatus)
                            }
                            className="bg-[#151922] border border-[#232936] rounded-lg text-[11.5px] px-2 py-1 text-white focus:outline-none focus:border-[#6366F1] cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="collected">Collected</option>
                            <option value="uploaded">Uploaded to Soli</option>
                          </select>

                          {/* Expand Details */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="p-1 rounded-md text-[#6B7280] hover:text-white hover:bg-[#1C222F]"
                            title="Expand details & sections"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content Drawer */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-[#1E2430]/70 bg-[#0E1117]/60 space-y-3 rounded-b-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px]">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                              Detailed Reasoning & Purpose:
                            </span>
                            <p className="text-[#D1D5DB] leading-relaxed">{item.whyItMatters}</p>
                            {item.practicalNotes && (
                              <p className="text-[#9CA3AF] mt-2 italic text-[12px] bg-[#141822] p-2.5 rounded-lg border border-[#232936]">
                                💡 {item.practicalNotes}
                              </p>
                            )}
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] block mb-1">
                              All Monitored Sections & Provisions:
                            </span>
                            {item.focusSections && item.focusSections.length > 0 ? (
                              <ul className="space-y-1 text-[#CBD5E1]">
                                {item.focusSections.map((sec, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-[12px]">
                                    <span className="text-[#6366F1] font-bold">›</span>
                                    <span>{sec}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[#6B7280] italic">Full text parsing and indexing required.</p>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#181D26]">
                          <Tag className="w-3.5 h-3.5 text-[#6B7280]" />
                          {item.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[11px] text-[#9CA3AF] bg-[#151922] px-2 py-0.5 rounded-md border border-[#232936]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* REFERENCE & ARCHITECTURE TAB */}
      {activeTab === "reference" && (
        <div className="space-y-5">
          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#1E2430] pb-2">
            {[
              { id: "metadata", label: "Case Metadata Schema (22 Fields)", icon: FileCode },
              { id: "ontology", label: "Legal Ontology & Concepts", icon: BookMarked },
              { id: "crosswalk", label: "Statutory Crosswalk (IPC/CrPC → BNS/BNSS/BSA)", icon: Scale },
              { id: "tree", label: "Target Directory Tree", icon: FolderTree },
            ].map((sub) => {
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => setRefSubTab(sub.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-medium transition-all ${
                    refSubTab === sub.id
                      ? "bg-[#1E2430] text-white border border-[#2C3444] shadow-xs"
                      : "text-[#9CA3AF] hover:text-white hover:bg-[#151922]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#818CF8]" />
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* VIEW 1: CASE METADATA SCHEMA */}
          {refSubTab === "metadata" && (
            <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] overflow-hidden space-y-4 p-5">
              <div>
                <h2 className="text-[17px] font-semibold text-white">
                  Soli Case Metadata Extraction Schema
                </h2>
                <p className="text-[13px] text-[#9CA3AF] mt-1">
                  Do not merely dump raw PDFs into Soli. To enable precise legal reasoning over electronic evidence, section interpretations, and judicial precedents, Soli indexes each judgment using these 22 structured attributes:
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#1E2430]">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-[#0E1117] text-[#6B7280] font-semibold uppercase text-[11px] tracking-wider border-b border-[#1E2430]">
                    <tr>
                      <th className="px-4 py-3">Metadata Field</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Specification / Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181D26]">
                    {CASE_METADATA_SCHEMA.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#141822] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[#818CF8] font-medium">
                          {row.field}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[#F43F5E] text-[11.5px]">
                          {row.type}
                        </td>
                        <td className="px-4 py-2.5 text-[#D1D5DB]">{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: LEGAL ONTOLOGY */}
          {refSubTab === "ontology" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-[15px]">
                  <ShieldCheck className="w-4 h-4 text-[#F43F5E]" />
                  <span>1. Cyber Offences Taxonomy</span>
                </div>
                <p className="text-[12px] text-[#6B7280]">
                  Core classification tags mapped to penal provisions across IT Act, BNS, and special laws:
                </p>
                <div className="space-y-1.5">
                  {LEGAL_ONTOLOGY_CATEGORIES.offences.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141822] border border-[#1E2430] text-[12px] text-[#D1D5DB]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-[15px]">
                  <Scale className="w-4 h-4 text-[#818CF8]" />
                  <span>2. Substantive & Procedural Doctrines</span>
                </div>
                <p className="text-[12px] text-[#6B7280]">
                  Legal concepts Soli evaluates during criminal liability and evidentiary analysis:
                </p>
                <div className="space-y-1.5">
                  {LEGAL_ONTOLOGY_CATEGORIES.legalConcepts.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141822] border border-[#1E2430] text-[12px] text-[#D1D5DB]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-[15px]">
                  <Layers className="w-4 h-4 text-[#34D399]" />
                  <span>3. Digital Evidence Types</span>
                </div>
                <p className="text-[12px] text-[#6B7280]">
                  Electronic artifacts subject to authentication, hash verification, and custody checks:
                </p>
                <div className="space-y-1.5">
                  {LEGAL_ONTOLOGY_CATEGORIES.digitalEvidenceTypes.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141822] border border-[#1E2430] text-[12px] text-[#D1D5DB]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: STATUTORY CROSSWALK */}
          {refSubTab === "crosswalk" && (
            <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-5 space-y-4">
              <div>
                <h2 className="text-[17px] font-semibold text-white">
                  Historical-to-Current Statutory Crosswalk
                </h2>
                <p className="text-[13px] text-[#9CA3AF] mt-1">
                  Enables Soli to cross-reference historical judicial precedents (governed by IPC 1860, CrPC 1973, and Evidence Act 1872) with modern proceedings under the 2023 codes (BNS, BNSS, BSA):
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#1E2430]">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="bg-[#0E1117] text-[#6B7280] font-semibold uppercase text-[11px] tracking-wider border-b border-[#1E2430]">
                    <tr>
                      <th className="px-4 py-3">Topic / Subject</th>
                      <th className="px-4 py-3 text-[#F87171]">Historical (Pre-July 2024)</th>
                      <th className="px-4 py-3 text-[#34D399]">Current Law (2024+)</th>
                      <th className="px-4 py-3">Application in Cybercrime Litigation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181D26]">
                    {STATUTORY_CROSSWALK.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#141822] transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">{row.topic}</td>
                        <td className="px-4 py-3 font-mono text-[#F87171]">{row.historical}</td>
                        <td className="px-4 py-3 font-mono text-[#34D399] font-medium">{row.current}</td>
                        <td className="px-4 py-3 text-[#9CA3AF]">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 4: TARGET DIRECTORY TREE */}
          {refSubTab === "tree" && (
            <div className="rounded-2xl border border-[#1E2430] bg-[#10131A] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-semibold text-white">Recommended Raw Corpus Directory Tree</h2>
                  <p className="text-[13px] text-[#9CA3AF] mt-1">
                    Canonical folder layout to organize downloaded official PDFs prior to parsing and chunking:
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(CORPUS_FOLDER_TREE);
                    showToast("Directory tree copied to clipboard.");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151922] border border-[#232936] text-white hover:bg-[#1C222F]"
                >
                  Copy Tree
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#090B0E] border border-[#181D26] text-[12px] font-mono text-[#A5B4FC] overflow-x-auto leading-relaxed">
                {CORPUS_FOLDER_TREE}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ADD CUSTOM ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-[560px] rounded-2xl border border-[#1E2430] bg-[#10131A] p-6 shadow-2xl space-y-4 z-10">
            <div className="flex items-center justify-between border-b border-[#1E2430] pb-3">
              <div className="flex items-center gap-2 text-white font-semibold text-[16px]">
                <Plus className="w-4 h-4 text-[#6366F1]" />
                <span>Add Document to Soli Corpus</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6B7280] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
                  Document / Judgment Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. State v. XYZ (Landmark Cyber Fraud Ruling)"
                  className="w-full bg-[#151922] border border-[#232936] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#525B6C] focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
                    Citation / Act Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCitation}
                    onChange={(e) => setNewCitation(e.target.value)}
                    placeholder="e.g. (2024) 4 SCC 123"
                    className="w-full bg-[#151922] border border-[#232936] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#525B6C] focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-[#151922] border border-[#232936] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="P0">P0 (Must Have)</option>
                    <option value="P1">P1 (High Priority)</option>
                    <option value="P2">P2 (Secondary)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
                    Corpus Layer / Category
                  </label>
                  <select
                    value={newLayer}
                    onChange={(e) => setNewLayer(e.target.value)}
                    className="w-full bg-[#151922] border border-[#232936] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#6366F1]"
                  >
                    {CORPUS_LAYERS.map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
                    Official Source Label
                  </label>
                  <input
                    type="text"
                    value={newSourceLabel}
                    onChange={(e) => setNewSourceLabel(e.target.value)}
                    placeholder="e.g. Supreme Court of India"
                    className="w-full bg-[#151922] border border-[#232936] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#525B6C] focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
                  Official Source URL
                </label>
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://main.sci.gov.in/…"
                  className="w-full bg-[#151922] border border-[#232936] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#525B6C] focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
                  Focus Sections (comma separated)
                </label>
                <input
                  type="text"
                  value={newSections}
                  onChange={(e) => setNewSections(e.target.value)}
                  placeholder="Section 66D, Section 318 BNS, Section 63 BSA"
                  className="w-full bg-[#151922] border border-[#232936] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#525B6C] focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
                  Why It Matters for Soli
                </label>
                <textarea
                  rows={2}
                  value={newWhy}
                  onChange={(e) => setNewWhy(e.target.value)}
                  placeholder="Explain why this statute, judgment, or circular is necessary for legal reasoning…"
                  className="w-full bg-[#151922] border border-[#232936] rounded-xl px-3.5 py-2 text-[13px] text-white placeholder:text-[#525B6C] focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E2430]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#9CA3AF] hover:text-white hover:bg-[#151922]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-[13px] font-medium bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm"
                >
                  Add to Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
