import React, { useState } from 'react';
import { ResumeData, WorkExperience, Education, Skill, CustomSectionItem, CustomSectionType } from '../types';
import { CUSTOM_SECTION_TYPES } from '../constants';
import Section from './Section';
import { PlusIcon } from './icons/PlusIcon';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../i18n';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: (updater: React.SetStateAction<ResumeData>) => void;
}

type Field = { key: keyof CustomSectionItem; placeholderKey: string; placeholder: string; type: 'input' | 'textarea' };
type FieldGroup = Field[];
type FieldLayout = (Field | FieldGroup)[];

const customSectionConfig: Record<CustomSectionType, {
  layout: FieldLayout;
  newItem: Omit<CustomSectionItem, 'id'>;
}> = {
  default: {
    layout: [
      { key: 'primaryText', placeholderKey: 'primaryText', placeholder: 'Title / Role', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'secondaryText', placeholder: 'Subtitle / Company', type: 'input' },
      [{ key: 'startDate', placeholderKey: 'startDate', placeholder: 'Start Date', type: 'input' }, { key: 'endDate', placeholderKey: 'endDate', placeholder: 'End Date', type: 'input' }],
      { key: 'description', placeholderKey: 'description', placeholder: 'Description', type: 'textarea' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
  projects: {
    layout: [
      { key: 'primaryText', placeholderKey: 'projectName', placeholder: 'Project Name', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'techStack', placeholder: 'Tech Stack (e.g., React, Node.js)', type: 'input' },
      [{ key: 'startDate', placeholderKey: 'startDate', placeholder: 'Start Date', type: 'input' }, { key: 'endDate', placeholderKey: 'endDate', placeholder: 'End Date', type: 'input' }],
      { key: 'description', placeholderKey: 'description', placeholder: 'Project description and your achievements...', type: 'textarea' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
  certifications: {
    layout: [
      { key: 'primaryText', placeholderKey: 'certificationName', placeholder: 'Certification Name', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'issuingOrg', placeholder: 'Issuing Organization', type: 'input' },
      { key: 'startDate', placeholderKey: 'dateIssued', placeholder: 'Date Issued', type: 'input' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
  awards: {
    layout: [
      { key: 'primaryText', placeholderKey: 'awardName', placeholder: 'Award Name', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'awardingBody', placeholder: 'Awarding Body', type: 'input' },
      { key: 'startDate', placeholderKey: 'dateReceived', placeholder: 'Date Received', type: 'input' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
  languages: {
    layout: [
      { key: 'primaryText', placeholderKey: 'language', placeholder: 'Language', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'proficiency', placeholder: 'Proficiency (e.g., Native, Fluent)', type: 'input' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
};

import { generateResumeSummary, generateExperienceDescription } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full p-2 bg-secondary border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none transition-shadow" />
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className="w-full p-2 bg-secondary border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none transition-shadow" />
);


const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData }) => {
  const { personalInfo, summary, experience, education, skills, customSectionsData, sectionOrder, sectionTitles } = resumeData;
  const [skillInput, setSkillInput] = useState('');
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState<CustomSectionType>('default');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { t, language } = useTranslation();

  const handleGenerateSummary = async () => {
      setGeneratingId('summary');
      try {
          const skillsStr = skills.map(s => s.name).join(', ');
          const text = await generateResumeSummary(personalInfo.title || '', skillsStr, language);
          setResumeData(prev => ({ ...prev, summary: text }));
          toast.success('Summary generated successfully!');
      } catch (err: any) {
          toast.error(err.message || 'Failed to generate summary');
      } finally {
          setGeneratingId(null);
      }
  };

  const handleGenerateExperience = async (id: string, role: string, company: string) => {
      setGeneratingId(`exp-${id}`);
      try {
          const text = await generateExperienceDescription(role, company, language);
          setResumeData(prev => ({
              ...prev,
              experience: prev.experience.map(exp => 
                  exp.id === id ? { ...exp, description: text } : exp
              )
          }));
          toast.success('Experience details generated!');
      } catch (err: any) {
          toast.error(err.message || 'Failed to generate experience');
      } finally {
          setGeneratingId(null);
      }
  };

  const handleToggleSection = (sectionKey: string) => {
    setOpenSection(prevOpenSection => (prevOpenSection === sectionKey ? null : sectionKey));
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
  };
  
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setResumeData(prev => ({ ...prev, summary: e.target.value }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('dragging-cursor');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) {
      return;
    }
    setResumeData(prev => {
        const newSectionOrder = [...prev.sectionOrder];
        const draggedItem = newSectionOrder.splice(draggingIndex, 1)[0];
        newSectionOrder.splice(index, 0, draggedItem);
        return { ...prev, sectionOrder: newSectionOrder };
    });
    setDraggingIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggingIndex(null);
    document.body.classList.remove('dragging-cursor');
  };
  
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
        e.preventDefault();
        const trimmedSkill = skillInput.trim().replace(/,$/, '');
        if (trimmedSkill && !skills.some(skill => skill.name.toLowerCase() === trimmedSkill.toLowerCase())) {
            const newSkill = { id: crypto.randomUUID(), name: trimmedSkill };
            setResumeData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
        }
        setSkillInput('');
    }
  };

  const handleRemoveSkill = (id: string) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill.id !== id) }));
  };

  const handleDeleteSection = (sectionKey: string) => {
    toast((toastInstance) => (
      <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-lg animate-fade-in ring-1 ring-border">
        <p className="text-center font-semibold mb-2 text-card-foreground">{t('form.deleteSectionTitle')} "{sectionTitles[sectionKey] || t(`form.${sectionKey}`)}"?</p>
        <p className="text-sm text-center text-muted-foreground mb-4">{t('form.deleteSectionMessage')}</p>
        <div className="flex gap-2 w-full">
          <button
            onClick={() => toast.dismiss(toastInstance.id)}
            className="w-full px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {t('form.cancel')}
          </button>
          <button
            onClick={() => {
              setResumeData(prev => {
                  const newSectionOrder = prev.sectionOrder.filter(key => key !== sectionKey);
                  const newCustomData = { ...prev.customSectionsData };
                  const newTitles = { ...prev.sectionTitles };
                  const newTypes = { ...prev.sectionTypes };
                  
                  if (sectionKey.startsWith('custom_')) {
                      delete newCustomData[sectionKey];
                      delete newTitles[sectionKey];
                      delete newTypes[sectionKey];
                  }

                  return {
                      ...prev,
                      sectionOrder: newSectionOrder,
                      customSectionsData: newCustomData,
                      sectionTitles: newTitles,
                      sectionTypes: newTypes,
                  };
              });
              toast.dismiss(toastInstance.id);
              toast.success(t('toasts.sectionDeleted'), { id: 'section-deleted-toast' });
            }}
            className="w-full px-3 py-1.5 text-sm font-semibold bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive"
          >
            {t('form.delete')}
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
    });
  };

  const handleRenameSection = (sectionKey: string, newTitle: string) => {
    setResumeData(prev => ({ ...prev, sectionTitles: { ...prev.sectionTitles, [sectionKey]: newTitle } }));
  };

  const handleConfirmAddNewSection = () => {
    const title = newSectionTitle.trim();
    if (title) {
        const newSectionKey = `custom_${crypto.randomUUID()}`;
        setResumeData(prev => ({
            ...prev,
            sectionOrder: [...prev.sectionOrder, newSectionKey],
            sectionTitles: { ...prev.sectionTitles, [newSectionKey]: title },
            sectionTypes: { ...prev.sectionTypes, [newSectionKey]: newSectionType },
            customSectionsData: { ...prev.customSectionsData, [newSectionKey]: [] }
        }));
        setOpenSection(newSectionKey);
        toast.success(t('toasts.sectionCreated', {title}));
        setNewSectionTitle('');
        setNewSectionType('default');
        setIsAddingSection(false);
    }
  };

  const handleCancelAddNewSection = () => {
    setNewSectionTitle('');
    setIsAddingSection(false);
    setNewSectionType('default');
  };
  
  return (
    <div className="space-y-4">
      <Section title={t('form.personalInfo')} isCollapsible isOpen={openSection === 'personalInfo'} onToggle={() => handleToggleSection('personalInfo')}>
        <div className="space-y-4">
          <FormInput type="text" name="name" placeholder={t('form.fullName')} value={personalInfo.name} onChange={handlePersonalInfoChange} />
          <FormInput type="text" name="title" placeholder={t('form.jobTitle')} value={personalInfo.title} onChange={handlePersonalInfoChange} />
          <FormInput type="email" name="email" placeholder={t('form.email')} value={personalInfo.email} onChange={handlePersonalInfoChange} />
          <FormInput type="tel" name="phone" placeholder={t('form.phone')} value={personalInfo.phone} onChange={handlePersonalInfoChange} />
          <FormInput type="text" name="location" placeholder={t('form.location')} value={personalInfo.location} onChange={handlePersonalInfoChange} />
          <FormInput type="url" name="website" placeholder={t('form.website')} value={personalInfo.website} onChange={handlePersonalInfoChange} />
        </div>
      </Section>
      
      <div className="space-y-4">
        {sectionOrder.map((sectionKey, index) => {
            const isCustom = sectionKey.startsWith('custom_');
            const defaultTitle = t(`form.${sectionKey}`, {}, sectionKey);
            const title = sectionTitles[sectionKey] || defaultTitle;
            
            const commonProps = {
              title: title,
              isDraggable: true,
              isCollapsible: true,
              isEditable: true,
              isOpen: openSection === sectionKey,
              onToggle: () => handleToggleSection(sectionKey),
              onDelete: () => handleDeleteSection(sectionKey),
              onRename: (newTitle: string) => handleRenameSection(sectionKey, newTitle),
            };

            let sectionComponent;

            if (isCustom) {
                const sectionType = resumeData.sectionTypes?.[sectionKey] || 'default';
                const config = customSectionConfig[sectionType];
                sectionComponent = (
                    <Section
                        {...commonProps}
                        items={customSectionsData[sectionKey]}
                        setItems={(items) => setResumeData(prev => ({
                            ...prev,
                            customSectionsData: {
                            ...prev.customSectionsData,
                            [sectionKey]: items as CustomSectionItem[]
                            }
                        }))}
                        newItem={config.newItem}
                        renderItem={(item, onChange) => (
                            <div className="space-y-2">
                            {config.layout.map((fieldOrGroup, i) => {
                                if (Array.isArray(fieldOrGroup)) {
                                return (
                                    <div key={`group-${i}`} className="flex flex-col sm:flex-row gap-2 sm:space-x-2 rtl:sm:space-x-reverse sm:gap-0">
                                    {fieldOrGroup.map(field => (
                                        <FormInput key={field.key} type="text" placeholder={t(`formPlaceholders.${field.placeholderKey}`, {}, field.placeholder)} value={item[field.key as keyof typeof item]} onChange={(e) => onChange(field.key, e.target.value)} />
                                    ))}
                                    </div>
                                );
                                }
                                const field = fieldOrGroup;
                                if (field.type === 'textarea') {
                                return <FormTextarea key={field.key} placeholder={t(`formPlaceholders.${field.placeholderKey}`, {}, field.placeholder)} value={item[field.key as keyof typeof item]} onChange={(e) => onChange(field.key, e.target.value)} className="h-24" />
                                }
                                return <FormInput key={field.key} type="text" placeholder={t(`formPlaceholders.${field.placeholderKey}`, {}, field.placeholder)} value={item[field.key as keyof typeof item]} onChange={(e) => onChange(field.key, e.target.value)} />
                            })}
                            </div>
                        )}
                    />
                );
            } else {
                 switch(sectionKey) {
                    case 'summary':
                        sectionComponent = (
                        <Section {...commonProps}>
                            <div className="relative">
                            <FormTextarea placeholder={t('form.summaryPlaceholder')} value={summary} onChange={handleSummaryChange} className="h-32" />
                            <div className="flex justify-end mt-2">
                                <button 
                                  onClick={handleGenerateSummary}
                                  disabled={generatingId === 'summary'}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                                >
                                  <SparklesIcon className={generatingId === 'summary' ? 'animate-spin' : ''} />
                                  <span>{generatingId === 'summary' ? t('generating') : t('generateWithAI')}</span>
                                </button>
                            </div>
                            </div>
                        </Section>
                        );
                        break;
                    case 'experience':
                        sectionComponent = (
                        <Section
                            {...commonProps}
                            items={experience}
                            setItems={(items) => setResumeData(prev => ({ ...prev, experience: items as WorkExperience[] }))}
                            newItem={{ company: '', title: '', startDate: '', endDate: '', description: '' }}
                            renderItem={(item, onChange) => (
                            <div className="space-y-2">
                                <FormInput type="text" placeholder={t('form.jobTitle')} value={item.title} onChange={(e) => onChange('title', e.target.value)} />
                                <FormInput type="text" placeholder={t('form.company')} value={item.company} onChange={(e) => onChange('company', e.target.value)} />
                                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 rtl:sm:space-x-reverse sm:gap-0">
                                <FormInput type="text" placeholder={t('form.startDate')} value={item.startDate} onChange={(e) => onChange('startDate', e.target.value)} />
                                <FormInput type="text" placeholder={t('form.endDate')} value={item.endDate} onChange={(e) => onChange('endDate', e.target.value)} />
                                </div>
                                <div className="relative">
                                <FormTextarea placeholder={t('form.description')} value={item.description} onChange={(e) => onChange('description', e.target.value)} className="h-24" />
                                <div className="flex justify-end mt-2">
                                    <button 
                                      onClick={() => handleGenerateExperience(item.id, item.title, item.company)}
                                      disabled={generatingId === `exp-${item.id}` || !item.title || !item.company}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                                    >
                                      <SparklesIcon className={generatingId === `exp-${item.id}` ? 'animate-spin' : ''} />
                                      <span>{generatingId === `exp-${item.id}` ? t('generating') : t('generateWithAI')}</span>
                                    </button>
                                </div>
                                </div>
                            </div>
                            )}
                        />
                        );
                        break;
                    case 'education':
                         sectionComponent = (
                            <Section
                                {...commonProps}
                                items={education}
                                setItems={(items) => setResumeData(prev => ({ ...prev, education: items as Education[] }))}
                                newItem={{ institution: '', degree: '', startDate: '', endDate: '', description: '' }}
                                renderItem={(item, onChange) => (
                                <div className="space-y-2">
                                    <FormInput type="text" placeholder={t('form.institution')} value={item.institution} onChange={(e) => onChange('institution', e.target.value)} />
                                    <FormInput type="text" placeholder={t('form.degree')} value={item.degree} onChange={(e) => onChange('degree', e.target.value)} />
                                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 rtl:sm:space-x-reverse sm:gap-0">
                                    <FormInput type="text" placeholder={t('form.startDate')} value={item.startDate} onChange={(e) => onChange('startDate', e.target.value)} />
                                    <FormInput type="text" placeholder={t('form.endDate')} value={item.endDate} onChange={(e) => onChange('endDate', e.target.value)} />
                                    </div>
                                    <FormTextarea placeholder={t('form.description')} value={item.description} onChange={(e) => onChange('description', e.target.value)} className="h-16"/>
                                </div>
                                )}
                            />
                        );
                        break;
                    case 'skills':
                        sectionComponent = (
                            <Section {...commonProps}>
                                <div className="flex flex-wrap gap-2 mb-2" aria-live="polite">
                                {skills.map((skill) => (
                                    <div key={skill.id} className="flex items-center bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full px-3 py-1 text-sm font-medium">
                                    <span>{skill.name}</span>
                                    <button onClick={() => handleRemoveSkill(skill.id)} className="ms-2 -me-1 p-0.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" aria-label={`${t('form.removeSkill')} ${skill.name}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                    </div>
                                ))}
                                </div>
                                <FormInput type="text" placeholder={t('form.addSkillPlaceholder')} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} aria-label={t('form.skills')} />
                                <p className="text-xs text-muted-foreground mt-1">{t('form.addSkillInstruction')}</p>
                            </Section>
                        );
                        break;
                    default:
                        sectionComponent = null;
                }
            }

            return (
              <div 
                key={sectionKey}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-300 ease-in-out cursor-grab ${draggingIndex === index ? 'opacity-50 shadow-2xl scale-105' : ''}`}
              >
                {sectionComponent}
              </div>
            );
        })}
      </div>

      <div className="mt-6">
        {isAddingSection ? (
            <div className="p-3 bg-secondary rounded-md space-y-3 animate-slide-down">
                <FormInput 
                    type="text"
                    placeholder={t('form.newSectionTitlePlaceholder')}
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    autoFocus
                />
                 <select
                    value={newSectionType}
                    onChange={(e) => setNewSectionType(e.target.value as CustomSectionType)}
                    className="w-full p-2 bg-secondary border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
                >
                    {CUSTOM_SECTION_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{t(`customSectionTypes.${type.id}`)}</option>
                    ))}
                </select>
                <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                    <button onClick={handleCancelAddNewSection} className="px-3 py-1.5 text-sm rounded-md hover:bg-accent">{t('form.cancel')}</button>
                    <button onClick={handleConfirmAddNewSection} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={!newSectionTitle.trim()}>
                        {t('form.addSection')}
                    </button>
                </div>
            </div>
        ) : (
            <button
                onClick={() => setIsAddingSection(true)}
                className="w-full flex items-center justify-center p-2 text-sm text-blue-600 dark:text-blue-400 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-md hover:bg-blue-500/10 hover:border-blue-500 dark:hover:border-blue-600 transition-colors"
            >
                <PlusIcon /> <span className="mx-2">{t('form.addNewSection')}</span>
            </button>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;