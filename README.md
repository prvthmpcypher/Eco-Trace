<div align="center">

<img src="https://img.shields.io/badge/EcoTrace-Carbon%20Tracker-2D6A4F?style=for-the-badge&logo=leaf&logoColor=92f7c3" alt="EcoTrace"/>

# 🌿 EcoTrace — Carbon Footprint Tracker & AI EcoCoach

**Bridge the knowing-doing gap. Track daily habits. Get AI-powered coaching. Compete with your neighborhood.**

[![MIT License](https://img.shields.io/badge/License-MIT-2D6A4F?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![Build](https://img.shields.io/github/actions/workflow/status/prvthmpcypher/eco-trace/build.yml?style=flat-square&label=CI%2FCD&color=52B788)](https://github.com/prvthmpcypher/eco-trace/actions)

<br/>

> *"Individuals drive 20–30% of global carbon emissions, yet lack tools to understand which habits matter most."*
> EcoTrace changes that — with a shame-free, gamified, AI-native daily tracker.

<br/>

![EcoTrace Banner](https://img.shields.io/badge/🌱%20Daily%20Tracking-52B788?style=flat-square) ![EcoTrace Banner](https://img.shields.io/badge/🤖%20AI%20EcoCoach-2D6A4F?style=flat-square) ![EcoTrace Banner](https://img.shields.io/badge/🏆%20Community%20Challenges-006C48?style=flat-square)

</div>

---

## 📖 Table of Contents

- [What is EcoTrace?](#-what-is-ecotrace)
- [Core Features](#-core-features)
- [Advanced Features](#-advanced-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Android APK Build](#-android-apk-build-capacitor)
- [Desktop / Web Release](#-desktop--web-release)
- [CI/CD & GitHub Actions](#-cicd--github-actions)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌿 What is EcoTrace?

EcoTrace is a **mobile-first, full-stack personal sustainability manager** that makes daily carbon tracking as effortless as opening Instagram. It combines:

- A **Carbon Dial** — real-time daily net CO₂ footprint, colour-coded against your 6 kg baseline
- An **AI EcoCoach** — Gemini-powered coaching tailored to your exact logged activity, never generic
- **Gamified Challenges** — neighborhood leaderboards, streak counters, and a living milestone seedling that grows as you improve
- A **Shame-free Design System** — warm botanical colours (`#2D6A4F`, `#92F7C3`, `#E8FFEE`), pebble-rounded shapes, and haptic-aligned micro-animations

---

## ✨ Core Features

| Feature | Description | Priority |
|---|---|---|
| 🧮 **Carbon Dial** | Animated circular dial showing net CO₂ vs. your daily 6.0 kg baseline | P0 |
| 📊 **Bento Activity Logger** | 5 categories (Transport, Food, Energy, Shopping, Waste) with smart sliders | P0 |
| 🤖 **AI EcoCoach** | Gemini 2.5 Flash tips triggered per activity + interactive chat console | P0 |
| 🎯 **Goal Tracking** | Monthly and annual CO₂ reduction targets with auto-recalibration | P1 |
| 🏆 **Community Challenges** | Public challenges, friend streak counters, tiered achievement badges | P1 |
| 🌱 **Living Milestone Seedling** | Visual tree that grows as you hit carbon-reduction milestones | P1 |
| 🔔 **Smart Notifications** | Habit nudges and milestone celebrations with intelligent frequency capping | P1 |
| 💾 **Offline-First** | Full local persistence via `localStorage` — works without any internet | P0 |

---

## 🚀 Advanced Features

### 🤖 AI EcoCoach Engine — How It Works

The AI coaching pipeline is built around a **server-side proxy** (`server.ts`) to ensure the Gemini API key never touches the client:

```
Client → POST /api/ai-coach → server.ts → Gemini 2.5 Flash → sanitized tip → Client
```

Key design decisions:
- **Input sanitisation** — all user data is stripped of HTML tags, dangerous characters, and clamped to safe numeric ranges before being included in the prompt
- **Graceful degradation** — if `GEMINI_API_KEY` is absent, the server returns a high-quality local rule-based tip rather than crashing
- **4,500 ms timeout** — a `Promise.race()` prevents hanging requests from degrading UX
- **Category-scoped prompts** — tips are always anchored to the exact category the user just logged, not generic

#### Prompt Design Pattern

```typescript
const prompt = `
  You are AI EcoCoach — a professional, encouraging, shame-free sustainability companion.
  Logged category: ${category}
  Recent entries: ${logs.map(l => l.category).join(", ")}
  Return a 1–2 sentence tip. Cite specific kg CO₂ savings. Plain text, no markdown.
`;
```

---

### 📊 Carbon Coefficient Data Model

EcoTrace uses verified emission offset factors derived from IPCC AR6 data:

| Activity | Unit | CO₂ Saved | Source |
|---|---|---|---|
| Commute by Bike | km | 0.15 kg CO₂e | vs. average combustion vehicle |
| Plant-based Meal | meal | 3.2 kg CO₂e | vs. beef-based meal |
| Off-grid Solar Charge | kWh | 0.4 kg CO₂e | vs. coal-grid average |
| Second-hand Purchase | item | 4.8 kg CO₂e | vs. new manufactured item |
| Composting Organic Waste | kg | 0.8 kg CO₂e | vs. landfill methane emission |

**Daily Baseline:** 6.0 kg CO₂e per person (global sustainable daily target per Paris Agreement trajectory)

---

### 🎨 Organic Design Token System

EcoTrace uses a fully documented Tailwind v4 `@theme` layer with semantic botanical tokens:

```css
@theme {
  --color-primary-dark:     #012d1d;   /* Deep forest — headings, high emphasis */
  --color-secondary-green:  #006c48;   /* Mid canopy — interactive elements */
  --color-accent-mint:      #2d6a4f;   /* Accent — borders, focus rings */
  --color-light-mint:       #92f7c3;   /* Highlight — success states, CTAs */
  --color-mist-bg:          #e8ffee;   /* Page background */
  --color-mist-light:       #defbe7;   /* Card backgrounds */
  --color-border-leaf:      #c5ddd2;   /* Dividers and borders */
  --font-sans: "Hanken Grotesk", "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

All UI components are built with these tokens — no hardcoded hex values outside `:root`.

---

### 🔄 Swipe-to-Log Interaction

The signature UX pattern is a **mobile-first drag-and-swipe confirm** built with touch-native event handlers:

```tsx
const handleTouchMove = (e: React.TouchEvent) => {
  const delta = e.touches[0].clientX - startX;
  const progress = Math.min(100, Math.max(0, (delta / 180) * 100));
  if (progress >= 95) { onSwipeLog(); /* triggers coach tip + CO₂ update */ }
};
```

This means every log can be confirmed in **under 30 seconds** — critical for habit formation.

---

### 🏆 Gamification Architecture

```
User logs activity
    │
    ▼
CO₂ saved calculated → Carbon Dial updates (real-time)
    │
    ▼
Streak counter incremented → Badge unlock check
    │
    ▼
Community leaderboard delta computed → Neighborhood rank updates
    │
    ▼
Living Milestone Seedling grows → Level-up animation fires
    │
    ▼
AI EcoCoach tip fetched → Coach card renders with category context
```

Achievement badge tiers: 🌱 Seedling → 🌿 Sapling → 🌳 Oak → 🌲 Ancient Grove

---

### 📱 Capacitor Native Packaging

EcoTrace ships as a **web container** compatible with Capacitor by Ionic, enabling APK/AAB compilation without a full React Native rewrite:

```
Vite build (dist/) → Capacitor sync → Android Gradle project → APK / AAB
```

See the [Android APK Build](#-android-apk-build-capacitor) section for the full step-by-step.

---

## 🛠 Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | 19 | SPA framework |
| **Language** | TypeScript | 5.8 | Type safety end-to-end |
| **Bundler** | Vite | 6.2 | Build tooling + HMR |
| **Styling** | Tailwind CSS | 4.1 | Utility-first design tokens |
| **Animation** | Motion (Framer) | 12.x | Micro-interactions |
| **Icons** | Lucide React | 0.546 | Consistent icon system |
| **Backend** | Express.js | 4.21 | Server-side AI proxy |
| **AI** | Google Gemini | 2.5 Flash | EcoCoach engine |
| **Rate Limiting** | express-rate-limit | 8.5 | API abuse prevention |
| **Runtime** | Node.js + tsx | 22 LTS | Dev + production server |
| **Build** | esbuild | 0.25 | Server bundle compilation |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    EcoTrace Client                       │
│  React + TypeScript + Tailwind v4 + Motion               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ Dashboard│  │AddActivity│  │ Insights │  │Community│  │
│  │ CarbonDial│  │SliderLog │  │ChatCoach │  │Leaderbd │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┘  │
│       │              │              │                     │
│       └──────────────┼──────────────┘                    │
│                      │ localStorage (offline persistence) │
└──────────────────────┼──────────────────────────────────┘
                        │ fetch /api/ai-coach (relative)
┌──────────────────────▼──────────────────────────────────┐
│                 Express Server (server.ts)               │
│                                                          │
│  Rate Limiter → Input Sanitizer → Prompt Builder        │
│       │                                    │             │
│       └──────────────────────────────────┐ │             │
│                                          ▼ ▼             │
│                               Google Gemini 2.5 Flash    │
│                               (GEMINI_API_KEY in env)    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22 LTS
- A Google Gemini API key ([get one free here](https://ai.google.dev))

### Install & Run

```bash
# Clone the repo
git clone https://github.com/prvthmpcypher/eco-trace.git
cd eco-trace

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set GEMINI_API_KEY="your-key-here"

# Start dev server (Vite + Express together)
npm run dev
# → App running at http://localhost:3000
```

### Production Build

```bash
npm run build
# Outputs: dist/ (React SPA) + dist/server.cjs (Express server)

npm start
# → Production server at http://0.0.0.0:3000
```

---

## 📱 Android APK Build (Capacitor)

### Prerequisites
- Node.js installed
- Android Studio + Android SDK build tools

### Step-by-Step

```bash
# 1. Install Capacitor core
npm install @capacitor/core @capacitor/cli

# 2. Initialise Capacitor
npx cap init EcoTrace com.ecotrace.app --web-dir=dist

# 3. Add Android platform
npm install @capacitor/android
npx cap add android

# 4. Build production web assets
npm run build

# 5. Sync to Android project
npx cap sync

# 6. Open in Android Studio and build
npx cap open android
# In Android Studio → Build → Build Bundle(s) / APK(s) → Build APK
```

> **Tip:** Use `Build > Generate Signed Bundle / APK` for a Play Store release.

---

## 🖥 Desktop / Web Release

### GitHub Pages Deployment

```bash
# Tag a release
git tag -a v1.0.0 -m "EcoTrace v1.0.0 — initial release"
git push origin v1.0.0
```

The included GitHub Actions workflow (`.github/workflows/build.yml`) will:
1. Build the Vite SPA
2. Publish to GitHub Pages automatically
3. Build and attach APK and EXE artifacts to the GitHub Release

### Server Environment Setup

Map your secrets in your hosting provider's dashboard (never in `.env` committed to git):

| Provider | Where to set `GEMINI_API_KEY` |
|---|---|
| Vercel | Project → Settings → Environment Variables |
| Cloud Run | Service → Edit & Deploy → Variables & Secrets |
| Heroku | App → Settings → Config Vars |
| Railway | Project → Variables |

---

## ⚙️ CI/CD & GitHub Actions

EcoTrace ships with a full GitHub Actions pipeline. On every push to `main` and on every tagged release:

| Workflow | Trigger | What It Does |
|---|---|---|
| `build.yml` | Push to `main` / PR | TypeScript lint + Vite build |
| `release.yml` | `v*` tag push | Builds Vite SPA, packages APK via Capacitor, packages EXE via Electron Builder, attaches all to GitHub Release |
| `pages.yml` | Push to `main` | Deploys to GitHub Pages |

Workflow files are located in `.github/workflows/`. See the [GitHub Actions](#-cicd--github-actions) section above for details.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for AI) | Google Gemini API key for EcoCoach |
| `APP_URL` | No | Hosting URL for self-referential links |
| `NODE_ENV` | No | `production` enables HTTPS redirect |

> **Never commit your `.env` file.** It is gitignored by default.

---

## 🔒 Security

EcoTrace was designed with a defence-in-depth approach:

- **API key isolation** — Gemini key lives only in server env vars, never in client bundles
- **Input sanitisation** — all user data is stripped of HTML/script injection before prompt inclusion
- **Rate limiting** — 300 req/15 min globally; 15 req/min on the AI endpoint specifically
- **HTTPS enforcement** — automatic HTTP → HTTPS redirect in production
- **Credential masking in logs** — `safeLog()` replaces API keys and JWTs in all console output
- **JSON payload cap** — `express.json({ limit: "50kb" })` prevents large payload DoS
- **No eval/innerHTML** — zero dynamic code execution in the React frontend

See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## 🗺 Roadmap

- [x] Carbon Dial with animated SVG gauge
- [x] 5-category activity logger with swipe-to-confirm
- [x] AI EcoCoach with Gemini backend proxy
- [x] Community challenges & leaderboards
- [x] Living Milestone Seedling gamification
- [x] localStorage offline persistence
- [x] GitHub Actions CI/CD with APK + EXE auto-build
- [ ] Onboarding lifestyle quiz with personal CO₂ baseline
- [ ] Weekly AI insight summaries (ML-ranked recommendations)
- [ ] Carbon offset marketplace (verified projects + Stripe)
- [ ] Smart home + Fitbit API integrations
- [ ] React Native companion app
- [ ] Social sharing cards for milestones

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add weekly digest"`
4. Push and open a PR against `main`

Please run `npm run lint` before submitting. All PRs require passing CI.

---

## 📄 License

MIT © 2025 Poorvith M P — [@prvthmp](https://x.com/prvthmp) · [LinkedIn](https://linkedin.com/in/prvthmp) · [GitHub](https://github.com/prvthmpcypher)

---

<div align="center">

**Built with 🌿 for a healthier planet**

*EcoTrace — Every habit logged is a vote for the world you want to live in.*

</div>
