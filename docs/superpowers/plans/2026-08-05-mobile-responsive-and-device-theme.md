# Mobile Responsiveness & Device Theme Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio site usable on mobile viewports and make the theme respect the visitor's OS/browser color-scheme preference on first visit.

**Architecture:** Two independent fixes, no shared code:
1. `ThemeService.getInitialTheme()` gains a `window.matchMedia('(prefers-color-scheme: dark)')` fallback, used only when no theme is stored in `localStorage` yet.
2. Four Angular components (`nav`, `home-skills`, `home-projects`, `home-education`) get Tailwind responsive breakpoint classes (`sm:`/`md:`) added to their inline templates so grids stack to a single column and the nav collapses to a hamburger menu below `md` (768px). No new dependencies, no new CSS files — everything is Tailwind utility classes already available via the existing `@import 'tailwindcss'` in `src/styles.css`.

**Tech Stack:** Angular 21 (standalone components, signals, `@angular/build:unit-test` / Vitest), Tailwind CSS v4 (default breakpoints: `sm`=640px, `md`=768px, `lg`=1024px).

## Global Constraints

- Angular 21 standalone components with `ChangeDetectionStrategy.OnPush` — preserve this on every touched component.
- Tailwind v4 default breakpoints only — do not add a custom `tailwind.config.*` (project has none; config lives in `src/styles.css` via `@import`).
- No new npm dependencies.
- Existing visual language (neo-brutalist borders, `--ink`/`--bg`/`--card-bg` CSS vars, `neo-border`, `glass-card` classes) must be preserved — only add responsive layout classes, don't restyle.
- `ThemeService` public API (`theme`, `isDark`, `toggle()`) must not change — only the private `getInitialTheme()` fallback logic changes.
- This repo has zero existing `*.spec.ts` files; Task 1 introduces the first one. Follow Angular's default convention: co-located `<name>.spec.ts` next to the file under test, using `TestBed` from `@angular/core/testing`.

---

## File Structure

| File | Change |
|---|---|
| `src/app/core/services/theme.service.ts` | Modify `getInitialTheme()` to fall back to `matchMedia` when nothing is stored |
| `src/app/core/services/theme.service.spec.ts` | **New** — unit tests for the three init paths (stored / matchMedia dark / matchMedia light-or-absent) |
| `src/app/shared/components/nav/nav.component.ts` | Add a `menuOpen` signal, a hamburger button (visible `< md`), and collapse the nav links + toggles into a dropdown panel on mobile |
| `src/app/features/home/components/home-skills.component.ts` | Bento grid: `grid-cols-6` → responsive `grid-cols-1 sm:grid-cols-2 md:grid-cols-6`, per-item span moved from inline `[style.grid-column]` to a computed Tailwind class active only at `md:` |
| `src/app/features/home/components/home-projects.component.ts` | Project card grid: `grid-cols-[1.1fr_1fr]` → `grid-cols-1 md:grid-cols-[1.1fr_1fr]` |
| `src/app/features/home/components/home-education.component.ts` | Education/languages grid: `grid-cols-[1.4fr_1fr]` → `grid-cols-1 md:grid-cols-[1.4fr_1fr]` |

---

### Task 1: Theme service reads device color-scheme preference

**Files:**
- Modify: `src/app/core/services/theme.service.ts:27-33`
- Test: `src/app/core/services/theme.service.spec.ts` (new)

**Interfaces:**
- Consumes: nothing new.
- Produces: no change to public API. `getInitialTheme()` stays `private`; behavior change only.

- [ ] **Step 1: Write the failing tests**

Create `src/app/core/services/theme.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses the stored theme when one exists, ignoring device preference', () => {
    localStorage.setItem('portfolio-theme', 'light');
    mockMatchMedia(true); // device prefers dark, but stored value wins
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
  });

  it('falls back to dark when nothing is stored and the device prefers dark', () => {
    mockMatchMedia(true);
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
  });

  it('falls back to light when nothing is stored and the device does not prefer dark', () => {
    mockMatchMedia(false);
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --include src/app/core/services/theme.service.spec.ts`

Expected: the second and third tests FAIL (both currently return `'light'` regardless of `matchMedia`, since the source never reads it). The first test passes already — that's fine, it's there to lock in the "stored value always wins" behavior so Step 3 can't regress it.

- [ ] **Step 3: Implement the minimal fix**

In `src/app/core/services/theme.service.ts`, replace lines 27-33:

```ts
  private getInitialTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'light';
  }
```

with:

```ts
  private getInitialTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    }
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) return 'dark';
    }
    return 'light';
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --include src/app/core/services/theme.service.spec.ts`

Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services/theme.service.ts src/app/core/services/theme.service.spec.ts
git commit -m "fix: fall back to device color-scheme preference for initial theme"
```

---

### Task 2: Nav collapses to a hamburger menu below md (768px)

**Files:**
- Modify: `src/app/shared/components/nav/nav.component.ts` (full template rewrite of the `<nav>` block, lines 15-51; add state to the class, lines 54-60)

**Interfaces:**
- Consumes: `ThemeService.isDark()`, `ThemeService.toggle()`, `LanguageService.currentLang()`, `LanguageService.toggleLanguage()`, `NavItem[]` — all unchanged, already present.
- Produces: no new public members other than the internal `menuOpen` signal (not consumed elsewhere).

- [ ] **Step 1: Manual repro — confirm current overflow on mobile**

Run: `npm start`, open `http://localhost:4200`, open browser DevTools, set device toolbar to a 375px-wide viewport (e.g. "iPhone SE").

Expected: the pill nav bar's 5 links + logo + theme toggle + language toggle overflow or wrap and clip against the rounded pill edge — confirms the bug before touching code.

- [ ] **Step 2: Add a `menuOpen` signal to the component class**

In `src/app/shared/components/nav/nav.component.ts`, in the class body (after line 59 `active = signal('home');`), add:

```ts
  menuOpen = signal(false);
```

And add a toggle method near `scrollToTop()` (after line 99's closing brace, i.e. after the `scrollToTop` method):

```ts
  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
```

Also update `scrollTo(id: string)` (lines 93-96) to close the mobile menu on navigation — replace:

```ts
  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  }
```

with:

```ts
  scrollTo(id: string) {
    this.closeMenu();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  }
```

- [ ] **Step 3: Rewrite the template to add a hamburger toggle and collapse the links panel**

Replace the entire `template` string (lines 15-51) with:

```ts
  template: `
    <nav class="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 sm:px-6 pt-4 pointer-events-none">
      <div class="pointer-events-auto w-full max-w-[1020px] flex flex-col md:block">
        <div class="flex items-center justify-between gap-2 pl-5 pr-2 py-2.5 rounded-full neo-border transition-all backdrop-filter backdrop-blur-[14px]"
             [style.background]="scrolled() ? (themeService.isDark() ? 'rgba(28,28,32,0.75)' : 'rgba(255,255,255,0.70)') : (themeService.isDark() ? 'rgba(28,28,32,0.4)' : 'rgba(255,255,255,0.35)')"
             [style.boxShadow]="scrolled() ? '0 6px 0 rgba(0,0,0,0.1)' : 'none'">
          <button (click)="scrollToTop()" class="font-[var(--font-display)] font-bold text-lg tracking-tight flex items-center gap-2 text-[var(--ink)]">
            <span class="w-2.5 h-2.5 rounded-[3px] bg-[var(--color-accent)] rotate-45 inline-block"></span>
            WA
          </button>

          <div class="hidden md:flex items-center gap-0.5">
            @for (item of items; track item.id) {
              <button (click)="scrollTo(item.id)"
                      class="relative px-3.5 py-2 rounded-full text-[13px] font-[var(--font-display)] font-medium"
                      style="transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);"
                      [style.background]="active() === item.id ? 'var(--ink)' : 'transparent'"
                      [style.color]="active() === item.id ? 'var(--bg)' : 'var(--ink)'">
                {{ item.label }}
              </button>
            }
          </div>

          <div class="hidden md:flex items-center gap-2">
            <button (click)="themeService.toggle()" title="Toggle theme"
                    class="w-8.5 h-8.5 rounded-full neo-border bg-[var(--card-bg)] flex items-center justify-center">
              <ng-icon [name]="themeService.isDark() ? 'tablerMoon' : 'tablerSun'" size="15"></ng-icon>
            </button>
            <button (click)="langService.toggleLanguage()"
                    class="font-[var(--font-mono)] text-[11px] font-bold tracking-wide neo-border rounded-full px-2.5 py-1.5 bg-[var(--card-bg)] flex gap-1.5">
              <span [class.opacity-100]="langService.currentLang() === 'en'" [class.opacity-35]="langService.currentLang() !== 'en'">EN</span>
              <span class="opacity-30">/</span>
              <span [class.opacity-100]="langService.currentLang() === 'es'" [class.opacity-35]="langService.currentLang() !== 'es'">ES</span>
            </button>
          </div>

          <button (click)="toggleMenu()" title="Menu"
                  class="md:hidden w-8.5 h-8.5 rounded-full neo-border bg-[var(--card-bg)] flex items-center justify-center">
            <ng-icon [name]="menuOpen() ? 'tablerX' : 'tablerMenu2'" size="16"></ng-icon>
          </button>
        </div>

        @if (menuOpen()) {
          <div class="md:hidden mt-2 p-3 rounded-[24px] neo-border flex flex-col gap-1"
               [style.background]="themeService.isDark() ? 'rgba(28,28,32,0.92)' : 'rgba(255,255,255,0.92)'">
            @for (item of items; track item.id) {
              <button (click)="scrollTo(item.id)"
                      class="text-left px-4 py-2.5 rounded-2xl text-[14px] font-[var(--font-display)] font-medium"
                      [style.background]="active() === item.id ? 'var(--ink)' : 'transparent'"
                      [style.color]="active() === item.id ? 'var(--bg)' : 'var(--ink)'">
                {{ item.label }}
              </button>
            }
            <div class="flex items-center gap-2 mt-2 px-1">
              <button (click)="themeService.toggle()" title="Toggle theme"
                      class="w-8.5 h-8.5 rounded-full neo-border bg-[var(--card-bg)] flex items-center justify-center">
                <ng-icon [name]="themeService.isDark() ? 'tablerMoon' : 'tablerSun'" size="15"></ng-icon>
              </button>
              <button (click)="langService.toggleLanguage()"
                      class="font-[var(--font-mono)] text-[11px] font-bold tracking-wide neo-border rounded-full px-2.5 py-1.5 bg-[var(--card-bg)] flex gap-1.5">
                <span [class.opacity-100]="langService.currentLang() === 'en'" [class.opacity-35]="langService.currentLang() !== 'en'">EN</span>
                <span class="opacity-30">/</span>
                <span [class.opacity-100]="langService.currentLang() === 'es'" [class.opacity-35]="langService.currentLang() !== 'es'">ES</span>
              </button>
            </div>
          </div>
        }
      </div>
    </nav>
  `,
```

- [ ] **Step 4: Register the new icons**

The template now references `tablerMenu2` and `tablerX`, which aren't imported. Update the top of `src/app/shared/components/nav/nav.component.ts`:

Replace line 4:
```ts
import { tablerSun, tablerMoon } from '@ng-icons/tabler-icons';
```
with:
```ts
import { tablerSun, tablerMoon, tablerMenu2, tablerX } from '@ng-icons/tabler-icons';
```

Replace line 14:
```ts
  providers: [provideIcons({ tablerSun, tablerMoon })],
```
with:
```ts
  providers: [provideIcons({ tablerSun, tablerMoon, tablerMenu2, tablerX })],
```

- [ ] **Step 5: Build to catch template/type errors**

Run: `npm run build`

Expected: build succeeds with no errors (this catches unknown-icon-name and template syntax mistakes immediately, since there's no component test harness in this repo for nav yet).

- [ ] **Step 6: Manual verification at 375px and 768px+**

Run: `npm start`, open `http://localhost:4200` with DevTools device toolbar:
- At 375px: only the logo + hamburger button show in the pill; clicking the hamburger opens a dropdown panel with all 5 links, theme toggle, and language toggle, none of it clipped or overflowing the viewport width.
- At 1024px (desktop): hamburger button is hidden, full inline nav (links + toggles) shows exactly as before this change.
- Clicking a link in the mobile panel scrolls to the section and closes the panel.

- [ ] **Step 7: Commit**

```bash
git add src/app/shared/components/nav/nav.component.ts
git commit -m "feat: collapse nav into hamburger menu below md breakpoint"
```

---

### Task 3: Skills bento grid stacks responsively

**Files:**
- Modify: `src/app/features/home/components/home-skills.component.ts:21-34`

**Interfaces:**
- Consumes: `categories()` computed signal — unchanged, still returns `{ name, items, span, bg }[]`.
- Produces: no change to class API.

- [ ] **Step 1: Manual repro**

Run: `npm start`, DevTools device toolbar at 375px, scroll to the "Skills" section.

Expected: 6 fixed columns squeeze into ~350px — category cards are a few pixels wide, text wraps to one character per line.

- [ ] **Step 2: Make the grid responsive and scope per-item span to md+**

In `src/app/features/home/components/home-skills.component.ts`, replace lines 21-34:

```ts
      <div class="grid grid-cols-6 gap-4" style="grid-auto-rows: minmax(120px, auto);">
        @for (cat of categories(); track cat.name) {
          <div class="p-5.5 rounded-[18px] neo-border flex flex-col gap-3"
               [style.grid-column]="'span ' + cat.span"
               [style.background]="'var(' + cat.bg + ')'"
               [style.box-shadow]="'4px 4px 0 rgba(0,0,0,0.12)'"
               [style.color]="'var(--bento-text)'">
            <div class="font-[var(--font-display)] font-bold text-base">{{ cat.name }}</div>
            <div class="flex flex-wrap gap-2">
              @for (item of cat.items; track item) {
                <span class="font-[var(--font-mono)] text-[11.5px] font-semibold px-2.5 py-1 rounded-[7px] bg-[var(--chip-bg)] text-[var(--chip-text)] border border-[var(--chip-border)] backdrop-blur-xs">{{ item }}</span>
              }
            </div>
          </div>
        }
      </div>
```

with:

```ts
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4" style="grid-auto-rows: minmax(120px, auto);">
        @for (cat of categories(); track cat.name) {
          <div class="p-5.5 rounded-[18px] neo-border flex flex-col gap-3 col-span-1 sm:col-span-2"
               [class]="'md:!col-auto md:[grid-column:span_' + cat.span + ']'"
               [style.background]="'var(' + cat.bg + ')'"
               [style.box-shadow]="'4px 4px 0 rgba(0,0,0,0.12)'"
               [style.color]="'var(--bento-text)'">
            <div class="font-[var(--font-display)] font-bold text-base">{{ cat.name }}</div>
            <div class="flex flex-wrap gap-2">
              @for (item of cat.items; track item) {
                <span class="font-[var(--font-mono)] text-[11.5px] font-semibold px-2.5 py-1 rounded-[7px] bg-[var(--chip-bg)] text-[var(--chip-text)] border border-[var(--chip-border)] backdrop-blur-xs">{{ item }}</span>
              }
            </div>
          </div>
        }
      </div>
```

Notes on why: the two `class` bindings on the same element (`class="..."` static + `[class]="'...'"` dynamic) are both honored by Angular — they get merged. Below `sm` (640px) the grid has 1 explicit column and every card is `col-span-1` (full width). At `sm`-`md` (640-767px) the grid has 2 explicit columns and every card is `col-span-2` (still full width — 2 cards would overflow at their fixed `span` values like 3 or 4 in a 2-col grid). At `md`+ (768px) the grid switches to 6 explicit columns and `md:[grid-column:span_N]` restores the original bento layout, with `md:!col-auto` overriding the `col-span-2` utility class's specificity so the arbitrary value wins.

- [ ] **Step 3: Build to catch template errors**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 4: Manual verification at 375px, 700px, 1024px**

Run: `npm start`, DevTools device toolbar:
- 375px: skills cards stack one per row, full width, no horizontal scroll, all text readable.
- 700px: skills cards are 2 per row, full-width pairs, no card is spilling past the container.
- 1024px: 6-column bento grid renders identically to before this change (verify spans `[3,3,2,2,2,4]` visually match production today).

- [ ] **Step 5: Commit**

```bash
git add src/app/features/home/components/home-skills.component.ts
git commit -m "fix: stack skills bento grid responsively below md breakpoint"
```

---

### Task 4: Projects and education grids stack on mobile

**Files:**
- Modify: `src/app/features/home/components/home-projects.component.ts:35`
- Modify: `src/app/features/home/components/home-education.component.ts:13`

**Interfaces:**
- No signal/class API changes in either file — template-only edits.

- [ ] **Step 1: Manual repro**

Run: `npm start`, DevTools device toolbar at 375px:
- "Projects" section: image and text panel are squeezed side-by-side into two ~175px columns.
- "Education" section: education card and languages card are squeezed side-by-side.

- [ ] **Step 2: Fix the projects grid**

In `src/app/features/home/components/home-projects.component.ts`, line 35, replace:

```ts
                <div class="grid grid-cols-[1.1fr_1fr] rounded-[22px] neo-border-thick overflow-hidden glass-card" style="box-shadow: 6px 6px 0 var(--ink);" [class.animate-pulse]="isHighlighted(item.slug)">
```

with:

```ts
                <div class="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] rounded-[22px] neo-border-thick overflow-hidden glass-card" style="box-shadow: 6px 6px 0 var(--ink);" [class.animate-pulse]="isHighlighted(item.slug)">
```

- [ ] **Step 3: Fix the education grid**

In `src/app/features/home/components/home-education.component.ts`, line 13, replace:

```ts
        <section class="max-w-[980px] mx-auto px-6 pb-24 grid grid-cols-[1.4fr_1fr] gap-5">
```

with:

```ts
        <section class="max-w-[980px] mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-5">
```

- [ ] **Step 4: Build to catch template errors**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 5: Manual verification at 375px and 1024px**

Run: `npm start`, DevTools device toolbar:
- "Projects" at 375px: image stacks above the text/stack-chips/buttons block, both full width, image keeps its `min-h-[300px]`, no horizontal scroll. At 1024px: side-by-side layout unchanged from before this change.
- "Education" at 375px: education card stacks above languages card, both full width. At 1024px: side-by-side layout unchanged from before this change.

- [ ] **Step 6: Commit**

```bash
git add src/app/features/home/components/home-projects.component.ts src/app/features/home/components/home-education.component.ts
git commit -m "fix: stack projects and education grids on mobile viewports"
```

---

## Final Verification

- [ ] Run full test suite: `npm test` — all tests pass (including the 3 new `ThemeService` tests). (`ng test` runs once and exits in non-TTY environments; no `--run` flag exists — use `--include <path>` to scope to one file.)
- [ ] Run production build: `npm run build` — succeeds with no errors.
- [ ] Manual pass at 375px viewport across the whole page (home hero → marquee → experience → skills → projects → education → contact): no horizontal scrollbar anywhere, nav usable via hamburger, all text readable without zooming.
- [ ] Manual pass: clear `localStorage`, set OS/browser to dark mode, reload — site loads in dark theme. Clear `localStorage`, set OS/browser to light mode, reload — site loads in light theme. Toggle the theme button, reload — the manually chosen theme persists (stored value still wins over device preference).
