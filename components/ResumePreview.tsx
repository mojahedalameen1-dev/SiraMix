import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getFontFamilyOption } from '../constants';
import { useTranslation } from '../i18n';
import { buildDocxHtml } from '../services/docxTemplate';
import { ResumeData, TemplateOptions } from '../types';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import RealisticTemplate, { RealisticTemplateId } from './templates/RealisticTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  options: TemplateOptions;
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

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, options, setOptions, onOpenLongestSection, onExportBackup }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [zoomMode, setZoomMode] = useState<'fit-width' | 'actual' | 'fit-page'>('fit-width');
  const [scale, setScale] = useState(1);
  const [overflowStatus, setOverflowStatus] = useState<'perfect' | 'spill' | 'safe2'>('perfect');
  const [previewHeight, setPreviewHeight] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
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
  const isEmpty = !hasPersonalInfo
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
    const originalWidth = input.style.width;
    const originalHeight = input.style.height;
    try {
      const { default: html2canvas } = await import('html2canvas');
      input.style.width = '1050px';
      input.style.height = 'auto';
      const captureHeight = Math.max(input.scrollHeight, 1485);
      return await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1050,
        height: captureHeight,
        windowWidth: 1050,
        windowHeight: captureHeight,
      });
    } finally {
      input.style.width = originalWidth;
      input.style.height = originalHeight;
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
    const canvas = await capturePreview();
    if (!canvas) return;
    const { jsPDF } = await import('jspdf');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pdfWidth) / canvas.width;
    let position = 0;
    let remainingHeight = imageHeight;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imageHeight, undefined, 'FAST');
    remainingHeight -= pdfHeight;

    while (remainingHeight > 0.5) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imageHeight, undefined, 'FAST');
      remainingHeight -= pdfHeight;
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
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-grow">
          {overflowStatus === 'perfect' && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t('resumePreview.perfect')}
            </div>
          )}
          {overflowStatus === 'spill' && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs font-black text-amber-700 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t('resumePreview.spill')}
              <button onClick={reduceFont} className="rounded-full bg-background px-2 py-1 text-blue-600">{t('resumePreview.reduceFont')}</button>
              <button onClick={reduceMargins} className="rounded-full bg-background px-2 py-1 text-blue-600">{t('resumePreview.reduceMargins')}</button>
              <button onClick={reduceSpacing} className="rounded-full bg-background px-2 py-1 text-blue-600">{t('resumePreview.reduceSpacing')}</button>
              <button onClick={onOpenLongestSection} className="rounded-full bg-background px-2 py-1 text-blue-600">{t('resumePreview.openLongest')}</button>
            </div>
          )}
          {overflowStatus === 'safe2' && (
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-2 text-xs font-black text-blue-700 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              {t('resumePreview.safe2')}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <div className="flex rounded-xl border border-border bg-card p-1">
            {([
              ['fit-width', t('resumePreview.fitWidth')],
              ['actual', t('resumePreview.zoom100')],
              ['fit-page', t('resumePreview.fitPage')],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setZoomMode(mode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${zoomMode === mode ? 'bg-[#202432] text-white dark:bg-[#d5ff63] dark:text-[#101418]' : 'text-muted-foreground hover:bg-accent'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => !isEmpty && setExportMenuOpen(prev => !prev)}
              disabled={isEmpty || isExporting}
              className="flex items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
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
              <div className="absolute end-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card py-1.5 shadow-xl">
                <div className="mb-1 border-b border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  {t('resumePreview.exportFor')}
                </div>
                <button onClick={() => void runExport(handleDownloadPdf)} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                  <span className="text-xs font-black text-red-500">PDF</span>{t('resumePreview.asPDF')}
                </button>
                <button onClick={() => void runExport(handleDownloadDoc)} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                  <span className="text-xs font-black text-blue-500">DOCX</span>{t('resumePreview.asWord')}
                </button>
                <button onClick={() => void runExport(handleDownloadImage)} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                  <span className="text-xs font-black text-amber-500">JPG</span>{t('resumePreview.asJPG')}
                </button>
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
        className="relative flex w-full items-start justify-center overflow-auto rounded-2xl border border-border/85 bg-slate-200/50 p-3 dark:bg-slate-900/40 sm:p-5"
        style={{
          height: scale === 1 ? 'auto' : `${Math.max(A4_HEIGHT_PX, previewHeight) * scale + 18}px`,
          minHeight: `${Math.max(A4_HEIGHT_PX, previewHeight) * scale + 18}px`,
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
      </div>
    </div>
  );
};

export default ResumePreview;
