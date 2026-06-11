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
    'Innovative Senior Frontend Engineer with 8+ years of experience building and maintaining responsive and scalable web applications. Proficient in React, TypeScript, and modern JavaScript frameworks. Passionate about creating accessible, user-centric UIs and mentoring junior developers.',
  experience: [
    {
      id: crypto.randomUUID(),
      company: 'InnovateTech Solutions',
      title: 'Senior Frontend Engineer',
      startDate: 'Jan 2020',
      endDate: 'Present',
      description:
        '- Led the development of a new customer-facing dashboard using React and TypeScript, resulting in a 20% increase in user engagement.\n- Implemented a component library that reduced code duplication by 40%.\n- Mentored a team of 3 junior developers, fostering their growth and improving team velocity.',
    },
    {
      id: crypto.randomUUID(),
      company: 'Digital Creations Inc.',
      title: 'Frontend Developer',
      startDate: 'Jun 2016',
      endDate: 'Dec 2019',
      description:
        '- Developed and maintained user interfaces for various client projects using React and Redux.\n- Collaborated with UX/UI designers to translate wireframes into high-quality, functional code.\n- Improved website performance by optimizing load times, achieving a 30% reduction in bounce rate.',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      startDate: '2012',
      endDate: '2016',
      description: 'Graduated with honors. Coursework included Data Structures, Algorithms, and Web Development.',
    },
  ],
  skills: [
    { id: crypto.randomUUID(), name: 'React' },
    { id: crypto.randomUUID(), name: 'TypeScript' },
    { id: crypto.randomUUID(), name: 'JavaScript (ES6+)' },
    { id: crypto.randomUUID(), name: 'Node.js' },
    { id: crypto.randomUUID(), name: 'Tailwind CSS' },
    { id: crypto.randomUUID(), name: 'GraphQL' },
    { id: crypto.randomUUID(), name: 'Webpack' },
    { id: crypto.randomUUID(), name: 'Jest & RTL' },
  ],
  customSectionsData: {},
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
  sectionTitles: {},
  sectionTypes: {},
};

export const DEFAULT_RESUME_DATA_AR: ResumeData = {
  personalInfo: {
    name: 'اميليا تشن',
    title: 'مهندس واجهات أمامية أول',
    email: 'amelia.chen@email.com',
    phone: '(123) 456-7890',
    location: 'سان فرانسيسكو، كاليفورنيا',
    website: 'ameliachen.dev',
  },
  summary: 'مهندس واجهات أمامية مبتكر يتمتع بخبرة تزيد عن 8 سنوات في بناء وصيانة تطبيقات ويب متجاوبة وقابلة للتطوير. بارع في React و TypeScript وأطر JavaScript الحديثة.',
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
    accentColor: '#00B5A5', // SiraMix Teal
    fontFamily: 'font-calibri',
    fontSize: '10pt',
    template: 'classic',
    lineSpacing: 'normal',
    marginSize: 'normal',
};

export const ACCENT_COLORS = [
    { name: 'SiraMix Indigo', value: '#261E5A' },
    { name: 'SiraMix Teal', value: '#00B5A5' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Gray', value: '#6b7280' },
];

export const FONT_FAMILIES = [
    { name: 'Calibri', value: 'font-calibri' },
    { name: 'Arial', value: 'font-arial' },
    { name: 'Helvetica', value: 'font-helvetica' },
    { name: 'Georgia', value: 'font-georgia' },
    { name: 'Cambria', value: 'font-cambria' },
    { name: 'Verdana', value: 'font-verdana' },
    { name: 'Garamond', value: 'font-garamond' },
    { name: 'Tahoma', value: 'font-tahoma' },
    { name: 'Times New Roman', value: 'font-times' },
    { name: 'Trebuchet MS', value: 'font-trebuchet' },
];

export const TEMPLATES = [
    { id: 'classic', name: 'Classic' },
    { id: 'modern', name: 'Modern' },
];

export const CUSTOM_SECTION_TYPES: {id: CustomSectionType, name: string}[] = [
    { id: 'default', name: 'Generic List' },
    { id: 'projects', name: 'Projects' },
    { id: 'certifications', name: 'Certifications' },
    { id: 'awards', name: 'Awards' },
    { id: 'languages', name: 'Languages' },
];