import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Gemini Client initialization
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  } catch (err) {
    console.error("Failed to initialize Gemini:", err);
  }

  // Real-time Chat Logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("message", async (data) => {
      const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      const timestamp = new Date().toISOString();

      // 1. Broadcast user message
      const userMessage = {
        ...data,
        id: messageId,
        timestamp,
      };
      io.emit("message", userMessage);

      // 2. If it's a message from the operator, trigger AI response
      if (data.sender === 'OPERATOR_PRO' && ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: data.text,
            config: {
              systemInstruction: "You are the AUTGRIT System AI, a high-resilience automated control interface assistant. Your tone is technical, efficient, and slightly futuristic. Assist the operator with system status, protocol information, or general inquiries about the AUTGRIT Super App (Ride-hailing, Delivery, Sober Driver, Secure Payments, Pro Resources). Keep responses relatively concise.",
            }
          });

          const aiMessage = {
            id: 'ai-' + Date.now(),
            sender: 'SYSTEM_AI',
            text: response.text || "PROTOCOL_ERROR: Unable to generate response.",
            timestamp: new Date().toISOString(),
            socketId: 'system',
          };
          io.emit("message", aiMessage);
        } catch (error) {
          console.error("Gemini Error:", error);
          io.emit("message", {
            id: 'err-' + Date.now(),
            sender: 'SYSTEM_AI',
            text: "SYSTEM_ERROR: Connection to neural relay failed. Please check GEMINI_API_KEY configuration.",
            timestamp: new Date().toISOString(),
            socketId: 'system',
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  const getDatabasePath = () => path.join(process.cwd(), "database.json");

  const readDatabase = () => {
    const dbPath = getDatabasePath();
    try {
      if (fs.existsSync(dbPath)) {
        return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      }
    } catch (e) {
      console.error("Failed to read database:", e);
    }
    return {
      wallet: { eth: "1.8492", isWalletConnected: true },
      rideBooking: null,
      terminalLogs: [],
      systemStats: { load: "04.22%", uptime: "412:05:22", memory: "12.4" }
    };
  };

  const writeDatabase = (data: any) => {
    try {
      fs.writeFileSync(getDatabasePath(), JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.error("Failed to write database:", e);
      return false;
    }
  };

  app.get("/api/database", (req, res) => {
    res.json(readDatabase());
  });

  app.post("/api/database/update", (req, res) => {
    const currentDb = readDatabase();
    const updatedDb = { ...currentDb, ...req.body };
    writeDatabase(updatedDb);
    res.json(updatedDb);
  });

  app.post("/api/translate", async (req, res) => {
    const { targetLanguage, texts } = req.body;
    if (!targetLanguage || !texts || typeof texts !== "object") {
      return res.status(400).json({ error: "Missing targetLanguage or texts object" });
    }

    if (!ai) {
      return res.json({ translated: texts, warning: "Gemini AI not initialized" });
    }

    try {
      const prompt = `Translate the following dictionary of user interface strings into the language "${targetLanguage}".
Input JSON:
${JSON.stringify(texts, null, 2)}

You must return a JSON object with the EXACT same keys. Only translate the values. Do not change keys. Return only the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert app translator. Translate the values of the JSON dictionary into the requested target language. Keep the keys completely identical. Do not add any keys or remove any keys. Do not explain anything, just output the translated JSON object."
        }
      });

      const translatedText = response.text || "{}";
      const parsed = JSON.parse(translatedText.trim());
      res.json({ translated: parsed });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Failed to translate strings" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
