import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI EcoCoach will run in simulation mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI coach API endpoint
app.post("/api/ai-coach", async (req, res) => {
  try {
    const { logs, category } = req.body;
    
    // Fallback if no key is supplied
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        tip: `Your ${category ? category.toLowerCase() : 'diet'} is your top opportunity — cutting red meat saves ~3.2 kg CO2 per meal. Try logging a meat-free day!`
      });
    }

    const ai = getGeminiClient();
    const prompt = `
      You are is AI EcoCoach, a highly professional, encouraging, shame-free sustainability companion.
      The user is tracking their carbon footprint on an app called EcoTrace.
      Provide a highly actionable, 1-2 sentence tip tailored to the category they logged or their overall profile.
      Keep it very short, inspiring, and list a specific saving of kg CO2 if possible.
      
      Logged context category: ${category || 'general'}
      Recent tracked entries: ${JSON.stringify(logs || [])}

      Make sure to sound natural, friendly, and practical (e.g., "Your diet is your top opportunity — cutting red meat saves ~3.2 kg CO2 per meal."). Do not use markdown bullet points. Return just the plain string.
    `;

    // Wrap the Gemini api generator with a fast-resolving 4.5 second promise-timeout
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
    console.error("Gemini Error intercepted:", error);
    
    // Choose a premium context-aware fallback tip
    let fallbackTip = "Swapping carbon-heavy transport for public transit or walking is your single biggest impact reducer today!";
    
    const catText = req.body?.category ? String(req.body.category).toLowerCase() : "";
    if (catText.includes("diet") || catText.includes("food") || catText.includes("lunch") || catText.includes("beef") || catText.includes("plant")) {
      fallbackTip = "Your diet is your top opportunity — cutting red meat saves ~3.2 kg CO2 per meal. Try planning a delicious meat-free day!";
    } else if (catText.includes("transport") || catText.includes("bike") || catText.includes("walk") || catText.includes("car") || catText.includes("commute")) {
      fallbackTip = "Did you know? Swapping just one short drive for a walking commute or public transit saves up to 2.4 kg of CO2e per trip.";
    } else if (catText.includes("energy") || catText.includes("solar") || catText.includes("light") || catText.includes("charge")) {
      fallbackTip = "Powering down idle electronics and choosing daylight hours for charging saves up to 0.5 kg CO2 daily. Every watt counts!";
    } else if (catText.includes("shop") || catText.includes("waste") || catText.includes("compost") || catText.includes("item")) {
      fallbackTip = "Opting for high-quality second-hand goods or home composting reduces your landfill methane footprint by up to 4.8 kg CO2!";
    } else if (catText.includes("question") || catText.includes("suggest") || catText.includes("how")) {
      fallbackTip = "To reduce emissions effectively: 1) Prioritize local sustainable produce; 2) Walk/cycle trips under 3km; 3) Lower thermostat temperatures by 1°C.";
    }

    // Always respond with Status 200 and a friendly EcoCoach fallback tip to prevent UI disruption
    res.json({ 
      tip: fallbackTip,
      isFallback: true,
      errorInfo: error.message || "Model temporarily busy"
    });
  }
});

// Setting up Vite dev or static server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware.");
  } else {
    // In production, serve build outputs directly
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static file server loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoTrace server listening at http://0.0.0.0:${PORT}`);
  });
}

start();
