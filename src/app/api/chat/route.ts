import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

interface RetrievedChunk {
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

const nvidia = createOpenAI({
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY || "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",
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages, selectedDocId } = await req.json();
    const lastUser = (messages as { role: string; content?: string; parts?: { type: string; text?: string }[] }[])
      .filter(m => m.role === "user")
      .pop();
    let userQuery = "";
    if (lastUser) {
      if (typeof lastUser.content === "string") userQuery = lastUser.content;
      else if (Array.isArray(lastUser.parts)) {
        userQuery = lastUser.parts.filter(p => p.type === "text").map(p => p.text).join(" ");
      }
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const docFilter = selectedDocId && selectedDocId !== "all" ? [selectedDocId] : undefined;
    let retrievedChunks: RetrievedChunk[] = [];
    try {
      const searchRes = await fetch(`${apiBaseUrl}/rag/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, top_k: 8, document_ids: docFilter }),
      });
      if (searchRes.ok) {
        const data = await searchRes.json();
        retrievedChunks = data.results || [];
      }
    } catch (e) {
      console.error("Vector retrieval error:", e);
    }

    // — RAG relevance guard: ensure top relevant chunks are retained —
    const MIN_SIMILARITY = 0.50;
    const queryLower = userQuery.toLowerCase();
    const isJudgmentQuery = /judg(e)?ment|case\s*law|supreme\s*court|high\s*court/i.test(queryLower);

    let filteredChunks = retrievedChunks.filter(c => (c.similarity_score ?? 0) >= MIN_SIMILARITY);
    // If top chunks were retrieved from retriever, ensure we have at least top 4 if available
    if (filteredChunks.length === 0 && retrievedChunks.length > 0) {
      filteredChunks = retrievedChunks.slice(0, 4);
    }

    let hasOnlyActsForJudgmentQuery = false;
    if (isJudgmentQuery && filteredChunks.length > 0) {
      const judgmentChunks = filteredChunks.filter(c => {
        const title = (c.document_title || "").toLowerCase();
        const metaType = ((c.metadata as Record<string, unknown>)?.doc_type as string) || ((c.metadata as Record<string, unknown>)?.document_type as string);
        return metaType === "judgment" || title.includes("judgment") || title.includes("judgement") || title.includes(" vs ") || title.includes(" v. ");
      });
      if (judgmentChunks.length > 0) {
        filteredChunks = judgmentChunks;
      } else {
        hasOnlyActsForJudgmentQuery = true;
      }
    }

    const sources = filteredChunks.map((c, i) => ({
      source_number: i + 1,
      document_id: c.document_id,
      document_title: c.document_title,
      section_title: c.section_title,
      act_number: c.act_number,
      similarity_score: c.similarity_score,
      chunk_id: c.chunk_id,
      content_preview: c.content,
    }));

    let contextText = "";
    if (filteredChunks.length > 0) {
      contextText = filteredChunks
        .map((c, i) => `[Source ${i + 1}] ${c.document_title}${c.act_number ? ` (${c.act_number})` : ""} - ${c.section_title || "General"} [${c.act_number ? "Act" : "Judgment"}]:\n${c.content}`)
        .join("\n\n");
    }

    const systemPrompt = `You are Soli, a senior Legal Research Assistant specializing in Indian Law (Statutory Acts, Codes, Rules, and Judicial Precedents).

Your objective is to provide an in-depth, thorough, and exhaustive legal research answer to the user's inquiry, grounded strictly in the verified sources provided below.

VERIFIED CONTEXT (${filteredChunks.length} passages):
${contextText || "No passages found."}
${hasOnlyActsForJudgmentQuery ? `\nSPECIAL INSTRUCTION: The user queried for judgments, but the connected knowledge base currently contains statutory Acts on this subject (e.g. Indian Contract Act, 1872). Begin by noting: "While specific judicial case files on breach of contract are not currently indexed in your library, the governing statutory framework under the Indian Contract Act, 1872 provides the authoritative legal foundation for compensation, damages, and remedies upon breach of contract:" then provide an extensive, detailed breakdown of Sections 73, 74, and related principles citing [Source 1], [Source 2], etc.` : ""}

INSTRUCTIONS FOR DETAILED, HIGH-QUALITY OUTPUT:
1. **Executive Overview**: Provide a clear, substantive direct answer summarizing the applicable legal position under Indian law.
2. **Comprehensive Statutory Analysis**:
   - Provide an in-depth, section-by-section breakdown for every relevant provision found in the context.
   - Detail the exact legal tests, prerequisites, statutory conditions, and exceptions (e.g., remoteness of damage, mitigation duty, liquidated damages vs penalty).
   - Use clear markdown headings (e.g. "### Section 73: Compensation for Loss Caused by Breach").
3. **Structured Principles**:
   - Enumerate key conditions and statutory elements using numbered clauses (01, 02, etc.) or bullet points.
4. **Strict Grounding & Inline Citations**:
   - Every single legal claim, statutory assertion, or section explanation MUST be followed immediately by its inline citation tag like [1] or [2] (or [1][2] / [1, 2] if multiple apply).
   - Cite only sources from VERIFIED CONTEXT using their index number: [1], [2], etc. Do not include raw URLs, database IDs, or chunk IDs.
5. **Length & Depth**:
   - Write a rich, multi-paragraph, professional research briefing. Avoid brief summaries or surface-level answers.`;

    const modelName = process.env.NVIDIA_LLM_MODEL || "meta/llama-3.2-11b-vision-instruct";

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({
            type: "data-sources" as const,
            data: sources,
            transient: false,
          } as unknown as never);

          if (sources.length === 0) {
            const fallback = isJudgmentQuery
              ? `No judgments on "${userQuery.replace(/"/g, "'")}" were found in your connected knowledge base. Your library currently contains no judgments matching this query with sufficient relevance (threshold ${MIN_SIMILARITY}). Please upload relevant judgments (e.g., Supreme Court / High Court orders) or try a broader search.`
              : `No relevant sources found in your connected knowledge base for "${userQuery.replace(/"/g, "'")}" with sufficient relevance (threshold ${MIN_SIMILARITY}). Please upload relevant documents or rephrase your query.`;
            writer.write({ type: "text-start" as const, id: "fallback" } as unknown as never);
            for (const chunk of fallback.match(/.{1,18}/g) ?? [fallback]) {
              writer.write({ type: "text-delta" as const, id: "fallback", delta: chunk } as unknown as never);
              await new Promise(r => setTimeout(r, 8));
            }
            writer.write({ type: "text-end" as const, id: "fallback" } as unknown as never);
            return;
          }

          try {
            const modelMessages = await convertToModelMessages(messages as unknown as never);
            const result = streamText({
              model: nvidia.chat(modelName),
              system: systemPrompt,
              messages: modelMessages,
              temperature: 0.2,
            });
            writer.merge(result.toUIMessageStream());
          } catch (e) {
            console.error("streamText failed, falling back:", e);
            const fallback =
              `Answer generation failed, but ${sources.length} relevant sources were found. ` +
              sources.map((s, i) => `[${i + 1}] ${s.document_title}${s.section_title ? ` — ${s.section_title}` : ""}`).join("; ") +
              `. Please retry or check the Sources panel for the retrieved passages.`;
            writer.write({ type: "text-start" as const, id: "fallback-err" } as unknown as never);
            for (const chunk of fallback.match(/.{1,18}/g) ?? [fallback]) {
              writer.write({ type: "text-delta" as const, id: "fallback-err", delta: chunk } as unknown as never);
              await new Promise(r => setTimeout(r, 5));
            }
            writer.write({ type: "text-end" as const, id: "fallback-err" } as unknown as never);
          }
        },
      }),
    });
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Error in /api/chat:", e);
    return new Response(JSON.stringify({ error: e.message || "Chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
