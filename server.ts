import express from "express";
import path from "path";
import htmlToDocx from "html-to-docx";
import JSZip from "jszip";
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

const DEFAULT_DOCX_MARGINS = {
  top: 950,
  right: 950,
  bottom: 950,
  left: 950,
  header: 720,
  footer: 720,
  gutter: 0,
};

function toPositiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function toHalfPoints(value: unknown, fallback = 20) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.round(parsed * 2);
    }
  }

  return fallback;
}

async function removeDefaultTableBorders(input: Buffer): Promise<Buffer> {
  const archive = await JSZip.loadAsync(input);
  const documentFile = archive.file("word/document.xml");
  if (!documentFile) return input;

  const documentXml = await documentFile.async("string");
  const borderlessXml = documentXml.replace(
    /<w:tblBorders>[\s\S]*?<\/w:tblBorders>/g,
    "",
  );
  const compactClosingParagraph = [
    "<w:p><w:pPr>",
    '<w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/>',
    "</w:pPr><w:r><w:rPr>",
    '<w:sz w:val="2"/><w:szCs w:val="2"/>',
    "</w:rPr></w:r></w:p>",
  ].join("");
  const cleanedXml = borderlessXml.replace(
    /<w:p>\s*<w:pPr>\s*<w:spacing w:lineRule="auto"\/>\s*<\/w:pPr>\s*<w:r>\s*<w:rPr\/>\s*<\/w:r>\s*<\/w:p>\s*(?=<\/w:body>)/,
    compactClosingParagraph,
  );
  archive.file("word/document.xml", cleanedXml);
  return archive.generateAsync({ type: "nodebuffer" });
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
      const fontSize = toHalfPoints(options.fontSize);
      const docx = await htmlToDocx(body.html, null, {
        orientation: "portrait",
        pageSize: { width: 11906, height: 16838 },
        margins: {
          top: toPositiveNumber(margin.top, DEFAULT_DOCX_MARGINS.top),
          right: toPositiveNumber(margin.right, DEFAULT_DOCX_MARGINS.right),
          bottom: toPositiveNumber(margin.bottom, DEFAULT_DOCX_MARGINS.bottom),
          left: toPositiveNumber(margin.left, DEFAULT_DOCX_MARGINS.left),
          header: DEFAULT_DOCX_MARGINS.header,
          footer: DEFAULT_DOCX_MARGINS.footer,
          gutter: DEFAULT_DOCX_MARGINS.gutter,
        },
        title: options.title || "SiraMix Resume",
        creator: "SiraMix",
        lastModifiedBy: "SiraMix",
        font: options.font || "Arial",
        fontSize,
        complexScriptFontSize: fontSize,
        lang: options.lang || "en-US",
      });

      const rawBuffer = docx instanceof Buffer ? docx : Buffer.from(await (docx as Blob).arrayBuffer());
      const buffer = await removeDefaultTableBorders(rawBuffer);
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
