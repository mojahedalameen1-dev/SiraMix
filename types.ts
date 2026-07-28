export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id:string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name:string;
}

export type CustomSectionType = 'default' | 'projects' | 'certifications' | 'awards' | 'languages';

export interface CustomSectionItem {
  id: string;
  primaryText: string;
  secondaryText: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  customSectionsData: { [key: string]: CustomSectionItem[] };
  sectionOrder: string[];
  sectionTitles: { [key: string]: string; };
  sectionTypes: { [key: string]: CustomSectionType };
}

export interface TemplateOptions {
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  template: string;
  lineSpacing?: 'compact' | 'normal' | 'spacious';
  marginSize?: 'compact' | 'normal' | 'wide';
}

export type Language = 'en' | 'ar';

export interface SourceDocument {
  kind: 'pdf';
  name: string;
  mimeType: 'application/pdf';
  storagePath: string;
  chunkCount: number;
  size: number;
  uploadedAt: string;
}

export interface DualResumeData {
  en: ResumeData;
  ar: ResumeData;
}

export interface Resume {
  id: string;
  name: string;
  data: DualResumeData;
  options: TemplateOptions;
  sourceDocument?: SourceDocument | null;
}
