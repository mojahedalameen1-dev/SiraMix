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
    <div className="space-y-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-bold text-foreground">{t('templateControls.template')}</label>
        <div className="grid max-h-[520px] grid-cols-2 gap-3 overflow-auto rounded-xl border border-border bg-background p-2">
          {TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => handleChange('template', template.id)}
              className={`group rounded-xl border p-2 text-start transition hover:-translate-y-0.5 hover:shadow-md ${
                options.template === template.id ? 'border-[#00B5A5] bg-[#00B5A5]/10' : 'border-transparent bg-secondary hover:bg-accent'
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

      <div>
        <label className="mb-2 block text-sm font-bold text-foreground">{t('templateControls.accentColor')}</label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map(color => (
            <button
              key={color.value}
              title={color.name}
              onClick={() => handleChange('accentColor', color.value)}
              className={`h-9 w-9 rounded-full border-2 transition ${options.accentColor === color.value ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-card' : 'border-transparent'}`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-foreground">{t('templateControls.fontFamily')}</label>
        <div className="grid max-h-72 grid-cols-1 gap-2 overflow-auto rounded-xl border border-border bg-background p-2">
          {availableFonts.map(font => (
            <button
              key={font.value}
              type="button"
              onClick={() => handleChange('fontFamily', font.value)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-start text-sm transition ${
                options.fontFamily === font.value
                  ? 'border-[#00B5A5] bg-[#00B5A5]/10 text-foreground'
                  : 'border-transparent hover:bg-accent'
              }`}
            >
              <span className={font.value}>{font.name}</span>
              {font.replacementFor && (
                <span className="text-[10px] font-bold text-muted-foreground">{font.replacementFor}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
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

      <div className="border-t border-border pt-4">
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

      <div className="border-t border-border pt-4">
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
