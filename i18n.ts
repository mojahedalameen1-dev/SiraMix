import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

type TranslationLeaf = { en: string; ar: string };
type TranslationTree = { [key: string]: TranslationLeaf | TranslationTree };

const translations: TranslationTree = {
  header: {
    selectResume: { en: 'Select resume', ar: 'اختر السيرة الذاتية' },
    renameResume: { en: 'Rename resume', ar: 'إعادة تسمية السيرة' },
    addNewResume: { en: 'Create resume', ar: 'إنشاء سيرة جديدة' },
    deleteCurrentResume: { en: 'Delete current resume', ar: 'حذف السيرة الحالية' },
    toggleTheme: { en: 'Toggle theme', ar: 'تبديل الوضع' },
    signOut: { en: 'Sign out', ar: 'تسجيل الخروج' },
    saveSaved: { en: 'Saved', ar: 'تم الحفظ' },
    saveSaving: { en: 'Saving...', ar: 'جار الحفظ...' },
    saveError: { en: 'Save failed', ar: 'تعذر الحفظ' },
    retrySave: { en: 'Retry', ar: 'إعادة المحاولة' },
  },
  form: {
    personalInfo: { en: 'Personal information', ar: 'المعلومات الشخصية' },
    fullName: { en: 'Full name', ar: 'الاسم الكامل' },
    jobTitle: { en: 'Target job title', ar: 'المسمى الوظيفي المستهدف' },
    email: { en: 'Email address', ar: 'البريد الإلكتروني' },
    phone: { en: 'Phone number', ar: 'رقم الجوال' },
    location: { en: 'City, country', ar: 'المدينة، الدولة' },
    website: { en: 'LinkedIn / portfolio', ar: 'لينكدإن أو الموقع الشخصي' },
    summary: { en: 'Professional summary', ar: 'الملخص المهني' },
    summaryPlaceholder: {
      en: 'Write 3-4 focused sentences about your experience, strengths, and target role.',
      ar: 'اكتب 3 إلى 4 جمل مركزة عن خبرتك ونقاط قوتك والوظيفة المستهدفة.',
    },
    experience: { en: 'Experience', ar: 'الخبرة' },
    education: { en: 'Education', ar: 'التعليم' },
    skills: { en: 'Skills', ar: 'المهارات' },
    company: { en: 'Company', ar: 'الشركة' },
    startDate: { en: 'Start date', ar: 'تاريخ البداية' },
    endDate: { en: 'End date', ar: 'تاريخ النهاية' },
    description: { en: 'Description and achievements', ar: 'الوصف والإنجازات' },
    institution: { en: 'Institution', ar: 'الجهة التعليمية' },
    degree: { en: 'Degree / major', ar: 'الشهادة أو التخصص' },
    addSkillPlaceholder: { en: 'Example: Project management, Excel, Sales', ar: 'مثال: إدارة المشاريع، Excel، المبيعات' },
    addSkillInstruction: { en: 'Type a skill and press Enter or comma.', ar: 'اكتب المهارة ثم اضغط Enter أو فاصلة.' },
    removeSkill: { en: 'Remove', ar: 'إزالة' },
    addNewSection: { en: 'Add section', ar: 'إضافة قسم جديد' },
    newSectionTitlePlaceholder: { en: 'Section title, e.g. Projects', ar: 'عنوان القسم، مثل: المشاريع' },
    cancel: { en: 'Cancel', ar: 'إلغاء' },
    addSection: { en: 'Add section', ar: 'إضافة القسم' },
    deleteSectionTitle: { en: 'Delete section', ar: 'حذف القسم' },
    deleteSectionMessage: { en: 'This action cannot be undone.', ar: 'لا يمكن التراجع عن هذا الإجراء.' },
    delete: { en: 'Delete', ar: 'حذف' },
    complete: { en: 'Complete', ar: 'مكتمل' },
    missingRequired: { en: 'Missing required fields', ar: 'حقول مهمة ناقصة' },
  },
  formPlaceholders: {
    primaryText: { en: 'Title / role', ar: 'العنوان أو الدور' },
    secondaryText: { en: 'Subtitle / company', ar: 'الوصف أو الجهة' },
    startDate: { en: 'Start date', ar: 'تاريخ البداية' },
    endDate: { en: 'End date', ar: 'تاريخ النهاية' },
    description: { en: 'Description', ar: 'الوصف' },
    projectName: { en: 'Project name', ar: 'اسم المشروع' },
    techStack: { en: 'Tools / technologies', ar: 'الأدوات أو التقنيات' },
    certificationName: { en: 'Certification name', ar: 'اسم الشهادة' },
    issuingOrg: { en: 'Issuing organization', ar: 'الجهة المانحة' },
    dateIssued: { en: 'Date issued', ar: 'تاريخ الإصدار' },
    awardName: { en: 'Award name', ar: 'اسم الجائزة' },
    awardingBody: { en: 'Awarding body', ar: 'الجهة المانحة' },
    dateReceived: { en: 'Date received', ar: 'تاريخ الاستلام' },
    language: { en: 'Language', ar: 'اللغة' },
    proficiency: { en: 'Proficiency', ar: 'المستوى' },
  },
  section: {
    noItems: { en: 'No entries yet. Add the first one.', ar: 'لا توجد عناصر بعد. أضف أول عنصر.' },
    addNew: { en: 'Add entry', ar: 'إضافة عنصر' },
    renameSection: { en: 'Rename section', ar: 'إعادة تسمية القسم' },
    deleteSection: { en: 'Delete section', ar: 'حذف القسم' },
  },
  templateControls: {
    template: { en: 'Template', ar: 'القالب' },
    accentColor: { en: 'Accent color', ar: 'لون التمييز' },
    fontFamily: { en: 'Resume font', ar: 'خط السيرة' },
    fontSize: { en: 'Font size', ar: 'حجم الخط' },
    lineSpacing: { en: 'Line spacing', ar: 'تباعد الأسطر' },
    pageMargins: { en: 'Page margins', ar: 'هوامش الصفحة' },
    compact: { en: 'Compact', ar: 'مكثف' },
    normal: { en: 'Normal', ar: 'عادي' },
    spacious: { en: 'Spacious', ar: 'واسع' },
    wide: { en: 'Wide', ar: 'واسعة' },
  },
  resumePreview: {
    exportResume: { en: 'Export', ar: 'تصدير' },
    exportFor: { en: 'Export current version', ar: 'تصدير النسخة الحالية' },
    asPDF: { en: ' as PDF', ar: ' بصيغة PDF' },
    asWord: { en: ' as DOC', ar: ' بصيغة DOC' },
    asJPG: { en: ' as JPG', ar: ' بصيغة JPG' },
    backupJson: { en: ' backup', ar: ' نسخة احتياطية' },
    perfect: { en: 'Resume fits one page', ar: 'السيرة مناسبة لصفحة واحدة' },
    spill: { en: 'Resume is slightly over one page. Try:', ar: 'السيرة تتجاوز صفحة واحدة قليلًا. جرّب:' },
    safe2: { en: 'Still within a reasonable two-page limit.', ar: 'ما زالت ضمن حد صفحتين بشكل مقبول.' },
    reduceFont: { en: 'Reduce font', ar: 'تصغير الخط' },
    reduceMargins: { en: 'Reduce margins', ar: 'تقليل الهوامش' },
    reduceSpacing: { en: 'Reduce spacing', ar: 'تقليل التباعد' },
    openLongest: { en: 'Open longest section', ar: 'فتح القسم الأطول' },
    fitWidth: { en: 'Fit width', ar: 'ملاءمة العرض' },
    zoom100: { en: '100%', ar: '100%' },
    fitPage: { en: 'Fit page', ar: 'ملاءمة الصفحة' },
    contact: { en: 'Contact', ar: 'التواصل' },
  },
  ats: {
    title: { en: 'ATS readiness', ar: 'جاهزية أنظمة الفرز الآلي' },
    subtitle: {
      en: 'A deterministic local check for contact details, structure, keywords, and measurable achievements.',
      ar: 'فحص محلي يعتمد على قواعد واضحة لبيانات التواصل والبنية والكلمات المفتاحية والإنجازات القابلة للقياس.',
    },
    excellent: { en: 'Strong resume', ar: 'سيرة قوية' },
    needsWork: { en: 'Needs improvement', ar: 'تحتاج تحسين' },
    topFixes: { en: 'Top fixes', ar: 'أهم الإصلاحات' },
    allChecks: { en: 'Checklist', ar: 'قائمة الفحص' },
    goToSection: { en: 'Go to section', ar: 'انتقل للقسم' },
    passed: { en: 'Passed', ar: 'مكتمل' },
    warning: { en: 'Warning', ar: 'تنبيه' },
    error: { en: 'Fix needed', ar: 'يحتاج إصلاح' },
  },
  toasts: {
    sectionCreated: { en: 'Section created.', ar: 'تم إنشاء القسم.' },
    sectionDeleted: { en: 'Section deleted.', ar: 'تم حذف القسم.' },
  },
  footer: {
    credit: { en: 'Developed by Mojahed alameen', ar: 'تم تنفيذه من قبل المهندس مجاهد الأمين' },
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('language') as Language | null;
  return saved === 'ar' || saved === 'en' ? saved : 'ar';
};

function isTranslationLeaf(value: TranslationLeaf | TranslationTree | undefined): value is TranslationLeaf {
  return Boolean(value) && typeof value === 'object' && 'en' in value && 'ar' in value;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem('language', nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('font-thmanyah', language === 'ar');
    document.body.classList.toggle('font-sans', language === 'en');
  }, [language]);

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage } },
    children,
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (path: string, _variables?: Record<string, unknown>, fallback?: string): string => {
    const value = path.split('.').reduce<TranslationLeaf | TranslationTree | undefined>((current, key) => {
      if (!current || isTranslationLeaf(current)) return undefined;
      return current[key] as TranslationLeaf | TranslationTree | undefined;
    }, translations);

    return isTranslationLeaf(value) ? value[language] : (fallback || path);
  };

  return { t, language };
};
