import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { ResumeData } from '../types';

type SectionKey = 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'tools';
type ParsedSections = Partial<Record<SectionKey, string>>;

interface ParsedResumeText {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  title?: string;
  sections: ParsedSections;
}

interface ParsedResumePayload {
  format: 'structured' | 'text';
  blocks?: string[];
  parsed?: ParsedResumeText;
  text?: string;
}

const MAIN_SECTION_ORDER: SectionKey[] = ['summary', 'experience', 'education', 'skills', 'languages', 'tools'];

const SECTION_ALIASES: Record<SectionKey, string[]> = {
  summary: ['الملخص', 'نبذة', 'نبذة مختصرة', 'النبذة', 'summary', 'profile', 'about', 'professional summary'],
  experience: ['الخبرة', 'الخبرات', 'الخبرات المهنية', 'الخبرة العملية', 'experience', 'work history', 'employment history', 'professional experience', 'work experience'],
  education: ['التعليم', 'المؤهلات', 'المؤهلات العلمية', 'education', 'academic background', 'qualifications'],
  skills: ['المهارات', 'المهارات التقنية', 'skills', 'technical skills', 'core skills', 'skills & competencies'],
  languages: ['اللغات', 'languages', 'language proficiency'],
  tools: ['الأدوات', 'التقنيات', 'الأدوات والتقنيات', 'tools', 'technologies', 'tools & technologies'],
};

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_REGEX = /(?:\+?\d[\d\s().-]{7,}\d)/;
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/[^\s]+|[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/i;
const DATE_LINE_REGEX = /(?:(?:19|20)\d{2}|[A-Z][a-z]{2,8}\s+(?:19|20)\d{2}|يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|أكتوبر|اكتوبر|نوفمبر|ديسمبر)/i;
const SECTION_TITLES = new Set<string>(Object.values(SECTION_ALIASES).flat().map(value => normalizeLine(value)));

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeLine(line: string): string {
  return line
    .replace(/[#:|،,.\u00b7\u2022]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function isSectionLine(line: string): boolean {
  const normalized = normalizeLine(line);
  return SECTION_TITLES.has(normalized);
}

function sectionKeyForLine(line: string): SectionKey | null {
  const normalized = normalizeLine(line);
  if (!normalized || normalized.length > 60) return null;

  for (const [key, aliases] of Object.entries(SECTION_ALIASES) as [SectionKey, string[]][]) {
    if (aliases.some(alias => normalized === normalizeLine(alias))) {
      return key;
    }
  }

  return null;
}

function isLikelyName(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 3 || trimmed.length > 80) return false;
  if (EMAIL_REGEX.test(trimmed) || PHONE_REGEX.test(trimmed) || URL_REGEX.test(trimmed)) return false;
  if (isSectionLine(trimmed)) return false;
  return /^[\p{L}\s.'-]+$/u.test(trimmed);
}

function isLikelyLocation(line: string): boolean {
  return /(السعودية|الرياض|جدة|الدمام|الخبر|مكة|المدينة|riyadh|jeddah|dammam|khobar|saudi|ksa|remote)/i.test(line);
}

function splitLooseItems(text: string): string[] {
  return text
    .split(/\n|\||•|·|,|،|;|؛/g)
    .map(item => item.replace(/^[-*]\s*/, '').trim())
    .filter(item => item.length > 1);
}

function extractSectionsFromLines(lines: string[]): ParsedSections {
  const sections: ParsedSections = {};
  let activeKey: SectionKey | null = null;
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

function extractHeaderFields(lines: string[]): Pick<ParsedResumeText, 'name' | 'title' | 'email' | 'phone' | 'location' | 'website'> {
  const firstSectionIndex = lines.findIndex(isSectionLine);
  const headerEnd = firstSectionIndex > 0 ? Math.min(firstSectionIndex, 18) : Math.min(lines.length, 18);
  const headerWindow = lines.slice(0, headerEnd);
  const headerText = headerWindow.join('\n');
  const email = headerText.match(EMAIL_REGEX)?.[0];
  const phoneLabelMatch = headerText.match(/(?:phone|mobile|tel|الهاتف|الجوال)\s*:?\s*(\+?\d[\d\s().-]{7,}\d)/i);
  const phone = phoneLabelMatch?.[1]?.trim() || headerWindow.find(line => PHONE_REGEX.test(line))?.match(PHONE_REGEX)?.[0];
  const website = headerWindow
    .filter(line => !EMAIL_REGEX.test(line))
    .map(line => line.match(URL_REGEX)?.[0])
    .find(Boolean);
  const locationMatch = headerText.match(/(?:location|address|الموقع|العنوان)\s*:?\s*([^|\n]+)/i);
  const labeledField = /^(?:e-?mail|phone|mobile|tel|location|address|date of birth|dob|nationality|visa status|البريد|الهاتف|الجوال|الموقع|العنوان|تاريخ الميلاد|الجنسية|حالة التأشيرة)\s*:/i;

  const candidateLines = headerWindow.filter(line =>
    !EMAIL_REGEX.test(line) &&
    !PHONE_REGEX.test(line) &&
    !URL_REGEX.test(line) &&
    !DATE_LINE_REGEX.test(line) &&
    !labeledField.test(line) &&
    !isSectionLine(line),
  );
  const name = candidateLines.find(isLikelyName);
  const title = candidateLines.find(line => line !== name && !isLikelyLocation(line) && line.length <= 100);
  const location = locationMatch?.[1]?.trim() || candidateLines.find(isLikelyLocation) || lines.find(isLikelyLocation);

  return { name, title, email, phone, location, website };
}

function parseTextContent(text: string): ParsedResumeText {
  const normalized = normalizeText(text);
  const lines = normalized.split('\n').map(line => line.trim()).filter(Boolean);
  const sections = extractSectionsFromLines(lines);
  return {
    ...extractHeaderFields(lines),
    sections,
  };
}

function parseDateRange(text: string): { startDate: string; endDate: string } {
  const rangeMatch = text.match(new RegExp(`(${DATE_LINE_REGEX.source}[\\s\\S]{0,35}?(?:present|current|now|حتى الآن|الآن|(?:19|20)\\d{2}))`, 'i'));
  if (!rangeMatch) return { startDate: '', endDate: '' };

  const parts = rangeMatch[1].split(/\s?[-–—]\s?/);
  if (parts.length >= 2) {
    return { startDate: parts[0].trim(), endDate: parts.slice(1).join(' - ').trim() };
  }

  return { startDate: parts[0].trim(), endDate: '' };
}

function parseEntryBlock(block: string): { first: string; second: string; startDate: string; endDate: string; description: string } {
  const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
  const heading = lines[0] || '';
  const subheading = lines[1] && !/^[-•]/.test(lines[1]) ? lines[1] : '';
  const { startDate, endDate } = parseDateRange(block);
  const descriptionStartIndex = subheading ? 2 : 1;
  const description = lines.slice(descriptionStartIndex).join('\n').trim();
  const cleanHeading = heading
    .replace(/(?:[A-Z][a-z]{2,8}\s+)?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:[A-Z][a-z]{2,8}\s+)?(?:19|20)\d{2}|present|current|now)/i, '')
    .replace(/^[\s|:,-]+|[\s|:,-]+$/g, '')
    .trim();
  const subheadingParts = subheading
    .split('|')
    .map(part => part.trim())
    .filter(Boolean);
  const cleanSubheading = subheadingParts[subheadingParts.length - 1] || '';

  return {
    first: cleanHeading || heading.replace(new RegExp(DATE_LINE_REGEX.source, 'i'), '').trim(),
    second: cleanSubheading,
    startDate,
    endDate,
    description,
  };
}

function splitEntries(text: string): string[] {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const entryStarts = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) =>
      /(?:[A-Z][a-z]{2,8}\s+)?(?:19|20)\d{2}\s*[-–—]\s*(?:(?:[A-Z][a-z]{2,8}\s+)?(?:19|20)\d{2}|present|current|now)/i.test(line),
    )
    .map(({ index }) => index);

  if (entryStarts.length >= 2) {
    return entryStarts.map((start, index) => {
      const end = entryStarts[index + 1] ?? lines.length;
      return lines.slice(start, end).join('\n');
    });
  }

  return text
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .flatMap(block => {
      const bulletItems = block.split(/\n(?=[-*•]\s+)/).map(item => item.trim()).filter(Boolean);
      return bulletItems.length > 1 && bulletItems.every(item => item.length > 30) ? bulletItems : [block];
    });
}

function pickBestSectionBlock(lines: string[], aliases: string[]): string | undefined {
  const normalizedAliases = aliases.map(alias => normalizeLine(alias));
  const startIndex = lines.findIndex(line => normalizedAliases.includes(normalizeLine(line)));
  if (startIndex === -1) return undefined;

  const collected: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (isSectionLine(line)) break;
    collected.push(line);
  }

  return collected.join('\n').trim() || undefined;
}

function extractFromStructuredPayload(payload: ParsedResumePayload): ParsedResumeText {
  if (payload.parsed && payload.blocks?.length) {
    return payload.parsed;
  }

  if (payload.blocks?.length) {
    const lines = payload.blocks;
    const sections: ParsedSections = {};
    for (const key of MAIN_SECTION_ORDER) {
      const value = pickBestSectionBlock(lines, SECTION_ALIASES[key]);
      if (value) sections[key] = value;
    }
    return {
      ...extractHeaderFields(lines),
      sections,
    };
  }

  return parseTextContent(payload.text || '');
}

function parseSkillsBlock(text: string): string[] {
  return splitLooseItems(text)
    .flatMap(item => item.split(/\s{2,}/g))
    .map(item => item.replace(/^(?:skills?|tools?|competencies?)\s*[:\-]\s*/i, '').trim())
    .filter(item => item.length > 1 && !isSectionLine(item));
}

function sectionExists(data: ResumeData, key: string): boolean {
  return key === 'personalInfo' || data.sectionOrder.includes(key);
}

function upsertImportedListSection(
  data: ResumeData,
  sectionType: 'default' | 'languages',
  title: string,
  values: string[],
): void {
  if (!values.length) return;

  let sectionKey = data.sectionOrder.find(key =>
    key.startsWith('custom_') &&
    (sectionType === 'languages'
      ? data.sectionTypes[key] === 'languages'
      : normalizeLine(data.sectionTitles[key] || '') === normalizeLine(title)),
  );

  if (!sectionKey) {
    sectionKey = `custom_${crypto.randomUUID()}`;
    data.sectionOrder.push(sectionKey);
  }

  data.sectionTypes[sectionKey] = sectionType;
  data.sectionTitles[sectionKey] = title;
  data.customSectionsData[sectionKey] = values.map(value => {
    const [primaryText, secondaryText = ''] = value.split(/\s+[-–—:|]\s+/).map(part => part.trim());
    return {
      id: crypto.randomUUID(),
      primaryText,
      secondaryText,
      startDate: '',
      endDate: '',
      description: '',
    };
  });
}

function applyParsedText(current: ResumeData, parsed: ParsedResumeText): ResumeData {
  const next: ResumeData = {
    ...current,
    sectionOrder: [...current.sectionOrder],
    sectionTitles: { ...current.sectionTitles },
    sectionTypes: { ...current.sectionTypes },
    customSectionsData: { ...current.customSectionsData },
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
    next.experience = splitEntries(parsed.sections.experience).map(block => {
      const entry = parseEntryBlock(block);
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
    next.education = splitEntries(parsed.sections.education).map(block => {
      const entry = parseEntryBlock(block);
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
    const skillItems = parseSkillsBlock(parsed.sections.skills)
      .map(name => ({ id: crypto.randomUUID(), name }));

    if (skillItems.length) {
      next.skills = skillItems;
    }
  }

  if (parsed.sections.languages) {
    upsertImportedListSection(next, 'languages', 'Languages', splitLooseItems(parsed.sections.languages));
  }

  if (parsed.sections.tools) {
    upsertImportedListSection(next, 'default', 'Tools & Technologies', splitLooseItems(parsed.sections.tools));
  }

  return next;
}

function parsePdfTextContent(text: string): ParsedResumeText {
  return parseTextContent(text);
}

function parseDocxTextContent(text: string): ParsedResumeText {
  try {
    const payload = JSON.parse(text) as ParsedResumePayload;
    return extractFromStructuredPayload(payload);
  } catch {
    return parseTextContent(text);
  }
}

function htmlToBlocksFromDocxHtml(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: string[] = [];

  const addBlock = (value: string) => {
    const normalized = normalizeText(value);
    if (normalized) blocks.push(normalized);
  };

  doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,tr').forEach(node => {
    const el = node as HTMLElement;
    const text = normalizeText((el.textContent || '').replace(/\u00a0/g, ' '));
    if (!text) return;

    if (el.tagName === 'TR') {
      const cells = Array.from(el.querySelectorAll('th,td'))
        .map(cell => normalizeText((cell.textContent || '').replace(/\u00a0/g, ' ')))
        .filter(Boolean);
      if (cells.length) {
        addBlock(cells.join(' | '));
      }
      return;
    }

    addBlock(text);
  });

  return blocks;
}

interface PositionedPdfText {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function pdfItemsToLines(items: unknown[]): string[] {
  const positioned = items.flatMap<PositionedPdfText>(item => {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('str' in item) ||
      !('transform' in item) ||
      !Array.isArray(item.transform)
    ) {
      return [];
    }

    const str = String(item.str || '').trim();
    if (!str) return [];
    const transform = item.transform as number[];
    return [{
      str,
      x: Number(transform[4] || 0),
      y: Number(transform[5] || 0),
      width: Number('width' in item ? item.width : 0),
      height: Math.abs(Number('height' in item ? item.height : transform[3] || 10)),
    }];
  });

  const rows: PositionedPdfText[][] = [];
  for (const item of positioned.sort((a, b) => b.y - a.y || a.x - b.x)) {
    const row = rows.find(candidate => {
      const baseline = candidate.reduce((total, value) => total + value.y, 0) / candidate.length;
      const tolerance = Math.max(2.2, Math.min(5, item.height * 0.45));
      return Math.abs(baseline - item.y) <= tolerance;
    });
    if (row) row.push(item);
    else rows.push([item]);
  }

  return rows
    .sort((a, b) => b[0].y - a[0].y)
    .map(row => {
      const fragments = row.sort((a, b) => a.x - b.x);
      let line = '';
      let previous: PositionedPdfText | null = null;

      for (const fragment of fragments) {
        if (previous) {
          const gap = fragment.x - (previous.x + previous.width);
          const previousCharWidth = previous.width / Math.max(1, previous.str.length);
          line += gap > Math.max(22, previousCharWidth * 4) ? ' | ' : ' ';
        }
        line += fragment.str;
        previous = fragment;
      }

      return normalizeText(line);
    })
    .filter(Boolean);
}

export async function extractResumeTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (file.type === 'application/pdf' || extension === 'pdf') {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const blocks: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageLines = pdfItemsToLines(content.items);
      if (pageLines.length) {
        if (blocks.length) blocks.push('');
        blocks.push(...pageLines);
      }
    }

    return JSON.stringify({
      format: 'structured',
      blocks,
      parsed: extractFromStructuredPayload({ format: 'structured', blocks }),
    } satisfies ParsedResumePayload);
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    const mammoth = (await import('mammoth/mammoth.browser')).default;
    const result = await mammoth.convertToHtml(
      { arrayBuffer: buffer },
      {
        includeDefaultStyleMap: true,
        ignoreEmptyParagraphs: true,
      },
    );

    const blocks = htmlToBlocksFromDocxHtml(result.value);
    const parsed = extractFromStructuredPayload({
      format: 'structured',
      blocks,
      parsed: undefined,
    });

    return JSON.stringify({
      format: 'structured',
      blocks,
      parsed,
    } satisfies ParsedResumePayload);
  }

  throw new Error('UNSUPPORTED_FILE_TYPE');
}

export function importResumeTextIntoData(current: ResumeData, text: string): ResumeData {
  const parsed = parseDocxTextContent(text);
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
