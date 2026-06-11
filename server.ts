import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { rateLimit } from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = 3000;

// Tell Express to trust proxy headers (e.g., X-Forwarded-For) in order for rate limiting to work behind reverse proxies
app.set("trust proxy", 1);

// ====== SECURITY REQUIREMENT 3: HTTPS MIDDLEWARE ======
// In production, force redirection of insecure HTTP requests to HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    const proto = req.headers["x-forwarded-proto"];
    if (proto && proto !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
  }
  next();
});

// Parse json payloads securely
app.use(express.json({ limit: "50kb" }));

// ====== SECURITY REQUIREMENT 3: ZERO LOG EXPOSURE SANITIZERS ======
function safeLog(message: string, ...args: any[]) {
  const secretKey = process.env.GEMINI_API_KEY;
  let logStr = `${message} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ")}`;
  if (secretKey && secretKey.length > 5) {
    const escapedKey = secretKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    logStr = logStr.replace(new RegExp(escapedKey, "g"), "[MASKED_API_KEY]");
  }
  logStr = logStr.replace(/eyJ[a-zA-Z0-9-_=]+\.eyJ[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_.+/=]*/g, "[MASKED_JWT]");
  console.log(logStr);
}

function safeLogError(message: string, error: any) {
  let errStr = error?.stack || error?.message || String(error);
  const secretKey = process.env.GEMINI_API_KEY;
  if (secretKey && secretKey.length > 5) {
    const escapedKey = secretKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    errStr = errStr.replace(new RegExp(escapedKey, "g"), "[MASKED_API_KEY]");
  }
  errStr = errStr.replace(/eyJ[a-zA-Z0-9-_=]+\.eyJ[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_.+/=]*/g, "[MASKED_JWT]");
  console.error(`${message}:`, errStr.substring(0, 1000));
}

// ====== SECURITY REQUIREMENT 4: RATE LIMIT EVERY ENDPOINT ======
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." }
});
app.use(globalLimiter);

// Specific strict rate limiter for AI Coach prompt evaluation
const coachApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 queries per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many coaching requests. Please take a deep breath and try again soon!" }
});


// ====== SECURITY REQUIREMENT 5: SECRETS IN ENV VARS ONLY ======
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    // Strict requirement: Never fall back to "MOCK_KEY" or hardcoded credentials
    if (!key) {
      safeLog("WARNING: GEMINI_API_KEY environment variable is not defined. Running in secure rule-based mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}


// ====== SECURITY REQUIREMENT 6: SANITISE & VALIDATE USER INPUTS ======
function cleanString(val: any, maxLength = 80): string {
  if (typeof val !== "string") return "";
  // Strip dangerous tag patterns, backticks, or script elements to block injection
  let cleaned = val.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/[\`\"\$]/g, ""); // strip characters often used in nesting
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  return cleaned.trim();
}

function validateAndSanitizeLogs(logsArray: any): any[] {
  if (!Array.isArray(logsArray)) return [];
  const validCategories = ["Transport", "Food", "Energy", "Shopping", "Waste"];
  
  return logsArray
    .map(item => {
      if (!item || typeof item !== "object") return null;
      // Force strict check of data values to block direct database or code manipulation patterns
      return {
        id: cleanString(item.id, 40),
        category: validCategories.includes(String(item.category)) ? String(item.category) : "Transport",
        name: cleanString(item.name, 60),
        amount: typeof item.amount === "number" && isFinite(item.amount) ? Math.min(1000, Math.max(0, item.amount)) : 0,
        unit: cleanString(item.unit, 10),
        co2Saved: typeof item.co2Saved === "number" && isFinite(item.co2Saved) ? Math.min(200, Math.max(0, item.co2Saved)) : 0,
        timestamp: cleanString(item.timestamp, 30)
      };
    })
    .filter(item => item !== null);
}


// ====== SECURITY REQUIREMENT 2: PREVENT UNAUTHORIZED DATA ACCESS (IDOR) ======
// Note: As an offline-first tracker, all custom transaction metrics reside in client local storage.
// To ensure perfect direct reference security, this endpoint has no parameters referring to cross-tenant ids
// and contains zero references to dynamic server files (thwarting path-traversal IDOR). All operations are local-scoped.

app.post("/api/ai-coach", coachApiLimiter, async (req, res) => {
  try {
    // 1. Strictly validate and sanitize input fields
    const logs = validateAndSanitizeLogs(req.body?.logs);
    const category = cleanString(req.body?.category, 50);

    const keyExist = !!process.env.GEMINI_API_KEY;
    const ai = getGeminiClient();

    // 2. Safely serve context tips if API key is not mapped
    if (!keyExist || !ai) {
      let localAdvice = "Swapping red meat for plant-based foods saves ~3.2 kg CO2 per meal. Try custom planning your diet!";
      if (category) {
        const cat = category.toLowerCase();
        if (cat.includes("diet") || cat.includes("food")) {
          localAdvice = "Your diet is your top opportunity — cutting red meat saves ~3.2 kg CO2 per meal. Try planning a delicious meat-free day!";
        } else if (cat.includes("transport") || cat.includes("bike") || cat.includes("walk")) {
          localAdvice = "Did you know? Swapping just one short drive for a walking commute or public transit saves up to 2.4 kg of CO2e per trip.";
        }
      }
      return res.json({ tip: localAdvice });
    }

    const prompt = `
      You are AI EcoCoach, a professional, encouraging, sham-free sustainability companion.
      The user is tracking their carbon footprint on an app called EcoTrace.
      Provide a highly actionable, 1-2 sentence tip tailored to the category they logged or their overall profile.
      Keep it very short, inspiring, and list a specific saving of kg CO2 if possible.
      
      Logged context category: ${category || 'general'}
      Recent tracked entries count: ${logs.length}
      Recent entries categories: ${logs.map(l => l.category).join(", ")}

      Make sure to sound natural, friendly, and practical (e.g., "Your diet is your top opportunity — cutting red meat saves ~3.2 kg CO2 per meal."). Do not use markdown bullet points. Return just the plain string.
    `;

    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout of 4500ms exceeded")), 4500)
    );

    const generatePromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const tip = response.text?.trim() || "Small steps count! Swapping just one drive for a walk can save about 2.4 kg of CO2.";
    
    res.json({ tip });
  } catch (error: any) {
    safeLogError("Gemini Error intercepted", error);
    
    let fallbackTip = "Swapping carbon-heavy transport for public transit or walking is your single biggest impact reducer today!";
    const catText = req.body?.category ? String(req.body.category).toLowerCase() : "";
    
    if (catText.includes("diet") || catText.includes("food") || catText.includes("lunch")) {
      fallbackTip = "Your diet is your top opportunity — cutting red meat saves ~3.2 kg CO2 per meal. Try planning a delicious meat-free day!";
    } else if (catText.includes("transport") || catText.includes("bike") || catText.includes("car")) {
      fallbackTip = "Did you know? Swapping just one short drive for a walking commute or public transit saves up to 2.4 kg of CO2e per trip.";
    } else if (catText.includes("energy") || catText.includes("solar")) {
      fallbackTip = "Powering down idle electronics and choosing daylight hours for charging saves up to 0.5 kg CO2 daily. Every watt counts!";
    }

    res.json({ 
      tip: fallbackTip,
      isFallback: true,
      errorInfo: "Model temporarily busy" 
    });
  }
});


// ====== SECURITY REQUIREMENT 1: NO JWT SECRETS IN FRONTEND ======
// Any secure session authentication or programmatic signature logic goes in back-end handlers below if added.
// Currently, the application maintains zero token dependencies on the frontend, isolating keys to backend scopes.


// Setting up Vite dev or static server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    safeLog("Vite development server loaded as middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    safeLog("Production static file server loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    safeLog(`EcoTrace server listening at http://0.0.0.0:${PORT}`);
  });
}

start();
