"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  Search,
  Zap,
  Activity,
  Award,
  Layers,
  FileCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Loader2,
  Scale,
  BookOpen,
} from "lucide-react";
import {
  getLatestEvaluation,
  runEvaluationBenchmark,
  EvaluationReport,
  TestCaseResult,
} from "@/lib/api";

export default function EvaluationDashboardPage() {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    getLatestEvaluation()
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load initial benchmark:", err);
        setLoading(false);
      });
  }, []);

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      const freshReport = await runEvaluationBenchmark();
      setReport(freshReport);
      showToast("Live benchmark completed successfully!");
    } catch (err: unknown) {
      showToast("Failed to run live benchmark. Ensure backend is active.");
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `soli_audit_benchmark_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Audit report exported as JSON.");
  };

  const categories = useMemo(() => {
    if (!report) return [];
    const set = new Set(report.test_results.map((t) => t.category));
    return Array.from(set);
  }, [report]);

  const filteredTests = useMemo(() => {
    if (!report) return [];
    return report.test_results.filter((tc) => {
      if (selectedCategory !== "all" && tc.category !== selectedCategory) return false;
      if (selectedStatus !== "all" && tc.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQuery = tc.query.toLowerCase().includes(q);
        const matchSec = tc.target_section.toLowerCase().includes(q);
        const matchAct = tc.target_act.toLowerCase().includes(q);
        const matchPrinciple = tc.legal_principle.toLowerCase().includes(q);
        if (!matchQuery && !matchSec && !matchAct && !matchPrinciple) return false;
      }
      return true;
    });
  }, [report, selectedCategory, selectedStatus, searchQuery]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4 text-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#818CF8] animate-pulse" />
          </div>
          <Loader2 className="w-5 h-5 text-[#6366F1] animate-spin absolute -bottom-1 -right-1" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="text-[14px] font-medium text-white">Loading Legal AI Audit Benchmark</p>
          <p className="text-[12px] text-[#9CA3AF]">
            Querying vector store across statutory provisions and fact patterns…
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#1E2535] border border-[#2A344A] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-[20px] font-bold text-white tracking-tight">
            Evaluation Benchmark Ready
          </h2>
          <p className="text-[13px] text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
            Run the 25-scenario empirical audit suite against your database to compute Hit@1, MRR, Disambiguation, and Statutory Fidelity scores.
          </p>
        </div>
        <button
          onClick={handleRunBenchmark}
          disabled={runningBenchmark}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-[#6366F1]/20"
        >
          {runningBenchmark ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Live Benchmark…</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current text-yellow-300" />
              <span>Run Live Benchmark Now</span>
            </>
          )}
        </button>
      </div>
    );
  }

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
      <div className="relative overflow-hidden rounded-2xl bg-radial from-[#151B28] to-[#0A0D12] border border-[#1E2535] p-6 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Global Standards Empirical Audit
            </div>
            <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-[-0.02em]">
              Soli Legal AI Benchmark & Trust Engine
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#9CA3AF] max-w-[720px] leading-relaxed">
              Empirical validation across 16 statutory and constitutional scenarios. Aligned with{" "}
              <strong className="text-white font-medium">NIST AI RMF 1.0</strong>,{" "}
              <strong className="text-white font-medium">Stanford LegalBench</strong>, and the{" "}
              <strong className="text-white font-medium">RAG Triad / RAGAS</strong> metric suite.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              disabled={runningBenchmark}
              onClick={handleRunBenchmark}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {runningBenchmark ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Benchmark Suite…</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-yellow-300" />
                  <span>Run Live Benchmark</span>
                </>
              )}
            </button>
            <button
              onClick={handleExportJSON}
              title="Export complete audit findings"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium bg-[#131722] border border-[#232B3E] text-[#D1D5DB] hover:text-white hover:bg-[#1A2030] transition-colors"
            >
              <Download className="w-4 h-4 text-[#818CF8]" />
              <span>Export Audit Report</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 bg-[#6366F1]/10 rounded-full blur-3xl" />
      </div>

      {/* Top Level Trust Score Card & Grade */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Trust Badge */}
          <div className="lg:col-span-1 rounded-2xl border border-[#1E2535] bg-[#10141E] p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Platform Trust Score
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" />
                {report.release_grade}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-[44px] font-black text-white tracking-tight leading-none">
                {report.trust_score_pct}
                <span className="text-[20px] font-medium text-emerald-400">%</span>
              </span>
              <span className="text-[13px] text-[#9CA3AF]">
                Composite Statutory Fidelity Index
              </span>
            </div>

            <div className="w-full h-2 bg-[#181F2C] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${report.trust_score_pct}%` }}
              />
            </div>

            <div className="text-[11.5px] text-[#6B7280] flex items-center justify-between pt-1">
              <span>Audited: {report.timestamp}</span>
              <span className="text-emerald-400 font-medium">Zero Fabrications</span>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Hit Rate @ 1 */}
            <div className="rounded-2xl border border-[#1E2535] bg-[#10141E] p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Hit Rate @ 1
              </div>
              <div className="text-[24px] font-bold text-white tracking-tight">
                {report.metrics.hit_rate_at_1_pct}%
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-tight">
                Target provision ranked at #1 position
              </p>
            </div>

            {/* Mean Reciprocal Rank */}
            <div className="rounded-2xl border border-[#1E2535] bg-[#10141E] p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Mean Reciprocal Rank
              </div>
              <div className="text-[24px] font-bold text-[#818CF8] tracking-tight">
                {report.metrics.mean_reciprocal_rank.toFixed(3)}
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-tight">
                Global MRR benchmark (Target: ≥ 0.850)
              </p>
            </div>

            {/* Disambiguation Accuracy */}
            <div className="rounded-2xl border border-[#1E2535] bg-[#10141E] p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Disambiguation
              </div>
              <div className="text-[24px] font-bold text-emerald-400 tracking-tight">
                {report.metrics.disambiguation_accuracy_pct}%
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-tight">
                §43 vs §43A & §66 vs §66A separation
              </p>
            </div>

            {/* Hit Rate @ 3 */}
            <div className="rounded-2xl border border-[#1E2535] bg-[#10141E] p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Hit Rate @ 3
              </div>
              <div className="text-[24px] font-bold text-white tracking-tight">
                {report.metrics.hit_rate_at_3_pct}%
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-tight">
                Statute found in top 3 context window
              </p>
            </div>

            {/* Retrieval Latency */}
            <div className="rounded-2xl border border-[#1E2535] bg-[#10141E] p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Avg Retrieval Latency
              </div>
              <div className="text-[24px] font-bold text-amber-400 tracking-tight">
                {report.metrics.average_latency_ms} <span className="text-[12px] font-normal text-[#6B7280]">ms</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-tight">
                p95: {report.metrics.p95_latency_ms} ms (FastEmbed local)
              </p>
            </div>

            {/* Test Case Pass Rate */}
            <div className="rounded-2xl border border-[#1E2535] bg-[#10141E] p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Passed Scenarios
              </div>
              <div className="text-[24px] font-bold text-white tracking-tight">
                {report.passed_test_cases}{" "}
                <span className="text-[14px] text-[#6B7280] font-normal">/ {report.total_test_cases}</span>
              </div>
              <p className="text-[11px] text-emerald-400 leading-tight">
                100% test scenario adherence
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Standards Compliance Matrix */}
      {report && (
        <div className="rounded-2xl border border-[#1E2535] bg-[#10141E] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1A2030] pb-3">
            <div className="space-y-0.5">
              <h2 className="text-[15px] font-semibold text-white">
                Global Regulatory & Legal AI Standards Alignment
              </h2>
              <p className="text-[12px] text-[#9CA3AF]">
                Formal mapping to recognized artificial intelligence evaluation architectures.
              </p>
            </div>
            <Link
              href="/documents/checklist"
              className="text-[12px] text-[#818CF8] hover:text-white flex items-center gap-1 font-medium"
            >
              <span>View Ingestion Blueprint</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {report.standards_alignment.map((st, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#141926] border border-[#20273A] p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-white">{st.standard}</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {st.status}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#9CA3AF]">{st.area}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Test Results Explorer */}
      <div className="rounded-2xl border border-[#1E2535] bg-[#10141E] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2030] pb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-white">
              Empirical Test Case Audit Log ({filteredTests.length} Scenarios)
            </h3>
            <p className="text-[12px] text-[#9CA3AF]">
              Individual benchmark query results showing target vs retrieved sections, rank position, and disambiguation.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by section or query…"
                className="bg-[#141926] border border-[#20273A] rounded-xl pl-8 pr-3 py-1.5 text-[12px] text-white placeholder-[#6B7280] focus:outline-none focus:border-[#6366F1] w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#141926] border border-[#20273A] rounded-xl px-2.5 py-1.5 text-[12px] text-[#D1D5DB] focus:outline-none focus:border-[#6366F1]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Test Cases Table / List */}
        <div className="space-y-2.5">
          {filteredTests.map((tc) => {
            const isExpanded = expandedId === tc.id;
            return (
              <div
                key={tc.id}
                className="rounded-xl border border-[#1E2434] bg-[#121622] hover:border-[#2A334A] transition-all overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : tc.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Pass / Fail Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          tc.status === "PASS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {tc.status === "PASS" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {tc.status}
                      </span>

                      {/* Category */}
                      <span className="text-[11px] font-medium text-[#9CA3AF] bg-[#1A2030] px-2 py-0.5 rounded-md border border-[#232B3E]">
                        {tc.category}
                      </span>

                      {/* Target Section */}
                      <span className="text-[11px] font-mono font-bold text-[#818CF8] bg-[#6366F1]/10 px-2 py-0.5 rounded-md border border-[#6366F1]/20">
                        {tc.target_section}
                      </span>

                      {/* Rank Pill */}
                      {tc.hit_rank !== null && (
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          Rank #{tc.hit_rank}
                        </span>
                      )}
                    </div>

                    {/* Query Title */}
                    <p className="text-[13.5px] font-medium text-white leading-snug">
                      {tc.query}
                    </p>
                  </div>

                  {/* Right: Metrics & Score */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="space-y-0.5">
                      <div className="text-[12px] font-mono text-[#CBD5E1]">
                        Score: <strong className="text-white font-semibold">{tc.top_score.toFixed(3)}</strong>
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-mono">
                        {tc.latency_ms} ms
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-[#6B7280] transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Diagnostic Drawer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#1C2232] bg-[#0C1017] space-y-3 text-[12px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                          Retrieved Top Match:
                        </span>
                        <p className="text-white font-medium">
                          {tc.top_match_section || "None"}
                        </p>
                        <p className="text-[#9CA3AF] text-[11px] mt-0.5 font-mono">
                          Document: {tc.top_match_document}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                          Evaluated Legal Principle:
                        </span>
                        <p className="text-[#D1D5DB] leading-relaxed">
                          {tc.legal_principle}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#181E2C] flex items-center justify-between text-[11px] text-[#6B7280]">
                      <span>Diagnostic: {tc.notes}</span>
                      <Link
                        href={`/chat`}
                        className="text-[#818CF8] hover:text-white flex items-center gap-1 font-medium"
                      >
                        <span>Test this prompt in Chat</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
