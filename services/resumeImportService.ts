import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { CustomSectionItem, ResumeData } from '../types';

type ParsedSections = Partial<Record<'summary' | 'experience' | 'education' | 'skills' | 'languages', string>>;

interface ParsedResumeText {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  title?: string;
  sections: ParsedSections;
}

const SECTION_ALIASES: Record<keyof ParsedSections, string[]> = {
  summary: ['الملخص', 'نبذة', 'نبذة مختصرة', 'النبذة', 'profile', 'summary', 'about', 'professional summary'],
  experience: ['الخبرة', 'الخبرات', 'الخبرات المهنية', 'الخبرة العملية', 'experience', 'work history', 'employment history', 'professional experience'],
  education: ['التعليم', 'المؤهلات', 'المؤهلات العلمية', 'education', 'academic background', 'qualifications'],
  skills: ['المهارات', 'المهارات التقنية', 'skills', 'technical skills', 'core skills'],
  languages: ['اللغات', 'languages'],
};

const ALL_SECTION_TITLES = Object.values(SECTION_ALIASES).flat();
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_REGEX = /(?:\+?\d[\d\s().-]{7,}\d)/;
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/[^\s]+|[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/i;

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeLine(line: string): string {
  return line.replace(/[#:|،.]+$/g, '').trim().toLowerCase();
}

function sectionKeyForLine(line: string): keyof ParsedSections | null {
  const normalized = normalizeLine(line);
  if (!normalized || normalized.length > 45) return null;

  for (const [key, aliases] of Object.entries(SECTION_ALIASES) as [keyof ParsedSections, string[]][]) {
    if (aliases.some(alias => normalized === alias.toLowerCase())) {
      return key;
    }
  }

  return null;
}

function isLikelyName(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 3 || trimmed.length > 70) return false;
  if (EMAIL_REGEX.test(trimmed) || PHONE_REGEX.test(trimmed) || URL_REGEX.test(trimmed)) return false;
  if (sectionKeyForLine(trimmed)) return false;
  return /^[\p{L}\s.'-]+$/u.test(trimmed);
}

function isLikelyLocation(line: string): boolean {
  return /(السعودية|الرياض|جدة|الدمام|الخبر|مكة|المدينة|riyadh|jeddah|dammam|khobar|saudi|ksa|remote)/i.test(line);
}

function splitLooseItems(text: string): string[] {
  return text
    .split(/\n|•|·|,|،|;|؛/g)
    .map(item => item.replace(/^[-*]\s*/, '').trim())
    .filter(item => item.length > 1);
}

function extractSections(lines: string[]): ParsedSections {
  const sections: ParsedSections = {};
  let activeKey: keyof ParsedSections | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (activeKey && buffer.length) {
      sections[activeKey] = buffer.join('\n').trim();
    }
    buffer = [];
  };

  for (const line of lines) {
    const key = sectionKeyForLine(line);
    if (key) {
      flush();
      activeKey = key;
      continue;
    }

    if (activeKey) {
      buffer.push(line);
    }
  }

  flush();
  return sections;
}

function parseText(text: string): ParsedResumeText {
  const normalized = normalizeText(text);
  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean);
  const email = normalized.match(EMAIL_REGEX)?.[0];
  const phone = normalized.match(PHONE_REGEX)?.[0]?.trim();
  const website = normalized.match(URL_REGEX)?.[0];
  const sections = extractSections(lines);
  const firstSectionIndex = lines.findIndex(line => Boolean(sectionKeyForLine(line)));
  const headerLines = lines.slice(0, firstSectionIndex > -1 ? firstSectionIndex : Math.min(lines.length, 8));
  const name = headerLines.find(isLikelyName);
  const title = headerLines.find(line => line !== name && !EMAIL_REGEX.test(line) && !PHONE_REGEX.test(line) && !URL_REGEX.test(line) && !isLikelyLocation(line));
  const location = headerLines.find(isLikelyLocation);

  return { name, title, email, phone, website, location, sections };
}

function sectionExists(data: ResumeData, key: string): boolean {
  return key === 'personalInfo' || data.sectionOrder.includes(key);
}

function parseDatedEntry(block: string): { first: string; second: string; startDate: string; endDate: string; description: string } {
  const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
  const heading = lines[0] || '';
  const second = lines[1] && !/^[-•]/.test(lines[1]) ? lines[1] : '';
  const dateMatch = block.match(/((?:19|20)\d{2}|[A-Z][a-z]{2,8}\s+(?:19|20)\d{2}|يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|أكتوبر|اكتوبر|نوفمبر|ديسمبر)[^\n]{0,35}?(present|current|now|حتى الآن|الآن|(?:19|20)\d{2})/i);
  const [startDate, endDate] = dateMatch?.[0]?.split(/\s?[-–—]\s?/) || ['', ''];
  const descriptionLines = lines.slice(second ? 2 : 1);

  return {
    first: heading.replace(dateMatch?.[0] || '', '').trim(),
    second,
    startDate: startDate || '',
    endDate: endDate || '',
    description: descriptionLines.join('\n').trim(),
  };
}

function splitEntries(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .flatMap(block => {
      const bulletItems = block.split(/\n(?=[-*•]\s+)/).map(item => item.trim()).filter(Boolean);
      return bulletItems.length > 1 && bulletItems.every(item => item.length > 30) ? bulletItems : [block];
    });
}

function applyParsedText(current: ResumeData, parsed: ParsedResumeText): ResumeData {
  const next: ResumeData = {
    ...current,
    personalInfo: {
      ...current.personalInfo,
      name: parsed.name || current.personalInfo.name,
      title: parsed.title || current.personalInfo.title,
      email: parsed.email || current.personalInfo.email,
      phone: parsed.phone || current.personalInfo.phone,
      location: parsed.location || current.personalInfo.location,
      website: parsed.website || current.personalInfo.website,
    },
  };

  if (sectionExists(current, 'summary') && parsed.sections.summary) {
    next.summary = parsed.sections.summary;
  }

  if (sectionExists(current, 'experience') && parsed.sections.experience) {
    next.experience = splitEntries(parsed.sections.experience).slice(0, 8).map(block => {
      const entry = parseDatedEntry(block);
      return {
        id: crypto.randomUUID(),
        title: entry.first,
        company: entry.second,
        startDate: entry.startDate,
        endDate: entry.endDate,
        description: entry.description,
      };
    });
  }

  if (sectionExists(current, 'education') && parsed.sections.education) {
    next.education = splitEntries(parsed.sections.education).slice(0, 6).map(block => {
      const entry = parseDatedEntry(block);
      return {
        id: crypto.randomUUID(),
        degree: entry.first,
        institution: entry.second,
        startDate: entry.startDate,
        endDate: entry.endDate,
        description: entry.description,
      };
    });
  }

  if (sectionExists(current, 'skills') && parsed.sections.skills) {
    next.skills = splitLooseItems(parsed.sections.skills).slice(0, 30).map(name => ({ id: crypto.randomUUID(), name }));
  }

  if (parsed.sections.languages) {
    const languageSectionKey = current.sectionOrder.find(key => current.sectionTypes[key] === 'languages');
    if (languageSectionKey) {
      const languageItems: CustomSectionItem[] = splitLooseItems(parsed.sections.languages).slice(0, 12).map(item => {
        const [primaryText, secondaryText = ''] = item.split(/[-–—:|]/).map(part => part.trim());
        return { id: crypto.randomUUID(), primaryText, secondaryText, startDate: '', endDate: '', description: '' };
      });
      next.customSectionsData = { ...current.customSectionsData, [languageSectionKey]: languageItems };
    }
  }

  return next;
}

export async function extractResumeTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (file.type === 'application/pdf' || extension === 'pdf') {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => ('str' in item ? item.str : '')).join(' '));
    }

    return normalizeText(pages.join('\n\n'));
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    const mammoth = (await import('mammoth/mammoth.browser')).default;
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return normalizeText(result.value);
  }

  throw new Error('UNSUPPORTED_FILE_TYPE');
}

export function importResumeTextIntoData(current: ResumeData, text: string): ResumeData {
  const parsed = parseText(text);
  return applyParsedText(current, parsed);
}

export function getFirstImportedSection(before: ResumeData, after: ResumeData): string {
  if (before.personalInfo !== after.personalInfo && JSON.stringify(before.personalInfo) !== JSON.stringify(after.personalInfo)) return 'personalInfo';
  if (before.summary !== after.summary) return 'summary';
  if (before.experience !== after.experience && JSON.stringify(before.experience) !== JSON.stringify(after.experience)) return 'experience';
  if (before.education !== after.education && JSON.stringify(before.education) !== JSON.stringify(after.education)) return 'education';
  if (before.skills !== after.skills && JSON.stringify(before.skills) !== JSON.stringify(after.skills)) return 'skills';
  return 'personalInfo';
}
