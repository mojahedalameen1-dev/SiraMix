import React, { useMemo, useState } from 'react';
import { ResumeData, WorkExperience, Education, Skill, CustomSectionItem, CustomSectionType } from '../types';
import { CUSTOM_SECTION_TYPES } from '../constants';
import Section from './Section';
import { PlusIcon } from './icons/PlusIcon';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../i18n';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: (updater: React.SetStateAction<ResumeData>) => void;
  openSection: string | null;
  setOpenSection: (section: string | null) => void;
  focusSection?: string | null;
}

type Field = { key: keyof CustomSectionItem; placeholderKey: string; placeholder: string; type: 'input' | 'textarea' };
type FieldGroup = Field[];
type FieldLayout = (Field | FieldGroup)[];

const customSectionConfig: Record<CustomSectionType, { layout: FieldLayout; newItem: Omit<CustomSectionItem, 'id'> }> = {
  default: {
    layout: [
      { key: 'primaryText', placeholderKey: 'primaryText', placeholder: 'Title / role', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'secondaryText', placeholder: 'Subtitle / company', type: 'input' },
      [{ key: 'startDate', placeholderKey: 'startDate', placeholder: 'Start date', type: 'input' }, { key: 'endDate', placeholderKey: 'endDate', placeholder: 'End date', type: 'input' }],
      { key: 'description', placeholderKey: 'description', placeholder: 'Description', type: 'textarea' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
  projects: {
    layout: [
      { key: 'primaryText', placeholderKey: 'projectName', placeholder: 'Project name', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'techStack', placeholder: 'Tools / technologies', type: 'input' },
      [{ key: 'startDate', placeholderKey: 'startDate', placeholder: 'Start date', type: 'input' }, { key: 'endDate', placeholderKey: 'endDate', placeholder: 'End date', type: 'input' }],
      { key: 'description', placeholderKey: 'description', placeholder: 'Project description and achievements', type: 'textarea' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
  certifications: {
    layout: [
      { key: 'primaryText', placeholderKey: 'certificationName', placeholder: 'Certification name', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'issuingOrg', placeholder: 'Issuing organization', type: 'input' },
      { key: 'startDate', placeholderKey: 'dateIssued', placeholder: 'Date issued', type: 'input' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
  awards: {
    layout: [
      { key: 'primaryText', placeholderKey: 'awardName', placeholder: 'Award name', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'awardingBody', placeholder: 'Awarding body', type: 'input' },
      { key: 'startDate', placeholderKey: 'dateReceived', placeholder: 'Date received', type: 'input' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
  languages: {
    layout: [
      { key: 'primaryText', placeholderKey: 'language', placeholder: 'Language', type: 'input' },
      { key: 'secondaryText', placeholderKey: 'proficiency', placeholder: 'Proficiency', type: 'input' },
    ],
    newItem: { primaryText: '', secondaryText: '', startDate: '', endDate: '', description: '' },
  },
};

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-[#00B5A5] focus:ring-2 focus:ring-[#00B5A5]/20 ${className}`}
  />
);

const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-[#00B5A5] focus:ring-2 focus:ring-[#00B5A5]/20 ${className}`}
  />
);

function sectionCompletion(sectionKey: string, data: ResumeData): number {
  if (sectionKey === 'personalInfo') {
    const fields = [data.personalInfo.name, data.personalInfo.title, data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }
  if (sectionKey === 'summary') return data.summary.trim().split(/\s+/).filter(Boolean).length >= 30 ? 100 : data.summary.trim() ? 50 : 0;
  if (sectionKey === 'experience') return data.experience.length ? Math.min(100, data.experience.length * 50) : 0;
  if (sectionKey === 'education') return data.education.length ? 100 : 0;
  if (sectionKey === 'skills') return Math.min(100, Math.round((data.skills.length / 6) * 100));
  const items = data.customSectionsData[sectionKey] || [];
  return items.length ? 100 : 0;
}

const CompletionBadge: React.FC<{ value: number }> = ({ value }) => {
  const { t } = useTranslation();
  const complete = value >= 80;
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${complete ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-700'}`}>
      {complete ? t('form.complete') : `${value}%`}
    </span>
  );
};

const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, setResumeData, openSection, setOpenSection, focusSection }) => {
  const { personalInfo, summary, experience, education, skills, customSectionsData, sectionOrder, sectionTitles } = resumeData;
  const [skillInput, setSkillInput] = useState('');
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState<CustomSectionType>('default');
  const { t } = useTranslation();

  const missingPersonalFields = useMemo(() => {
    const fields = [
      [t('form.fullName'), personalInfo.name],
      [t('form.jobTitle'), personalInfo.title],
      [t('form.email'), personalInfo.email],
      [t('form.phone'), personalInfo.phone],
      [t('form.location'), personalInfo.location],
    ];
    return fields.filter(([, value]) => !String(value || '').trim()).map(([label]) => label);
  }, [personalInfo, t]);

  const handleToggleSection = (sectionKey: string) => {
    setOpenSection(openSection === sectionKey ? null : sectionKey);
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('dragging-cursor');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
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
        setResumeData(prev => ({ ...prev, skills: [...prev.skills, { id: crypto.randomUUID(), name: trimmedSkill }] }));
      }
      setSkillInput('');
    }
  };

  const handleDeleteSection = (sectionKey: string) => {
    toast((toastInstance) => (
      <div className="flex flex-col items-center rounded-xl bg-card p-4 shadow-lg ring-1 ring-border">
        <p className="mb-2 text-center font-semibold text-card-foreground">{t('form.deleteSectionTitle')} "{sectionTitles[sectionKey] || t(`form.${sectionKey}`)}"?</p>
        <p className="mb-4 text-center text-sm text-muted-foreground">{t('form.deleteSectionMessage')}</p>
        <div className="flex w-full gap-2">
          <button onClick={() => toast.dismiss(toastInstance.id)} className="w-full rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-accent">
            {t('form.cancel')}
          </button>
          <button
            onClick={() => {
              setResumeData(prev => {
                const newCustomData = { ...prev.customSectionsData };
                const newTitles = { ...prev.sectionTitles };
                const newTypes = { ...prev.sectionTypes };
                delete newCustomData[sectionKey];
                delete newTitles[sectionKey];
                delete newTypes[sectionKey];
                return {
                  ...prev,
                  sectionOrder: prev.sectionOrder.filter(key => key !== sectionKey),
                  customSectionsData: newCustomData,
                  sectionTitles: newTitles,
                  sectionTypes: newTypes,
                };
              });
              toast.dismiss(toastInstance.id);
              toast.success(t('toasts.sectionDeleted'));
            }}
            className="w-full rounded-md bg-destructive px-3 py-1.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            {t('form.delete')}
          </button>
        </div>
      </div>
    ), { duration: 6000, position: 'top-center' });
  };

  const handleConfirmAddNewSection = () => {
    const title = newSectionTitle.trim();
    if (!title) return;
    const newSectionKey = `custom_${crypto.randomUUID()}`;
    setResumeData(prev => ({
      ...prev,
      sectionOrder: [...prev.sectionOrder, newSectionKey],
      sectionTitles: { ...prev.sectionTitles, [newSectionKey]: title },
      sectionTypes: { ...prev.sectionTypes, [newSectionKey]: newSectionType },
      customSectionsData: { ...prev.customSectionsData, [newSectionKey]: [] },
    }));
    setOpenSection(newSectionKey);
    toast.success(t('toasts.sectionCreated'));
    setNewSectionTitle('');
    setNewSectionType('default');
    setIsAddingSection(false);
  };

  const getSectionTitle = (sectionKey: string) => sectionTitles[sectionKey] || t(`form.${sectionKey}`, {}, sectionKey);

  const renderHeaderAddon = (sectionKey: string) => <CompletionBadge value={sectionCompletion(sectionKey, resumeData)} />;

  return (
    <div className="space-y-4">
      <Section
        title={t('form.personalInfo')}
        isCollapsible
        isOpen={openSection === 'personalInfo'}
        onToggle={() => handleToggleSection('personalInfo')}
        headerAddon={renderHeaderAddon('personalInfo')}
        isHighlighted={focusSection === 'personalInfo'}
      >
        <div className="space-y-4">
          {missingPersonalFields.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              {t('form.missingRequired')}: {missingPersonalFields.join('، ')}
            </div>
          )}
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
          const commonProps = {
            title: getSectionTitle(sectionKey),
            isDraggable: true,
            isCollapsible: true,
            isEditable: true,
            isOpen: openSection === sectionKey,
            onToggle: () => handleToggleSection(sectionKey),
            onDelete: () => handleDeleteSection(sectionKey),
            onRename: (newTitle: string) => setResumeData(prev => ({ ...prev, sectionTitles: { ...prev.sectionTitles, [sectionKey]: newTitle } })),
            headerAddon: renderHeaderAddon(sectionKey),
            isHighlighted: focusSection === sectionKey,
          };

          let sectionComponent: React.ReactNode = null;

          if (isCustom) {
            const sectionType = resumeData.sectionTypes?.[sectionKey] || 'default';
            const config = customSectionConfig[sectionType];
            sectionComponent = (
              <Section
                {...commonProps}
                items={customSectionsData[sectionKey]}
                setItems={(items) => setResumeData(prev => ({ ...prev, customSectionsData: { ...prev.customSectionsData, [sectionKey]: items as CustomSectionItem[] } }))}
                newItem={config.newItem}
                renderItem={(item, onChange) => (
                  <div className="space-y-2">
                    {config.layout.map((fieldOrGroup, i) => {
                      if (Array.isArray(fieldOrGroup)) {
                        return (
                          <div key={`group-${i}`} className="flex flex-col gap-2 sm:flex-row">
                            {fieldOrGroup.map(field => (
                              <FormInput key={field.key} type="text" placeholder={t(`formPlaceholders.${field.placeholderKey}`, {}, field.placeholder)} value={item[field.key]} onChange={(e) => onChange(field.key, e.target.value)} />
                            ))}
                          </div>
                        );
                      }
                      const field = fieldOrGroup;
                      return field.type === 'textarea'
                        ? <FormTextarea key={field.key} placeholder={t(`formPlaceholders.${field.placeholderKey}`, {}, field.placeholder)} value={item[field.key]} onChange={(e) => onChange(field.key, e.target.value)} className="h-24" />
                        : <FormInput key={field.key} type="text" placeholder={t(`formPlaceholders.${field.placeholderKey}`, {}, field.placeholder)} value={item[field.key]} onChange={(e) => onChange(field.key, e.target.value)} />;
                    })}
                  </div>
                )}
              />
            );
          } else if (sectionKey === 'summary') {
            sectionComponent = (
              <Section {...commonProps}>
                <FormTextarea placeholder={t('form.summaryPlaceholder')} value={summary} onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))} className="h-36" />
              </Section>
            );
          } else if (sectionKey === 'experience') {
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
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <FormInput type="text" placeholder={t('form.startDate')} value={item.startDate} onChange={(e) => onChange('startDate', e.target.value)} />
                      <FormInput type="text" placeholder={t('form.endDate')} value={item.endDate} onChange={(e) => onChange('endDate', e.target.value)} />
                    </div>
                    <FormTextarea placeholder={t('form.description')} value={item.description} onChange={(e) => onChange('description', e.target.value)} className="h-28" />
                  </div>
                )}
              />
            );
          } else if (sectionKey === 'education') {
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
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <FormInput type="text" placeholder={t('form.startDate')} value={item.startDate} onChange={(e) => onChange('startDate', e.target.value)} />
                      <FormInput type="text" placeholder={t('form.endDate')} value={item.endDate} onChange={(e) => onChange('endDate', e.target.value)} />
                    </div>
                    <FormTextarea placeholder={t('form.description')} value={item.description} onChange={(e) => onChange('description', e.target.value)} className="h-20" />
                  </div>
                )}
              />
            );
          } else if (sectionKey === 'skills') {
            sectionComponent = (
              <Section {...commonProps}>
                <div className="mb-3 flex flex-wrap gap-2" aria-live="polite">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                      <span>{skill.name}</span>
                      <button
                        onClick={() => setResumeData(prev => ({ ...prev, skills: prev.skills.filter(item => item.id !== skill.id) }))}
                        className="ms-2 rounded-full p-0.5 text-slate-500 hover:bg-black/10"
                        aria-label={`${t('form.removeSkill')} ${skill.name}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
                <FormInput type="text" placeholder={t('form.addSkillPlaceholder')} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} />
                <p className="mt-2 text-xs text-muted-foreground">{t('form.addSkillInstruction')}</p>
              </Section>
            );
          }

          return (
            <div
              key={sectionKey}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`transition-all duration-200 ${draggingIndex === index ? 'scale-[1.01] opacity-60' : ''}`}
            >
              {sectionComponent}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        {isAddingSection ? (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <FormInput type="text" placeholder={t('form.newSectionTitlePlaceholder')} value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} autoFocus />
            <select value={newSectionType} onChange={(e) => setNewSectionType(e.target.value as CustomSectionType)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {CUSTOM_SECTION_TYPES.map(type => (
                <option key={type.id} value={type.id}>{t(`customSectionTypes.${type.id}`)}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setIsAddingSection(false); setNewSectionTitle(''); }} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent">{t('form.cancel')}</button>
              <button onClick={handleConfirmAddNewSection} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!newSectionTitle.trim()}>
                {t('form.addSection')}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAddingSection(true)} className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-blue-300 p-3 text-sm font-bold text-blue-600 transition hover:bg-blue-500/10">
            <PlusIcon /> <span className="mx-2">{t('form.addNewSection')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;
