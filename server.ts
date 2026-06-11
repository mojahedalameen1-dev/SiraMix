import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const MAX_ROLE_LENGTH = 120;
const MAX_COMPANY_LENGTH = 160;
const MAX_EXPERIENCE_LENGTH = 2000;
const SUPPORTED_LANGUAGES = new Set(["en", "ar"]);

function readTextField(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, maxLength);
}

function readLanguage(value: unknown): "en" | "ar" {
  return typeof value === "string" && SUPPORTED_LANGUAGES.has(value) ? (value as "en" | "ar") : "en";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate/summary", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const role = readTextField(req.body?.role, MAX_ROLE_LENGTH);
      const experience = readTextField(req.body?.experience, MAX_EXPERIENCE_LENGTH);
      const language = readLanguage(req.body?.language);
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert resume writer. Write a professional resume summary for a candidate with the following profile:
Role: ${role || "Professional"}
Experience/Skills: ${experience || "General"}
      
The summary should be approximately 3-4 sentences long, powerful, highlighting seniority and core domain expertise without using personal pronouns (like "I" or "My"). Do not include any introductory text, just the summary itself.
Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      res.status(500).json({ error: "Failed to generate summary." });
    }
  });

  app.post("/api/generate/experience", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const role = readTextField(req.body?.role, MAX_ROLE_LENGTH);
      const company = readTextField(req.body?.company, MAX_COMPANY_LENGTH);
      const language = readLanguage(req.body?.language);
      if (!role || !company) {
        return res.status(400).json({ error: "Role and company are required." });
      }
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert resume writer. Write a list of 3 bullet points describing the impact and duties for a candidate working as a "${role}" at "${company}". 
Each bullet point must start with a strong action verb and include a quantifiable metric if possible. 
Do not include any introductory text. Just output the bullet points separated by newlines, using "-" for the bullets.
Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error generating experience:", error);
      res.status(500).json({ error: "Failed to generate experience." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
