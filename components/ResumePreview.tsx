import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getFontFamilyOption } from '../constants';
import { useTranslation } from '../i18n';
import { ResumeData, TemplateOptions } from '../types';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';

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
  const { t, language } = useTranslation();

  const A4_WIDTH_PX = 793.7;
  const A4_HEIGHT_PX = 1122.5;
  const fileName = `SiraMix-${data.personalInfo.name || 'Resume'}`.replace(/\s+/g, '-');
  const selectedFont = getFontFamilyOption(options.fontFamily);

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
    input.style.width = '1050px';
    input.style.height = '1485px';
    const canvas = await html2canvas(input, { scale: 2, useCORS: true, logging: false });
    input.style.width = originalWidth;
    input.style.height = originalHeight;
    return canvas;
  };

  const handleDownloadImage = async () => {
    const canvas = await capturePreview();
    if (!canvas) return;
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.href = canvas.toDataURL('image/jpeg');
    link.download = `${fileName}.jpg`;
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async () => {
    const canvas = await capturePreview();
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`${fileName}.pdf`);
  };

  const marginBySize = {
    compact: 700,
    normal: 950,
    wide: 1250,
  };

  const lineHeightBySpacing = {
    compact: 1.25,
    normal: 1.45,
    spacious: 1.7,
  };

  const getExportHtml = () => {
    const input = previewRef.current;
    if (!input) return null;

    const clonedNode = input.cloneNode(true) as HTMLElement;
    const isRtl = language === 'ar';
    const lineHeight = lineHeightBySpacing[options.lineSpacing || 'normal'];
    const textAlign = isRtl ? 'right' : 'left';
    const fontSize = options.fontSize || '10pt';

    const originalElements = [input, ...Array.from(input.querySelectorAll('*'))] as HTMLElement[];
    const clonedElements = [clonedNode, ...Array.from(clonedNode.querySelectorAll('*'))] as HTMLElement[];
    originalElements.forEach((originalElement, index) => {
      const clonedElement = clonedElements[index];
      if (!clonedElement) return;
      const computed = window.getComputedStyle(originalElement);
      const copiedProperties = [
        'color',
        'backgroundColor',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'lineHeight',
        'textAlign',
        'direction',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'borderBottomColor',
        'borderBottomStyle',
        'borderBottomWidth',
      ] as const;
      copiedProperties.forEach(property => {
        clonedElement.style[property] = computed[property];
      });
    });

    clonedNode.querySelectorAll('[class]').forEach(element => {
      (element as HTMLElement).removeAttribute('class');
    });

    clonedNode.querySelectorAll('div[data-bullet]').forEach(item => {
      const p = document.createElement('p');
      p.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      p.style.margin = '0 0 4pt 0';
      p.style.textAlign = textAlign;
      p.style.lineHeight = String(lineHeight);
      p.style.paddingInlineStart = '14pt';

      const bullet = document.createElement('span');
      bullet.style.fontFamily = selectedFont.cssFamily;
      bullet.style.paddingInlineEnd = '5pt';
      bullet.textContent = '•';

      const text = (item.textContent || '').replace(/^•\s*/, '').trim();
      p.appendChild(bullet);
      p.appendChild(document.createTextNode(text));
      item.parentNode?.replaceChild(p, item);
    });

    const styles = `
      <style>
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #000000;
          direction: ${isRtl ? 'rtl' : 'ltr'};
          unicode-bidi: embed;
          font-family: ${selectedFont.cssFamily};
          font-size: ${fontSize};
          line-height: ${lineHeight};
        }
        body, div, section, header, main, aside, p, span, a, h1, h2, h3, h4, li {
          font-family: ${selectedFont.cssFamily};
          box-sizing: border-box;
        }
        #resume-preview {
          width: 210mm;
          min-height: 297mm;
          background: #ffffff;
          color: #000000;
          direction: ${isRtl ? 'rtl' : 'ltr'};
          unicode-bidi: embed;
          text-align: ${textAlign};
        }
        header { text-align: center; margin-bottom: ${options.lineSpacing === 'compact' ? '12pt' : options.lineSpacing === 'spacious' ? '24pt' : '18pt'}; }
        main, aside, section { direction: ${isRtl ? 'rtl' : 'ltr'}; unicode-bidi: embed; }
        h1 { margin: 0; font-size: 24pt; font-weight: 800; color: ${options.accentColor}; text-align: center; }
        h2 { margin: 4pt 0 8pt 0; font-size: 14pt; font-weight: 500; text-align: center; color: #111827; }
        h3, .section-title {
          margin: 0 0 8pt 0;
          padding-bottom: 4pt;
          border-bottom: 1.5pt solid ${options.accentColor};
          font-size: 11pt;
          font-weight: 700;
          text-transform: uppercase;
          color: #000000;
          text-align: ${textAlign};
        }
        p { margin: 0 0 5pt 0; line-height: ${lineHeight}; text-align: ${textAlign}; }
        a { color: ${options.accentColor}; text-decoration: none; }
        .grid, .flex { display: block; }
        [dir="rtl"] { direction: rtl; unicode-bidi: embed; text-align: right; }
        [dir="ltr"] { direction: ltr; unicode-bidi: embed; text-align: left; }
      </style>
    `;

    return `<!DOCTYPE html><html lang="${language}" dir="${isRtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>SiraMix Resume</title>${styles}</head><body>${clonedNode.outerHTML}</body></html>`;
  };

  const handleDownloadDoc = async () => {
    const sourceHTML = getExportHtml();
    if (!sourceHTML) return;

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
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.docx`;
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  };

  const reduceFont = () => setOptions({ ...options, fontSize: `${Math.max(8, parseFloat(options.fontSize) - 0.5)}pt` });
  const reduceMargins = () => setOptions({ ...options, marginSize: 'compact' });
  const reduceSpacing = () => setOptions({ ...options, lineSpacing: 'compact' });

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
              onClick={() => setExportMenuOpen(prev => !prev)}
              className="flex items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-lg transition hover:bg-blue-700"
              aria-haspopup="true"
              aria-expanded={exportMenuOpen}
            >
              {t('resumePreview.exportResume')}
              <svg className="ms-2 h-5 w-5 transition-transform" style={{ transform: exportMenuOpen ? 'rotate(180deg)' : 'none' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {exportMenuOpen && (
              <div className="absolute end-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card py-1.5 shadow-xl">
                <div className="mb-1 border-b border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  {t('resumePreview.exportFor')}
                </div>
                <button onClick={() => { handleDownloadPdf(); setExportMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                  <span className="text-xs font-black text-red-500">PDF</span>{t('resumePreview.asPDF')}
                </button>
                <button onClick={() => { handleDownloadDoc(); setExportMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
                  <span className="text-xs font-black text-blue-500">DOCX</span>{t('resumePreview.asWord')}
                </button>
                <button onClick={() => { handleDownloadImage(); setExportMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold hover:bg-accent">
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
        className="flex w-full items-start justify-center overflow-auto rounded-2xl border border-border/85 bg-slate-200/50 p-3 dark:bg-slate-900/40 sm:p-5"
        style={{
          height: scale === 1 ? 'auto' : `${Math.max(A4_HEIGHT_PX, previewHeight) * scale + 18}px`,
          minHeight: `${Math.max(A4_HEIGHT_PX, previewHeight) * scale + 18}px`,
        }}
      >
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
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
