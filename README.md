# Soli Frontend — Premium Dark Legal AI Workspace

> **Soli** is a professional legal research workstation for Indian law firms. Grounded RAG chat with verifiable citations over your private Knowledge Base (Acts, Judgments, Rules, Legal Books, Case Files).

![Next.js](https://img.shields.io/badge/Next.js-16.3-000?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-7-000?logo=vercel)

---

## 1. Overview

`frontend/` is a **Next.js 16 App Router** SPA (Turbopack) that delivers the entire Soli experience:

- **Three-pane dark workstation** — `240px` fixed `Sidebar` + `flex:1` chat (`max-w 820`) + `320→360px` collapsible `Sources` drawer
- **RAG Chat** — streaming via **Vercel AI SDK** (`ai` 7 + `@ai-sdk/react` 4) against `POST /api/chat` which does `pgvector` retrieval before `streamText`
- **Documents** — list/search/delete with dark premium table, `X sources · Y chunks` live stats
- **Upload** — drag & drop PDF → `POST /documents/upload` (multipart, SHA256 dedup → `409`)
- **Research Agent** — `POST /research/search` over verified public Indian sources + `Add to library`
- **Persistence** — chat history survives refresh via `localStorage soli-chat-messages`

No top navbar — `Sidebar` is **permanent to all pages** (`components/Sidebar.tsx:1`, `AppShell.tsx:10`).

---

## 2. Features

| Area | Details |
|------|---------|
| **Chat** | `src/app/chat/page.tsx:1` — `useChat(DefaultChatTransport{api:/api/chat, body:{selectedDocId}})` + manual `input` state, `sendMessage({text})`, `stop()`, citations `[1]` → `CitationBadge` hover preview + click → right drawer, `SourceStrip` compact chips after answer, follow-ups, sticky composer (`shrink-0 sticky bottom-0`) |
| **Sources** | `SourcePanel`/`SourceDrawer` — `w-[320px] xl:w-[360px] max-w-[86vw]`, separate `overflow-y-auto`, `Open document → /documents/[id]`, highlight sync `hoveredSourceNum` |
| **Documents** | `src/app/documents/page.tsx:1` + `[id]/page.tsx:1` — search, `DELETE /documents/{id}` with dark confirmation modal (removes Knowledge Base + vector chunks via `CASCADE`), detail view without raw JSON |
| **Research** | `src/app/research/page.tsx:1` — 1160px two-col grid (`docTypeConfig` badges, `ScoreBar` authority/relevance/match), `Add to library` via `POST /research/fetch`, session history |
| **Design** | Dark tokens `globals.css:1` (`--soli-bg #0B0C0F`, `surface #151820`, `border #1F242E`, `accent #6366F1`), `Inter` via `next/font`, `lucide-react` 16-18px icons, `focus-visible:ring`, `overscroll-contain`, `break-words` handling |

---

## 3. Tech Stack

- **Framework:** Next 16.3.5 (Turbopack), App Router, `src/app/layout.tsx:1` (`Inter` swap, `dark` class, `selection:bg-[#6366F1]/30`)
- **UI:** Tailwind 4 (`@tailwindcss/postcss`), `globals.css:1` centralized dark tokens, no external component lib (custom)
- **AI:** `ai@7.0.102` + `@ai-sdk/react@4.0.105` + `@ai-sdk/openai@4.0.67` for NVIDIA (`integrate.api.nvidia.com`)
- **Icons:** `lucide-react@1.46.0`
- **State:** React `useState`/`useEffect` + `localStorage` (`soli-chat-messages`, `soli-selectedDocId` + `CustomEvent soli-scope-change` between `Sidebar` and `Chat`)

---

## 4. Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Inter + AppShell
│   │   ├── globals.css         # Dark tokens, scrollbar, animations
│   │   ├── page.tsx            # Home — hero + What you can ask + library preview
│   │   ├── chat/page.tsx       # 1200-line RAG workstation (3-pane, streaming, citations, drawer)
│   │   ├── documents/
│   │   │   ├── page.tsx        # List + search + delete modal
│   │   │   ├── new/page.tsx    # Upload drag & drop + progress
│   │   │   └── [id]/page.tsx   # Detail + Remove
│   │   ├── research/page.tsx   # Agent search + ingest + sessions
│   │   └── api/chat/route.ts   # RAG proxy: rag/search → context → streamText → toUIMessageStreamResponse
│   ├── components/
│   │   ├── AppShell.tsx        # Sidebar (fixed 240px) + lg:ml-[240px] main, mobile hamburger
│   │   └── Sidebar.tsx         # Workspace/Knowledge Base/Search Scope (localStorage sync)
│   └── lib/
│       └── api.ts              # API_BASE_URL, uploadDocument (XHR progress), CRUD + RAG helpers, RAGSource with document_id
├── public/
├── package.json
└── next.config.ts
```

---

## 5. Getting Started

**Prereqs:** Node 18+, `backend` running on `:8000`.

```bash
cd frontend
npm install
cp .env.example .env.local  # create if missing
npm run dev     # http://localhost:3000
npm run build   # production build (Turbopack)
npm run lint    # eslint 9
```

**Env (`.env.local`):**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NVIDIA_API_KEY=nvapi-...          # for /api/chat server route
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_LLM_MODEL=meta/llama-3.2-11b-vision-instruct
```

If `NVIDIA_API_KEY` is missing, `api/chat` falls back to canned `No judgments found…` streaming instead of empty card.

---

## 6. Key Components & UX Decisions

- **AppShell** (`components/AppShell.tsx:10`): `min-h-screen flex` + `Sidebar` fixed `left-0 top-0 bottom-0 w-[240px]`. No top `Navbar` (removed per spec). Mobile `lg:hidden` header with `Menu` toggle.
- **Sidebar** (`Sidebar.tsx:74`): `Workspace` (Chat/Documents/Upload/Research Agent) with active `bg-[#161B26]`, `Knowledge Base` (5 static categories → `Link /documents?filter=act` etc.), `Search Scope` (`select` → `localStorage` + `CustomEvent` → chat `sendMessage(..., {body:{selectedDocId}})`) — previously `transport` body was static, now per-message.
- **Chat Layout** (`chat/page.tsx:907`): Outer `flex flex-1 min-h-0 w-full overflow-hidden` → `Main 2-divs` (`flex flex-1`): `Chat DIV flex-1 flex-col h-full` (`flex-1 overflow-y-auto` messages + `shrink-0 sticky bottom-0` composer) + `Sources DIV w-[320px] xl:w-[360px] hidden xl:flex` (separate scroll). Fixes prior `div inside p` hydration error by changing `<p>` → `<div>` and `span` → `div inline-flex` for `CitationBadge`.
- **Persistence**: `isHydrated` guard prevents overwriting `[]` before `localStorage` read; on `messages` change, `JSON.stringify` saved. `Reset` clears storage.
- **Citations**: `InlineFormatting` splits `/\[(\d+)\]/`, `CitationBadge` `relative inline-flex` with `absolute` preview `w-[320px] bg-[#0F121A]`, click highlights `highlightedSourceNum` and scrolls `source-card-N`.

---

## 7. API Integration

All via `lib/api.ts:80` `API_BASE_URL`:

| Method | Endpoint | Used in |
|--------|----------|---------|
| `POST` | `/documents/upload` (multipart) | `documents/new` |
| `GET` | `/documents` / `/{id}` | `Sidebar`, `documents/*`, `chat` |
| `DELETE` | `/documents/{id}` → `204` | `documents/page.tsx`, `[id]/page.tsx` (also deletes `rag_chunks` cascade) |
| `POST` | `/rag/search` | `api/chat/route.ts` (retrieval) |
| `POST` | `/research/search` / `/fetch` | `research/page.tsx` |
| `GET` | `/rag/stats` | `chat` empty-state `816 → {total_chunks}` |

---

## 8. Design System

`globals.css:1` tokens: `soli-bg #0B0C0F`, `sidebar #101216` (via `Sidebar`), `surface #151820`, `border #1B202A`, `text #F1F2F3`, `muted #6B7280`, `accent #6366F1`. Dark `color-scheme: dark` via `html.dark`. No `transition: all`, only `transform/opacity`, `focus-visible:ring`, `aria-label` on icon buttons.

---

## 9. Deployment

- `next.config.ts` — set `turbopack.root` if monorepo warning appears.
- Build: `npm run build` → `.next` (static + `ƒ /api/chat` dynamic).
- Host on Vercel: set `NEXT_PUBLIC_API_BASE_URL` to production FastAPI URL and `NVIDIA_*` secrets.

---

## 10. Troubleshooting

- `GET /chat 500 input.trim` → fixed by `(input ?? "").trim()` and `value={input}` (`chat/page.tsx:230`).
- `createDataStreamResponse` missing → now `createUIMessageStreamResponse` + `convertToModelMessages` awaited (`api/chat/route.ts:83`).
- `div inside p` hydration → changed `FormattedLegalAnswer` `<p>` → `<div>` and `CitationBadge` outer to `div inline-flex`.
- Sources empty even with docs → check `MIN_SIMILARITY=0.62` (`route.ts:60`) and judgment filter; lower if `0.68` is too strict.
