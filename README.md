# 🌐 Walter Ambriz | Backend & AI Engineer Portfolio

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular)](https://angular.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions)](https://github.com/features/actions)

A high-performance, interactive portfolio featuring a retro-terminal aesthetic and an integrated AI assistant (**WALTER_AI**). Built as a **Data-Driven SPA**, it orchestrates communication between a custom FastAPI backend and a reactive Angular frontend.

🔗 **Live Demo:** [walterambriz.dev](https://amnotwallas.github.io/Portfolio/#/home)

---

## 🚀 Key Features

### 🧠 Single Source of Truth (SSOT)
The portfolio is entirely dynamic. It no longer relies on local JSON files or static assets. All professional data and project metadata are served via a **FastAPI Neural Core**, ensuring total consistency between the web UI and the AI assistant's knowledge base.

### 🛡️ Secure Asset Streaming
Images and professional documents are served through an authenticated asset pipeline. 
- **Header-based Auth:** Assets require `X-API-KEY` validation.
- **Blob Resolution:** The frontend resolves secure streams into local Blob URLs, preventing unauthorized direct access.
- **On-the-fly Optimization:** The backend serves optimized WebP formats to maximize delivery speed.

### ⚡ WPO & Performance (Lighthouse +90)
- **SWR Caching:** Implements *Stale-While-Revalidate* strategy using LocalStorage for near-instant First Contentful Paint (FCP).
- **Lazy Hydration:** Utilizes Angular's `@defer` blocks for viewport-based component loading.
- **Layout Shift Protection:** Zero-CLS architecture using pre-allocated skeletons and explicit aspect-ratios.
- **GPU-Accelerated Visuals:** CRT flicker and scanline effects optimized for 60FPS with minimal CPU overhead.

---

## 🛠️ Tech Stack

### Frontend (The "Shell")
- **Framework:** Angular 21 (Signals, Standalone Components, APP_INITIALIZER)
- **Performance:** Native SWR implementation, Secure Image Resolvers.
- **Styling:** Tailwind CSS v4, PrimeNG v21.
- **Animations:** CSS-based Glitch engine, Scramble Directive for terminal effects.

### Backend (The "Core")
- **Language:** Python 3.11+
- **Framework:** FastAPI (RESTful API, SSE, Secure Streaming)
- **Security:** API Key Middleware, CORS Policy Management.
- **AI Engine:** Llama 3.1 via Groq (Multi-Agent Orchestration).

---

## 📂 Project Structure

```text
src/app/
├── core/               # Singleton services (Portfolio, Chat, Language)
├── shared/             # Reusable UI (Skeletons, ScrambleDirective, Models)
├── features/           # Domain modules (Home, ProjectDetails)
└── portfolio.model.ts  # Centralized Data Schema
```

---

## ⚙️ Development

### Prerequisites
- **Node.js:** v20+
- **Package Manager:** npm (v11+)

### Local Setup
1. **Clone & Install:**
   ```bash
   git clone https://github.com/amnotwallas/portfolio.git
   cd portfolio
   npm install
   ```

2. **Environment Configuration:**
   Create a `src/environments/environment.ts` (or modify the prod one) and ensure you have your `WALTER_AI_API_KEY`.

3. **Run Development Server:**
   ```bash
   npm start
   ```

4. **Testing:**
   ```bash
   npm test
   ```

---

## 🚢 Deployment & CI/CD
This project uses **GitHub Actions** for automated delivery:
- **Secret Injection:** The `WALTER_AI_API_KEY` is injected into the environment files during the build process.
- **Routing Fix:** Automatically generates a `404.html` from `index.html` to support client-side routing on GitHub Pages.
- **Hosting:** Deployed via GitHub Pages on every push to `main`.

---
*Developed with focus and precision by Walter Ambriz // AI & Backend Engineer*
