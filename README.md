# Portfolio
Es un portafolio profesional construido con Angular 21, Tailwind CSS y PrimeNG.
# 🌐 Walter Ambriz | Backend & AI Engineer Portfolio

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular)](https://angular.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=flat-square&logo=vercel)](https://vercel.com/)

A high-performance, interactive portfolio featuring a retro-terminal aesthetic and an integrated AI assistant (**WALTER_AI**). Built for speed, responsiveness, and seamless user interaction.

🔗 **Live Demo:** [walterambriz.dev]()

---

## 🚀 Key Features

### 🤖 WALTER_AI Integration
An intelligent assistant powered by **Llama 3.1** via Groq/OpenAI. It doesn't just answer questions—it can **navigate the site for you**.
- **Context-Aware:** Knows my full CV, projects, and technical skills.
- **Command Dispatcher:** Can trigger redirects (e.g., `[NAV:CV]`, `[NAV:PROJECTS]`) based on user intent.
- **Thinking States:** Real-time feedback with terminal-style "thinking" animations.

### ⌨️ Retro-Terminal Aesthetic
- **Scramble Text Effects:** Smooth character transition animations for all dynamic content.
- **GPU-Accelerated Visuals:** High-performance effects optimized for ultra-low CPU usage.
- **Scanline Overlays:** Optional visual filters to enhance the terminal vibe.

### 🌍 Multilingual Support
- Built-in support for **English** and **Spanish**, managed via a dedicated `LanguageService`.
- Persistent language preferences across sessions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Angular 21 (Signals, Standalone Components)
- **Styling:** Tailwind CSS v4, PrimeNG v21 (Lara Theme)
- **Icons:** `@ng-icons` (Lucide, Tabler Icons)
- **Testing:** Vitest, JSDOM

### Backend (WALTER_AI Neural Core)
- **Language:** Python
- **Framework:** FastAPI
- **AI Orchestration:** Groq SDK / OpenAI API
- **Deployment:** Vercel Serverless Functions

---

## 📂 Project Structure

```text
src/
├── app/
│   └── frontend/
│       ├── common/          # Components (Footer, SpeedDial), Services
│       ├── pages/           # Home, CV, Wrapper
│       └── app.routes.ts    # Navigation logic
├── assets/
│   └── data.json           # Source of truth for portfolio content
└── environments/           # Production & Development configs
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v20+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/amnotwallas/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---
*Developed with too much ☕ by Walter Ambriz // AI & Backend Engineer*
