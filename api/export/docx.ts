import htmlToDocx from 'html-to-docx';

interface VercelRequestLike {
  method?: string;
  body?: unknown;
}

interface VercelResponseLike {
  status: (statusCode: number) => VercelResponseLike;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  send: (body: unknown) => void;
}

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

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = req.body as DocxExportRequest;
    if (typeof body?.html !== 'string' || body.html.length < 20 || body.html.length > 5_000_000) {
      return res.status(400).json({ error: 'Invalid document HTML.' });
    }

    const options = body.documentOptions || {};
    const margin = options.margins || {};
    const docx = await htmlToDocx(body.html, null, {
      orientation: 'portrait',
      pageSize: { width: 11906, height: 16838 },
      margins: {
        top: margin.top || 950,
        right: margin.right || 950,
        bottom: margin.bottom || 950,
        left: margin.left || 950,
      },
      title: options.title || 'SiraMix Resume',
      creator: 'SiraMix',
      lastModifiedBy: 'SiraMix',
      font: options.font || 'Arial',
      fontSize: options.fontSize || '10pt',
      complexScriptFontSize: options.fontSize || '10pt',
      lang: options.lang || 'en-US',
    });

    const buffer = docx instanceof Buffer ? docx : Buffer.from(await (docx as Blob).arrayBuffer());
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="SiraMix-Resume.docx"');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('DOCX export failed:', error);
    return res.status(500).json({ error: 'DOCX export failed.' });
  }
}
