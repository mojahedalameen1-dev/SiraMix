import React, { forwardRef } from 'react';
import { ResumeData, TemplateOptions } from '../../types';
import { useTranslation } from '../../i18n';

interface TemplateProps {
  data: ResumeData;
  options: TemplateOptions;
  language: 'en' | 'ar';
  variant: RealisticTemplateId;
}

export type RealisticTemplateId =
  | 'emerald-two-column'
  | 'audit-classic'
  | 'blue-analyst'
  | 'centered-executive'
  | 'consulting-timeline'
  | 'dense-executive'
  | 'minimal-technical';

interface VariantConfig {
  accent: string;
  mutedAccent: string;
  heading: string;
  line: string;
  layout: 'two-column' | 'single' | 'centered' | 'timeline' | 'dense' | 'minimal';
}

const VARIANTS: Record<RealisticTemplateId, VariantConfig> = {
  'emerald-two-column': {
    accent: '#18a56f',
    mutedAccent: '#e8f7ef',
    heading: '#111827',
    line: '#18a56f',
    layout: 'two-column',
  },
  'audit-classic': {
    accent: '#5867a8',
    mutedAccent: '#eef1ff',
    heading: '#111827',
    line: '#111827',
    layout: 'single',
  },
  'blue-analyst': {
    accent: '#1f66c2',
    mutedAccent: '#e9f2ff',
    heading: '#0f3f8f',
    line: '#1f66c2',
    layout: 'two-column',
  },
  'centered-executive': {
    accent: '#375d9d',
    mutedAccent: '#edf3fb',
    heading: '#151923',
    line: '#9aa7b5',
    layout: 'centered',
  },
  'consulting-timeline': {
    accent: '#2f6f8f',
    mutedAccent: '#eaf4f7',
    heading: '#111827',
    line: '#b9c4cf',
    layout: 'timeline',
  },
  'dense-executive': {
    accent: '#0b6bb7',
    mutedAccent: '#e8f3fc',
    heading: '#111827',
    line: '#111827',
    layout: 'dense',
  },
  'minimal-technical': {
    accent: '#343a40',
    mutedAccent: '#f3f4f6',
    heading: '#111827',
    line: '#555b63',
    layout: 'minimal',
  },
};

function cleanBullet(text: string) {
  return text.trim().replace(/^[\u2022\-\*]\s*/, '');
}

function bulletLines(text: string) {
  return text.split('\n').map(cleanBullet).filter(Boolean);
}

const RealisticTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data, options, language, variant }, ref) => {
  const { t } = useTranslation();
  const isRtl = language === 'ar';
  const config = VARIANTS[variant];
  const { personalInfo, summary, experience, education, skills, customSectionsData, sectionOrder, sectionTitles } = data;
  const accent = options.accentColor || config.accent;
  const fontClass = options.fontFamily;
  const paddingClass = options.marginSize === 'compact' ? 'p-7' : options.marginSize === 'wide' ? 'p-12' : 'p-9';
  const leadingClass = options.lineSpacing === 'compact' ? 'leading-snug' : options.lineSpacing === 'spacious' ? 'leading-loose' : 'leading-relaxed';
  const dense = config.layout === 'dense' || config.layout === 'minimal';
  const sectionGap = dense ? 'mb-3' : 'mb-5';

  const titleFor = (key: string) => (sectionTitles[key] || t(`form.${key}`, {}, key)).toUpperCase();

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3
      className={`section-title mb-2 border-b pb-1 text-[10px] font-black uppercase tracking-[0.08em]`}
      style={{ color: config.layout === 'minimal' ? config.heading : accent, borderColor: config.line }}
    >
      {children}
    </h3>
  );

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2" data-bullet>
      <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <span>{children}</span>
    </div>
  );

  const renderSummary = () => summary && (
    <section className={sectionGap}>
      <SectionTitle>{titleFor('summary')}</SectionTitle>
      <p className={`${leadingClass} text-[10.5px] text-gray-700`}>{summary}</p>
    </section>
  );

  const renderExperience = (timeline = false) => experience.length > 0 && (
    <section className={sectionGap}>
      <SectionTitle>{titleFor('experience')}</SectionTitle>
      <div className={timeline ? 'space-y-3 border-s ps-4' : 'space-y-3'} style={timeline ? { borderColor: config.line } : undefined}>
        {experience.map(item => (
          <div key={item.id} className="break-inside-avoid">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <h4 className="text-[11px] font-black text-gray-950">{item.title}</h4>
                <p className="text-[10px] font-bold" style={{ color: accent }}>{item.company}</p>
              </div>
              <p className="text-[9px] font-semibold text-gray-500">{item.startDate} - {item.endDate}</p>
            </div>
            <div className={`mt-1 space-y-1 text-[9.5px] text-gray-700 ${leadingClass}`}>
              {bulletLines(item.description).map((line, index) => <Bullet key={index}>{line}</Bullet>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderEducation = () => education.length > 0 && (
    <section className={sectionGap}>
      <SectionTitle>{titleFor('education')}</SectionTitle>
      <div className={config.layout === 'centered' || config.layout === 'minimal' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
        {education.map(item => (
          <div key={item.id} className="break-inside-avoid">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <h4 className="text-[10.5px] font-black text-gray-950">{item.degree}</h4>
              <span className="text-[8.5px] font-semibold text-gray-500">{item.startDate} - {item.endDate}</span>
            </div>
            <p className="text-[9.5px] font-bold text-gray-700">{item.institution}</p>
            {item.description && <p className="mt-0.5 text-[9px] text-gray-600">{item.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );

  const renderSkills = (compact = false) => skills.length > 0 && (
    <section className={sectionGap}>
      <SectionTitle>{titleFor('skills')}</SectionTitle>
      <div className={compact ? 'space-y-1' : 'grid grid-cols-2 gap-x-4 gap-y-1'}>
        {skills.map(skill => (
          <div key={skill.id} className="flex items-center justify-between gap-2 border-b border-gray-100 py-0.5 text-[9.3px] font-bold text-gray-700">
            <span>{skill.name}</span>
            {(variant === 'blue-analyst' || variant === 'minimal-technical') && (
              <span className="h-1.5 w-8 rounded-full" style={{ background: `linear-gradient(90deg, ${accent} 70%, #e5e7eb 70%)` }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const renderCustom = (key: string) => {
    const items = customSectionsData[key] || [];
    if (!items.length) return null;
    return (
      <section key={key} className={sectionGap}>
        <SectionTitle>{titleFor(key)}</SectionTitle>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id}>
              <div className="flex justify-between gap-2">
                <h4 className="text-[10px] font-black text-gray-900">{item.primaryText}</h4>
                <span className="text-[8.5px] text-gray-500">{item.startDate}{item.endDate ? ` - ${item.endDate}` : ''}</span>
              </div>
              {item.secondaryText && <p className="text-[9px] font-bold" style={{ color: accent }}>{item.secondaryText}</p>}
              {item.description && <p className="text-[9px] text-gray-650">{item.description}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const remainingSections = sectionOrder.filter(key => !['summary', 'experience', 'education', 'skills'].includes(key));

  const ContactLine = () => (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[9px] font-semibold text-gray-600">
      <span>{personalInfo.phone}</span>
      <span>{personalInfo.email}</span>
      <span>{personalInfo.location}</span>
      {personalInfo.website && <span>{personalInfo.website}</span>}
    </div>
  );

  const Header = ({ centered = false }: { centered?: boolean }) => (
    <header className={`${centered ? 'text-center' : ''} mb-4 border-b pb-3`} style={{ borderColor: config.line }}>
      <h1 className="text-[27px] font-black uppercase leading-none tracking-tight" style={{ color: config.heading }}>{personalInfo.name}</h1>
      <p className="mt-1 text-[10.5px] font-black" style={{ color: accent }}>{personalInfo.title}</p>
      <ContactLine />
    </header>
  );

  const sidebar = (
    <aside className="space-y-4">
      {renderSkills(true)}
      {remainingSections.map(renderCustom)}
    </aside>
  );

  const mainSections = (
    <>
      {renderSummary()}
      {renderExperience(config.layout === 'timeline')}
      {renderEducation()}
      {config.layout !== 'two-column' && config.layout !== 'dense' ? renderSkills(false) : null}
      {config.layout !== 'two-column' && remainingSections.map(renderCustom)}
    </>
  );

  let body: React.ReactNode;
  if (config.layout === 'single') {
    body = <main>{mainSections}</main>;
  } else if (config.layout === 'centered' || config.layout === 'minimal') {
    body = <main>{mainSections}</main>;
  } else {
    body = (
      <div className={`grid grid-cols-12 gap-7 ${isRtl ? 'direction-rtl' : ''}`}>
        <main className={config.layout === 'dense' ? 'col-span-7' : 'col-span-8'}>{mainSections}</main>
        <aside className={config.layout === 'dense' ? 'col-span-5' : 'col-span-4'}>{sidebar}</aside>
      </div>
    );
  }

  return (
    <div
      id="resume-preview"
      ref={ref}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`bg-white text-black ${fontClass} ${paddingClass}`}
      style={{ fontSize: options.fontSize, width: '210mm', minHeight: '297mm', color: '#000' }}
    >
      <Header centered={config.layout === 'centered' || config.layout === 'minimal'} />
      {body}
    </div>
  );
});

RealisticTemplate.displayName = 'RealisticTemplate';

export default RealisticTemplate;
