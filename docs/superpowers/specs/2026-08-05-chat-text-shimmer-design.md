# Chat Text Shimmer — Design

## Problem

`ChatComponent` talks to a serverless chat API. Cold starts can leave the
assistant bubble empty for a noticeable pause before the first token
arrives, and even once streaming starts, responses can land in fast bursts
that read as an abrupt jump from nothing to full text. The current UI shows
a plain blinking cursor block (`animate-pulse`) appended to whatever text
has streamed so far, with no distinct treatment for the "waiting on the
server" phase. This reads as unresponsive/static rather than "working".

## Goal

Give the user continuous visual feedback, from the moment they submit a
query until the assistant's response finishes streaming, using a single
shimmer effect that covers both:

1. The cold-start wait before any text has arrived.
2. The active streaming phase as text is appended.

## Non-goals

- No change to `ChatService`, streaming/SSE parsing, or any TypeScript
  message-handling logic — this is a template + CSS-only change.
- No per-character/typewriter animation — shimmer is a gradient sweep, not
  a reveal animation.
- No shimmer on user messages — only assistant messages get this treatment.

## Design

### Single mechanism, driven by existing state

Both the "waiting" and "streaming" phases are already represented by the
existing `ChatMessage.streaming` boolean (`chat.component.ts:17`). No new
component state is introduced. One CSS utility class renders the shimmer;
it is applied conditionally in the template based on whether `text` is
empty or not, both gated by `streaming`.

### Visual states in the assistant bubble

| State | Condition | Rendering |
|---|---|---|
| Waiting for first token | `streaming === true` and `text === ''` | Placeholder line ("Thinking…") rendered with the shimmer class applied to its text. |
| Streaming | `streaming === true` and `text !== ''` | The actual streamed text rendered with the shimmer class applied. |
| Done | `streaming === false` | Text rendered normally (solid `var(--ink)` color), shimmer class removed — no cursor block. |

The blinking cursor block currently appended after streaming text
(`chat.component.ts:70`) is removed; the shimmer on the text itself is the
sole "in progress" indicator.

### CSS: `.text-shimmer`

A new utility class, parallel to the existing `.skeleton` block-shimmer
(`styles.css:240-244`), but clipped to text instead of a background box:

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
    color: var(--ink);
    background: none;
    -webkit-text-fill-color: unset;
  }
}
```

Reuses the existing `@keyframes shimmer` already defined at
`styles.css:245` — no new keyframes needed. `prefers-reduced-motion` falls
back to static solid-colored text, matching the "done" state.

### Template changes (`chat.component.ts`)

In the assistant-message branch (`chat.component.ts:66-73`):

- If `msg.streaming && !msg.text`: render a placeholder `<span
  class="text-shimmer">Thinking…</span>` (or localized via
  `langService`, TBD in plan) instead of the empty text span.
- If `msg.streaming && msg.text`: render `<span class="text-shimmer
  whitespace-pre-wrap">{{ msg.text }}</span>`.
- If `!msg.streaming`: render the current plain `<span
  class="whitespace-pre-wrap">{{ msg.text }}</span>` — unchanged.
- Remove the trailing blinking-cursor `@if (msg.streaming)` block
  entirely.

### Error/edge cases

- If the stream errors out before any text arrives, `updateAssistantMessage`
  is called with `streaming: false` and an error string — this naturally
  falls into the "done" state and renders as plain solid text, no shimmer
  leaks.
- Rapid final chunk followed immediately by `streaming: false` (already the
  existing flow) transitions cleanly: shimmer class is simply absent once
  `streaming` flips.

## Testing

- Manual verification (per `verify` skill): open chat, submit a query,
  confirm shimmer appears immediately on "Thinking…", transitions to
  shimmering live text as tokens stream, and settles to solid text on
  completion.
- Verify `prefers-reduced-motion: reduce` (via OS/browser emulation) shows
  static solid text throughout, no animation.
- No unit tests planned — this is a pure presentational change with no new
  branching logic beyond template conditionals already covered by existing
  `streaming`/`text` state.
