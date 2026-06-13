import React, { useEffect } from 'react';
import { TemplateOptions } from '../types';
import { ACCENT_COLORS, ARABIC_FONT_FAMILIES, ENGLISH_FONT_FAMILIES, TEMPLATES } from '../constants';
import { Language, useTranslation } from '../i18n';

interface TemplateControlsProps {
  options: TemplateOptions;
  setOptions: (options: TemplateOptions) => void;
  language: Language;
}

const TemplateControls: React.FC<TemplateControlsProps> = ({ options, setOptions, language }) => {
  const { t } = useTranslation();
  const numericFontSize = parseFloat(options.fontSize);
  const availableFonts = language === 'ar' ? ARABIC_FONT_FAMILIES : ENGLISH_FONT_FAMILIES;
  const currentFontIsAvailable = availableFonts.some(font => font.value === options.fontFamily);

  useEffect(() => {
    if (!currentFontIsAvailable) {
      setOptions({ ...options, fontFamily: availableFonts[0].value });
    }
  }, [availableFonts, currentFontIsAvailable, options, setOptions]);

  const handleChange = (key: keyof TemplateOptions, value: string) => {
    setOptions({ ...options, [key]: value });
  };

  const TemplateMiniPreview: React.FC<{ accent: string; layout: string; active: boolean }> = ({ accent, layout, active }) => (
    <div className={`relative aspect-[3/4] overflow-hidden rounded-lg border bg-white p-2 shadow-sm ${active ? 'border-[#00B5A5]' : 'border-border'}`}>
      <div className="h-1.5 w-2/3 rounded-full" style={{ backgroundColor: accent }} />
      <div className="mt-1 h-1 w-1/2 rounded-full bg-slate-300" />
      <div className="mt-2 h-px bg-slate-200" />
      <div className={layout === 'single' || layout === 'centered' || layout === 'minimal' ? 'mt-2 space-y-1.5' : 'mt-2 grid grid-cols-[1.6fr_1fr] gap-2'}>
        <div className="space-y-1.5">
          <div className="h-1 w-1/3 rounded-full" style={{ backgroundColor: accent }} />
          <div className="h-1 rounded-full bg-slate-200" />
          <div className="h-1 w-5/6 rounded-full bg-slate-200" />
          <div className="h-1 w-4/5 rounded-full bg-slate-200" />
          <div className="h-1 w-1/3 rounded-full" style={{ backgroundColor: accent }} />
          <div className="h-1 rounded-full bg-slate-200" />
          <div className="h-1 w-3/4 rounded-full bg-slate-200" />
        </div>
        {!(layout === 'single' || layout === 'centered' || layout === 'minimal') && (
          <div className="space-y-1">
            <div className="h-1 w-2/3 rounded-full" style={{ backgroundColor: accent }} />
            <div className="h-1 rounded-full bg-slate-200" />
            <div className="h-1 rounded-full bg-slate-200" />
            <div className="mt-2 h-8 rounded-full opacity-20" style={{ backgroundColor: accent }} />
          </div>
        )}
      </div>
      {active && <div className="absolute end-1 top-1 h-2.5 w-2.5 rounded-full bg-[#00B5A5]" />}
    </div>
  );

  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-black text-foreground">{t('templateControls.template')}</label>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-700">ATS</span>
        </div>
        <div className="grid max-h-[440px] grid-cols-2 gap-3 overflow-auto rounded-2xl border border-border/80 bg-background/70 p-2">
          {TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => handleChange('template', template.id)}
              className={`group rounded-2xl border p-2 text-start transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                options.template === template.id ? 'border-[#00B5A5] bg-[#00B5A5]/10 shadow-sm' : 'border-transparent bg-secondary/80 hover:bg-accent'
              }`}
            >
              <TemplateMiniPreview accent={template.accent} layout={template.layout} active={options.template === template.id} />
              <div className="mt-2">
                <div className="text-xs font-black text-foreground">{language === 'ar' ? template.nameAr : template.nameEn}</div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] font-bold text-muted-foreground">
                  <span>{language === 'ar' ? template.categoryAr : template.categoryEn}</span>
                  {template.atsReady && <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700">ATS</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
        <label className="mb-3 block text-sm font-black text-foreground">{t('templateControls.accentColor')}</label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map(color => (
            <button
              key={color.value}
              title={color.name}
              onClick={() => handleChange('accentColor', color.value)}
              className={`h-9 w-9 rounded-full border-2 transition hover:scale-105 ${options.accentColor === color.value ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-card' : 'border-transparent'}`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
        <label htmlFor="resumeFont" className="mb-2 block text-sm font-black text-foreground">{t('templateControls.fontFamily')}</label>
        <select
          id="resumeFont"
          value={options.fontFamily}
          onChange={(event) => handleChange('fontFamily', event.target.value)}
          className={`w-full rounded-xl border border-border bg-card px-3 py-3 text-sm font-bold text-foreground outline-none transition focus:border-[#00B5A5] focus:ring-4 focus:ring-[#00B5A5]/10 ${options.fontFamily}`}
        >
          {availableFonts.map(font => (
            <option key={font.value} value={font.value} className={font.value}>
              {font.name}{font.replacementFor ? ` (${font.replacementFor})` : ''}
            </option>
          ))}
        </select>
        <p className={`mt-3 rounded-xl bg-secondary px-3 py-2 text-sm text-foreground ${options.fontFamily}`}>
          {language === 'ar' ? 'هذا مثال حي للخط المختار داخل السيرة.' : 'Live preview of the selected resume font.'}
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
        <label htmlFor="fontSize" className="mb-2 block text-sm font-bold text-foreground">
          {t('templateControls.fontSize')} <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">{options.fontSize}</span>
        </label>
        <input
          id="fontSize"
          type="range"
          min="8"
          max="14"
          step="0.5"
          value={numericFontSize}
          onChange={e => handleChange('fontSize', `${e.target.value}pt`)}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary"
        />
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
        <label className="mb-2 block text-sm font-bold text-foreground">{t('templateControls.lineSpacing')}</label>
        <div className="grid grid-cols-3 gap-2">
          {(['compact', 'normal', 'spacious'] as const).map(id => (
            <button
              key={id}
              onClick={() => handleChange('lineSpacing', id)}
              className={`rounded-xl px-2.5 py-2 text-xs font-bold transition ${
                (options.lineSpacing || 'normal') === id ? 'bg-blue-600 text-white' : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {t(`templateControls.${id}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
        <label className="mb-2 block text-sm font-bold text-foreground">{t('templateControls.pageMargins')}</label>
        <div className="grid grid-cols-3 gap-2">
          {(['compact', 'normal', 'wide'] as const).map(id => (
            <button
              key={id}
              onClick={() => handleChange('marginSize', id)}
              className={`rounded-xl px-2.5 py-2 text-xs font-bold transition ${
                (options.marginSize || 'normal') === id ? 'bg-blue-600 text-white' : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {t(`templateControls.${id}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateControls;
