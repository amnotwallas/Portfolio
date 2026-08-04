# API-Driven Neobrutalist/Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the retro-terminal visual system with the Minimalism + Glassmorphism + Neobrutalism design captured in `project/*.dc.html`, while making `PortfolioService.portfolioDataSignal` (backed by `GET /api/v1/data`) and `ChatService` the *only* source of portfolio content — no component may hold fabricated bio/experience/project/skill/chat-suggestion copy that stands in for API data.

**Architecture:** Angular 21 standalone components + signals stay as-is. This is a visual + data-sourcing rebuild, not a framework change: existing services (`PortfolioService`, `ChatService`, `UiService`) are extended, not replaced; existing routes (`/home`, `/project/:slug`) are kept because they're a strict improvement over the mockup's two static per-project pages. Components that conflict with `project/` (speeddial, retro chat widget, accordion experience, grid+expand projects) are deleted and rebuilt rather than patched.

**Tech Stack:** Angular 21 (standalone components, signals, `@if`/`@for`/`@defer`), Tailwind CSS v4 (`@theme`), `@ng-icons/tabler-icons`, RxJS.

## Global Constraints

- All portfolio content — bio, work history, skills, projects, education, languages, contact links, system status/location, chat suggestions — must be read from `PortfolioService.portfolioDataSignal` or returned live by `ChatService`. No hardcoded arrays or strings stand in for that data anywhere in the diff.
- Fields the current API contract doesn't provide yet (`WorkExperience.tags`, `WorkExperience.metrics`, `Project.highlights`) are added as **optional** fields to `portfolio.model.ts` and rendered only `@if` present — never backfilled with invented values.
- UI chrome copy (nav item labels, button labels, section eyebrows, "Resume"/"Contact" labels, empty-state copy) is not portfolio data — it stays in `LanguageService.translations` as static EN/ES strings, same pattern as today.
- Visual system must match `project/Portfolio.dc.html`, `project/CaseLens Project.dc.html`, `project/WALTER-AI Project.dc.html`: fonts Space Grotesk (headings/labels) + Inter (body) + JetBrains Mono (mono/eyebrows); light theme `bg #FAFAF7` / `ink #15151A`, dark theme `bg #121214` / `ink #F2F2F0`; accent indigo `#3B4CF0` (hover `#222BAE`) and lime `#C6FF6B`; neobrutalist cards/buttons use `2px`–`2.5px` solid `var(--ink)` borders with flat offset shadows (`Npx Npx 0 <color>`, no blur); glass cards use `backdrop-filter: blur(...)` over a translucent `var(--glass)` background.
- Where the current implementation conflicts with `project/`, tear it down and rebuild to match — fidelity to `project/` wins over preserving existing markup/classes.
- This repo has no test runner wired up (`npm test` → `ng test`, no `.spec.ts` files exist, no Karma/Vitest config present). Do not invent a test harness as part of this plan. Each task's verification step is `npm run build` (must succeed with zero TypeScript errors) plus a manual visual check against the matching `project/*.dc.html` file via `npm start`.
- Commit messages must not reference AI tools, assistants, or generation — write them as a human engineer would.
- Work happens on branch `redesign/api-driven-neobrutalism-glass` (already created off `main`).

---

## File Structure

**Modify:**
- `src/styles.css` — replace retro token set with light/dark design tokens + neobrutalist/glass utility classes.
- `src/app/shared/models/portfolio.model.ts` — add optional `highlights`, `tags`, `metrics` fields.
- `src/app/core/services/language.service.ts` — replace translation keys with the new UI-copy set.
- `src/app/app.component.html` / `.ts` — swap speeddial for nav, keep chat + dock.
- `src/app/features/home/home.page.html` / `.ts` — reassemble sections in the new order, drive scramble phrases from real data.
- `src/app/features/home/components/home-hero.component.ts` — rebuild to hero mockup.
- `src/app/features/home/components/home-experience.component.ts` — rebuild to timeline mockup.
- `src/app/features/home/components/home-projects.component.ts` — rebuild to carousel mockup.
- `src/app/shared/components/chat/chat.component.ts` — restyle to floating panel, suggestions from API.
- `src/app/shared/components/footer/footer.component.ts` — rebuilt in place into the floating "dock".
- `src/app/features/projects/project-details.page.html` / `.ts` — restyle to case-study mockup layout, add highlights section.

**Create:**
- `src/app/core/services/theme.service.ts`
- `src/app/shared/components/nav/nav.component.ts`
- `src/app/shared/components/marquee/marquee.component.ts`
- `src/app/features/home/components/home-skills.component.ts`
- `src/app/features/home/components/home-education.component.ts`
- `src/app/features/home/components/home-contact.component.ts`

**Delete:**
- `src/app/shared/components/speeddial/speeddial.component.ts`
- `src/app/shared/components/speeddial/speeddial.component.html`
- `src/app/shared/directives/magnetic.directive.ts` (only ever imported by speeddial — confirmed via grep)

---

### Task 1: Design tokens & global styles

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Produces: CSS custom properties `--bg`, `--ink`, `--ink-soft`, `--glass`, `--glass-border`, `--card-bg`, `--chip-bg`, `--chip-border`, `--chat-bg`, `--stripe-a`, `--stripe-b`, `--dock-idle`, `--accent` (`#3B4CF0`), `--accent-hover` (`#222BAE`), `--lime` (`#C6FF6B`), consumed by every component task below via Tailwind arbitrary-value classes, e.g. `bg-[var(--bg)]`, `border-[var(--ink)]`, `text-[var(--ink-soft)]`.
- Produces: utility classes `.neo-border` (`border-2 border-[var(--ink)]`), `.neo-shadow` (`shadow-[4px_4px_0_var(--ink)]`), `.neo-shadow-lime` (`shadow-[4px_4px_0_var(--lime)]`), `.glass-card` (`bg-[var(--glass)] backdrop-blur-[10px] border border-[var(--glass-border)]`), `.pill` (`rounded-full`).
- Produces: keyframes `marquee`, `splashPop`, `blinkCursor`, `fadeUp` (ported verbatim from `project/Portfolio.dc.html:18-22`).

- [ ] **Step 1: Replace the retro theme block**

Delete the existing `@theme` block (`src/styles.css:4-16`) and the retro-specific rules that depend on it (`.text-glow`, `.text-glow-bright`, `.splash-text` Minecraft styling, `.animate-pulse-gold`, `.animate-neural-highlight`, `.animate-tooltip` — these are retro-only and have no equivalent in `project/`). Replace with:

```css
@import 'tailwindcss';
@import "tailwindcss-primeui";

@theme {
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --color-accent: #3B4CF0;
  --color-accent-hover: #222BAE;
  --color-lime: #C6FF6B;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
}

:root,
:root[data-theme="light"] {
  --bg: #FAFAF7;
  --ink: #15151A;
  --ink-soft: #6B6B76;
  --glass: rgba(255,255,255,0.6);
  --glass-border: rgba(21,21,26,0.1);
  --card-bg: #ffffff;
  --chip-bg: #F1F1EC;
  --chip-border: rgba(21,21,26,0.15);
  --chat-bg: rgba(255,255,255,0.85);
  --stripe-a: #EDEDE6;
  --stripe-b: #E2E2D8;
  --dock-idle: rgba(21,21,26,0.06);
  --bento-1: #EAF0FF; --bento-2: #FEF6E0; --bento-3: #EAFBE7;
  --bento-4: #FFF0F0; --bento-5: #F1EEFF; --bento-6: #EFFCF6;
  --bento-text: #15151A;
}

:root[data-theme="dark"] {
  --bg: #121214;
  --ink: #F2F2F0;
  --ink-soft: #A6A6AE;
  --glass: rgba(255,255,255,0.06);
  --glass-border: rgba(255,255,255,0.12);
  --card-bg: #1C1C20;
  --chip-bg: rgba(255,255,255,0.08);
  --chip-border: rgba(255,255,255,0.16);
  --chat-bg: rgba(28,28,32,0.92);
  --stripe-a: #232327;
  --stripe-b: #2B2B30;
  --dock-idle: rgba(255,255,255,0.08);
  --bento-1: #1B2440; --bento-2: #3A311A; --bento-3: #1B3324;
  --bento-4: #3A1C1C; --bento-5: #2A2140; --bento-6: #1A332C;
  --bento-text: #F2F2F0;
}

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  transition: background 0.3s ease, color 0.3s ease;
  overflow-x: hidden;
}

a { color: var(--color-accent); text-decoration: none; }
a:hover { color: var(--color-accent-hover); }

.neo-border { border: 2px solid var(--ink); }
.neo-border-thick { border: 2.5px solid var(--ink); }
.neo-shadow { box-shadow: 4px 4px 0 var(--ink); }
.neo-shadow-lime { box-shadow: 4px 4px 0 var(--color-lime); }
.glass-card {
  background: var(--glass);
  backdrop-filter: blur(10px);
  border: 1.5px solid var(--glass-border);
}

@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes splashPop { 0%,100% { transform: rotate(-8deg) scale(1); } 50% { transform: rotate(-8deg) scale(1.06); } }
@keyframes blinkCursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

.skeleton {
  background: linear-gradient(90deg, var(--chip-bg) 25%, rgba(59,76,240,0.08) 37%, var(--chip-bg) 63%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
```

- [ ] **Step 2: Update the font import**

In `src/index.html`, replace the current Google Fonts `<link>` (Space Grotesk only) with:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: succeeds with no errors (Tailwind will warn about now-unused retro classes still referenced by not-yet-rebuilt components — that's expected until later tasks land; if the build hard-fails, temporarily keep the old `@theme` retro variables alongside the new ones until Task 11).

- [ ] **Step 4: Commit**

```bash
git add src/styles.css src/index.html
git commit -m "style: replace retro theme tokens with light/dark neobrutalist-glass tokens"
```

---

### Task 2: Extend the portfolio model for optional API fields

**Files:**
- Modify: `src/app/shared/models/portfolio.model.ts`

**Interfaces:**
- Produces: `WorkExperience.tags?: string[]`, `WorkExperience.metrics?: string[]`, `Project.highlights?: string[]` — consumed by Task 8 (experience), Task 10 (projects), Task 15 (project details).

- [ ] **Step 1: Add the optional fields**

```typescript
export interface WorkExperience {
  company: string;
  role: string;
  period: string;
  summary: string;
  image?: string;
  highlights: string[];
  tags?: string[];
  metrics?: string[];
}
```

```typescript
export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string;
  image: string;
  images: string[];
  stack: string[];
  period: string;
  highlights?: string[];
  links: {
    github: string;
    demo: string | null;
  };
  metadata: ProjectMetadata;
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds (adding optional fields is non-breaking).

- [ ] **Step 3: Commit**

```bash
git add src/app/shared/models/portfolio.model.ts
git commit -m "feat: add optional tags, metrics and highlights fields to portfolio model"
```

---

### Task 3: ThemeService

**Files:**
- Create: `src/app/core/services/theme.service.ts`

**Interfaces:**
- Produces: `ThemeService.theme: Signal<'light' | 'dark'>`, `ThemeService.toggle(): void`, `ThemeService.isDark: Signal<boolean>` — consumed by Task 5 (nav toggle button) and any component needing theme-aware icon color.

- [ ] **Step 1: Implement the service**

```typescript
import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'portfolio-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<Theme>(this.getInitialTheme());
  isDark = computed(() => this.theme() === 'dark');

  constructor() {
    effect(() => {
      const value = this.theme();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, value);
      }
    });
  }

  toggle() {
    this.theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  private getInitialTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'light';
  }
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/theme.service.ts
git commit -m "feat: add ThemeService for light/dark mode with localStorage persistence"
```

---

### Task 4: Rewrite LanguageService UI-copy keys

**Files:**
- Modify: `src/app/core/services/language.service.ts`

**Interfaces:**
- Produces: `LanguageService.t` now exposes `nav` (object with `home`, `experience`, `skills`, `projects`, `contact`), `heroPre`, `ctaPrimary`, `ctaSecondary`, `resumeLabel`, `experienceEyebrow`, `experienceTitle`, `skillsEyebrow`, `skillsTitle`, `projectsEyebrow`, `projectsTitle`, `viewCaseLabel`, `educationEyebrow`, `languagesEyebrow`, `contactTitle`, `chatTitle`, `chatSubtitle`, `chatPlaceholder`, `chatEmptyState`, `backToPortfolio` — consumed by every rebuilt template in Tasks 5–15.
- Consumes: nothing (static object), same shape/usage pattern as the current file.

- [ ] **Step 1: Replace the translations object**

```typescript
import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<Language>('en');

  translations = {
    en: {
      nav: { home: 'Home', experience: 'Experience', skills: 'Skills', projects: 'Work', contact: 'Contact' },
      heroPre: "Hi, I'm",
      ctaPrimary: 'See my work',
      ctaSecondary: 'Get in touch',
      resumeLabel: 'Resume',
      experienceEyebrow: 'Career',
      experienceTitle: 'Experience',
      skillsEyebrow: 'Toolkit',
      skillsTitle: 'Skills & Tools',
      projectsEyebrow: 'Selected work',
      projectsTitle: 'Projects',
      viewCaseLabel: 'View case study',
      educationEyebrow: 'Education',
      languagesEyebrow: 'Languages',
      contactTitle: "Let's build something",
      chatTitle: 'WALTER_AI',
      chatSubtitle: 'ask me anything',
      chatPlaceholder: 'Type a message...',
      chatEmptyState: "Ask me about Walter's experience, skills, or projects.",
      backToPortfolio: 'Back to portfolio'
    },
    es: {
      nav: { home: 'Inicio', experience: 'Experiencia', skills: 'Habilidades', projects: 'Proyectos', contact: 'Contacto' },
      heroPre: 'Hola, soy',
      ctaPrimary: 'Ver proyectos',
      ctaSecondary: 'Contactar',
      resumeLabel: 'CV',
      experienceEyebrow: 'Trayectoria',
      experienceTitle: 'Experiencia',
      skillsEyebrow: 'Herramientas',
      skillsTitle: 'Habilidades y Herramientas',
      projectsEyebrow: 'Trabajo seleccionado',
      projectsTitle: 'Proyectos',
      viewCaseLabel: 'Ver caso de estudio',
      educationEyebrow: 'Educación',
      languagesEyebrow: 'Idiomas',
      contactTitle: 'Construyamos algo juntos',
      chatTitle: 'WALTER_AI',
      chatSubtitle: 'pregúntame lo que sea',
      chatPlaceholder: 'Escribe un mensaje...',
      chatEmptyState: 'Pregúntame sobre la experiencia, habilidades o proyectos de Walter.',
      backToPortfolio: 'Volver al portafolio'
    }
  };

  toggleLanguage() {
    this.currentLang.update(lang => lang === 'en' ? 'es' : 'en');
  }

  get t() {
    return this.translations[this.currentLang()];
  }
}
```

- [ ] **Step 2: Grep for now-removed keys**

Run: `grep -rn "langService.t\.\(available\|aboutMe\|seeMore\|seeLess\|aiReady\|aiThinking\|aiCommand\|placeholder\)" src`
Expected: no matches outside files this plan will rewrite in later tasks (footer, chat, home-hero old templates — those get rebuilt in place, so leftover references will be replaced as part of those tasks, not here).

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/language.service.ts
git commit -m "refactor: replace retro-terminal copy keys with neobrutalist UI copy"
```

---

### Task 5: Delete speeddial, add floating pill NavComponent

**Files:**
- Delete: `src/app/shared/components/speeddial/speeddial.component.ts`, `src/app/shared/components/speeddial/speeddial.component.html`, `src/app/shared/directives/magnetic.directive.ts`
- Create: `src/app/shared/components/nav/nav.component.ts`

**Interfaces:**
- Consumes: `LanguageService.t.nav`, `LanguageService.currentLang`, `LanguageService.toggleLanguage()`, `ThemeService.isDark`, `ThemeService.toggle()`.
- Produces: `<app-nav/>` selector — consumed by Task 14 (`app.component.html`). Emits scroll via native `document.getElementById(id).scrollIntoView`, same navigation contract `UiService.navigate` already relies on (section ids `home`/`experience`/`skills`/`projects`/`contact` stay on the sections themselves, unchanged).

- [ ] **Step 1: Delete the old files**

```bash
git rm -r src/app/shared/components/speeddial src/app/shared/directives/magnetic.directive.ts
```

- [ ] **Step 2: Implement the nav component**

Port the structure of `project/Portfolio.dc.html:32-61` (the `<nav>` block: pill container, logo, section links with active-state pill background, theme toggle sun/moon SVGs, EN/ES toggle, resume link) into Angular, replacing `{{ }}` bindings with signal reads and `[class.x]` bindings, and the `sc-if`/`sc-for` mockup directives with `@if`/`@for`. Active-section tracking reuses the same `IntersectionObserver` pattern already used in `HomeExperienceComponent`'s highlight logic (`src/app/features/home/components/home-experience.component.ts`), observing `#home`, `#experience`, `#skills`, `#projects`, `#contact`.

```typescript
import { Component, signal, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerSun, tablerMoon } from '@ng-icons/tabler-icons';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';

interface NavItem { id: string; label: string; }

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ tablerSun, tablerMoon })],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6 pt-4 pointer-events-none">
      <div class="pointer-events-auto w-full max-w-[1020px] flex items-center justify-between gap-2 pl-5 pr-2 py-2 rounded-full neo-border transition-shadow"
           [class.glass-card]="true"
           [class.shadow-[0_6px_0_rgba(0,0,0,0.1)]]="scrolled()">
        <button (click)="scrollToTop()" class="font-[var(--font-display)] font-bold text-lg tracking-tight flex items-center gap-2 text-[var(--ink)]">
          <span class="w-2.5 h-2.5 rounded-[3px] bg-[var(--color-accent)] rotate-45 inline-block"></span>
          WA
        </button>

        <div class="flex items-center gap-0.5">
          @for (item of items; track item.id) {
            <button (click)="scrollTo(item.id)"
                    class="relative px-3.5 py-2 rounded-full text-[13px] font-[var(--font-display)] font-medium transition-colors"
                    [class.bg-[var(--ink)]]="active() === item.id"
                    [class.text-[var(--bg)]]="active() === item.id"
                    [class.text-[var(--ink)]]="active() !== item.id">
              {{ item.label }}
            </button>
          }
        </div>

        <div class="flex items-center gap-2">
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
          <a href="https://amnotwallas.github.io/Portfolio/" target="_blank" rel="noopener"
             class="font-[var(--font-display)] font-bold text-[13px] text-[#15151A] bg-[var(--color-lime)] neo-border rounded-full px-4 py-2 neo-shadow whitespace-nowrap">
            {{ langService.t.resumeLabel }}
          </a>
        </div>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent implements OnInit, OnDestroy {
  langService = inject(LanguageService);
  themeService = inject(ThemeService);

  scrolled = signal(false);
  active = signal('home');
  private observer?: IntersectionObserver;

  get items(): NavItem[] {
    const t = this.langService.t.nav;
    return [
      { id: 'home', label: t.home },
      { id: 'experience', label: t.experience },
      { id: 'skills', label: t.skills },
      { id: 'projects', label: t.projects },
      { id: 'contact', label: t.contact }
    ];
  }

  ngOnInit() {
    window.addEventListener('scroll', this.onScroll);
    setTimeout(() => {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) this.active.set(e.target.id); });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      ['home', 'experience', 'skills', 'projects', 'contact'].forEach(id => {
        const el = document.getElementById(id);
        if (el) this.observer!.observe(el);
      });
    }, 200);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    this.observer?.disconnect();
  }

  private onScroll = () => this.scrolled.set(window.scrollY > 40);

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: fails until Task 14 removes the `<app-speed-dial/>` reference from `app.component.html`/`.ts` — that's fine, this task's own file compiles cleanly on its own; confirm with `npx tsc --noEmit -p tsconfig.app.json` if `npm run build` is noisy from the not-yet-updated `app.component.ts` import.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: replace radial speed-dial with floating pill navigation"
```

---

### Task 6: Marquee ticker component

**Files:**
- Create: `src/app/shared/components/marquee/marquee.component.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (reads `.skills[].items`).
- Produces: `<app-marquee/>` selector — consumed by Task 13 (`home.page.html`).

- [ ] **Step 1: Implement the component**

Ports `project/Portfolio.dc.html:86-93`. `marqueeDouble` in the mockup is `[...skills.flatMap(items), ...skills.flatMap(items)]` (doubled for the seamless CSS loop) — that's still 100% API-sourced data, just duplicated for the animation, so it satisfies the no-mock-data constraint.

```typescript
import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (words().length) {
      <div class="relative z-[1] bg-[#15151A] py-4 overflow-hidden -rotate-1 -mx-1">
        <div class="flex w-max" style="animation: marquee 26s linear infinite;">
          @for (word of words(); track $index) {
            <span class="font-[var(--font-display)] font-bold text-xl text-[#FAFAF7] px-5.5 whitespace-nowrap inline-flex items-center gap-5.5">
              {{ word }} <span class="text-[var(--color-lime)]">&#9670;</span>
            </span>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarqueeComponent {
  private portfolioService = inject(PortfolioService);

  words = computed(() => {
    const data = this.portfolioService.portfolioDataSignal();
    if (!data) return [];
    const items = data.skills.flatMap(s => s.items);
    return [...items, ...items];
  });
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/shared/components/marquee/marquee.component.ts
git commit -m "feat: add API-driven skills marquee component"
```

---

### Task 7: Rebuild HomeHeroComponent

**Files:**
- Modify: `src/app/features/home/components/home-hero.component.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (reads `basics.name`, `basics.summary`, `system.status`, `skills[].category`); `LanguageService.t` (`heroPre`, `ctaPrimary`, `ctaSecondary`).
- Produces: no `@Input()`s anymore (drops `firstName`/`activeTitle` inputs — the component becomes self-sufficient off signals, so Task 13 stops passing them).

- [ ] **Step 1: Replace the hardcoded splash/title arrays with real data**

The current file hardcodes `splashPhrases = ['Available for work!']` and (in `home.page.ts`) a `titles` array of four invented role phrases. Both get removed. The splash badge now reads `cv.system.status` directly (the API already models this via `SystemConfig.status`). The scrambling role text now cycles through `cv.skills.map(s => s.category)` — real skill-category names from the API — instead of fabricated phrases.

```typescript
import { Component, inject, signal, computed, effect, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full flex flex-col items-center text-center px-6">
      @if (cv(); as data) {
        <div class="inline-block text-left mb-2">
          <div class="font-[var(--font-display)] text-xl font-medium text-[var(--ink-soft)] mb-2">{{ langService.t.heroPre }}</div>
          <div class="relative inline-block mb-5">
            <h1 class="font-[var(--font-display)] font-bold leading-none m-0 text-[var(--ink)]" style="font-size: clamp(48px, 9vw, 104px); letter-spacing: -0.03em;">
              {{ data.basics.name }}
            </h1>
            @if (data.system.status) {
              <div class="absolute -top-4.5 -right-17 rotate-[-8deg]" style="animation: splashPop 1.6s ease-in-out infinite;">
                <span class="font-[var(--font-display)] font-bold text-xs tracking-wide bg-[var(--color-lime)] text-[#15151A] neo-border rounded-lg px-2.5 py-1.5 neo-shadow whitespace-nowrap inline-block">
                  {{ data.system.status }}
                </span>
              </div>
            }
          </div>
        </div>

        <div class="h-10 flex items-center justify-center mb-7.5">
          <span class="font-[var(--font-mono)] font-medium text-[var(--color-accent)]" style="font-size: clamp(14px, 2.4vw, 20px);">
            {{ scrambleDisplay() }}<span style="animation: blinkCursor 1s step-end infinite;">|</span>
          </span>
        </div>

        <div class="max-w-[640px] px-7 py-5.5 rounded-[20px] glass-card border-l-4 border-l-[var(--ink)]">
          <p class="m-0 text-[17px] leading-relaxed text-[var(--ink-soft)]">{{ data.basics.summary }}</p>
        </div>

        <div class="flex gap-3.5 mt-8 flex-wrap justify-center">
          <button (click)="scrollTo('projects')"
                  class="font-[var(--font-display)] font-bold text-[15px] bg-[var(--ink)] text-[var(--bg)] neo-border rounded-full px-6.5 py-3.5 neo-shadow-lime">
            {{ langService.t.ctaPrimary }}
          </button>
          <button (click)="scrollTo('contact')"
                  class="font-[var(--font-display)] font-bold text-[15px] glass-card text-[var(--ink)] rounded-full px-6.5 py-3.5">
            {{ langService.t.ctaSecondary }}
          </button>
        </div>
      } @else {
        <div class="space-y-4 w-full max-w-lg">
          <div class="skeleton w-3/4 h-16 mx-auto rounded-xl"></div>
          <div class="skeleton w-1/2 h-6 mx-auto rounded-lg"></div>
          <div class="skeleton w-full h-24 rounded-2xl"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeHeroComponent implements OnDestroy {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  cv = this.portfolioService.portfolioDataSignal;
  scrambleDisplay = signal('');

  private phraseIndex = 0;
  private scrambleInterval: any;
  private scrambleTimeout: any;

  constructor() {
    effect(() => {
      const data = this.cv();
      if (data && data.skills.length && !this.scrambleInterval && !this.scrambleTimeout) {
        this.runScramble();
      }
    });
  }

  private runScramble() {
    const data = this.cv();
    if (!data) return;
    const phrases = data.skills.map(s => s.category);
    const target = phrases[this.phraseIndex % phrases.length];
    let frame = 0;
    const totalFrames = 18;
    clearInterval(this.scrambleInterval);
    this.scrambleInterval = setInterval(() => {
      frame++;
      const reveal = Math.floor((frame / totalFrames) * target.length);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        if (target[i] === ' ') { out += ' '; continue; }
        out += i < reveal ? target[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      this.scrambleDisplay.set(out);
      if (frame >= totalFrames) {
        clearInterval(this.scrambleInterval);
        this.scrambleDisplay.set(target);
        this.phraseIndex++;
        this.scrambleTimeout = setTimeout(() => this.runScramble(), 2400);
      }
    }, 35);
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  }

  ngOnDestroy() {
    clearInterval(this.scrambleInterval);
    clearTimeout(this.scrambleTimeout);
  }
}
```

- [ ] **Step 2: Remove the now-unused `ScrambleDirective` import** if `grep -rn "ScrambleDirective" src` shows no other consumers after this change (the directive was only used by the old dynamic-title element in this component and in `home-hero`'s sibling title line, which this rebuild replaces).

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: fails only on `home.page.html`/`home.page.ts` still passing `[firstName]`/`[activeTitle]` inputs — fixed in Task 13.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/home/components/home-hero.component.ts
git commit -m "refactor: rebuild hero section with light/glass design, drop fabricated role phrases"
```

---

### Task 8: Rebuild HomeExperienceComponent

**Files:**
- Modify: `src/app/features/home/components/home-experience.component.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (`work[]`, including new optional `tags`/`metrics`), `UiService.highlight$`, `LanguageService.t` (`experienceEyebrow`, `experienceTitle`).
- Produces: unchanged public contract (`getItemElementId`, highlight handling) so `UiService.triggerHighlight('EXPERIENCE', id)` callers keep working.

- [ ] **Step 1: Replace the accordion markup with the mockup's always-expanded timeline cards**

Port `project/Portfolio.dc.html:96-142`: logo square + connecting line, glass card per job, achievements list (`job.achievements` → keep using the existing `highlights` field name from the model, do not rename), tag chips (`@if (job.tags)`), metric pills (`@if (job.metrics)`). Keep the existing highlight-pulse mechanism (`isHighlighted`, `processHighlight`) verbatim — that logic isn't visual and isn't part of the redesign.

```typescript
import { Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="experience" class="w-full max-w-[900px] mx-auto py-12 px-6">
      <div class="flex items-center gap-3 mb-11">
        <span class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)]">{{ langService.t.experienceEyebrow }}</span>
        <div class="flex-grow h-0.5 bg-[var(--ink)] opacity-15"></div>
      </div>
      <h2 class="font-[var(--font-display)] font-bold mb-12 text-[var(--ink)]" style="font-size: clamp(28px, 4vw, 42px); letter-spacing: -0.02em;">{{ langService.t.experienceTitle }}</h2>

      @if (cvSignal(); as cv) {
        @for (job of cv.work; track $index) {
          <div [id]="getItemElementId(job.company)" class="grid grid-cols-[64px_1fr] gap-5 mb-9 items-start">
            <div class="flex flex-col items-center">
              <div class="w-14 h-14 rounded-[14px] neo-border bg-[var(--card-bg)] overflow-hidden flex items-center justify-center neo-shadow">
                @if (job.image) {
                  <img [src]="job.image" [alt]="job.company" class="w-full h-full object-contain p-1.5" />
                }
              </div>
              <div class="w-0.5 flex-grow bg-[var(--ink)] opacity-10 mt-2 min-h-[40px]"></div>
            </div>
            <div class="p-6 rounded-[18px] glass-card transition-all duration-500"
                 [class.animate-pulse]="isHighlighted(job.company)">
              <div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <h3 class="font-[var(--font-display)] text-xl font-bold m-0 text-[var(--ink)]">{{ job.role }}</h3>
                <span class="font-[var(--font-mono)] text-xs text-[var(--ink-soft)]">{{ job.period }}</span>
              </div>
              <div class="font-[var(--font-display)] text-sm font-semibold text-[var(--color-accent)] mb-3">{{ job.company }}</div>
              <p class="text-[15px] leading-relaxed text-[var(--ink-soft)] mb-3.5">{{ job.summary }}</p>
              @if (job.highlights?.length) {
                <div class="flex flex-col gap-2 mb-3.5">
                  @for (ach of job.highlights; track $index) {
                    <div class="flex gap-2.5 text-sm leading-relaxed text-[var(--ink-soft)]">
                      <span class="text-[var(--color-accent)] font-bold flex-shrink-0">&#9642;</span>{{ ach }}
                    </div>
                  }
                </div>
              }
              @if (job.tags?.length) {
                <div class="flex flex-wrap gap-2">
                  @for (tag of job.tags; track $index) {
                    <span class="font-[var(--font-mono)] text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--ink)]">{{ tag }}</span>
                  }
                </div>
              }
              @if (job.metrics?.length) {
                <div class="flex flex-wrap gap-2.5 mt-4">
                  @for (m of job.metrics; track $index) {
                    <span class="font-[var(--font-display)] text-[13px] font-bold px-3 py-1.5 rounded-full bg-[var(--color-lime)] text-[#15151A] neo-border">{{ m }}</span>
                  }
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeExperienceComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);
  langService = inject(LanguageService);

  cvSignal = this.portfolioService.portfolioDataSignal;
  highlightedExpId: string | null = null;
  private sub = new Subscription();

  ngOnInit() {
    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        if (event.type === 'EXPERIENCE') this.processHighlight(event.id);
      })
    );
  }

  getItemElementId(company: string): string {
    return 'exp-' + company.toLowerCase().trim().replace(/\s+/g, '-');
  }

  isHighlighted(company: string): boolean {
    return this.highlightedExpId === this.getItemElementId(company);
  }

  private processHighlight(id: string) {
    const data = this.cvSignal();
    if (!data) { setTimeout(() => this.processHighlight(id), 500); return; }

    const targetId = id.toLowerCase().trim();
    const match = data.work.find(w => {
      const company = w.company.toLowerCase().trim();
      return company === targetId || company.includes(targetId) || targetId.includes(company);
    });

    if (match) {
      const elementId = this.getItemElementId(match.company);
      this.highlightedExpId = null;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.highlightedExpId = elementId;
        this.cdr.markForCheck();
        const el = document.getElementById(elementId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { this.highlightedExpId = null; this.cdr.markForCheck(); }, 6000);
      }, 50);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/home/components/home-experience.component.ts
git commit -m "refactor: rebuild experience timeline with glass cards, render optional tags/metrics"
```

---

### Task 9: HomeSkillsComponent (bento grid)

**Files:**
- Create: `src/app/features/home/components/home-skills.component.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (`skills[]`), `LanguageService.t` (`skillsEyebrow`, `skillsTitle`).
- Produces: `<app-home-skills/>` — consumed by Task 13.

- [ ] **Step 1: Implement the component**

Ports `project/Portfolio.dc.html:144-163`. The mockup assigns a per-category background tint by index from a 6-color palette and a column span pattern `[3,3,2,2,2,4]` — those are presentation constants (design tokens, not portfolio content), so they stay as component constants.

```typescript
import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';

const SPANS = [3, 3, 2, 2, 2, 4];
const BENTO_VARS = ['--bento-1', '--bento-2', '--bento-3', '--bento-4', '--bento-5', '--bento-6'];

@Component({
  selector: 'app-home-skills',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="skills" class="w-full max-w-[980px] mx-auto py-5 px-6 pb-24">
      <div class="flex items-center gap-3 mb-11">
        <span class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)]">{{ langService.t.skillsEyebrow }}</span>
        <div class="flex-grow h-0.5 bg-[var(--ink)] opacity-15"></div>
      </div>
      <h2 class="font-[var(--font-display)] font-bold mb-8 text-[var(--ink)]" style="font-size: clamp(28px, 4vw, 42px); letter-spacing: -0.02em;">{{ langService.t.skillsTitle }}</h2>

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
                <span class="font-[var(--font-mono)] text-[11.5px] px-2.5 py-1 rounded-lg bg-white/55 border border-black/15">{{ item }}</span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeSkillsComponent {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  categories = computed(() => {
    const data = this.portfolioService.portfolioDataSignal();
    if (!data) return [];
    return data.skills.map((s, i) => ({
      name: s.category,
      items: s.items,
      span: SPANS[i % SPANS.length],
      bg: BENTO_VARS[i % BENTO_VARS.length]
    }));
  });
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/home/components/home-skills.component.ts
git commit -m "feat: add API-driven skills bento grid section"
```

---

### Task 10: Rebuild HomeProjectsComponent as a carousel

**Files:**
- Modify: `src/app/features/home/components/home-projects.component.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (`projects[]`), `PortfolioService.getSecureImage()`, `UiService.highlight$`, `LanguageService.t` (`projectsEyebrow`, `projectsTitle`, `viewCaseLabel`).
- Produces: unchanged `getProjectElementId`/highlight contract for `UiService.triggerHighlight('PROJECT', id)`.

- [ ] **Step 1: Replace the 2-column expand grid with the mockup's prev/next carousel**

Port `project/Portfolio.dc.html:165-216`: image/content split card, status badge from `proj.status` → map to `item.metadata.status` (real field), stack chips, "View case study" link to `['/project', item.slug]` (keep the existing dynamic route — do not recreate the mockup's two static per-project pages), GitHub link, dot indicators. Keep `getSecureImage` resolution logic from the current implementation (it's already API-driven, not mock data) and the existing highlight-pulse subscription.

```typescript
import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerChevronLeft, tablerChevronRight } from '@ng-icons/tabler-icons';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-projects',
  standalone: true,
  imports: [CommonModule, NgIcon, RouterModule],
  providers: [provideIcons({ tablerChevronLeft, tablerChevronRight })],
  template: `
    <div id="projects" class="w-full max-w-[980px] mx-auto py-5 px-6 pb-28">
      <div class="flex items-center gap-3 mb-11">
        <span class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)]">{{ langService.t.projectsEyebrow }}</span>
        <div class="flex-grow h-0.5 bg-[var(--ink)] opacity-15"></div>
      </div>
      <div class="flex items-baseline justify-between mb-8 flex-wrap gap-3">
        <h2 class="font-[var(--font-display)] font-bold m-0 text-[var(--ink)]" style="font-size: clamp(28px, 4vw, 42px); letter-spacing: -0.02em;">{{ langService.t.projectsTitle }}</h2>
        <div class="flex gap-2.5">
          <button (click)="prev()" class="w-10.5 h-10.5 rounded-full neo-border bg-[var(--card-bg)] flex items-center justify-center neo-shadow"><ng-icon name="tablerChevronLeft" size="16"></ng-icon></button>
          <button (click)="next()" class="w-10.5 h-10.5 rounded-full neo-border bg-[var(--card-bg)] flex items-center justify-center neo-shadow"><ng-icon name="tablerChevronRight" size="16"></ng-icon></button>
        </div>
      </div>

      @if (cvSignal(); as cv) {
        <div class="overflow-hidden rounded-[24px]">
          <div class="flex transition-transform duration-500" [style.transform]="'translateX(-' + (index() * 100) + '%)'">
            @for (item of cv.projects; track item.slug) {
              <div [id]="getProjectElementId(item.slug)" class="min-w-full p-1">
                <div class="grid grid-cols-[1.1fr_1fr] rounded-[22px] neo-border-thick overflow-hidden glass-card neo-shadow"
                     [class.animate-pulse]="isHighlighted(item.slug)">
                  <div class="relative min-h-[260px] flex items-center justify-center border-r-2.5 border-[var(--ink)]"
                       [style.background]="'repeating-linear-gradient(135deg, var(--stripe-a), var(--stripe-a) 10px, var(--stripe-b) 10px, var(--stripe-b) 20px)'">
                    @if (resolvedImages[item.image]) {
                      <img [src]="resolvedImages[item.image]" [alt]="item.name" class="w-full h-full object-cover" />
                    }
                    <span class="absolute top-3.5 left-3.5 font-[var(--font-display)] font-bold text-[11px] tracking-wide bg-[var(--color-lime)] text-[#15151A] neo-border rounded-full px-3 py-1.5">
                      {{ item.metadata.status }}
                    </span>
                  </div>
                  <div class="p-7.5 flex flex-col gap-3.5">
                    <h3 class="font-[var(--font-display)] text-2xl font-bold m-0 text-[var(--ink)]">{{ item.name }}</h3>
                    <p class="text-[14.5px] leading-relaxed text-[var(--ink-soft)] m-0">{{ item.description }}</p>
                    <div class="flex flex-wrap gap-1.5">
                      @for (s of item.stack; track s) {
                        <span class="font-[var(--font-mono)] text-[10.5px] px-2.5 py-1 rounded-md bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--ink)]">{{ s }}</span>
                      }
                    </div>
                    <div class="flex gap-2.5 mt-1.5 flex-wrap">
                      <a [routerLink]="['/project', item.slug]" class="font-[var(--font-display)] font-bold text-[13.5px] bg-[var(--ink)] text-[var(--bg)] neo-border rounded-full px-4.5 py-2.5">{{ langService.t.viewCaseLabel }}</a>
                      @if (item.links.github) {
                        <a [href]="item.links.github" target="_blank" rel="noopener" class="font-[var(--font-display)] font-bold text-[13.5px] glass-card text-[var(--ink)] rounded-full px-4.5 py-2.5">GitHub</a>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="flex justify-center gap-2 mt-5">
          @for (item of cv.projects; track item.slug; let i = $index) {
            <button (click)="goTo(i)" class="h-2 rounded-full neo-border transition-all"
                    [style.width]="i === index() ? '26px' : '8px'"
                    [style.background]="i === index() ? 'var(--ink)' : 'var(--card-bg)'"></button>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeProjectsComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);
  langService = inject(LanguageService);

  cvSignal = this.portfolioService.portfolioDataSignal;
  index = signal(0);
  resolvedImages: { [key: string]: string } = {};
  highlightedProjectId: string | null = null;
  private sub = new Subscription();

  constructor() {
    effect(() => {
      const data = this.cvSignal();
      if (data) this.resolveAllImages(data);
    });
  }

  ngOnInit() {
    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        if (event.type === 'PROJECT') this.processHighlight(event.id);
      })
    );
  }

  getProjectElementId(slug: string): string {
    return 'project-' + slug.toLowerCase().trim();
  }

  isHighlighted(slug: string): boolean {
    return this.highlightedProjectId === this.getProjectElementId(slug);
  }

  private processHighlight(id: string) {
    const data = this.cvSignal();
    if (!data) { setTimeout(() => this.processHighlight(id), 500); return; }
    const targetId = id.toLowerCase().trim();
    const idx = data.projects.findIndex(p => p.slug === targetId || p.slug.includes(targetId) || p.name.toLowerCase().includes(targetId));
    if (idx !== -1) {
      const project = data.projects[idx];
      this.index.set(idx);
      const elementId = this.getProjectElementId(project.slug);
      this.highlightedProjectId = null;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.highlightedProjectId = elementId;
        this.cdr.markForCheck();
        const el = document.getElementById(elementId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { this.highlightedProjectId = null; this.cdr.markForCheck(); }, 6000);
      }, 50);
    }
  }

  private async resolveAllImages(data: any) {
    await Promise.all(data.projects.map(async (project: any) => {
      if (!this.resolvedImages[project.image]) {
        this.resolvedImages[project.image] = await this.portfolioService.getSecureImage(project.image);
        this.cdr.markForCheck();
      }
    }));
  }

  prev() {
    const total = this.cvSignal()?.projects.length ?? 1;
    this.index.update(i => (i - 1 + total) % total);
  }

  next() {
    const total = this.cvSignal()?.projects.length ?? 1;
    this.index.update(i => (i + 1) % total);
  }

  goTo(i: number) {
    this.index.set(i);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/home/components/home-projects.component.ts
git commit -m "refactor: rebuild projects section as a carousel matching the redesign"
```

---

### Task 11: HomeEducationComponent

**Files:**
- Create: `src/app/features/home/components/home-education.component.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (`education[]`, `languages[]`), `LanguageService.t` (`educationEyebrow`, `languagesEyebrow`).

- [ ] **Step 1: Implement the component**

Ports `project/Portfolio.dc.html:218-236`. Uses the first `education` entry (the API returns an array; the mockup's design only has room for one card — showing `education[0]` is a presentation choice, not fabricated data).

```typescript
import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-home-education',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cv(); as data) {
      @if (data.education.length || data.languages.length) {
        <section class="max-w-[980px] mx-auto px-6 pb-24 grid grid-cols-[1.4fr_1fr] gap-5">
          @if (education(); as edu) {
            <div class="p-6.5 rounded-[18px] glass-card">
              <div class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-2.5">{{ langService.t.educationEyebrow }}</div>
              <h3 class="font-[var(--font-display)] text-[19px] font-bold m-0 mb-1.5 text-[var(--ink)]">{{ edu.degree }}</h3>
              <div class="text-sm text-[var(--ink-soft)] mb-2">{{ edu.institution }} &middot; {{ edu.period }}</div>
            </div>
          }
          @if (data.languages.length) {
            <div class="p-6.5 rounded-[18px] bg-[#15151A] text-[#FAFAF7] neo-border neo-shadow-lime">
              <div class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-lime)] mb-2.5">{{ langService.t.languagesEyebrow }}</div>
              <div class="flex flex-col gap-2.5">
                @for (lg of data.languages; track lg.name) {
                  <div class="flex justify-between text-sm">
                    <span class="font-semibold">{{ lg.name }}</span><span class="opacity-70">{{ lg.level }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </section>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeEducationComponent {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  cv = this.portfolioService.portfolioDataSignal;
  education = computed(() => this.cv()?.education[0] ?? null);
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/home/components/home-education.component.ts
git commit -m "feat: add API-driven education and languages section"
```

---

### Task 12: HomeContactComponent

**Files:**
- Create: `src/app/features/home/components/home-contact.component.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (`basics.email`, `basics.profiles`, `basics.name`, `system.location.city`), `LanguageService.t` (`contactTitle`).

- [ ] **Step 1: Implement the component**

Ports `project/Portfolio.dc.html:238-248`. The mockup hardcodes `walterardev@gmail.com`, the LinkedIn/GitHub URLs, and the "© 2026 Walter Ambriz Reyna · Guadalajara, Jalisco, México" line — all of that instead comes from `basics.email`, `basics.profiles` (matched by `network`), `basics.name`, and `system.location.city`, respectively. The footer tagline (`footerTag` in the mockup) is dropped as a full sentence — reuse `basics.summary` is redundant with the hero, so this section shows only the CTA heading, contact links, and the copyright line, all sourced from the API.

```typescript
import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';
import { Profile } from '../../../shared/models/portfolio.model';

@Component({
  selector: 'app-home-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cv(); as data) {
      <section id="contact" class="relative z-[1] py-22.5 px-6 pb-40 text-center bg-[#15151A] text-[#FAFAF7]">
        <h2 class="font-[var(--font-display)] font-bold m-0 mb-4.5" style="font-size: clamp(30px, 5vw, 54px); letter-spacing: -0.02em;">{{ langService.t.contactTitle }}</h2>
        <div class="flex gap-3.5 justify-center flex-wrap mb-12.5">
          @if (data.basics.email) {
            <a [href]="'mailto:' + data.basics.email" class="font-[var(--font-display)] font-bold text-[15px] bg-[var(--color-lime)] text-[#15151A] neo-border rounded-full px-6.5 py-3.5 shadow-[4px_4px_0_#FAFAF7]">{{ data.basics.email }}</a>
          }
          @for (profile of data.basics.profiles; track profile.network) {
            <a [href]="profile.url" target="_blank" rel="noopener" class="font-[var(--font-display)] font-bold text-[15px] text-[#FAFAF7] border-2 border-[#FAFAF7] rounded-full px-6.5 py-3.5">{{ profile.network }}</a>
          }
        </div>
        <div class="font-[var(--font-mono)] text-[11.5px] text-white/35">
          &copy; {{ currentYear }} {{ data.basics.name }} @if (data.system.location.city) { &middot; {{ data.system.location.city }} }
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeContactComponent {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  cv = this.portfolioService.portfolioDataSignal;
  currentYear = new Date().getFullYear();
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/features/home/components/home-contact.component.ts
git commit -m "feat: add API-driven contact section"
```

---

### Task 13: Reassemble home.page.html / home.page.ts

**Files:**
- Modify: `src/app/features/home/home.page.html`, `src/app/features/home/home.page.ts`

**Interfaces:**
- Consumes: all components from Tasks 6–12.

- [ ] **Step 1: Drop the hardcoded `titles` rotation from `home.page.ts`**

`HomePage` currently owns `firstName`/`activeTitle` and a hardcoded 4-item `titles` array passed into `HomeHeroComponent`. Since Task 7 made `HomeHeroComponent` self-sufficient (it reads `basics.name`/skill categories directly off the signal), `HomePage` no longer needs any of that:

```typescript
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HomeHeroComponent } from "./components/home-hero.component";
import { HomeExperienceComponent } from './components/home-experience.component';
import { HomeSkillsComponent } from './components/home-skills.component';
import { HomeProjectsComponent } from './components/home-projects.component';
import { HomeEducationComponent } from './components/home-education.component';
import { HomeContactComponent } from './components/home-contact.component';
import { MarqueeComponent } from '../../shared/components/marquee/marquee.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: 'home.page.html',
  imports: [
    CommonModule,
    HomeHeroComponent,
    MarqueeComponent,
    HomeExperienceComponent,
    HomeSkillsComponent,
    HomeProjectsComponent,
    HomeEducationComponent,
    HomeContactComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {}
```

- [ ] **Step 2: Rewrite `home.page.html`**

```html
<main class="min-h-screen">
  <section id="home" class="min-h-screen flex items-center justify-center pt-20 pb-20">
    <app-home-hero></app-home-hero>
  </section>

  <app-marquee></app-marquee>

  <app-home-experience></app-home-experience>
  <app-home-skills></app-home-skills>
  <app-home-projects></app-home-projects>
  <app-home-education></app-home-education>
  <app-home-contact></app-home-contact>
</main>
```

(Dropping the `@defer (on viewport)` blocks and their skeleton placeholders: each section component now renders its own `skeleton`-class loading state directly off the signal, matching the pattern used by `HomeHeroComponent` in Task 7, so a second layer of defer-placeholder skeletons is redundant. Sections above the fold no longer need `snap-start`/`scroll-snap` — the redesign doesn't use scroll-snap sections, matching `project/Portfolio.dc.html`, which scrolls freely.)

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: succeeds with zero TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/features/home/home.page.html src/app/features/home/home.page.ts
git commit -m "refactor: reassemble home page sections per the redesign layout"
```

---

### Task 14: Rebuild footer.component.ts into the floating dock

**Files:**
- Modify: `src/app/shared/components/footer/footer.component.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (`basics.email`, `basics.profiles`), unchanged.
- Produces: same `app-footer` selector (kept to minimize churn in `app.component.html`), but now also exposes a `chatOpen` output-free toggle used by Task 15 via a shared `ChatService`/local event — implemented here as: the dock's "AI" icon calls `chatVisible.set(true)` on an injected `ChatUiService`-style signal. To avoid inventing a new cross-component contract, the dock instead injects `ChatComponent`'s own visibility signal indirectly through `UiService`: add one new method there (see Step 1).

- [ ] **Step 1: Add a chat-visibility signal to `UiService`**

```typescript
// src/app/core/services/ui.service.ts — add alongside existing members
chatOpen = signal(false);
toggleChat() { this.chatOpen.update(v => !v); }
```

- [ ] **Step 2: Rebuild the template as the mockup's floating dock**

Ports `project/Portfolio.dc.html:250-260`. Drops the CV-tooltip/"NOT_LINKED" placeholder state (that was a hardcoded UI stand-in — the CV button now always points at `basics.profiles` GitHub/LinkedIn plus `mailto:`, and only renders if the underlying API field is present) and the retro copy-to-clipboard toast styling gets restyled, not removed (the copy-email behavior itself is real functionality, kept as-is).

```typescript
import { Component, computed, inject, signal } from "@angular/core";
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from "@angular/common";
import { PortfolioData, Profile } from "../../models/portfolio.model";
import { PortfolioService } from "../../../core/services/portfolio.service";
import { UiService } from "../../../core/services/ui.service";
import { LanguageService } from "../../../core/services/language.service";
import { tablerBrandGithub, tablerBrandLinkedin, tablerMail, tablerCheck, tablerMessageCircle } from "@ng-icons/tabler-icons";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIcon, CommonModule],
  template: `
    <div class="fixed bottom-5.5 right-5.5 z-[200] flex items-center gap-1.5 px-3 py-2.5 rounded-full glass-card neo-border neo-shadow">
      @if (getProfileUrl('GitHub'); as gh) {
        <a [href]="gh" target="_blank" rel="noopener" title="GitHub" class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[var(--dock-idle)] text-[var(--ink)]">
          <ng-icon [svg]="icons.tablerBrandGithub" size="18"></ng-icon>
        </a>
      }
      @if (getProfileUrl('LinkedIn'); as li) {
        <a [href]="li" target="_blank" rel="noopener" title="LinkedIn" class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[var(--dock-idle)] text-[var(--ink)]">
          <ng-icon [svg]="icons.tablerBrandLinkedin" size="18"></ng-icon>
        </a>
      }
      @if (portfolio?.basics?.email) {
        <button (click)="copyEmail()" title="Copy email" class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[var(--dock-idle)] text-[var(--ink)]">
          <ng-icon [svg]="isCopied() ? icons.tablerCheck : icons.tablerMail" size="18"></ng-icon>
        </button>
      }
      <button (click)="uiService.toggleChat()" [title]="langService.t.chatTitle" class="relative w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[#15151A] text-[#FAFAF7]">
        <ng-icon [svg]="icons.tablerMessageCircle" size="18"></ng-icon>
        <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4ADE80] border-2 border-[var(--bg)]"></span>
      </button>
    </div>
  `
})
export class Footer {
  private portfolioService = inject(PortfolioService);
  uiService = inject(UiService);
  langService = inject(LanguageService);

  get portfolio(): PortfolioData | null { return this.portfolioService.portfolio; }

  readonly icons = { tablerBrandGithub, tablerBrandLinkedin, tablerMail, tablerCheck, tablerMessageCircle };

  isCopied = signal(false);

  getProfileUrl(network: string): string | null {
    const profiles = this.portfolio?.basics.profiles || [];
    return profiles.find((p: Profile) => p.network === network)?.url || null;
  }

  async copyEmail() {
    if (this.isCopied()) return;
    const email = this.portfolio?.basics.email;
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore, matches prior fallback intent without inventing new UI copy.
    }
  }
}
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: succeeds. `tablerHeartDollar` and `tablerCloudDownload` icon imports are dropped since the CV-download button and its tooltip are gone — resume access lives in the nav bar (Task 5) per `project/`.

- [ ] **Step 4: Commit**

```bash
git add src/app/shared/components/footer/footer.component.ts src/app/core/services/ui.service.ts
git commit -m "refactor: rebuild footer into the redesign's floating action dock"
```

---

### Task 15: Restyle ChatComponent and source suggestions from the API

**Files:**
- Modify: `src/app/shared/components/chat/chat.component.ts`

**Interfaces:**
- Consumes: `ChatService.submitQuery()`/`isProcessing` (unchanged streaming contract), `PortfolioService.portfolioDataSignal` (`terminal.command_suggestions`), `UiService.chatOpen` (from Task 14), `LanguageService.t` (`chatTitle`, `chatSubtitle`, `chatPlaceholder`, `chatEmptyState`).

- [ ] **Step 1: Delete the hardcoded proactive-tooltip phrase banks**

Remove the entire `checkSectionAndShowTooltip`/`phrases` object (the four hardcoded Spanish `{label, query}` arrays keyed by `hero`/`experience`/`projects`/`project_details`) and the scroll-driven tooltip rotation (`onWindowScroll`, `startRotation`, `showTooltip`, `currentSuggestion`). None of that copy comes from the API. Suggested prompts instead come from `cv.terminal.command_suggestions` — real API data already modeled by `TerminalConfig` — rendered as chips inside the open panel (matching `project/Portfolio.dc.html:280-284`'s `suggestedQuestions`), not as a separate floating tooltip.

- [ ] **Step 2: Restyle the panel to the glass floating-panel mockup, keep the real streaming logic**

Keep `onChatSubmit`, `getChatContext`, `handleAction`, and the SSE reader loop from the current file byte-for-byte (that is real integration with the API agent, exactly what the constraints require preserving). Replace only the template and the trigger/visibility wiring:

```typescript
import { Component, ElementRef, ViewChild, inject, AfterViewInit, ChangeDetectorRef, computed, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowUp, tablerX } from '@ng-icons/tabler-icons';
import { ChatService } from '../../../core/services/chat.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { Router } from '@angular/router';
import { ChatResponse, ChatAction } from '../../models/portfolio.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowUp, tablerX })],
  template: `
    @if (uiService.chatOpen()) {
      <div class="fixed bottom-22 right-5.5 z-[199] w-[min(360px,90vw)] rounded-[20px] glass-card neo-border neo-shadow overflow-hidden flex flex-col" style="animation: fadeUp 0.35s ease;">
        <div class="bg-[#15151A] text-[#FAFAF7] px-4 py-3.5 flex items-center justify-between">
          <div>
            <div class="font-[var(--font-display)] font-bold text-[13.5px]">{{ langService.t.chatTitle }}</div>
            <div class="font-[var(--font-mono)] text-[10px] text-[var(--color-lime)]">{{ langService.t.chatSubtitle }}</div>
          </div>
          <button (click)="uiService.toggleChat()" class="w-6 h-6 flex items-center justify-center text-[#FAFAF7]">
            <ng-icon name="tablerX" size="14"></ng-icon>
          </button>
        </div>

        <div class="p-4 max-h-64 overflow-y-auto flex flex-col gap-2.5">
          <p #chatResponseEl class="font-[var(--font-body)] text-[13px] text-[var(--ink)] leading-relaxed m-0 min-h-[3em]">
            {{ langService.t.chatEmptyState }}
          </p>
        </div>

        @if (suggestions().length) {
          <div class="px-3.5 pb-2.5 flex flex-col gap-1.5 border-t border-[var(--glass-border)] pt-2.5">
            @for (q of suggestions(); track q) {
              <button (click)="suggestQuery(q)" class="text-left font-[var(--font-mono)] text-[11.5px] px-3 py-2 rounded-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/25">
                {{ q }}
              </button>
            }
          </div>
        }

        <form (submit)="onChatSubmit()" class="flex items-center gap-2.5 px-4 py-3 border-t border-[var(--glass-border)]">
          <input #chatInput type="text" [(ngModel)]="userQuery" name="query" autocomplete="off"
                 [placeholder]="langService.t.chatPlaceholder"
                 class="flex-grow bg-transparent border-none outline-none font-[var(--font-body)] text-[13px] text-[var(--ink)]">
          <button type="submit" [disabled]="isProcessing() || !userQuery.trim()"
                  class="p-2.5 rounded-full bg-[var(--color-accent)] text-white disabled:opacity-30">
            <ng-icon name="tablerArrowUp" size="18"></ng-icon>
          </button>
        </form>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  private chatService = inject(ChatService);
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  uiService = inject(UiService);
  langService = inject(LanguageService);

  @ViewChild('chatResponseEl') chatResponseEl!: ElementRef<HTMLElement>;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;

  userQuery = '';
  isProcessing = this.chatService.isProcessing;
  cvSignal = this.portfolioService.portfolioDataSignal;

  suggestions = computed(() => this.cvSignal()?.terminal?.command_suggestions ?? []);

  ngAfterViewInit() {}
  ngOnDestroy() {}

  suggestQuery(query: string) {
    this.userQuery = query;
    setTimeout(() => this.onChatSubmit(), 200);
  }

  private getChatContext() {
    const url = this.router.url;
    let page = 'home';
    let project_slug = null;
    if (url.includes('/project/')) {
      page = 'project_details';
      const parts = url.split('/');
      project_slug = parts[parts.indexOf('project') + 1]?.split('#')[0]?.split('?')[0] || null;
    }
    return { url, page, project_slug };
  }

  async onChatSubmit() {
    const query = this.userQuery.trim();
    if (!query || this.isProcessing()) return;

    const context = this.getChatContext();
    this.userQuery = '';
    this.chatResponseEl.nativeElement.textContent = '...';

    try {
      const body = await this.chatService.submitQuery(query, context);
      if (!body) return;

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let partialLine = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done && !partialLine) break;

        const chunk = done ? '' : decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split('\n');
        partialLine = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmedLine.replace('data: ', '').trim();
            const data: ChatResponse = JSON.parse(jsonStr);
            if (data.message) {
              fullText += data.message;
              this.chatResponseEl.nativeElement.textContent = fullText + '_';
            }
            if (data.actions?.length) data.actions.forEach(action => this.handleAction(action));
          } catch (e) {
            console.error('Error parsing chat stream line:', e, line);
          }
        }

        if (done) break;
      }

      this.chatResponseEl.nativeElement.textContent = fullText;
      this.chatService.addToHistory('user', query);
      this.chatService.addToHistory('assistant', fullText);
    } catch (error: any) {
      this.chatResponseEl.nativeElement.textContent = error?.message === 'TOO_MANY_REQUESTS'
        ? 'TOO_MANY_REQUESTS'
        : 'API_UNAVAILABLE';
    } finally {
      this.chatService.setProcessing(false);
      this.cdr.markForCheck();
    }
  }

  private handleAction(action: ChatAction) {
    if (action.type === 'navigation' && action.target) {
      this.router.navigate(['/home'], { fragment: action.target });
    }
    // 'highlight' actions keep going through UiService.triggerHighlight elsewhere in the app;
    // this component only needs to react to navigation actions directly.
  }
}
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/shared/components/chat/chat.component.ts
git commit -m "refactor: restyle chat panel and source suggestions from terminal.command_suggestions"
```

---

### Task 16: Wire app.component.html / app.component.ts

**Files:**
- Modify: `src/app/app.component.html`, `src/app/app.component.ts`

**Interfaces:**
- Consumes: `NavComponent` (Task 5), `ChatComponent` (Task 15), `Footer`/dock (Task 14).

- [ ] **Step 1: Update the shell**

```typescript
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from './shared/components/footer/footer.component';
import { NavComponent } from './shared/components/nav/nav.component';
import { ChatComponent } from './shared/components/chat/chat.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavComponent, Footer, ChatComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

```html
<app-nav/>

@defer (on idle) {
  <app-chat/>
}

<main class="main">
  <router-outlet />
</main>

<app-footer/>
```

(`LanguageService` injection is dropped from `AppComponent` — nothing in `app.component.html` read `langService` directly; it was only injected for downstream template access that no longer applies now that `NavComponent`/`Footer` inject it themselves.)

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds — this is the task where the `<app-speed-dial/>` reference finally disappears, so any lingering build error from Task 5 clears here.

- [ ] **Step 3: Commit**

```bash
git add src/app/app.component.html src/app/app.component.ts
git commit -m "refactor: wire new nav, chat and dock into the app shell"
```

---

### Task 17: Restyle project-details.page, add highlights section

**Files:**
- Modify: `src/app/features/projects/project-details.page.html`, `src/app/features/projects/project-details.page.ts`

**Interfaces:**
- Consumes: `PortfolioService.portfolioDataSignal` (`projects[]`, including new `highlights?`), `LanguageService.t` (`backToPortfolio`, plus new keys added in Step 1 below), unchanged `ProjectDetailsPage` computed signals (`project`, `adjacents`) and image-gallery/lightbox logic — none of that is visual-only, so it's preserved.

- [ ] **Step 1: Add case-study copy keys to `LanguageService`**

Extend the `en`/`es` objects from Task 4 with:

```typescript
// en
overviewLabel: 'Overview',
stackLabel: 'Stack',
highlightsLabel: 'Highlights',
challengeLabel: 'Challenge',
solutionLabel: 'Solution',
// es
overviewLabel: 'Resumen',
stackLabel: 'Stack',
highlightsLabel: 'Destacados',
challengeLabel: 'Reto',
solutionLabel: 'Solución',
```

- [ ] **Step 2: Restyle the header/overview/stack/highlights/challenge-solution blocks**

Port the structure of `project/CaseLens Project.dc.html:34-83` (status badge, title, tagline, GitHub link + period, image block, overview + stack two-column, highlights grid, challenge/solution two-column, back-to-portfolio CTA), replacing `{{ }}` bindings with the existing `item`/`cv` template variables already bound in `project-details.page.html` (`item.metadata.status`, `item.name`, `item.description`, `item.links.github`, `item.period`, `item.long_description`, `item.stack`, `item.metadata.challenges`, `item.metadata.solutions`). Keep the existing carousel/lightbox image gallery markup as-is (lines around the "Project Carousel" block) — it's a strict superset of the mockup's single static image block and stays functionally unchanged, only its container gets the new `neo-border`/`glass-card` classes instead of retro-yellow ones.

Add the highlights grid (new, using `Project.highlights` from Task 2) directly after the stack section:

```html
@if (item.highlights?.length) {
  <div class="space-y-4">
    <h2 class="font-[var(--font-display)] text-[22px] font-bold m-0 mb-2 text-[var(--ink)]">{{ langService.t.highlightsLabel }}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      @for (h of item.highlights; track $index) {
        <div class="p-4.5 rounded-2xl neo-border bg-[var(--card-bg)] shadow-[3px_3px_0_rgba(21,21,26,0.15)] text-sm leading-relaxed text-[var(--ink-soft)]">{{ h }}</div>
      }
    </div>
  </div>
}
```

Restyle every retro-yellow/dark-only class (`text-retro-yellow`, `glass-effect`, `bg-retro-dark`, `text-glow`, etc.) to the light/dark tokens from Task 1 (`text-[var(--color-accent)]`, `glass-card`, `bg-[var(--card-bg)]`, drop the glow text-shadow classes entirely — they're retro-only and have no equivalent in `project/`). Inject `LanguageService` in `project-details.page.ts` (`langService = inject(LanguageService);`) so the template can read the new copy keys.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Manual visual check**

Run: `npm start`, navigate to `/project/<any-slug-returned-by-the-api>`, compare header/overview/stack/highlights/challenge-solution layout against `project/CaseLens Project.dc.html` and `project/WALTER-AI Project.dc.html` opened directly in a browser.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/projects/project-details.page.html src/app/features/projects/project-details.page.ts src/app/core/services/language.service.ts
git commit -m "refactor: restyle project case-study page and render API-sourced highlights"
```

---

### Task 18: Final integration pass

**Files:**
- Modify: `src/styles.css` (cleanup), any file still referencing removed retro classes.

- [ ] **Step 1: Sweep for leftover retro classes**

Run: `grep -rn "retro-\|text-glow\|splash-text\|neural-highlight\|pulse-gold\|animate-tooltip" src/app --include=*.ts --include=*.html`
Expected: no matches. Fix any stragglers found by swapping in the Task 1 tokens/utilities.

- [ ] **Step 2: Sweep for any remaining hardcoded content arrays**

Run: `grep -rn "const.*=.*\[.*{.*label\|const.*=.*\[.*{.*q:\|hardcod" src/app --include=*.ts`
Manually review each hit against the Global Constraints — every remaining literal array must be either UI-copy (fine) or a design/token constant (span patterns, color palettes — fine), never portfolio content or chat Q&A standing in for the API.

- [ ] **Step 3: Full build + manual pass**

Run: `npm run build` — must succeed cleanly.
Run: `npm start`, walk the whole page top to bottom (`/home`) and one `/project/:slug` page, in both light and dark mode and both EN/ES, comparing section-by-section against `project/Portfolio.dc.html`, `project/CaseLens Project.dc.html`, `project/WALTER-AI Project.dc.html` opened directly in a browser tab.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove leftover retro-theme classes after redesign"
```

---

## Self-Review Notes

- **Spec coverage:** every mockup section (nav, hero, marquee, experience, skills, projects carousel, education/languages, contact, floating dock, chat panel, project case-study page) maps to a task above.
- **Data-sourcing coverage:** every place the mockup hardcoded content (hero splash/role phrases, chat tooltip Q&A banks, footer CV/copyright text, project highlights, work `tags`/`metrics`) is traced to either a real `PortfolioData`/`ChatService` field or is dropped/replaced with an API-sourced equivalent — none are ported verbatim as literals.
- **Ambiguity resolved:** UI chrome copy (nav labels, button text, section eyebrows) intentionally stays static in `LanguageService`, per Global Constraints — flagged explicitly so it isn't mistaken for a missed hardcoding violation.
