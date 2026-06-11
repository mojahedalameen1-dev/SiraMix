import express from "express";
import path from "path";
import htmlToDocx from "html-to-docx";
import { createServer as createViteServer } from "vite";

interface DocxExportRequest {
  html?: unknown;
  documentOptions?: {
    margins?: { top?: number; right?: number; bottom?: number; left?: number };
    title?: string;
    font?: string;
    fontSize?: string;
    lang?: string;
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: "6mb" }));

  app.post("/api/export/docx", async (req, res) => {
    try {
      const body = req.body as DocxExportRequest;
      if (typeof body.html !== "string" || body.html.length < 20 || body.html.length > 5_000_000) {
        return res.status(400).json({ error: "Invalid document HTML." });
      }

      const options = body.documentOptions || {};
      const margin = options.margins || {};
      const docx = await htmlToDocx(body.html, null, {
        orientation: "portrait",
        pageSize: { width: 11906, height: 16838 },
        margins: {
          top: margin.top || 950,
          right: margin.right || 950,
          bottom: margin.bottom || 950,
          left: margin.left || 950,
        },
        title: options.title || "SiraMix Resume",
        creator: "SiraMix",
        lastModifiedBy: "SiraMix",
        font: options.font || "Arial",
        fontSize: options.fontSize || "10pt",
        complexScriptFontSize: options.fontSize || "10pt",
        lang: options.lang || "en-US",
      });

      const buffer = docx instanceof Buffer ? docx : Buffer.from(await (docx as Blob).arrayBuffer());
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", 'attachment; filename="SiraMix-Resume.docx"');
      return res.send(buffer);
    } catch (error) {
      console.error("DOCX export failed:", error);
      return res.status(500).json({ error: "DOCX export failed." });
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
