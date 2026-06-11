import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ARABIC_FONT_FAMILIES, DEFAULT_DUAL_RESUME_DATA, DEFAULT_TEMPLATE_OPTIONS, ENGLISH_FONT_FAMILIES } from './constants';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Login } from './components/Login';
import Header, { SaveStatus } from './components/Header';
import Footer from './components/Footer';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import TemplateControls from './components/TemplateControls';
import { AtsAnalysis } from './components/AtsAnalysis';
import { PencilIcon } from './components/icons/PencilIcon';
import { TargetIcon } from './components/icons/TargetIcon';
import { LanguageProvider, useLanguage } from './i18n';
import { resumeService } from './services/resumeService';
import { extractResumeTextFromFile, getFirstImportedSection, importResumeTextIntoData } from './services/resumeImportService';
import { DualResumeData, Resume, ResumeData, TemplateOptions } from './types';

type WorkspaceTab = 'content' | 'design' | 'ats';
type MobileWorkspaceView = 'form' | 'preview';

function createNewResumeObj(existingResumes: Resume[] = []): Resume {
  const newId = crypto.randomUUID();
  const index = existingResumes.length + 1;

  return {
    id: newId,
    name: existingResumes.length === 0 ? 'سيرتي الأساسية' : `سيرة ذاتية ${index}`,
    data: JSON.parse(JSON.stringify(DEFAULT_DUAL_RESUME_DATA)),
    options: { ...DEFAULT_TEMPLATE_OPTIONS },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isResumeData(value: unknown): value is ResumeData {
  if (!isRecord(value)) return false;
  const personalInfo = value.personalInfo;

  return (
    isRecord(personalInfo) &&
    typeof personalInfo.name === 'string' &&
    typeof personalInfo.title === 'string' &&
    typeof personalInfo.email === 'string' &&
    typeof personalInfo.phone === 'string' &&
    typeof personalInfo.location === 'string' &&
    typeof personalInfo.website === 'string' &&
    typeof value.summary === 'string' &&
    Array.isArray(value.experience) &&
    Array.isArray(value.education) &&
    Array.isArray(value.skills) &&
    isRecord(value.customSectionsData) &&
    Array.isArray(value.sectionOrder) &&
    isRecord(value.sectionTitles) &&
    isRecord(value.sectionTypes)
  );
}

function isDualResumeData(value: unknown): value is DualResumeData {
  return isRecord(value) && isResumeData(value.en) && isResumeData(value.ar);
}

function isTemplateOptions(value: unknown): value is TemplateOptions {
  if (!isRecord(value)) return false;

  return (
    typeof value.accentColor === 'string' &&
    typeof value.fontFamily === 'string' &&
    typeof value.fontSize === 'string' &&
    typeof value.template === 'string'
  );
}

function getResumeCompletion(data: ResumeData): number {
  const checks = [
    Boolean(data.personalInfo.name.trim()),
    Boolean(data.personalInfo.title.trim()),
    Boolean(data.personalInfo.email.trim()),
    Boolean(data.personalInfo.phone.trim()),
    Boolean(data.summary.trim()),
    data.experience.some(item => item.title.trim() && item.company.trim()),
    data.education.some(item => item.degree.trim() && item.institution.trim()),
    data.skills.length >= 4,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getLongestSectionKey(data: ResumeData): string {
  const sectionLengths: Record<string, number> = {
    personalInfo: Object.values(data.personalInfo).join(' ').length,
    summary: data.summary.length,
    experience: data.experience.map(item => `${item.title} ${item.company} ${item.description}`).join(' ').length,
    education: data.education.map(item => `${item.degree} ${item.institution} ${item.description}`).join(' ').length,
    skills: data.skills.map(skill => skill.name).join(' ').length,
  };

  for (const section of Object.keys(data.customSectionsData || {})) {
    sectionLengths[section] = JSON.stringify(data.customSectionsData[section] || []).length;
  }

  return Object.entries(sectionLengths).sort((a, b) => b[1] - a[1])[0]?.[0] || 'summary';
}

const MainAppContent: React.FC<{
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  resumes: Resume[];
  activeResumeId: string;
  setActiveResumeId: (id: string) => void;
  currentResume: Resume;
  setResumeData: (updater: React.SetStateAction<DualResumeData>) => void;
  setTemplateOptions: (options: TemplateOptions) => void;
  addResume: () => void;
  deleteResume: (id: string) => void;
  renameResume: (id: string, newName: string) => void;
  user: any;
  signOut: () => Promise<void>;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
}> = ({
  theme,
  setTheme,
  resumes,
  activeResumeId,
  setActiveResumeId,
  currentResume,
  setResumeData,
  setTemplateOptions,
  addResume,
  deleteResume,
  renameResume,
  user,
  signOut,
  saveStatus,
  onRetrySave,
}) => {
  const { language, setLanguage } = useLanguage();
  const isRtl = language === 'ar';
  const activeLanguage = language;
  const inactiveLanguage = activeLanguage === 'ar' ? 'en' : 'ar';
  const activeData = currentResume.data[activeLanguage];
  const inactiveData = currentResume.data[inactiveLanguage];

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('content');
  const [openSection, setOpenSection] = useState<string | null>('personalInfo');
  const [focusSection, setFocusSection] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileWorkspaceView>('form');
  const [importBanner, setImportBanner] = useState<string | null>(null);
  const [isImportingResume, setIsImportingResume] = useState(false);

  const currentCompletion = getResumeCompletion(activeData);
  const otherCompletion = getResumeCompletion(inactiveData);

  useEffect(() => {
    const availableFonts = activeLanguage === 'ar' ? ARABIC_FONT_FAMILIES : ENGLISH_FONT_FAMILIES;
    if (!availableFonts.some(font => font.value === currentResume.options.fontFamily)) {
      setTemplateOptions({ ...currentResume.options, fontFamily: availableFonts[0].value });
    }
  }, [activeLanguage, currentResume.options, setTemplateOptions]);

  const openEditorSection = (section: string) => {
    setActiveTab('content');
    setMobileView('form');
    setOpenSection(section);
    setFocusSection(section);
    window.setTimeout(() => setFocusSection(null), 1400);
  };

  const handleSetLanguageSpecificResumeData = (updater: React.SetStateAction<ResumeData>) => {
    setResumeData(prevDualData => {
      const currentActiveData = prevDualData[activeLanguage];
      const newActiveData = typeof updater === 'function' ? updater(currentActiveData) : updater;

      return {
        ...prevDualData,
        [activeLanguage]: newActiveData,
      };
    });
  };

  const handleCopyStructureFromOtherLanguage = () => {
    setResumeData(prev => {
      const source = prev[inactiveLanguage];
      const target = prev[activeLanguage];
      const customSectionsData = source.sectionOrder.reduce<ResumeData['customSectionsData']>((acc, section) => {
        if (!['personalInfo', 'summary', 'experience', 'education', 'skills'].includes(section)) {
          acc[section] = target.customSectionsData[section] || [];
        }
        return acc;
      }, {});

      return {
        ...prev,
        [activeLanguage]: {
          ...target,
          sectionOrder: [...source.sectionOrder],
          sectionTitles: { ...source.sectionTitles },
          sectionTypes: { ...source.sectionTypes },
          customSectionsData: {
            ...target.customSectionsData,
            ...customSectionsData,
          },
        },
      };
    });

    toast.success(isRtl ? 'تم نسخ هيكل الأقسام فقط بدون نسخ النصوص.' : 'Section structure copied without copying text.');
  };

  const handleExportBackup = () => {
    try {
      const jsonStr = JSON.stringify({
        id: currentResume.id,
        name: currentResume.name,
        data: currentResume.data,
        options: currentResume.options,
      }, null, 2);

      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentResume.name.replace(/\s+/g, '-')}-backup.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(isRtl ? 'تم تصدير النسخة الاحتياطية بنجاح.' : 'Backup JSON file exported successfully.');
    } catch (err) {
      toast.error(isRtl ? 'تعذر تصدير ملف النسخة الاحتياطية.' : 'Error during file export.');
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = eventReader => {
      try {
        const parsed = JSON.parse(eventReader.target?.result as string);
        if (!isRecord(parsed) || !parsed.data || !isTemplateOptions(parsed.options)) {
          toast.error(isRtl ? 'صيغة ملف النسخة الاحتياطية غير صالحة.' : 'Unsupported or invalid backup JSON.');
          return;
        }

        let injectedData: unknown = parsed.data;
        if (isResumeData(injectedData)) {
          injectedData = {
            en: { ...injectedData },
            ar: JSON.parse(JSON.stringify(injectedData)),
          };
        }

        if (!isDualResumeData(injectedData)) {
          toast.error(isRtl ? 'صيغة ملف النسخة الاحتياطية غير صالحة.' : 'Unsupported or invalid backup JSON.');
          return;
        }

        setResumeData(injectedData);
        setTemplateOptions(parsed.options);
        if (typeof parsed.name === 'string' && parsed.name.trim()) {
          renameResume(currentResume.id, parsed.name);
        }
        toast.success(isRtl ? 'تم استيراد النسخة الاحتياطية بنجاح.' : 'Resume backup imported successfully.');
      } catch (err) {
        toast.error(isRtl ? 'تعذر قراءة ملف JSON.' : 'Failed to parse JSON backup.');
      }
    };

    fileReader.readAsText(file);
    event.target.value = '';
  };

  const handleImportResumeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const confirmed = window.confirm(
      isRtl
        ? 'سيتم استبدال محتوى النسخة الحالية فقط. هل تريد المتابعة؟'
        : 'The current version content will be replaced. Do you want to continue?',
    );

    if (!confirmed) {
      toast(isRtl ? 'تم إلغاء الاستيراد.' : 'Import cancelled.');
      return;
    }

    setIsImportingResume(true);
    setImportBanner(null);

    try {
      const extractedText = await extractResumeTextFromFile(file);
      if (!extractedText.trim()) {
        toast.error(isRtl ? 'لم نتمكن من استخراج أي نص من الملف. جرّب ملف PDF أو DOCX يحتوي على نص قابل للنسخ.' : 'No text could be extracted from this file. Try a text-based PDF or DOCX.');
        return;
      }

      let importedSection = 'personalInfo';
      setResumeData(prevDualData => {
        const currentActiveData = prevDualData[activeLanguage];
        const importedData = importResumeTextIntoData(currentActiveData, extractedText);
        importedSection = getFirstImportedSection(currentActiveData, importedData);

        return {
          ...prevDualData,
          [activeLanguage]: importedData,
        };
      });

      setActiveTab('content');
      setMobileView('form');
      setOpenSection(importedSection);
      setFocusSection(importedSection);
      window.setTimeout(() => setFocusSection(null), 1400);
      setImportBanner(isRtl ? 'تم الاستيراد — راجع البيانات وعدّل ما تحتاج' : 'Imported — review the data and edit anything you need.');
      toast.success(isRtl ? 'تم الاستيراد — راجع البيانات وعدّل ما تحتاج.' : 'Imported. Review the data and edit anything you need.');
    } catch (error) {
      const message = error instanceof Error && error.message === 'UNSUPPORTED_FILE_TYPE'
        ? (isRtl ? 'نوع الملف غير مدعوم. ارفع ملف PDF أو DOCX فقط.' : 'Unsupported file type. Upload PDF or DOCX only.')
        : (isRtl ? 'تعذر استيراد السيرة. تأكد أن الملف غير تالف ويحتوي على نص قابل للاستخراج.' : 'Could not import this resume. Make sure the file is not corrupted and contains extractable text.');
      toast.error(message);
    } finally {
      setIsImportingResume(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col">
      <Toaster position="bottom-right" toastOptions={{ className: 'bg-white dark:bg-gray-700 dark:text-white' }} />
      <Header
        theme={theme}
        setTheme={setTheme}
        resumes={resumes}
        activeResumeId={activeResumeId}
        setActiveResumeId={setActiveResumeId}
        addResume={addResume}
        deleteResume={deleteResume}
        renameResume={renameResume}
        currentResumeName={currentResume.name}
        user={user}
        signOut={signOut}
        saveStatus={saveStatus}
        onRetrySave={onRetrySave}
      />

      <main className="container mx-auto px-3 sm:px-4 py-5 lg:py-8 flex-grow space-y-5">
        <section className="bg-card border border-border rounded-2xl shadow-sm p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#00B5A5]/10 px-3 py-1 text-xs font-bold text-[#00796f] dark:text-[#65fff1]">
                  {activeLanguage === 'ar' ? 'تعدل الآن النسخة العربية' : 'You are editing the English version'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isRtl ? 'هذه ليست ترجمة تلقائية؛ اكتب محتوى مناسبًا لكل سوق.' : 'This is not an auto-translation. Write content for each market.'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{activeLanguage === 'ar' ? 'اكتمال العربية' : 'English completion'}: <strong className="text-foreground">{currentCompletion}%</strong></span>
                <span>{inactiveLanguage === 'ar' ? 'اكتمال العربية' : 'English completion'}: <strong className="text-foreground">{otherCompletion}%</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeLanguage === 'ar' ? 'bg-[#00B5A5] text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeLanguage === 'en' ? 'bg-[#00B5A5] text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  English
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopyStructureFromOtherLanguage}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-accent transition-colors"
              >
                {isRtl ? 'نسخ هيكل الأقسام فقط' : 'Copy section structure'}
              </button>
            </div>
          </div>
        </section>

        <div className="lg:hidden bg-card border border-border rounded-2xl p-1.5 flex gap-1">
          <button
            type="button"
            onClick={() => setMobileView('form')}
            className={`flex-1 rounded-xl py-2 text-xs font-bold ${mobileView === 'form' ? 'bg-[#00B5A5] text-white' : 'text-muted-foreground'}`}
          >
            {isRtl ? 'النموذج' : 'Form'}
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 rounded-xl py-2 text-xs font-bold ${mobileView === 'preview' ? 'bg-[#00B5A5] text-white' : 'text-muted-foreground'}`}
          >
            {isRtl ? 'المعاينة' : 'Preview'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          <div className={`${mobileView === 'preview' ? 'hidden lg:block' : 'block'} lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4`}>
            <div className="bg-card border border-border p-1.5 rounded-2xl shadow-sm flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'content'
                    ? 'bg-[#00B5A5] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <PencilIcon />
                <span>{isRtl ? 'المحتوى' : 'Content'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'design'
                    ? 'bg-[#00B5A5] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l4.96-4.96m-4.96 4.96a15.918 15.918 0 011.83-3.19a4.89 4.89 0 00-6.101-6.102a15.82 15.82 0 013.19 1.83l4.96-4.96" />
                </svg>
                <span>{isRtl ? 'التصميم' : 'Layout'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ats')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'ats'
                    ? 'bg-[#00B5A5] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <TargetIcon className="w-4 h-4" />
                <span>{isRtl ? 'فحص ATS' : 'ATS Checker'}</span>
              </button>
            </div>

            {activeTab === 'content' && (
              <div className="space-y-4">
                {importBanner && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {importBanner}
                  </div>
                )}
                <ResumeForm
                  resumeData={activeData}
                  setResumeData={handleSetLanguageSpecificResumeData}
                  openSection={openSection}
                  setOpenSection={setOpenSection}
                  focusSection={focusSection}
                />
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-4 animate-fade-in">
                <TemplateControls options={currentResume.options} setOptions={setTemplateOptions} language={activeLanguage} />
                <div className="p-4 bg-card rounded-2xl border border-border shadow-sm flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {isRtl ? 'النسخ الاحتياطي والاستيراد' : 'Backup & Portability'}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {isRtl
                      ? 'احتفظ بنسخة JSON من بيانات السيرة لاستعادتها لاحقًا أو نقلها بين الأجهزة.'
                      : 'Download your backup file as JSON to keep your data safe and use it on other machines.'}
                  </p>
                  <label className={`flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${isImportingResume ? 'pointer-events-none bg-muted text-muted-foreground' : 'bg-[#00B5A5] text-white hover:bg-[#009f92]'}`}>
                    {isImportingResume ? (isRtl ? 'جار الاستيراد...' : 'Importing...') : (isRtl ? 'استيراد سيرة PDF / DOCX' : 'Import PDF / DOCX')}
                    <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleImportResumeFile} className="hidden" disabled={isImportingResume} />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold border border-border bg-background hover:bg-accent rounded-xl transition-all"
                    >
                      {isRtl ? 'تصدير JSON' : 'Export JSON'}
                    </button>
                    <label className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold border border-border bg-background hover:bg-accent rounded-xl transition-all cursor-pointer">
                      {isRtl ? 'استيراد JSON' : 'Import JSON'}
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ats' && (
              <AtsAnalysis data={activeData} onSelectSection={openEditorSection} />
            )}
          </div>

          <div className={`${mobileView === 'form' ? 'hidden lg:block' : 'block'} lg:col-span-7 xl:col-span-8`}>
            <ResumePreview
              data={activeData}
              options={currentResume.options}
              setOptions={setTemplateOptions}
              onOpenLongestSection={() => openEditorSection(getLongestSectionKey(activeData))}
              onExportBackup={handleExportBackup}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const AppRoot: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const isRtl = language === 'ar';

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string>('');
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const profileHydratedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      profileHydratedRef.current = false;
      setDbLoading(false);
      return;
    }

    const initUserData = async () => {
      setDbLoading(true);
      try {
        const migrationResult = await resumeService.migrateLocalStorageData(user.id);
        localStorage.removeItem('isGuestMode');

        if (migrationResult) {
          setResumes(migrationResult.resumes);
          setActiveResumeId(migrationResult.activeResumeId || migrationResult.resumes[0].id);
          setTheme(migrationResult.theme);
          setLanguage(migrationResult.language);
          profileHydratedRef.current = true;
          toast.success(isRtl ? 'تمت مزامنة بياناتك السابقة مع الحساب.' : 'Your previous data was synchronized with your account.');
          return;
        }

        const cloudResumes = await resumeService.getResumes(user.id);
        const profile = await resumeService.getProfile(user.id);
        setTheme(profile.theme || 'light');
        setLanguage(profile.language || 'en');

        if (cloudResumes.length === 0) {
          const initialResume = createNewResumeObj([]);
          await resumeService.createResume(user.id, initialResume);
          await resumeService.upsertProfile({ id: user.id, active_resume_id: initialResume.id });
          setResumes([initialResume]);
          setActiveResumeId(initialResume.id);
        } else {
          setResumes(cloudResumes);
          const savedActiveId = profile.active_resume_id;
          setActiveResumeId(savedActiveId && cloudResumes.some(r => r.id === savedActiveId) ? savedActiveId : cloudResumes[0].id);
        }

        profileHydratedRef.current = true;
      } catch (err) {
        console.error('Error fetching/migrating cloud resume data:', err);
        toast.error(isRtl ? 'تعذر جلب بيانات الحساب. تم فتح مساحة مؤقتة.' : 'Could not synchronize your account data. A temporary workspace was opened.');
        setResumes([createNewResumeObj([])]);
        profileHydratedRef.current = false;
      } finally {
        setDbLoading(false);
        setSaveStatus('saved');
      }
    };

    initUserData();
  }, [isRtl, setLanguage, user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (user && profileHydratedRef.current && !dbLoading) {
      resumeService.upsertProfile({ id: user.id, theme })
        .catch(err => console.error('Error saving theme profile:', err));
    } else {
      localStorage.setItem('theme', theme);
    }
  }, [theme, user, dbLoading]);

  useEffect(() => {
    if (user && profileHydratedRef.current && !dbLoading) {
      resumeService.upsertProfile({ id: user.id, language })
        .catch(err => console.error('Error saving language profile:', err));
    } else {
      localStorage.setItem('language', language);
    }
  }, [language, user, dbLoading]);

  const currentResume = useMemo(() => {
    return resumes.find(r => r.id === activeResumeId) || null;
  }, [resumes, activeResumeId]);

  const handleSetActiveResumeId = useCallback((id: string) => {
    setActiveResumeId(id);
    if (user) {
      resumeService.upsertProfile({ id: user.id, active_resume_id: id })
        .catch(err => console.error('Error saving active resume profile:', err));
    }
  }, [user]);

  const setResumeData = (updater: React.SetStateAction<DualResumeData>) => {
    setSaveStatus('saving');
    setResumes(prevResumes => {
      const updated = prevResumes.map(resume => {
        if (resume.id !== activeResumeId) return resume;
        const nextData = typeof updater === 'function' ? updater(resume.data) : updater;
        return { ...resume, data: nextData };
      });

      const currentActive = updated.find(resume => resume.id === activeResumeId);
      if (currentActive && user) {
        resumeService.updateResumeDebounced(user.id, activeResumeId, { data: currentActive.data })
          .then(() => setSaveStatus('saved'))
          .catch(err => {
            console.error('Error during data debounce save:', err);
            setSaveStatus('error');
          });
      } else {
        localStorage.setItem('resumes', JSON.stringify(updated));
        setSaveStatus('saved');
      }

      return updated;
    });
  };

  const setTemplateOptions = (options: TemplateOptions) => {
    setSaveStatus('saving');
    setResumes(prev => {
      const updated = prev.map(resume => resume.id === activeResumeId ? { ...resume, options } : resume);
      if (user) {
        resumeService.updateResumeDebounced(user.id, activeResumeId, { options })
          .then(() => setSaveStatus('saved'))
          .catch(err => {
            console.error('Error saving template options:', err);
            setSaveStatus('error');
          });
      } else {
        localStorage.setItem('resumes', JSON.stringify(updated));
        setSaveStatus('saved');
      }
      return updated;
    });
  };

  const retrySave = () => {
    if (!user || !currentResume) return;

    setSaveStatus('saving');
    resumeService.updateResumeImmediate(user.id, currentResume.id, {
      name: currentResume.name,
      data: currentResume.data,
      options: currentResume.options,
    })
      .then(() => {
        setSaveStatus('saved');
        toast.success(isRtl ? 'تمت إعادة المحاولة والحفظ بنجاح.' : 'Retry saved successfully.');
      })
      .catch(err => {
        console.error('Manual retry save failed:', err);
        setSaveStatus('error');
        toast.error(isRtl ? 'تعذر الحفظ. تحقق من الاتصال ثم حاول مرة أخرى.' : 'Save failed. Check your connection and try again.');
      });
  };

  const addResume = async () => {
    const newResume = createNewResumeObj(resumes);
    try {
      if (user) {
        await resumeService.createResume(user.id, newResume);
      }
      setResumes(prev => [...prev, newResume]);
      handleSetActiveResumeId(newResume.id);
      toast.success(isRtl ? 'تم إنشاء سيرة ذاتية جديدة.' : 'New resume created.');
    } catch (err) {
      console.error('Failed to create resume:', err);
      toast.error(isRtl ? 'تعذر إنشاء السيرة الجديدة.' : 'Failed to create the new resume.');
    }
  };

  const deleteResume = async (id: string) => {
    if (resumes.length <= 1) {
      toast.error(isRtl ? 'لا يمكن حذف آخر سيرة ذاتية في الحساب.' : "You can't delete your last resume.");
      return;
    }

    toast(toastInstance => (
      <div className="flex flex-col items-center p-4 bg-card rounded-2xl shadow-lg ring-1 ring-border text-start">
        <p className="text-center font-semibold mb-2 text-card-foreground">
          {isRtl ? 'حذف هذه السيرة الذاتية؟' : 'Delete this resume?'}
        </p>
        <p className="text-sm text-center text-muted-foreground mb-4">
          {isRtl ? 'لا يمكن التراجع عن الحذف بعد تأكيده.' : 'This action cannot be undone.'}
        </p>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={() => toast.dismiss(toastInstance.id)}
            className="w-full px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                toast.dismiss(toastInstance.id);
                if (user) {
                  await resumeService.deleteResume(user.id, id);
                }
                const nextResumes = resumes.filter(resume => resume.id !== id);
                setResumes(nextResumes);
                if (activeResumeId === id) {
                  handleSetActiveResumeId(nextResumes[0].id);
                }
                toast.success(isRtl ? 'تم حذف السيرة الذاتية.' : 'Resume deleted.');
              } catch (err) {
                console.error('Failed to delete resume:', err);
                toast.error(isRtl ? 'تعذر حذف السيرة الذاتية.' : 'Deletion failed.');
              }
            }}
            className="w-full px-3 py-1.5 text-sm font-semibold bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive"
          >
            {isRtl ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    ), { duration: 6000, position: 'top-center' });
  };

  const renameResume = (id: string, newName: string) => {
    setSaveStatus('saving');
    setResumes(prev => {
      const updated = prev.map(resume => resume.id === id ? { ...resume, name: newName } : resume);
      if (user) {
        resumeService.updateResumeDebounced(user.id, id, { name: newName })
          .then(() => setSaveStatus('saved'))
          .catch(err => {
            console.error('Error saving updated name:', err);
            setSaveStatus('error');
          });
      } else {
        localStorage.setItem('resumes', JSON.stringify(updated));
        setSaveStatus('saved');
      }
      return updated;
    });
  };

  if (authLoading || (user && dbLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-muted-foreground animate-pulse">
            {isRtl ? 'جار تجهيز مساحة العمل...' : 'Preparing your workspace...'}
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login theme={theme} setTheme={setTheme} />;
  }

  if (!currentResume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="w-10 h-10 border-4 border-dashed border-blue-500 rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground mt-4">
          {isRtl ? 'جار فتح السيرة الذاتية...' : 'Opening resume workspace...'}
        </span>
      </div>
    );
  }

  return (
    <MainAppContent
      theme={theme}
      setTheme={setTheme}
      resumes={resumes}
      activeResumeId={activeResumeId}
      setActiveResumeId={handleSetActiveResumeId}
      currentResume={currentResume}
      setResumeData={setResumeData}
      setTemplateOptions={setTemplateOptions}
      addResume={addResume}
      deleteResume={deleteResume}
      renameResume={renameResume}
      user={user}
      signOut={signOut}
      saveStatus={saveStatus}
      onRetrySave={retrySave}
    />
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppRoot />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
