import React, { forwardRef } from 'react';
import { ResumeData, TemplateOptions } from '../../types';
import { useTranslation } from '../../i18n';

interface TemplateProps {
    data: ResumeData;
    options: TemplateOptions;
    language: 'en' | 'ar';
}

const ModernTemplate = forwardRef<HTMLDivElement, TemplateProps>(({ data, options, language }, ref) => {
    const { t } = useTranslation();
    const { personalInfo, summary, experience, education, skills, customSectionsData, sectionOrder, sectionTitles } = data;
    const accentColorStyle = { color: options.accentColor };
    const accentBorderStyle = { borderColor: options.accentColor };
    const isRtl = language === 'ar';
    
    const sidebarSections = ['skills'];

    // Dynamic Spacing / Margin values
    const textSpacingClass = options.lineSpacing === 'compact' ? 'leading-normal' : options.lineSpacing === 'spacious' ? 'leading-loose' : 'leading-relaxed';
    const listSpacingClass = options.lineSpacing === 'compact' ? 'space-y-0.5' : options.lineSpacing === 'spacious' ? 'space-y-2' : 'space-y-1';
    
    const sectionMargin = options.lineSpacing === 'compact' ? 'mb-4' : options.lineSpacing === 'spacious' ? 'mb-8' : 'mb-6';
    const itemMargin = options.lineSpacing === 'compact' ? 'mb-3' : options.lineSpacing === 'spacious' ? 'mb-5' : 'mb-4';
    
    const paddingClass = options.marginSize === 'compact' ? 'p-6 md:p-8' : options.marginSize === 'wide' ? 'p-12 md:p-16' : 'p-8 md:p-12';

    const BulletPoint: React.FC<{ text: string }> = ({ text }) => {
        const cleanedText = text.trim().replace(/^[•\-\*]\s*/, '');
        if (!cleanedText) return null;
        return (
            <div className="flex items-start" data-bullet>
                <span className={`mt-1.5 ${isRtl ? 'ml-3' : 'mr-3'}`} style={{ color: options.accentColor }}>•</span>
                <span className={`${textSpacingClass}`}>{cleanedText}</span>
            </div>
        );
    };

    const renderSection = (sectionKey: string) => {
        const defaultTitle = t(`form.${sectionKey}`, {}, sectionKey);
        const title = sectionTitles[sectionKey] || defaultTitle;
        
        if (sectionKey.startsWith('custom_')) {
            const sectionData = customSectionsData[sectionKey];
            const type = data.sectionTypes?.[sectionKey] || 'default';
            if (!sectionData) return null;

            if (type === 'languages') {
                return (
                    <section key={sectionKey} className={sectionMargin}>
                        <h3 className="section-title text-base font-bold uppercase tracking-wider mb-2 border-b-2 pb-1" style={accentBorderStyle}>{title}</h3>
                        <ul className="grid grid-cols-1 gap-y-2">
                            {sectionData.map(item => (
                                <li key={item.id} className={`text-gray-700 ${textSpacingClass}`}>
                                   {item.primaryText} {item.secondaryText && <span className="text-gray-500">({item.secondaryText})</span>}
                                </li>
                            ))}
                        </ul>
                    </section>
                )
            }

            return (
                <section key={sectionKey} className={sectionMargin}>
                    <h3 className="section-title text-base font-bold uppercase tracking-wider mb-2 border-b-2 pb-1" style={accentBorderStyle}>{title}</h3>
                     {sectionData.length > 0 ? (
                        sectionData.map(item => {
                            switch (type) {
                                case 'projects':
                                    return (
                                        <div key={item.id} className={itemMargin}>
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-bold text-sm text-gray-900">{item.primaryText}</h4>
                                                {(item.startDate || item.endDate) && (
                                                    <div className="text-xs font-semibold text-gray-655 font-semibold text-gray-600">
                                                        {item.startDate}{item.startDate && item.endDate ? ' - ' : ''}{item.endDate}
                                                    </div>
                                                )}
                                            </div>
                                            {item.secondaryText && <div className="text-sm font-semibold" style={accentColorStyle}>{item.secondaryText}</div>}
                                            {item.description && <div className={`mt-1.5 text-gray-750 whitespace-pre-wrap ${listSpacingClass}`}>
                                                {item.description.split('\n').filter(l => l.trim()).map((line, i) => (
                                                    <BulletPoint key={i} text={line} />
                                                ))}
                                            </div>}
                                        </div>
                                    );
                                case 'certifications':
                                case 'awards':
                                     return (
                                        <div key={item.id} className={itemMargin}>
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-bold text-sm text-gray-900">{item.primaryText}</h4>
                                                {item.startDate && <div className="text-xs font-semibold text-gray-655">{item.startDate}</div>}
                                            </div>
                                            {item.secondaryText && <div className="text-sm text-gray-700">{item.secondaryText}</div>}
                                        </div>
                                    );
                                case 'default':
                                default:
                                    return (
                                        <div key={item.id} className={itemMargin}>
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-bold text-sm text-gray-900">{item.primaryText}</h4>
                                                {(item.startDate || item.endDate) && (
                                                    <div className="text-xs font-semibold text-gray-655">{item.startDate} - {item.endDate}</div>
                                                )}
                                            </div>
                                            <div className="text-sm font-semibold" style={accentColorStyle}>{item.secondaryText}</div>
                                            {item.description && <div className={`mt-1.5 text-gray-750 whitespace-pre-wrap ${listSpacingClass}`}>
                                                {item.description.split('\n').filter(l => l.trim()).map((line, i) => (
                                                    <BulletPoint key={i} text={line} />
                                                ))}
                                            </div>}
                                        </div>
                                    );
                            }
                        })
                     ) : (
                          <p className="text-gray-450 italic text-xs">This section is empty.</p>
                     )}
                </section>
            );
        }

        switch (sectionKey) {
            case 'summary':
                return summary && (
                    <section key="summary" className={sectionMargin}>
                        <h3 className="section-title text-base font-bold uppercase tracking-wider mb-2 border-b-2 pb-1" style={accentBorderStyle}>{title}</h3>
                        <p className={`text-gray-700 ${textSpacingClass}`}>{summary}</p>
                    </section>
                );
            case 'experience':
                return experience.length > 0 && (
                    <section key="experience" className={sectionMargin}>
                        <h3 className="section-title text-base font-bold uppercase tracking-wider mb-2 border-b-2 pb-1" style={accentBorderStyle}>{title}</h3>
                        {experience.map(exp => (
                            <div key={exp.id} className={`${itemMargin} break-inside-avoid`}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-sm text-gray-900">{exp.title}</h4>
                                    <div className="text-xs font-semibold text-gray-600 text-right">{exp.startDate} - {exp.endDate}</div>
                                </div>
                                <div className="text-sm font-semibold" style={accentColorStyle}>{exp.company}</div>
                                <div className={`mt-1 text-gray-700 whitespace-pre-wrap ${listSpacingClass}`}>
                                     {exp.description.split('\n').filter(l => l.trim()).map((line, i) => (
                                        <BulletPoint key={i} text={line} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                );
            case 'education':
                 return education.length > 0 && (
                    <section key="education" className={sectionMargin}>
                        <h3 className="section-title text-base font-bold uppercase tracking-wider mb-2 border-b-2 pb-1" style={accentBorderStyle}>{title}</h3>
                        {education.map(edu => (
                            <div key={edu.id} className={`${itemMargin} break-inside-avoid`}>
                            <div className="flex justify-between items-baseline">
                                <h4 className="font-bold text-sm text-gray-900">{edu.degree}</h4>
                                <div className="text-xs font-semibold text-gray-600 text-right">{edu.startDate} - {edu.endDate}</div>
                            </div>
                            <div className="text-sm font-semibold text-gray-750">{edu.institution}</div>
                            {edu.description && <div className={`mt-0.5 text-gray-600 ${textSpacingClass}`}>{edu.description}</div>}
                            </div>
                        ))}
                    </section>
                );
            case 'skills':
                 return skills.length > 0 && (
                    <section key="skills" className={sectionMargin}>
                        <h3 className="section-title text-base font-bold uppercase tracking-wider mb-2 border-b-2 pb-1" style={accentBorderStyle}>{title}</h3>
                         <ul className={`grid grid-cols-1 gap-y-1.5 ${isRtl ? '-mr-1' : '-ml-1'}`}>
                          {skills.map(skill => (
                            <li key={skill.id} className={`text-gray-750 ${textSpacingClass} flex items-start`}>
                                <span className={`mt-1.5 ${isRtl ? 'ml-2' : 'mr-2'}`} style={{ color: options.accentColor }}>•</span>
                                <span>{skill.name}</span>
                            </li>
                          ))}
                        </ul>
                    </section>
                );
            default:
                return null;
        }
    };
    
    return (
        <div
            id="resume-preview"
            ref={ref}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`bg-white shadow-resume text-black ${isRtl ? 'font-shamel' : options.fontFamily} ${paddingClass}`}
            style={{ fontSize: options.fontSize, width: '210mm', minHeight: '297mm', color: '#000' }}
        >
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight" style={accentColorStyle}>{personalInfo.name}</h1>
                <h2 className="text-lg font-medium text-gray-750 mt-1">{personalInfo.title}</h2>
            </header>

            <div className="grid grid-cols-12 gap-x-8">
                <main className="col-span-8">
                    {sectionOrder
                        .filter(key => !sidebarSections.includes(key))
                        .map(sectionKey => renderSection(sectionKey))
                    }
                </main>
                <aside className="col-span-4">
                    <section className="mb-6">
                        <h3 className="section-title text-base font-bold uppercase tracking-wider mb-2 border-b-2 pb-1" style={accentBorderStyle}>{t('resumePreview.contact')}</h3>
                         <div className="text-xs text-gray-705 space-y-1.5">
                            <p className="font-semibold">{personalInfo.phone}</p>
                            <p className="font-semibold">{personalInfo.email}</p>
                            <p className="font-semibold">{personalInfo.location}</p>
                            {personalInfo.website && <p><a href={`https://${personalInfo.website}`} target="_blank" rel="noopener noreferrer" style={accentColorStyle} className="hover:underline">{personalInfo.website}</a></p>}
                         </div>
                    </section>
                     {sectionOrder
                        .filter(key => sidebarSections.includes(key))
                        .map(sectionKey => renderSection(sectionKey))
                    }
                </aside>
            </div>
        </div>
    );
});

ModernTemplate.displayName = 'ModernTemplate';

export default ModernTemplate;
