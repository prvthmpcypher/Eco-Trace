# EcoTrace — Carbon Footprint Tracker & AI EcoCoach

EcoTrace is a modern, responsive, full-stack personal sustainability manager designed to bridge the knowing-doing gap of carbon footprint reduction through simple daily tracking, neighborhood competition, and shame-free AI-driven habit coaching.

---

## 1. Chosen Vertical: Personal Climate Action & Habit Formation
EcoTrace addresses the individual climate action vertical. While enterprises use complex industrial-grade carbon accounting platforms, individuals represent 20–30% of global greenhouse emissions. Rather than using punitive shame-based UI design, EcoTrace treats climate metrics as a **"living ecosystem"** (utilizing an Organic Data design system with soft botanical colors, pebble-rounded UI shapes, and haptic-aligned micro-interactions).

---

## 2. Approach & Logic
EcoTrace is built as a complete, modern responsive mobile-first full-stack application.
* **Server-Authoritative Secrets Proxy:** To prevent exposing confidential API keys (like the Gemini API key) to client-side browser requests, the app features an Express backend (`server.ts`) that handles all requests to Gemini model servers.
* **Client-Side Persistence:** Tracking user entries require durability so users don't lose their eco-milestones or habit steaks. We utilize a local, robust `localStorage` state layer to persist logged history, active group challenge progress, and personal milestones across browser reload states.
* **Organic Design Token System**: We avoid cold, technical spreadsheets. Daily carbon status is visualized on a beautifully animated, retrograded "Circular Dial" showing Net Carbon impact compared to recommended daily thresholds. Hitting positive benchmarks is rewarded with micro-celebration animations and level-ups on a "Living Milestone seedling."

---

## 3. How the Solution Works
1. **The Carbon Dial (Daily Metrics):**
   * Computes the logged activity values (e.g., transport km, dietary meal changes, off-grid energy usage) against a standard raw daily footprint allowance (6.0 kg CO2e).
   * Visualizes remaining footprint allowances with clear under/over color-coded states.
2. **AI EcoCoach Engine:**
   * Utilizes the server-side proxy `/api/ai-coach` to dispatch prompt requests to Google GenAI's latest `gemini-3.5-flash` model.
   * Generates highly actionable, encouraging, and non-judgmental single-topic tips based on the exact category the user just logged.
   * Includes a fully integrated interactive "Chat with Coach" console inside the **Insights** tab where users can ask custom questions about vegetarian cooking, eco-purchasing, or renewable retrofits.
3. **Bento Activity Log Engine:**
   * Categories selection grid directly maps to customized slider scales depending on metrics unit systems (e.g., km for transport, meals count for dietary improvements, items for second-hand purchases).
4. **Slide to Log / Confirm Controls:**
   * Custom mobile-first drag-and-swipe sliders allow frictionless re-logging (under 30s per entry) for habit-forming repeatability and satisfying visual confirmation.
5. **Gamified Collaboration:**
   * Tracks neighborhood rankings, friend streak counters, active public challenges, and unlocks achievement badges (Level 2 Sapling status).

---

## 4. Key Assumptions Made
* **Carbon Saving Coefficients**: For tracking carbon savings, standard emission offsets were calculated per logged activity unit:
  * Commute by bicycle vs standard combustion auto saves **0.15 kg CO2e/km**.
  * Swapping to plant-based meals saves **3.2 kg CO2e/meal**.
  * Off-grid solar vs standard municipal coal grid energy saves **0.4 kg CO2e/kWh**.
  * Sustainable second-hand purchase saves **4.8 kg CO2e/item**.
  * Active organic waste composting saves **0.8 kg CO2e/kg**.
* **Footprint Baseline**: Assume standard recommended daily emission baseline limit is **6.0 kg CO2e** per person. Logs of carbon-saving habits subtract directly from this limit, representing your current Net daily footprint score.
