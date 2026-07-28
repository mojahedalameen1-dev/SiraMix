import React, { useEffect, useRef, useState } from 'react';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

interface OriginalPdfPreviewProps {
  blob: Blob;
  scale: number;
  language: 'en' | 'ar';
  onPageCountChange?: (count: number) => void;
}

interface PdfCanvasProps {
  pdf: any;
  pageNumber: number;
  scale: number;
}

const PdfCanvas: React.FC<PdfCanvasProps> = ({ pdf, pageNumber, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null;

    void pdf.getPage(pageNumber).then((page: any) => {
      if (cancelled || !canvasRef.current) return;
      const viewport = page.getViewport({ scale: Math.max(1.35, scale * 1.8) });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const task = page.render({ canvasContext: context, viewport });
      renderTask = task;
      return task.promise;
    }).catch((error: unknown) => {
      if (!cancelled && (error as { name?: string })?.name !== 'RenderingCancelledException') {
        console.error('Original PDF page render failed:', error);
      }
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pageNumber, pdf, scale]);

  return <canvas ref={canvasRef} className="block h-auto w-full bg-white" />;
};

export const OriginalPdfPreview: React.FC<OriginalPdfPreviewProps> = ({ blob, scale, language, onPageCountChange }) => {
  const [pdf, setPdf] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void>; promise: Promise<any> } | null = null;

    void blob.arrayBuffer().then(async data => {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      loadingTask = pdfjs.getDocument({ data });
      const loadedPdf = await loadingTask.promise;
      if (cancelled) {
        await loadedPdf.destroy();
        return;
      }
      setPdf(loadedPdf);
      onPageCountChange?.(loadedPdf.numPages);
    }).catch(errorValue => {
      if (!cancelled) {
        console.error('Original PDF load failed:', errorValue);
        setError(true);
      }
    });

    return () => {
      cancelled = true;
      void loadingTask?.destroy();
      setPdf(null);
    };
  }, [blob, onPageCountChange]);

  if (error) {
    return (
      <div className="grid min-h-80 place-items-center bg-white p-8 text-center text-sm font-bold text-red-600">
        {language === 'ar' ? 'تعذر عرض ملف PDF الأصلي.' : 'The original PDF could not be displayed.'}
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="grid min-h-80 place-items-center bg-white p-8 text-sm font-bold text-slate-500">
        {language === 'ar' ? 'جار تجهيز صفحات الملف الأصلي...' : 'Preparing the original pages...'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: pdf.numPages }, (_, index) => (
        <div key={index} className="overflow-hidden border border-slate-300 bg-white shadow-xl">
          <PdfCanvas pdf={pdf} pageNumber={index + 1} scale={scale} />
        </div>
      ))}
    </div>
  );
};
