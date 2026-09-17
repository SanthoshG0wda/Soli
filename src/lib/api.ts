// ── Shared Types ─────────────────────────────────────────────────────────────

export type DocumentStatus =
  | "uploaded" | "extracting" | "extracted" | "parsing"
  | "parsed" | "validating" | "validated" | "in_review"
  | "published" | "rejected";

export interface Document {
  id: string;
  title: string;
  act_number: string | null;
  source_url: string | null;
  original_filename: string;
  status: DocumentStatus;
  uploaded_at: string;
}

export interface UploadDocumentPayload {
  file: File;
  title: string;
  act_number?: string;
  source_url?: string;
}

export interface FetchDocumentPayload {
  url: string;
  title: string;
  act_number?: string;
  source_url?: string;
}


export interface DuplicateErrorDetail {
  message: string;
  existing_document_id: string;
  existing_document_title: string;
}

export interface ApiError {
  status: number;
  message: string;
  duplicateDetail?: DuplicateErrorDetail;
}

// ── Research Agent Types ─────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source_name: string;
  source_domain: string;
  doc_type: "act" | "judgment" | "report" | "article" | "unknown";
  authority_score: number;
  relevance_score: number;
  combined_score: number;
  is_pdf: boolean;
}

export interface SearchResponse {
  session_id: string;
  query: string;
  expanded_queries: string[];
  llm_used: boolean;
  result_count: number;
  results: SearchResult[];
}

export interface FetchResponse {
  document_id: string;
  title: string;
  status: string;
  message: string;
}

export interface ResearchSession {
  id: string;
  query: string;
  result_count: number;
  ingested_count: number;
  llm_used: boolean;
  created_at: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ── Document API ─────────────────────────────────────────────────────────────

export function uploadDocument(
  payload: UploadDocumentPayload,
  onProgress?: (percent: number) => void
): Promise<Document> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/documents/upload`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      let data: Record<string, unknown> | null = null;
      try { data = JSON.parse(xhr.responseText) as Record<string, unknown>; } catch { data = null; }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as unknown as Document);
      } else if (xhr.status === 409) {
        const duplicateDetail = data?.detail as DuplicateErrorDetail | undefined;
        reject({ status: 409, message: duplicateDetail?.message || "Duplicate", duplicateDetail } as ApiError);
      } else {
        const msg = typeof data?.detail === "string" ? data.detail : `Upload failed with HTTP ${xhr.status}`;
        reject({ status: xhr.status, message: msg } as ApiError);
      }
    };

    xhr.onerror = () => reject({ status: 0, message: "Network error: Unable to connect to backend." } as ApiError);

    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("title", payload.title);
    if (payload.act_number) formData.append("act_number", payload.act_number);
    if (payload.source_url) formData.append("source_url", payload.source_url);
    xhr.send(formData);
  });
}

export async function fetchDocumentFromUrl(payload: FetchDocumentPayload): Promise<Document> {
  const res = await fetch(`${API_BASE_URL}/documents/fetch-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.ok) {
    return data as unknown as Document;
  }
  if (res.status === 409) {
    const duplicateDetail = data?.detail as DuplicateErrorDetail | undefined;
    throw {
      status: 409,
      message: duplicateDetail?.message || "Document already exists with identical file hash",
      duplicateDetail,
    } as ApiError;
  }
  const msg = typeof data?.detail === "string" ? data.detail : `Failed to fetch from URL (${res.status})`;
  throw { status: res.status, message: msg } as ApiError;
}

export function getDownloadDocumentUrl(id: string): string {
  return `${API_BASE_URL}/documents/${id}/download`;
}

export function getProxyDownloadUrl(url: string, title: string): string {
  return `${API_BASE_URL}/documents/proxy-download?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
}

export async function getDocument(id: string): Promise<Document> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: unknown };
    throw { status: res.status, message: typeof err.detail === "string" ? err.detail : `Failed (${res.status})` } as ApiError;
  }
  return res.json();
}

export async function listDocuments(): Promise<Document[]> {
  const res = await fetch(`${API_BASE_URL}/documents`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: unknown };
    throw { status: res.status, message: typeof err.detail === "string" ? err.detail : `Failed (${res.status})` } as ApiError;
  }
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: "DELETE",
  });
  if (res.status === 204 || res.ok) return;
  const err = await res.json().catch(() => ({})) as { detail?: unknown };
  throw { status: res.status, message: typeof err.detail === "string" ? err.detail : `Delete failed (${res.status})` } as ApiError;
}

// ── Research Agent API ────────────────────────────────────────────────────────

export async function searchDocuments(query: string, maxResults = 15): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE_URL}/research/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, max_results: maxResults }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw { status: res.status, message: err.detail || "Search failed" } as ApiError;
  }
  return res.json();
}

export async function fetchAndIngest(result: {
  result_id: string; title: string; url: string; doc_type: string; source_name: string;
}): Promise<FetchResponse> {
  const res = await fetch(`${API_BASE_URL}/research/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw { status: res.status, message: err.detail || "Fetch failed" } as ApiError;
  }
  return res.json();
}

export async function listResearchSessions(): Promise<ResearchSession[]> {
  const res = await fetch(`${API_BASE_URL}/research/sessions`, { cache: "no-store" });
  if (!res.ok) throw { status: res.status, message: "Failed to load sessions" } as ApiError;
  return res.json();
}

// ── RAG Pipeline API ─────────────────────────────────────────────────────────

export interface RAGIndexResponse {
  document_id: string;
  title: string;
  chunks_indexed: number;
  status: string;
}

export interface RAGIndexAllResponse {
  total_documents: number;
  results: Array<{
    document_id: string;
    status: "success" | "error";
    chunks?: number;
    error?: string;
  }>;
}

export interface RAGStats {
  total_chunks: number;
  indexed_documents: number;
  total_documents: number;
  vector_dimensions: number;
  embedding_model: string;
  llm_model: string;
}

export async function indexDocument(documentId: string): Promise<RAGIndexResponse> {
  const res = await fetch(`${API_BASE_URL}/rag/index/${documentId}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw { status: res.status, message: err.detail || "Indexing failed" } as ApiError;
  }
  return res.json();
}

export async function indexAllDocuments(): Promise<RAGIndexAllResponse> {
  const res = await fetch(`${API_BASE_URL}/rag/index-all`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw { status: res.status, message: err.detail || "Batch indexing failed" } as ApiError;
  }
  return res.json();
}

export async function getRagStats(): Promise<RAGStats> {
  const res = await fetch(`${API_BASE_URL}/rag/stats`, { cache: "no-store" });
  if (!res.ok) {
    throw { status: res.status, message: "Failed to load RAG stats" } as ApiError;
  }
  return res.json();
}

export interface RAGSource {
  source_number: number;
  document_id: string;
  document_title: string;
  section_title: string | null;
  act_number: string | null;
  similarity_score: number;
  chunk_id: string;
  content_preview: string;
}

export interface RAGAskResponse {
  answer: string;
  query: string;
  sources: RAGSource[];
  model_used: string;
}

export interface RAGSearchResultItem {
  chunk_id: string;
  document_id: string;
  document_title: string;
  act_number: string | null;
  section_title: string | null;
  chunk_index: number;
  similarity_score: number;
  content: string;
  metadata: Record<string, unknown>;
}

export interface RAGSearchResponse {
  query: string;
  count: number;
  results: RAGSearchResultItem[];
}

export async function ragAsk(payload: {
  query: string;
  top_k?: number;
  document_ids?: string[];
}): Promise<RAGAskResponse> {
  const res = await fetch(`${API_BASE_URL}/rag/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw { status: res.status, message: err.detail || "RAG query failed" } as ApiError;
  }
  return res.json();
}

export async function ragSearch(payload: {
  query: string;
  top_k?: number;
  document_ids?: string[];
  min_score?: number;
}): Promise<RAGSearchResponse> {
  const res = await fetch(`${API_BASE_URL}/rag/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw { status: res.status, message: err.detail || "RAG search failed" } as ApiError;
  }
  return res.json();
}

// ── Evaluation & Trust Benchmark API ─────────────────────────────────────────

export interface TestCaseResult {
  id: string;
  category: string;
  query: string;
  target_section: string;
  target_act: string;
  legal_principle: string;
  status: "PASS" | "FAIL";
  is_negative_test: boolean;
  latency_ms: number;
  top_match_section: string | null;
  top_match_document: string | null;
  top_score: number;
  hit_rank: number | null;
  disambiguation_passed?: boolean;
  notes: string;
}

export interface EvaluationMetrics {
  hit_rate_at_1_pct: number;
  hit_rate_at_3_pct: number;
  hit_rate_at_5_pct: number;
  mean_reciprocal_rank: number;
  disambiguation_accuracy_pct: number;
  average_latency_ms: number;
  p95_latency_ms: number;
}

export interface StandardsAlignment {
  standard: string;
  area: string;
  status: string;
}

export interface EvaluationReport {
  timestamp: string;
  total_test_cases: number;
  passed_test_cases: number;
  failed_test_cases: number;
  overall_accuracy_pct: number;
  trust_score_pct: number;
  release_grade: string;
  grade_badge: string;
  metrics: EvaluationMetrics;
  standards_alignment: StandardsAlignment[];
  test_results: TestCaseResult[];
}

export async function runEvaluationBenchmark(): Promise<EvaluationReport> {
  const res = await fetch(`${API_BASE_URL}/evaluation/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw { status: res.status, message: err.detail || "Benchmark execution failed" } as ApiError;
  }
  return res.json();
}

export async function getLatestEvaluation(): Promise<EvaluationReport> {
  const res = await fetch(`${API_BASE_URL}/evaluation/latest`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw { status: res.status, message: err.detail || "Failed to fetch evaluation report" } as ApiError;
  }
  return res.json();
}
