import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Resume, ResumeData, TemplateOptions, DualResumeData } from './types';
import { DEFAULT_DUAL_RESUME_DATA, DEFAULT_TEMPLATE_OPTIONS } from './constants';
import Header from './components/Header';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import TemplateControls from './components/TemplateControls';
import { AtsAnalysis } from './components/AtsAnalysis';
import { Toaster, toast } from 'react-hot-toast';
import { LanguageProvider, useLanguage, useTranslation } from './i18n';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './components/AuthContext';
import { resumeService } from './services/resumeService';
import { Login } from './components/Login';

// Icons for Workspace Tabs
import { PencilIcon } from './components/icons/PencilIcon';
import { TargetIcon } from './components/icons/TargetIcon';

function createNewResumeObj(existingResumes: Resume[] = []): Resume {
    const newId = crypto.randomUUID();
    return {
        id: newId,
        name: `Untitled Resume ${existingResumes.length + 1}`,
        data: DEFAULT_DUAL_RESUME_DATA,
        options: DEFAULT_TEMPLATE_OPTIONS,
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

// Main Workspace Component
const MainAppContent: React.FC<{
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  resumes: Resume[];
  setResumes: React.Dispatch<React.SetStateAction<Resume[]>>;
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
}> = ({
  theme,
  setTheme,
  resumes,
  setResumes,
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
}) => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const isRtl = language === 'ar';
  const activeLanguage = language as 'en' | 'ar';
  const activeData = currentResume.data[activeLanguage];

  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'ats'>('content');

  const handleSetLanguageSpecificResumeData = (updater: React.SetStateAction<ResumeData>) => {
    setResumeData(prevDualData => {
      const currentActiveData = prevDualData[activeLanguage];
      const newActiveData = typeof updater === 'function' ? updater(currentActiveData) : updater;
      return {
        ...prevDualData,
        [activeLanguage]: newActiveData
      };
    });
  };

  // Backup & Restore Actions
  const handleExportBackup = () => {
    try {
      const jsonStr = JSON.stringify({
        id: currentResume.id,
        name: currentResume.name,
        data: currentResume.data,
        options: currentResume.options
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
      
      toast.success(isRtl ? 'تم تصدير النسخة الاحتياطية كملف JSON بنجاح!' : 'Backup JSON file exported successfully!');
    } catch (err) {
      toast.error(isRtl ? 'حدث خطأ أثناء تصدير الملف.' : 'Error during file export.');
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (isRecord(parsed) && parsed.data && isTemplateOptions(parsed.options)) {
          let injectedData: unknown = parsed.data;
          
          // Check for legacy flat import and migrate it instantly
          if (isResumeData(injectedData)) {
             injectedData = {
               en: { ...injectedData },
               ar: JSON.parse(JSON.stringify(injectedData))
             };
          }

          if (!isDualResumeData(injectedData)) {
            toast.error(isRtl ? 'صيغة ملف غير صالحة.' : 'Unsupported or invalid backup JSON.');
            return;
          }
          
          setResumeData(injectedData);
          setTemplateOptions(parsed.options);
          if (typeof parsed.name === 'string' && parsed.name.trim()) {
            renameResume(currentResume.id, parsed.name);
          }
          toast.success(isRtl ? 'تمت استعادة نسخة الاحتياطي وحقن البيانات بنجاح!' : 'Resume backup imported successfully!');
        } else {
          toast.error(isRtl ? 'صيغة ملف غير صالحة.' : 'Unsupported or invalid backup JSON.');
        }
      } catch (err) {
        toast.error(isRtl ? 'فشل تحليل ملف JSON.' : 'Failed to parse JSON backup.');
      }
    };
    fileReader.readAsText(file);
    // Reset file input value so same file can be uploaded again
    event.target.value = '';
  };

  return (
    <div className={`min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col`}>
      <Toaster position="bottom-right" toastOptions={{
        className: 'bg-white dark:bg-gray-700 dark:text-white',
      }} />
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
      />
      
      <main className="container mx-auto px-4 py-8 flex-grow space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Workspace Sidebar Hub Section */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-4">
            
            {/* Visual Custom Mode Tabs selector */}
            <div className="bg-card border border-border p-1.5 rounded-2xl shadow-sm flex items-center justify-between gap-1">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'content'
                    ? 'bg-[#00B5A5] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <PencilIcon />
                <span>{isRtl ? '📝 المحتوى' : '📝 Content'}</span>
              </button>

              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'design'
                    ? 'bg-[#00B5A5] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {/* Embedded palette SVG */}
                <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l4.96-4.96m-4.96 4.96a15.918 15.918 0 011.83-3.19a4.89 4.89 0 00-6.101-6.102a15.82 15.82 0 013.19 1.83l4.96-4.96" />
                </svg>
                <span>{isRtl ? '🎨 التصميم' : '🎨 Layout'}</span>
              </button>

              <button
                onClick={() => setActiveTab('ats')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
                  activeTab === 'ats'
                    ? 'bg-[#00B5A5] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <TargetIcon className="w-4 h-4" />
                <span>{isRtl ? '🎯 فحص ATS' : '🎯 ATS Checker'}</span>
                
                {/* Active check bubble alert */}
                <span className="absolute -top-1 -end-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>
            </div>
 
            {/* Content workspace render based on state */}
            <div className="transition-all duration-300">
              {activeTab === 'content' && (
                <div className="space-y-4 animate-fade-in">
                  <ResumeForm resumeData={activeData} setResumeData={handleSetLanguageSpecificResumeData} />
                </div>
              )}
              
              {activeTab === 'design' && (
                <div className="space-y-4 animate-fade-in animate-slide-down">
                  <TemplateControls options={currentResume.options} setOptions={setTemplateOptions} />
                  
                  {/* Backup Section */}
                  <div className="p-4 bg-card rounded-2xl border border-border shadow-sm flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {isRtl ? 'النسخ الاحتياطي والبيانات' : 'Backup & Portability'}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {isRtl 
                        ? 'قم بتحميل ملف السيرة الذاتية بصيغة JSON على جهازك للرجوع إليه وتعديله في أي وقت لاحق.' 
                        : 'Download your backup file as JSON to keep your valuable data safe and use it on other machines.'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={handleExportBackup}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold border border-border bg-background hover:bg-accent rounded-xl transition-all"
                      >
                        {/* Download link icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{isRtl ? 'حفظ نسخة JSON' : 'Export JSON'}</span>
                      </button>

                      <label className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold border border-border bg-background hover:bg-accent rounded-xl transition-all cursor-pointer">
                        {/* Upload icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>{isRtl ? 'استيراد JSON' : 'Import JSON'}</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'ats' && (
                <div className="space-y-4 animate-fade-in animate-slide-up">
                  <AtsAnalysis data={activeData} />
                </div>
              )}
            </div>

          </div>
          
          {/* Live High-Fidelity Preview Column */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ResumePreview data={activeData} options={currentResume.options} />
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Core APP UI orchestration
const AppRoot: React.FC = () => {
  const { user, signOut, loading: authLoading, signInWithGoogle } = useAuth();
  const { language, setLanguage } = useLanguage();
  const isRtl = language === 'ar';

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string>('');
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const profileHydratedRef = useRef(false);

  // Load cloud data upon authentication
  useEffect(() => {
    if (!user) {
      profileHydratedRef.current = false;
      setDbLoading(false);
      return;
    }

    const initUserData = async () => {
      setDbLoading(true);
      try {
        // 1. Check & execute local storage migration for the first time
        const migrationResult = await resumeService.migrateLocalStorageData(user.id);
        
        // Remove guest flag as they are now securely logged in
        localStorage.removeItem('isGuestMode');

        if (migrationResult) {
          setResumes(migrationResult.resumes);
          setActiveResumeId(migrationResult.activeResumeId || migrationResult.resumes[0].id);
          setTheme(migrationResult.theme);
          setLanguage(migrationResult.language);
          profileHydratedRef.current = true;
          toast.success(isRtl ? 'تمت مزامنة بياناتك السابقة مع السحابة للتنقل بأمان!' : 'Migrated your legacy templates successfully into the cloud!');
        } else {
          // 2. No migration needed, fetch directly from cloud DB
          const cloudResumes = await resumeService.getResumes(user.id);
          const profile = await resumeService.getProfile(user.id);

          setTheme(profile.theme || 'light');
          setLanguage(profile.language || 'en');

          if (cloudResumes.length === 0) {
            // First time user with empty cloud, generate default
            const initialResume = createNewResumeObj([]);
            await resumeService.createResume(user.id, initialResume);
            
            await resumeService.upsertProfile({
              id: user.id,
              active_resume_id: initialResume.id,
            });

            setResumes([initialResume]);
            setActiveResumeId(initialResume.id);
          } else {
            setResumes(cloudResumes);
            const savedActiveId = profile.active_resume_id;
            if (savedActiveId && cloudResumes.some(r => r.id === savedActiveId)) {
              setActiveResumeId(savedActiveId);
            } else {
              setActiveResumeId(cloudResumes[0].id);
            }
          }
          profileHydratedRef.current = true;
        }
      } catch (err) {
        console.error('Error fetching/migrating cloud resume data:', err);
        toast.error(isRtl ? 'عذرًا، حدث خطأ أثناء جلب بيانات السحابة.' : 'Could not synchronize database resources.');
        // Prevent complete block, fallback to fresh client-side template
        setResumes([createNewResumeObj([])]);
        profileHydratedRef.current = false;
      } finally {
        setDbLoading(false);
      }
    };

    initUserData();
  }, [user]);

  // Synchronize Dark / Light toggling
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (user && profileHydratedRef.current && !dbLoading) {
      resumeService.upsertProfile({ id: user.id, theme })
        .catch(err => console.error('Error saving theme profile:', err));
    }
  }, [theme, user, dbLoading]);

  // Synchronize Language Toggling
  useEffect(() => {
    if (user && profileHydratedRef.current && !dbLoading) {
      resumeService.upsertProfile({ id: user.id, language })
        .catch(err => console.error('Error saving language profile:', err));
    }
  }, [language, user, dbLoading]);

  // Active resume calculation helper
  const currentResume = useMemo(() => {
    return resumes.find(r => r.id === activeResumeId) || null;
  }, [resumes, activeResumeId]);

  // Handle active resume ID changes dynamically
  const handleSetActiveResumeId = useCallback((id: string) => {
    setActiveResumeId(id);
    if (user) {
      resumeService.upsertProfile({ id: user.id, active_resume_id: id })
        .catch(err => console.error('Error saving active resume profile:', err));
    }
  }, [user]);

  // CRUD DB sync helpers
  const setResumeData = (updater: React.SetStateAction<DualResumeData>) => {
    setResumes(prevResumes => {
      const updated = prevResumes.map(r => {
        if (r.id !== activeResumeId) {
          return r;
        }
        const newResumeData =
          typeof updater === 'function' ? updater(r.data) : updater;
        
        return { ...r, data: newResumeData };
      });

      if (user) {
        const currentActive = updated.find(r => r.id === activeResumeId);
        if (currentActive) {
          resumeService.updateResumeDebounced(user.id, activeResumeId, { data: currentActive.data })
            .catch(err => console.error('Error during data debounce save:', err));
        }
      } else {
        localStorage.setItem('resumes', JSON.stringify(updated));
      }

      return updated;
    });
  };

  const setTemplateOptions = (options: TemplateOptions) => {
    setResumes(prev => {
      const updated = prev.map(r => r.id === activeResumeId ? { ...r, options } : r);
      if (user) {
        resumeService.updateResumeDebounced(user.id, activeResumeId, { options })
          .catch(err => console.error('Error saving template options:', err));
      }
      return updated;
    });
  };

  const addResume = async () => {
    const newResume = createNewResumeObj(resumes);
    if (user) {
      try {
        await resumeService.createResume(user.id, newResume);
        setResumes(prev => [...prev, newResume]);
        handleSetActiveResumeId(newResume.id);
        toast.success(isRtl ? 'تم إنشاء سيرة ذاتية إضافية جديدة!' : 'New cloud-persisted portfolio created!');
      } catch (err) {
        console.error('Failed to create additional resume tab:', err);
        toast.error(isRtl ? 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' : 'Failed saving new workspace to database.');
      }
    }
  };

  const deleteResume = async (id: string) => {
    if (resumes.length <= 1) {
        toast.error(isRtl ? 'لا يمكنك حذف سيرة ذاتية وحيدة.' : "You can't delete your last remaining template.");
        return;
    }

    toast((toastInstance) => (
      <div className="flex flex-col items-center p-4 bg-card rounded-2xl shadow-lg animate-fade-in ring-1 ring-border text-start">
        <p className="text-center font-semibold mb-2 text-card-foreground">
          {isRtl ? 'حذف هذا النموذج نهائيًا؟' : 'Delete Resume Profile?'}
        </p>
        <p className="text-sm text-center text-muted-foreground mb-4">
          {isRtl ? 'لا يمكن التراجع عن هذا الإجراء سحابيًا أو محليًا.' : 'This record will be permanently purged.'}
        </p>
        <div className="flex gap-2 w-full">
          <button
            onClick={() => toast.dismiss(toastInstance.id)}
            className="w-full px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={async () => {
              try {
                toast.dismiss(toastInstance.id);
                if (user) {
                  const loadingToast = toast.loading(isRtl ? 'جاري حذف الملف من السحابة...' : 'Deleting database entry...');
                  await resumeService.deleteResume(user.id, id);
                  toast.dismiss(loadingToast);
                }
                
                const newResumes = resumes.filter(r => r.id !== id);
                setResumes(newResumes);
                if (activeResumeId === id) {
                    handleSetActiveResumeId(newResumes[0].id);
                }
                
                toast.success(isRtl ? 'تم حذف الملف بنجاح.' : 'Resume profile deleted successfully.');
              } catch (err) {
                console.error('Failed to delete resume tab:', err);
                toast.error(isRtl ? 'فشل إتمام العملية بالكامل.' : 'Deletion failed.');
              }
            }}
            className="w-full px-3 py-1.5 text-sm font-semibold bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive"
          >
            {isRtl ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
    });
  };

  const renameResume = (id: string, newName: string) => {
    setResumes(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, name: newName } : r);
      if (user) {
        resumeService.updateResumeDebounced(user.id, id, { name: newName })
          .catch(err => console.error('Error saving updated name:', err));
      }
      return updated;
    });
  };

  // Render Loading States
  if (authLoading || (user && dbLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold font-mono text-muted-foreground animate-pulse">
            {isRtl ? 'جاري تهيئة مساحة العمل التفاعلية...' : 'Configuring secured cloud engine...'}
          </span>
        </div>
      </div>
    );
  }

  // Not signed in? Render login overlay screen
  if (!user) {
    return <Login theme={theme} setTheme={setTheme} />;
  }

  // No active resumed initialized yet?
  if (!currentResume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="w-10 h-10 border-4 border-dashed border-blue-500 rounded-full animate-spin"></div>
        <span className="text-xs font-mono text-muted-foreground mt-4">Initializing fresh workspace space...</span>
      </div>
    );
  }

  return (
    <MainAppContent
      theme={theme}
      setTheme={setTheme}
      resumes={resumes}
      setResumes={setResumes}
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
    />
  );
};

// Global App Root Mount Wrapper
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
