import { ResumeData, TemplateOptions, CustomSectionType } from './types';

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  customSectionsData: {},
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
  sectionTitles: {},
  sectionTypes: {},
};

export const DEFAULT_RESUME_DATA_AR: ResumeData = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
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

export interface ResumeTemplateOption {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  accent: string;
  layout: 'single' | 'two-column' | 'centered' | 'timeline' | 'dense' | 'minimal';
  atsReady?: boolean;
}

export const TEMPLATES: ResumeTemplateOption[] = [
  { id: 'classic', name: 'Classic / رسمي', nameAr: 'رسمي كلاسيكي', nameEn: 'Classic', categoryAr: 'عام', categoryEn: 'General', accent: '#00B5A5', layout: 'single', atsReady: true },
  { id: 'modern', name: 'Modern / حديث', nameAr: 'حديث', nameEn: 'Modern', categoryAr: 'عام', categoryEn: 'General', accent: '#00B5A5', layout: 'two-column', atsReady: true },
  { id: 'emerald-two-column', name: 'Emerald Two Column', nameAr: 'عمودان زمردي', nameEn: 'Emerald Two Column', categoryAr: 'تقني', categoryEn: 'Tech', accent: '#18a56f', layout: 'two-column', atsReady: true },
  { id: 'audit-classic', name: 'Audit Classic', nameAr: 'تدقيق كلاسيكي', nameEn: 'Audit Classic', categoryAr: 'مالي', categoryEn: 'Finance', accent: '#5867a8', layout: 'single', atsReady: true },
  { id: 'blue-analyst', name: 'Blue Analyst Sidebar', nameAr: 'محلل أزرق', nameEn: 'Blue Analyst', categoryAr: 'تحليل', categoryEn: 'Analysis', accent: '#1f66c2', layout: 'two-column', atsReady: true },
  { id: 'centered-executive', name: 'Centered Executive', nameAr: 'تنفيذي مركزي', nameEn: 'Centered Executive', categoryAr: 'إداري', categoryEn: 'Executive', accent: '#375d9d', layout: 'centered', atsReady: true },
  { id: 'consulting-timeline', name: 'Consulting Timeline', nameAr: 'استشاري زمني', nameEn: 'Consulting Timeline', categoryAr: 'استشارات', categoryEn: 'Consulting', accent: '#2f6f8f', layout: 'timeline', atsReady: true },
  { id: 'dense-executive', name: 'Dense Executive Split', nameAr: 'تنفيذي مكثف', nameEn: 'Dense Executive', categoryAr: 'قيادي', categoryEn: 'Leadership', accent: '#0b6bb7', layout: 'dense', atsReady: true },
  { id: 'minimal-technical', name: 'Minimal Technical', nameAr: 'تقني بسيط', nameEn: 'Minimal Technical', categoryAr: 'تقني', categoryEn: 'Technical', accent: '#343a40', layout: 'minimal', atsReady: true },
];

export const CUSTOM_SECTION_TYPES: { id: CustomSectionType; name: string }[] = [
  { id: 'default', name: 'Generic list' },
  { id: 'projects', name: 'Projects' },
  { id: 'certifications', name: 'Certifications' },
  { id: 'awards', name: 'Awards' },
  { id: 'languages', name: 'Languages' },
];
