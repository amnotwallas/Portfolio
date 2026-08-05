# Chat Text Shimmer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the chat assistant bubble a shimmering-text loading state that covers both the serverless cold-start wait (before the first token) and the active token-streaming phase, replacing the current blinking-cursor indicator.

**Architecture:** Pure CSS + Angular template change. A new `.text-shimmer` utility class (gradient text-clip animation, reusing the existing `shimmer` keyframe) is applied to the assistant message text whenever `ChatMessage.streaming` is `true`. No new component state, no service changes.

**Tech Stack:** Angular 17+ standalone components, Tailwind utility classes, plain CSS keyframes in `src/styles.css`, existing `LanguageService` i18n pattern.

## Global Constraints

- CSS-only visual change — no modifications to `ChatService`, SSE parsing, or `ChatMessage` interface (per spec Non-goals).
- Must respect `prefers-reduced-motion: reduce` — shimmer disables to static solid text.
- Placeholder "waiting for first token" text must be localized via `LanguageService` (en/es), following the existing `chatXxx` key naming convention in `language.service.ts`.
- No shimmer applied to user messages — assistant only.
- No unit tests planned for this change (spec: pure presentational, no new branching logic) — verification is manual, per the `verify` skill.

---

### Task 1: Add `chatThinking` i18n key

**Files:**
- Modify: `src/app/core/services/language.service.ts:33` (en block, after `chatEmptyState`)
- Modify: `src/app/core/services/language.service.ts:74` (es block, after `chatEmptyState`)

**Interfaces:**
- Consumes: nothing new.
- Produces: `langService.t().chatThinking` — a `string`, available to Task 3's template via the same `langService.t()` accessor already used for `chatEmptyState`/`chatPlaceholder`.

- [ ] **Step 1: Add the English key**

In `src/app/core/services/language.service.ts`, in the `en` object, immediately after the `chatEmptyState` line (line 33), add:

```typescript
      chatThinking: 'Thinking…',
```

- [ ] **Step 2: Add the Spanish key**

In the `es` object, immediately after the `chatEmptyState` line (line 74), add:

```typescript
      chatThinking: 'Pensando…',
```

- [ ] **Step 3: Verify the app still builds**

Run: `npx ng build --configuration development` (or the project's existing dev build command)
Expected: build succeeds with no TypeScript errors (both `en`/`es` objects must have matching key sets — a mismatch fails type inference on `translations`).

- [ ] **Step 4: Commit**

```bash
git add src/app/core/services/language.service.ts
git commit -m "feat: add chatThinking i18n key for chat shimmer placeholder

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GVGCFa5MThi9c6arRrNKn8"
```

---

### Task 2: Add `.text-shimmer` CSS utility

**Files:**
- Modify: `src/styles.css:245` (immediately after the existing `@keyframes shimmer` line, before the trailing blank line at 246)

**Interfaces:**
- Consumes: existing `@keyframes shimmer` (`styles.css:245`), existing CSS custom properties `--ink` and `--color-accent` (already used elsewhere in `styles.css`/`chat.component.ts`).
- Produces: `.text-shimmer` class, consumed by Task 3's template.

- [ ] **Step 1: Add the CSS rule**

In `src/styles.css`, immediately after line 245 (`@keyframes shimmer { ... }`), add:

```css
.text-shimmer {
  background: linear-gradient(90deg, var(--ink) 40%, var(--color-accent) 50%, var(--ink) 60%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer 1.5s infinite linear;
}
@media (prefers-reduced-motion: reduce) {
  .text-shimmer {
    animation: none;
    background: none;
    -webkit-text-fill-color: unset;
    color: var(--ink);
  }
}
```

- [ ] **Step 2: Manually verify the class in isolation**

Run the dev server (`npm start` / `ng serve`), open browser devtools, temporarily add `class="text-shimmer"` to any visible text element (e.g. via devtools element inspector), and confirm a gradient sweep animates across the text. Remove the temporary edit — this is a throwaway visual check, not a code change.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: add text-shimmer CSS utility for chat loading state

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GVGCFa5MThi9c6arRrNKn8"
```

---

### Task 3: Apply shimmer to the assistant message in `ChatComponent`

**Files:**
- Modify: `src/app/shared/components/chat/chat.component.ts:66-73` (assistant message branch template)

**Interfaces:**
- Consumes: `msg.streaming: boolean | undefined`, `msg.text: string` (existing `ChatMessage` fields, `chat.component.ts:13-18`), `langService.t().chatThinking` (from Task 1), `.text-shimmer` class (from Task 2).
- Produces: no new interfaces — this is the terminal consumer.

- [ ] **Step 1: Replace the assistant message template block**

In `src/app/shared/components/chat/chat.component.ts`, replace lines 66-73:

```typescript
            } @else {
              <div class="self-start max-w-[88%] px-3.5 py-2.5 rounded-[16px_16px_16px_4px] bg-[var(--card-bg)] border border-[var(--ink)]/15 text-[var(--ink)] text-xs leading-relaxed neo-shadow-xs animate-fade-up">
                <span class="whitespace-pre-wrap">{{ msg.text }}</span>
                @if (msg.streaming) {
                  <span class="inline-block w-1.5 h-3 bg-[var(--color-accent)] ml-0.5 animate-pulse"></span>
                }
              </div>
            }
```

with:

```typescript
            } @else {
              <div class="self-start max-w-[88%] px-3.5 py-2.5 rounded-[16px_16px_16px_4px] bg-[var(--card-bg)] border border-[var(--ink)]/15 text-[var(--ink)] text-xs leading-relaxed neo-shadow-xs animate-fade-up">
                @if (msg.streaming && !msg.text) {
                  <span class="text-shimmer font-medium">{{ langService.t().chatThinking }}</span>
                } @else if (msg.streaming) {
                  <span class="text-shimmer whitespace-pre-wrap">{{ msg.text }}</span>
                } @else {
                  <span class="whitespace-pre-wrap">{{ msg.text }}</span>
                }
              </div>
            }
```

- [ ] **Step 2: Run the app and manually verify the full flow**

Run the dev server, open the chat widget, submit a query (`chatInput` → `onChatSubmit()` in `chat.component.ts:161`), and confirm, in order:
1. Immediately after submit, the assistant bubble shows shimmering "Thinking…" (or "Pensando…" if `currentLang` is `es`).
2. As soon as the first SSE chunk arrives (`updateAssistantMessage` called with non-empty `fullText`, `chat.component.ts:207`), the placeholder is replaced by the shimmering live text, growing as more chunks arrive.
3. When the stream finishes (`streaming: false` set at `chat.component.ts:218`), the text stops shimmering and renders as solid `var(--ink)` colored text, with no leftover cursor block.
4. Trigger an error path (e.g. stop the backend) and confirm the error message (`chat.component.ts:222-225`) renders as plain solid text, not shimmering — since it's set with `streaming: false`.

Expected: all four checks pass visually; no console errors.

- [ ] **Step 3: Verify reduced-motion fallback**

In Chrome DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce", repeat the submit flow from Step 2.
Expected: "Thinking…" and streaming text render as static solid `var(--ink)` text with no animated gradient sweep.

- [ ] **Step 4: Commit**

```bash
git add src/app/shared/components/chat/chat.component.ts
git commit -m "feat: shimmer assistant chat text during cold-start wait and streaming

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GVGCFa5MThi9c6arRrNKn8"
```
