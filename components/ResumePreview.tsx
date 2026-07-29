import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getFontFamilyOption } from '../constants';
import { useTranslation } from '../i18n';
import { buildDocxHtml } from '../services/docxTemplate';
import { sourceDocumentService } from '../services/sourceDocumentService';
import { ResumeData, SourceDocument, TemplateOptions } from '../types';
import { OriginalPdfPreview } from './OriginalPdfPreview';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import RealisticTemplate, { RealisticTemplateId } from './templates/RealisticTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  options: TemplateOptions;
  sourceDocument?: SourceDocument | null;
  setOptions: (options: TemplateOptions) => void;
  onOpenLongestSection?: () => void;
  onExportBackup?: () => void;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, options, sourceDocument, setOptions, onOpenLongestSection, onExportBackup }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [zoomMode, setZoomMode] = useState<'fit-width' | 'actual' | 'fit-page'>('fit-width');
  const [scale, setScale] = useState(1);
  const [overflowStatus, setOverflowStatus] = useState<'perfect' | 'spill' | 'safe2'>('perfect');
  const [previewHeight, setPreviewHeight] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(null);
  const [sourceLoadFailed, setSourceLoadFailed] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'editable'>(sourceDocument ? 'original' : 'editable');
  const { t, language } = useTranslation();

  const A4_WIDTH_PX = 793.7;
  const A4_HEIGHT_PX = 1122.5;
  const fileName = `SiraMix-${data.personalInfo.name || 'Resume'}`
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  const hasPersonalInfo = Object.values(data.personalInfo).some(value => value.trim());
  const hasCustomContent = Object.values(data.customSectionsData || {})
    .some(items => items.length > 0);
  const isEmpty = !sourceDocument && !hasPersonalInfo
    && !data.summary.trim()
    && data.experience.length === 0
    && data.education.length === 0
    && data.skills.length === 0
    && !hasCustomContent;
  const selectedFont = getFontFamilyOption(options.fontFamily);
  const realisticTemplateIds = new Set<string>([
    'emerald-two-column',
    'audit-classic',
    'blue-analyst',
    'centered-executive',
    'consulting-timeline',
    'dense-executive',
    'minimal-technical',
  ]);

  const triggerDownload = (blob: Blob, downloadName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.href = url;
    link.download = downloadName;
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  useEffect(() => {
    let cancelled = false;
    setSourceBlob(null);
    setSourceLoadFailed(false);

    if (!sourceDocument) {
      setViewMode('editable');
      return;
    }

    setViewMode('original');
    void sourceDocumentService.getBlob(sourceDocument)
      .then(blob => {
        if (!cancelled) setSourceBlob(blob);
      })
      .catch(error => {
        if (!cancelled) {
          console.error('Could not load source PDF:', error);
          setSourceLoadFailed(true);
          setViewMode('editable');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sourceDocument]);

  const waitForFonts = async () => {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  };

  useEffect(() => {
    const calculateScale = () => {
      if (!previewContainerRef.current) return;
      const containerWidth = previewContainerRef.current.offsetWidth - 24;
      const widthScale = Math.min(1, containerWidth / A4_WIDTH_PX);
      const pageScale = Math.min(widthScale, 0.72);
      setScale(zoomMode === 'actual' ? 1 : zoomMode === 'fit-page' ? pageScale : widthScale);
    };

    calculateScale();
    const debouncedCalculateScale = debounce(calculateScale, 100);
    window.addEventListener('resize', debouncedCalculateScale);
    return () => window.removeEventListener('resize', debouncedCalculateScale);
  }, [zoomMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!previewRef.current) return;
      const actualHeight = previewRef.current.scrollHeight;
      setPreviewHeight(actualHeight);
      if (actualHeight > A4_HEIGHT_PX && actualHeight <= A4_HEIGHT_PX * 1.15) {
        setOverflowStatus('spill');
      } else if (actualHeight > A4_HEIGHT_PX * 1.15) {
        setOverflowStatus('safe2');
      } else {
        setOverflowStatus('perfect');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [data, options]);

  const capturePreview = async () => {
    const input = previewRef.current;
    if (!input) return null;

    await waitForFonts();
    const exportRoot = input.cloneNode(true) as HTMLElement;
    exportRoot.removeAttribute('id');
    exportRoot.style.position = 'fixed';
    exportRoot.style.inset = '0 auto auto -10000px';
    exportRoot.style.width = `${A4_WIDTH_PX}px`;
    exportRoot.style.minHeight = `${A4_HEIGHT_PX}px`;
    exportRoot.style.height = 'auto';
    exportRoot.style.transform = 'none';
    exportRoot.style.margin = '0';
    exportRoot.style.boxShadow = 'none';
    document.body.appendChild(exportRoot);

    try {
      const { default: html2canvas } = await import('html2canvas');
      const captureHeight = Math.max(exportRoot.scrollHeight, A4_HEIGHT_PX);
      return await html2canvas(exportRoot, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: A4_WIDTH_PX,
        height: captureHeight,
        windowWidth: A4_WIDTH_PX,
        windowHeight: captureHeight,
      });
    } finally {
      exportRoot.remove();
    }
  };

  const handleDownloadImage = async () => {
    const canvas = await capturePreview();
    if (!canvas) return;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        result => result ? resolve(result) : reject(new Error('JPG export failed')),
        'image/jpeg',
        0.94,
      );
    });
    triggerDownload(blob, `${fileName}.jpg`);
  };

  const handleDownloadPdf = async () => {
    if (viewMode === 'original' && sourceDocument && sourceBlob) {
      triggerDownload(sourceBlob, sourceDocument.name);
      return;
    }

    const canvas = await capturePreview();
    if (!canvas) return;
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const pageHeightPx = Math.round((canvas.width * pdfHeight) / pdfWidth);
    const pageCount = Math.max(1, Math.ceil((canvas.height - 2) / pageHeightPx));

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;
      const context = pageCanvas.getContext('2d', { alpha: false });
      if (!context) continue;

      const sourceY = pageIndex * pageHeightPx;
      const sourceHeight = Math.min(pageHeightPx, Math.max(0, canvas.height - sourceY));
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }
    triggerDownload(pdf.output('blob'), `${fileName}.pdf`);
  };

  const marginBySize = {
    compact: 700,
    normal: 950,
    wide: 1250,
  };

  const handleDownloadDoc = async () => {
    const sourceHTML = buildDocxHtml(data, options, language);

    await waitForFonts();
    const margin = marginBySize[options.marginSize || 'normal'];
    const response = await fetch('/api/export/docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: sourceHTML,
        fileName,
        documentOptions: {
          margins: { top: margin, right: margin, bottom: margin, left: margin },
          title: `${data.personalInfo.name || 'SiraMix Resume'}`,
          font: selectedFont.name.replace(/\s+\(.+\)$/, ''),
          fontSize: options.fontSize,
          lang: language === 'ar' ? 'ar-SA' : 'en-US',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('DOCX export failed');
    }

    const blob = await response.blob();
    triggerDownload(blob, `${fileName}.docx`);
  };

  const reduceFont = () => setOptions({ ...options, fontSize: `${Math.max(8, parseFloat(options.fontSize) - 0.5)}pt` });
  const reduceMargins = () => setOptions({ ...options, marginSize: 'compact' });
  const reduceSpacing = () => setOptions({ ...options, lineSpacing: 'compact' });

  const runExport = async (exporter: () => Promise<void>) => {
    if (isEmpty || isExporting) return;
    setIsExporting(true);
    setExportMenuOpen(false);
    try {
      await exporter();
      toast.success(language === 'ar' ? 'تم تجهيز الملف وتنزيله.' : 'Your file is ready and downloaded.');
    } catch (error) {
      console.error('Resume export failed:', error);
      toast.error(language === 'ar' ? 'تعذر تصدير الملف. حاول مرة أخرى.' : 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {sourceDocument && (
        <div className="brand-surface rounded-2xl border-[#67c7a5]/30 p-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black text-foreground">
                {language === 'ar' ? 'نسخة أصلية محفوظة دون تغيير' : 'Original file preserved unchanged'}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {language === 'ar'
                  ? 'المعاينة الأصلية وتصدير PDF يحافظان على الصفحات والتنسيق والألوان كما رُفعت.'
                  : 'Original preview and PDF export keep the uploaded pages, layout, and colors exactly.'}
              </p>
            </div>
            <div className="flex rounded-xl border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setViewMode('original')}
                disabled={!sourceBlob}
                className={`rounded-lg px-3 py-2 text-xs font-black transition ${viewMode === 'original' ? 'brand-tab-active' : 'text-muted-foreground hover:bg-accent'} disabled:opacity-50`}
              >
                {language === 'ar' ? 'مطابق للأصل' : 'Original'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('editable')}
                className={`rounded-lg px-3 py-2 text-xs font-black transition ${viewMode === 'editable' ? 'brand-tab-active' : 'text-muted-foreground hover:bg-accent'}`}
              >
                {language === 'ar' ? 'نسخة قابلة للتحرير' : 'Editable copy'}
              </button>
            </div>
          </div>
          {sourceLoadFailed && (
            <p className="mt-2 text-xs font-bold text-red-600">
              {language === 'ar' ? 'تعذر تحميل النسخة الأصلية، وتم فتح النسخة القابلة للتحرير.' : 'The original could not be loaded, so the editable copy is shown.'}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-grow">
          {viewMode === 'original' && sourceDocument ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {language === 'ar' ? 'التنسيق الأصلي محفوظ بالكامل' : 'Original formatting fully preserved'}
            </div>
          ) : overflowStatus === 'perfect' && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t('resumePreview.perfect')}
            </div>
          )}
          {viewMode === 'editable' && overflowStatus === 'spill' && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-black text-amber-700 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t('resumePreview.spill')}
              <button onClick={reduceFont} className="rounded-full bg-background px-2 py-1 text-[#17664f]">{t('resumePreview.reduceFont')}</button>
              <button onClick={reduceMargins} className="rounded-full bg-background px-2 py-1 text-[#17664f]">{t('resumePreview.reduceMargins')}</button>
              <button onClick={reduceSpacing} className="rounded-full bg-background px-2 py-1 text-[#17664f]">{t('resumePreview.reduceSpacing')}</button>
              <button onClick={onOpenLongestSection} className="rounded-full bg-background px-2 py-1 text-[#17664f]">{t('resumePreview.openLongest')}</button>
            </div>
          )}
          {viewMode === 'editable' && overflowStatus === 'safe2' && (
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-2 text-xs font-black text-blue-700 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              {t('resumePreview.safe2')}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <div className="brand-surface flex rounded-xl p-1">
            {([
              ['fit-width', t('resumePreview.fitWidth')],
              ['actual', t('resumePreview.zoom100')],
              ['fit-page', t('resumePreview.fitPage')],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setZoomMode(mode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${zoomMode === mode ? 'brand-tab-active' : 'text-muted-foreground hover:bg-accent'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => !isEmpty && setExportMenuOpen(prev => !prev)}
              disabled={isEmpty || isExporting || (viewMode === 'original' && !sourceBlob)}
              className="brand-action flex items-center justify-center rounded-xl px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              aria-haspopup="true"
              aria-expanded={exportMenuOpen}
              title={isEmpty ? (language === 'ar' ? 'أضف معلوماتك أولًا' : 'Add your details first') : undefined}
            >
              {isExporting ? (language === 'ar' ? 'جارٍ التصدير...' : 'Exporting...') : t('resumePreview.exportResume')}
              <svg className="ms-2 h-5 w-5 transition-transform" style={{ transform: exportMenuOpen ? 'rotate(180deg)' : 'none' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {exportMenuOpen && (
              <div className="brand-surface absolute end-0 z-30 mt-2 w-56 overflow-hidden rounded-xl py-1.5 shadow-xl">
                <div className="mb-1 border-b border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  {t('resumePreview.exportFor')}
                </div>
                <button onClick={() => void runExport(handleDownloadPdf)} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                  <span className="text-xs font-black text-red-500">PDF</span>{t('resumePreview.asPDF')}
                </button>
                {viewMode === 'editable' && (
                  <>
                    <button onClick={() => void runExport(handleDownloadDoc)} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                      <span className="text-xs font-black text-blue-500">DOCX</span>{t('resumePreview.asWord')}
                    </button>
                    <button onClick={() => void runExport(handleDownloadImage)} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                      <span className="text-xs font-black text-amber-500">JPG</span>{t('resumePreview.asJPG')}
                    </button>
                  </>
                )}
                {onExportBackup && (
                  <button onClick={() => { onExportBackup(); setExportMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                    <span className="text-xs font-black text-emerald-600">JSON</span>{t('resumePreview.backupJson')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        ref={previewContainerRef}
        className="brand-preview-stage relative flex w-full items-start justify-center overflow-auto rounded-[1.75rem] border border-[#67c7a5]/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_24px_60px_rgba(18,35,30,0.08)] sm:p-5"
        style={{
          height: viewMode === 'original' ? 'auto' : scale === 1 ? 'auto' : `${Math.max(A4_HEIGHT_PX, previewHeight) * scale + 18}px`,
          minHeight: viewMode === 'original' ? 360 : `${Math.max(A4_HEIGHT_PX, previewHeight) * scale + 18}px`,
        }}
      >
        {isEmpty && (
          <div className="pointer-events-none absolute inset-x-4 top-24 z-20 mx-auto max-w-sm rounded-3xl border border-[#00B5A5]/20 bg-white/95 p-6 text-center shadow-2xl backdrop-blur dark:bg-[#101b18]/95">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#00B5A5]/10 text-[#00B5A5]">
              <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3v18M3 12h18M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8" />
              </svg>
            </span>
            <h3 className="mt-4 text-lg font-black text-foreground">
              {language === 'ar' ? 'معاينتك ستظهر هنا' : 'Your preview will appear here'}
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
              {language === 'ar'
                ? 'ابدأ بإضافة الاسم والمسمى الوظيفي، وستتحدث الصفحة تلقائيًا.'
                : 'Add your name and job title to begin. The page updates automatically.'}
            </p>
          </div>
        )}
        {viewMode === 'original' && sourceBlob ? (
          <div style={{ width: A4_WIDTH_PX * scale }} className="shrink-0">
            <OriginalPdfPreview blob={sourceBlob} scale={scale} language={language} />
          </div>
        ) : viewMode === 'original' && sourceDocument ? (
          <div className="grid min-h-80 w-full place-items-center rounded-2xl bg-white p-8 text-sm font-black text-slate-500">
            {language === 'ar' ? 'جار تحميل النسخة الأصلية المحفوظة...' : 'Loading the preserved original...'}
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              width: A4_WIDTH_PX,
              height: Math.max(A4_HEIGHT_PX, previewHeight),
            }}
            className="overflow-hidden rounded-sm border border-slate-300 shadow-2xl dark:border-slate-800"
          >
            {options.template === 'classic' && <ClassicTemplate ref={previewRef} data={data} options={options} language={language} />}
            {options.template === 'modern' && <ModernTemplate ref={previewRef} data={data} options={options} language={language} />}
            {realisticTemplateIds.has(options.template) && (
              <RealisticTemplate
                ref={previewRef}
                data={data}
                options={options}
                language={language}
                variant={options.template as RealisticTemplateId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
