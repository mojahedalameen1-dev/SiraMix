import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const translations = {
  header: {
    title: { en: 'SiraMix', ar: 'SiraMix' },
    selectResume: { en: 'Select Resume', ar: 'اختر السيرة الذاتية' },
    renameResume: { en: 'Rename resume', ar: 'إعادة تسمية السيرة الذاتية' },
    addNewResume: { en: 'Add new resume', ar: 'إضافة سيرة ذاتية جديدة' },
    deleteCurrentResume: { en: 'Delete current resume', ar: 'حذف السيرة الذاتية الحالية' },
    toggleTheme: { en: 'Toggle theme', ar: 'تبديل السمة' },
  },
  form: {
    personalInfo: { en: 'Personal Info', ar: 'المعلومات الشخصية' },
    fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
    jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي' },
    email: { en: 'Email', ar: 'البريد الإلكتروني' },
    phone: { en: 'Phone', ar: 'الهاتف' },
    location: { en: 'Location', ar: 'الموقع' },
    website: { en: 'Website/Portfolio', ar: 'الموقع الإلكتروني/ملف الأعمال' },
    summary: { en: 'Summary', ar: 'الملخص' },
    summaryPlaceholder: { en: 'A brief summary about your professional background...', ar: 'ملخص موجز عن خلفيتك المهنية...' },
    experience: { en: 'Experience', ar: 'الخبرة' },
    education: { en: 'Education', ar: 'التعليم' },
    skills: { en: 'Skills', ar: 'المهارات' },
    company: { en: 'Company', ar: 'الشركة' },
    startDate: { en: 'Start Date', ar: 'تاريخ البدء' },
    endDate: { en: 'End Date', ar: 'تاريخ الانتهاء' },
    description: { en: 'Description', ar: 'الوصف' },
    institution: { en: 'Institution', ar: 'المؤسسة التعليمية' },
    degree: { en: 'Degree/Major', ar: 'الشهادة/التخصص' },
    addSkillPlaceholder: { en: 'e.g., React, TypeScript', ar: 'مثال: React, TypeScript' },
    addSkillInstruction: { en: 'Type a skill and press Enter or comma to add it.', ar: 'اكتب مهارة واضغط على Enter أو فاصلة لإضافتها.' },
    removeSkill: { en: 'Remove', ar: 'إزالة' },
    addNewSection: { en: 'Add New Section', ar: 'إضافة قسم جديد' },
    newSectionTitlePlaceholder: { en: 'New section title (e.g., Projects)', ar: 'عنوان القسم الجديد (مثال: المشاريع)' },
    cancel: { en: 'Cancel', ar: 'إلغاء' },
    addSection: { en: 'Add Section', ar: 'إضافة قسم' },
    deleteSectionTitle: { en: 'Delete', ar: 'حذف' },
    deleteSectionMessage: { en: 'This action cannot be undone.', ar: 'لا يمكن التراجع عن هذا الإجراء.' },
    delete: { en: 'Delete', ar: 'حذف' },
    generateWithAI: { en: 'Spark with AI', ar: 'صياغة بالذكاء الاصطناعي' },
    generating: { en: 'Generating...', ar: 'جاري الصياغة...' },
  },
  formPlaceholders: {
    primaryText: { en: 'Title / Role', ar: 'العنوان / الدور' },
    secondaryText: { en: 'Subtitle / Company', ar: 'العنوان الفرعي / الشركة' },
    startDate: { en: 'Start Date', ar: 'تاريخ البدء' },
    endDate: { en: 'End Date', ar: 'تاريخ الانتهاء' },
    description: { en: 'Description', ar: 'الوصف' },
    projectName: { en: 'Project Name', ar: 'اسم المشروع' },
    techStack: { en: 'Tech Stack (e.g., React, Node.js)', ar: 'التقنيات المستخدمة (مثال: React, Node.js)' },
    certificationName: { en: 'Certification Name', ar: 'اسم الشهادة' },
    issuingOrg: { en: 'Issuing Organization', ar: 'الجهة المانحة' },
    dateIssued: { en: 'Date Issued', ar: 'تاريخ الإصدار' },
    awardName: { en: 'Award Name', ar: 'اسم الجائزة' },
    awardingBody: { en: 'Awarding Body', ar: 'الجهة المانحة' },
    dateReceived: { en: 'Date Received', ar: 'تاريخ الاستلام' },
    language: { en: 'Language', ar: 'اللغة' },
    proficiency: { en: 'Proficiency (e.g., Native, Fluent)', ar: 'المستوى (مثال: لغة أم, طليق)' },
  },
  section: {
    noItems: { en: "No items added yet. Click 'Add New' to start.", ar: "لم تتم إضافة أي عناصر بعد. انقر فوق 'إضافة جديد' للبدء." },
    addNew: { en: 'Add New', ar: 'إضافة جديد' },
    renameSection: { en: 'Rename section', ar: 'إعادة تسمية القسم' },
    deleteSection: { en: 'Delete section', ar: 'حذف القسم' },
  },
  templateControls: {
    template: { en: 'Template', ar: 'النموذج' },
    accentColor: { en: 'Accent Color', ar: 'اللون المميز' },
    fontFamily: { en: 'Font Family', ar: 'نوع الخط' },
    fontSize: { en: 'Font Size', ar: 'حجم الخط' },
  },
  resumePreview: {
    exportResume: { en: 'Export Resume', ar: 'تصدير السيرة الذاتية' },
    asPDF: { en: 'as PDF', ar: 'كملف PDF' },
    asWord: { en: 'as Word (.doc)', ar: 'كملف Word (.doc)' },
    asJPG: { en: 'as Image (.jpg)', ar: 'كصورة (.jpg)' },
    contact: { en: 'Contact', ar: 'معلومات الاتصال' },
  },
  customSectionTypes: {
    default: { en: 'Generic List', ar: 'قائمة عامة' },
    projects: { en: 'Projects', ar: 'المشاريع' },
    certifications: { en: 'Certifications', ar: 'الشهادات' },
    awards: { en: 'Awards', ar: 'الجوائز' },
    languages: { en: 'Languages', ar: 'اللغات' },
  },
  toasts: {
    autosaved: { en: 'Auto-saved!', ar: 'تم الحفظ تلقائيًا!' },
    newResume: { en: 'New resume created.', ar: 'تم إنشاء سيرة ذاتية جديدة.' },
    deleteError: { en: "You can't delete the last resume.", ar: 'لا يمكنك حذف آخر سيرة ذاتية.' },
    deleteSuccess: { en: 'Resume deleted.', ar: 'تم حذف السيرة الذاتية.' },
    sectionCreated: { en: 'Section "{title}" created.', ar: 'تم إنشاء قسم "{title}".' },
    sectionDeleted: { en: 'Section deleted.', ar: 'تم حذف القسم.' },
  },
  footer: {
    credit: { en: 'Developed by Mojahed alameen', ar: 'تم تنفيذه من قبل المهندس Mojahed alameen' }
  },
};

const getNestedTranslation = (obj: any, path: string): { [key in Language]: string } | undefined => {
  try {
    const value = path.split('.').reduce((o, i) => o[i], obj);
    return value;
  } catch (error) {
    return undefined;
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    const htmlEl = document.documentElement;
    htmlEl.lang = language;
    htmlEl.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (language === 'ar') {
      document.body.classList.add('font-shamel');
      document.body.classList.remove('font-sans');
    } else {
      document.body.classList.add('font-sans');
      document.body.classList.remove('font-shamel');
    }
  }, [language]);

  // FIX: Replaced JSX with React.createElement to fix parsing errors in .ts file.
  // The errors indicated that JSX syntax was not being correctly processed.
  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage } },
    children
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { language } = useLanguage();
  const t = (key: string, replacements?: { [key: string]: string }, fallback?: string): string => {
    const translationObj = getNestedTranslation(translations, key);
    let translation = translationObj ? translationObj[language] : (fallback || key);
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, replacements[rKey]);
        });
    }
    return translation;
  };

  return { t, language };
};