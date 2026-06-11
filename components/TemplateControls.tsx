import React from 'react';
import { TemplateOptions } from '../types';
import { ACCENT_COLORS, FONT_FAMILIES, TEMPLATES } from '../constants';
import { useTranslation } from '../i18n';

interface TemplateControlsProps {
  options: TemplateOptions;
  setOptions: (options: TemplateOptions) => void;
}

const TemplateControls: React.FC<TemplateControlsProps> = ({ options, setOptions }) => {
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const handleChange = (key: keyof TemplateOptions, value: string) => {
    setOptions({ ...options, [key]: value });
  };

  const numericFontSize = parseFloat(options.fontSize);

  return (
    <div className="p-4 bg-card rounded-lg shadow-sm border border-border space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{t('templateControls.template')}</label>
        <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map(template => (
                <button
                    key={template.id}
                    onClick={() => handleChange('template', template.id)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        options.template === template.id
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'bg-secondary hover:bg-accent'
                    }`}
                >
                    {template.name}
                </button>
            ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">{t('templateControls.accentColor')}</label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map(color => (
            <button
              key={color.value}
              title={color.name}
              onClick={() => handleChange('accentColor', color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${options.accentColor === color.value ? 'ring-2 ring-offset-2 dark:ring-offset-card ring-blue-500' : 'border-transparent'}`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="fontFamily" className="block text-sm font-medium text-foreground mb-1">{t('templateControls.fontFamily')}</label>
        <select
          id="fontFamily"
          value={options.fontFamily}
          onChange={e => handleChange('fontFamily', e.target.value)}
          className="w-full p-2 bg-secondary border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
        >
          {FONT_FAMILIES.map(font => (
            <option key={font.value} value={font.value}>{font.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="fontSize" className="block text-sm font-medium text-foreground mb-1">
          {t('templateControls.fontSize')} <span className="font-mono text-xs p-1 bg-muted rounded-md">{options.fontSize}</span>
        </label>
        <input
          id="fontSize"
          type="range"
          min="8"
          max="14"
          step="0.5"
          value={numericFontSize}
          onChange={e => handleChange('fontSize', `${e.target.value}pt`)}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="border-t border-border pt-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          {isRtl ? 'تباعد الأسطر' : 'Line Spacing'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'compact', labelEn: 'Compact', labelAr: 'مكثف' },
            { id: 'normal', labelEn: 'Normal', labelAr: 'عادي' },
            { id: 'spacious', labelEn: 'Spacious', labelAr: 'متسع' }
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => handleChange('lineSpacing', item.id)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                (options.lineSpacing || 'normal') === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {isRtl ? item.labelAr : item.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          {isRtl ? 'هوامش الصفحة' : 'Page Margins'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'compact', labelEn: 'Compact', labelAr: 'ضيقة' },
            { id: 'normal', labelEn: 'Normal', labelAr: 'عادية' },
            { id: 'wide', labelEn: 'Wide', labelAr: 'واسعة' }
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => handleChange('marginSize', item.id)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                (options.marginSize || 'normal') === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              {isRtl ? item.labelAr : item.labelEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateControls;