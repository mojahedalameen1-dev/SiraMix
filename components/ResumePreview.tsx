import React, { useRef, useState, useEffect } from 'react';
import { ResumeData, TemplateOptions } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import { useTranslation } from '../i18n';

interface ResumePreviewProps {
  data: ResumeData;
  options: TemplateOptions;
}

// Debounce utility function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced as (...args: Parameters<F>) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, options }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';

  // Dynamic Height & Overflow tracking (Crucial for page length optimization)
  const [overflowStatus, setOverflowStatus] = useState<'perfect' | 'spill' | 'safe2'>('perfect');
  const [previewHeight, setPreviewHeight] = useState(0);

  // A4 dimensions in pixels at 96 DPI
  const A4_WIDTH_PX = 793.7;
  const A4_HEIGHT_PX = 1122.5;

  useEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        // Set scale to fit width, but don't scale up past 100%
        setScale(Math.min(1, containerWidth / A4_WIDTH_PX));
      }
    };

    calculateScale();
    const debouncedCalculateScale = debounce(calculateScale, 100);
    window.addEventListener('resize', debouncedCalculateScale);
    return () => window.removeEventListener('resize', debouncedCalculateScale);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Recalculate overflow metrics when data or styling options change
  useEffect(() => {
    const checkOverflow = () => {
      if (previewRef.current) {
        const actualHeight = previewRef.current.scrollHeight;
        setPreviewHeight(actualHeight);

        // Standard A4 boundary is 1122.5 pixels
        if (actualHeight > A4_HEIGHT_PX && actualHeight <= A4_HEIGHT_PX * 1.15) {
          setOverflowStatus('spill'); // Slight overflow (bad UX for paper)
        } else if (actualHeight > A4_HEIGHT_PX * 1.15) {
          setOverflowStatus('safe2'); // Clearly multi-page
        } else {
          setOverflowStatus('perfect'); // Ideal 1-pager
        }
      }
    };

    // Timeout allows DOM repaint
    const timer = setTimeout(checkOverflow, 400);
    return () => clearTimeout(timer);
  }, [data, options]);

  const handleDownloadImage = (format: 'png' | 'jpeg') => {
    const input = previewRef.current;
    if (input) {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const fileExtension = format === 'png' ? 'png' : 'jpg';

      // Temporarily increase resolution for better image quality
      const originalWidth = input.style.width;
      const originalHeight = input.style.height;
      input.style.width = '1050px'; // A4 width at 150 DPI
      input.style.height = '1485px'; // A4 height at 150 DPI

      html2canvas(input, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      }).then((canvas) => {
        // Restore original size after capture
        input.style.width = originalWidth;
        input.style.height = originalHeight;

        const imgData = canvas.toDataURL(mimeType);

        const link = document.createElement('a');
        document.body.appendChild(link);
        link.href = imgData;
        link.download = `Resume-${data.personalInfo.name.replace(/ /g, '-')}.${fileExtension}`;
        link.click();
        document.body.removeChild(link);
      });
    }
  };

  const handleDownloadPdf = () => {
    const input = previewRef.current;
    if (input) {
       // Temporarily increase resolution for better PDF quality
      const originalWidth = input.style.width;
      const originalHeight = input.style.height;
      input.style.width = '1050px'; // A4 width at 150 DPI
      input.style.height = '1485px'; // A4 height at 150 DPI
      
      html2canvas(input, { 
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false, 
      }).then((canvas) => {
        // Restore original size after capture
        input.style.width = originalWidth;
        input.style.height = originalHeight;
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`Resume-${data.personalInfo.name.replace(/ /g, '-')}.pdf`);
      });
    }
  };

  const handleDownloadDocx = () => {
    const input = previewRef.current;
    if (!input) return;
    
    // Create a temporary, invisible clone for export to avoid manipulating the live preview
    const clonedNode = input.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedNode);
    clonedNode.style.position = 'absolute';
    clonedNode.style.left = '-9999px';
    clonedNode.style.color = '#000'; // Ensure text is black for Word

    const listItems = clonedNode.querySelectorAll('div[data-bullet]');
    listItems.forEach(item => {
        const p = document.createElement('p');
        p.style.margin = '0';
        p.style.textIndent = '-18pt'; // Hanging indent
        p.style.marginLeft = '18pt';
        const bullet = document.createElement('span');
        bullet.style.fontFamily = 'Symbol';
        bullet.style.paddingRight = '5pt';
        bullet.textContent = '·';
        p.appendChild(bullet);
        p.appendChild(document.createTextNode(item.textContent || ''));
        item.parentNode?.replaceChild(p, item);
    });
    
    // Explicitly add styles that Word can understand
     const styles = `
      <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; }
        h1, h2, h3, h4, p { margin: 0; padding: 0; }
        .section-title {
           border-bottom: 2px solid ${options.accentColor};
           padding-bottom: 4px;
           margin-bottom: 8px;
        }
      </style>
    `;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
        "xmlns:w='urn:schemas-microsoft-com:office:word' "+
        "xmlns='http://www.w3.org/TR/REC-html40'>"+
        "<head><meta charset='utf-8'><title>Export HTML to Word Document</title>" + styles + "</head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + clonedNode.innerHTML + footer;
    
    document.body.removeChild(clonedNode); // Clean up the cloned node

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Resume-${data.personalInfo.name.replace(/ /g, '-')}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Visual Workspace Sub-header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Dynamic A4 Length Balance Alarm */}
        <div className="flex-grow flex items-center">
          {overflowStatus === 'perfect' && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-550 animate-pulse" />
              {isRtl ? '📐 مثالي: صفحة واحدة متناسقة كليًا' : '📐 Balanced: Fits perfectly within 1 page'}
            </div>
          )}
          {overflowStatus === 'spill' && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              {isRtl ? '⚠️ تحذير: تسرب طفيف للصفحة الثانية' : '⚠️ Alert: Spilling slightly over 1 page'}
              <span className="text-[10px] opacity-75 font-normal hidden md:inline ml-1">
                {isRtl ? '(صغّر الخط أو التباعد لحزمها)' : '(Reduce padding/text to keep clean 1 page)'}
              </span>
            </div>
          )}
          {overflowStatus === 'safe2' && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-450 border border-blue-500/20 shadow-sm animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              {isRtl ? '📄 تخطيط السيرة الذاتية (صفحتين)' : '📄 Multiple pages layout profile'}
            </div>
          )}
        </div>

        {/* Download Button dropdown */}
        <div className="relative shrink-0 flex justify-end" ref={exportMenuRef}>
            <button
                onClick={() => setExportMenuOpen(prev => !prev)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg hover:shadow-blue-500/20 border border-blue-500/30"
                aria-haspopup="true"
                aria-expanded={exportMenuOpen}
            >
                <span>{t('resumePreview.exportResume')}</span>
                <svg className="ms-2 -me-1 h-5 w-5 rtl:me-2 rtl:-ms-1 transition-transform" style={{ transform: exportMenuOpen ? 'rotate(180deg)' : 'none' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {exportMenuOpen && (
                <div className="origin-top-right absolute end-0 mt-2.5 w-52 rounded-xl shadow-xl bg-card border border-border z-30 animate-slide-down py-1.5 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-border mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {isRtl ? 'تنزيل بتنسيق رسمي' : 'Choose format to save'}
                    </div>
                    <div className="flex flex-col" role="menu" aria-orientation="vertical">
                        <button
                            onClick={() => { handleDownloadPdf(); setExportMenuOpen(false); }}
                            className="w-full text-start px-4 py-2.5 text-sm text-foreground hover:bg-accent flex items-center gap-2 font-medium transition-colors"
                            role="menuitem"
                        >
                            <span className="text-red-500 font-extrabold text-xs">PDF</span>
                            <span>{t('resumePreview.asPDF')}</span>
                        </button>
                         <button
                            onClick={() => { handleDownloadDocx(); setExportMenuOpen(false); }}
                            className="w-full text-start px-4 py-2.5 text-sm text-foreground hover:bg-accent flex items-center gap-2 font-medium transition-colors"
                            role="menuitem"
                        >
                            <span className="text-blue-500 font-extrabold text-xs">DOC</span>
                            <span>{t('resumePreview.asWord')}</span>
                        </button>
                        <button
                            onClick={() => { handleDownloadImage('jpeg'); setExportMenuOpen(false); }}
                            className="w-full text-start px-4 py-2.5 text-sm text-foreground hover:bg-accent flex items-center gap-2 font-medium transition-colors"
                            role="menuitem"
                        >
                            <span className="text-amber-500 font-extrabold text-xs">JPG</span>
                            <span>{t('resumePreview.asJPG')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Immersive Paper Stage wrapping A4 layout */}
      <div
        ref={previewContainerRef}
        className="w-full bg-slate-200/50 dark:bg-slate-900/40 p-2 sm:p-4 md:p-6 rounded-2xl flex justify-center items-start border border-border/85"
        style={{
            height: scale === 1 ? 'auto' : `${Math.max(A4_HEIGHT_PX, previewHeight) * scale + 10}px`,
            minHeight: `${Math.max(A4_HEIGHT_PX, previewHeight) * scale + 10}px`,
        }}
    >
        <div
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                width: A4_WIDTH_PX,
                height: Math.max(A4_HEIGHT_PX, previewHeight),
            }}
            className="shadow-2xl rounded-sm overflow-hidden border border-slate-300 dark:border-slate-800"
        >
            {options.template === 'classic' && <ClassicTemplate ref={previewRef} data={data} options={options} language={language} />}
            {options.template === 'modern' && <ModernTemplate ref={previewRef} data={data} options={options} language={language} />}
        </div>
      </div>
      
    </div>
  );
};

export default ResumePreview;
