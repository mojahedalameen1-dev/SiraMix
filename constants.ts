import { ResumeData, TemplateOptions, CustomSectionType } from './types';

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    name: 'Amelia Chen',
    title: 'Senior Frontend Engineer',
    email: 'amelia.chen@email.com',
    phone: '(123) 456-7890',
    location: 'San Francisco, CA',
    website: 'ameliachen.dev',
  },
  summary:
    'Senior Frontend Engineer with 8+ years of experience building responsive, scalable web applications using React, TypeScript, and modern JavaScript frameworks. Strong focus on accessible interfaces, performance, and mentoring junior developers.',
  experience: [
    {
      id: crypto.randomUUID(),
      company: 'InnovateTech Solutions',
      title: 'Senior Frontend Engineer',
      startDate: 'Jan 2020',
      endDate: 'Present',
      description:
        '- Led development of a customer-facing dashboard using React and TypeScript, increasing engagement by 20%.\n- Built a shared component library that reduced duplicated UI code by 40%.\n- Mentored 3 junior developers and improved delivery consistency across the team.',
    },
    {
      id: crypto.randomUUID(),
      company: 'Digital Creations Inc.',
      title: 'Frontend Developer',
      startDate: 'Jun 2016',
      endDate: 'Dec 2019',
      description:
        '- Developed and maintained web interfaces for multiple client projects using React and Redux.\n- Collaborated with UX/UI teams to translate wireframes into production-ready components.\n- Improved page performance and reduced bounce rate by 30%.',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      startDate: '2012',
      endDate: '2016',
      description: 'Graduated with honors. Coursework included data structures, algorithms, and web development.',
    },
  ],
  skills: [
    { id: crypto.randomUUID(), name: 'React' },
    { id: crypto.randomUUID(), name: 'TypeScript' },
    { id: crypto.randomUUID(), name: 'JavaScript' },
    { id: crypto.randomUUID(), name: 'Node.js' },
    { id: crypto.randomUUID(), name: 'Tailwind CSS' },
    { id: crypto.randomUUID(), name: 'GraphQL' },
    { id: crypto.randomUUID(), name: 'Webpack' },
    { id: crypto.randomUUID(), name: 'Testing' },
  ],
  customSectionsData: {},
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
  sectionTitles: {},
  sectionTypes: {},
};

export const DEFAULT_RESUME_DATA_AR: ResumeData = {
  personalInfo: {
    name: 'مجاهد الأمين',
    title: 'مهندس واجهات أمامية أول',
    email: 'amelia.chen@email.com',
    phone: '0506157728',
    location: 'الخرج، السعودية',
    website: 'ameliachen.dev',
  },
  summary:
    'مهندس واجهات أمامية بخبرة تزيد عن 8 سنوات في بناء تطبيقات ويب متجاوبة وقابلة للتطوير باستخدام React وTypeScript وأطر JavaScript الحديثة، مع تركيز على تجربة المستخدم وسرعة الأداء وجودة الواجهات.',
  experience: [
    {
      id: crypto.randomUUID(),
      company: 'حلول الابتكار التقنية',
      title: 'مهندس واجهات أمامية أول',
      startDate: 'يناير 2020',
      endDate: 'حتى الآن',
      description:
        '- قُدت تطوير لوحة تحكم للعملاء باستخدام React وTypeScript مما ساهم في رفع تفاعل المستخدمين بنسبة 20%.\n- أنشأت مكتبة مكونات مشتركة خفضت تكرار كود الواجهات بنسبة 40%.\n- دربت 3 مطورين مبتدئين وحسنت انتظام التسليم داخل الفريق.',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      institution: 'جامعة الملك سعود',
      degree: 'بكالوريوس علوم الحاسب',
      startDate: '2012',
      endDate: '2016',
      description: 'دراسة ركزت على هياكل البيانات، الخوارزميات، وتطوير تطبيقات الويب.',
    },
  ],
  skills: [
    { id: crypto.randomUUID(), name: 'React' },
    { id: crypto.randomUUID(), name: 'TypeScript' },
    { id: crypto.randomUUID(), name: 'JavaScript' },
    { id: crypto.randomUUID(), name: 'تحسين الأداء' },
    { id: crypto.randomUUID(), name: 'تصميم الواجهات' },
    { id: crypto.randomUUID(), name: 'اختبار الواجهات' },
  ],
  customSectionsData: {},
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
  sectionTitles: {},
  sectionTypes: {},
};

export const DEFAULT_DUAL_RESUME_DATA = {
  en: DEFAULT_RESUME_DATA,
  ar: DEFAULT_RESUME_DATA_AR,
};

export const DEFAULT_TEMPLATE_OPTIONS: TemplateOptions = {
  accentColor: '#00B5A5',
  fontFamily: 'font-thmanyah',
  fontSize: '10pt',
  template: 'classic',
  lineSpacing: 'normal',
  marginSize: 'normal',
};

export const ACCENT_COLORS = [
  { name: 'SiraMix Teal', value: '#00B5A5' },
  { name: 'Deep Navy', value: '#202432' },
  { name: 'Hiring Blue', value: '#2563eb' },
  { name: 'Success Green', value: '#16a34a' },
  { name: 'Warm Gold', value: '#d97706' },
  { name: 'Professional Gray', value: '#4b5563' },
];

export interface FontFamilyOption {
  name: string;
  value: string;
  cssFamily: string;
  replacementFor?: string;
}

export const ARABIC_FONT_FAMILIES: FontFamilyOption[] = [
  { name: 'Thmanyah', value: 'font-thmanyah', cssFamily: "'Thmanyah', 'Tajawal', 'Cairo', sans-serif" },
  { name: 'IBM Plex Sans Arabic', value: 'font-ibm-plex-sans-arabic', cssFamily: "'IBM Plex Sans Arabic', sans-serif" },
  { name: 'Cairo', value: 'font-cairo', cssFamily: "'Cairo', sans-serif" },
  { name: 'Tajawal', value: 'font-tajawal', cssFamily: "'Tajawal', sans-serif" },
  { name: 'Alexandria', value: 'font-alexandria', cssFamily: "'Alexandria', sans-serif" },
  { name: 'Noto Sans Arabic', value: 'font-noto-sans-arabic', cssFamily: "'Noto Sans Arabic', sans-serif" },
  { name: 'Almarai', value: 'font-almarai', cssFamily: "'Almarai', sans-serif" },
  { name: 'Changa', value: 'font-changa', cssFamily: "'Changa', sans-serif" },
  { name: 'El Messiri', value: 'font-el-messiri', cssFamily: "'El Messiri', sans-serif" },
  { name: 'Noto Kufi Arabic', value: 'font-noto-kufi-arabic', cssFamily: "'Noto Kufi Arabic', sans-serif" },
];

export const ENGLISH_FONT_FAMILIES: FontFamilyOption[] = [
  { name: 'Calibri (Carlito)', value: 'font-carlito', cssFamily: "'Carlito', Calibri, sans-serif", replacementFor: 'Calibri' },
  { name: 'Arial (Arimo)', value: 'font-arimo', cssFamily: "'Arimo', Arial, sans-serif", replacementFor: 'Arial' },
  { name: 'Helvetica (Inter)', value: 'font-inter', cssFamily: "'Inter', Helvetica, Arial, sans-serif", replacementFor: 'Helvetica' },
  { name: 'Inter', value: 'font-inter', cssFamily: "'Inter', sans-serif" },
  { name: 'IBM Plex Sans', value: 'font-ibm-plex-sans', cssFamily: "'IBM Plex Sans', sans-serif" },
  { name: 'Aptos (Source Sans 3)', value: 'font-source-sans-3', cssFamily: "'Source Sans 3', Aptos, sans-serif", replacementFor: 'Aptos' },
  { name: 'Open Sans', value: 'font-open-sans', cssFamily: "'Open Sans', sans-serif" },
  { name: 'Lato', value: 'font-lato', cssFamily: "'Lato', sans-serif" },
  { name: 'Source Sans 3', value: 'font-source-sans-3', cssFamily: "'Source Sans 3', sans-serif" },
  { name: 'Roboto', value: 'font-roboto', cssFamily: "'Roboto', sans-serif" },
];

export const FONT_FAMILIES = [...ARABIC_FONT_FAMILIES, ...ENGLISH_FONT_FAMILIES];

export function getFontFamilyOption(value: string): FontFamilyOption {
  return FONT_FAMILIES.find(font => font.value === value) || ARABIC_FONT_FAMILIES[0];
}

export const TEMPLATES = [
  { id: 'classic', name: 'Classic / رسمي' },
  { id: 'modern', name: 'Modern / حديث' },
];

export const CUSTOM_SECTION_TYPES: { id: CustomSectionType; name: string }[] = [
  { id: 'default', name: 'Generic list' },
  { id: 'projects', name: 'Projects' },
  { id: 'certifications', name: 'Certifications' },
  { id: 'awards', name: 'Awards' },
  { id: 'languages', name: 'Languages' },
];
