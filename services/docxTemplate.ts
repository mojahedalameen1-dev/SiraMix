import { getFontFamilyOption } from '../constants';
import {
  CustomSectionItem,
  Education,
  Language,
  ResumeData,
  Skill,
  TemplateOptions,
  WorkExperience,
} from '../types';
import { getSafeExternalUrl } from '../utils/url';

const BASE_SECTION_TITLES: Record<Language, Record<string, string>> = {
  en: {
    summary: 'Professional Summary',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    contact: 'Contact',
  },
  ar: {
    summary: 'الملخص المهني',
    experience: 'الخبرة',
    education: 'التعليم',
    skills: 'المهارات',
    contact: 'معلومات التواصل',
  },
};

const TEMPLATE_LAYOUTS: Record<string, 'single' | 'two-column' | 'centered'> = {
  classic: 'single',
  modern: 'two-column',
  'emerald-two-column': 'two-column',
  'audit-classic': 'single',
  'blue-analyst': 'two-column',
  'centered-executive': 'centered',
  'consulting-timeline': 'single',
  'dense-executive': 'two-column',
  'minimal-technical': 'centered',
};

const TEMPLATE_HEADING_COLORS: Record<string, string> = {
  'audit-classic': '#111827',
  'blue-analyst': '#0f3f8f',
  'centered-executive': '#151923',
  'dense-executive': '#111827',
  'minimal-technical': '#111827',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeColor(value: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#00b5a5';
}

function text(value: string): string {
  return escapeHtml(value.trim());
}

function dateRange(startDate: string, endDate: string): string {
  return [startDate.trim(), endDate.trim()].filter(Boolean).map(escapeHtml).join(' - ');
}

function descriptionLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^[\u2022\-*]\s*/, ''))
    .filter(Boolean);
}

function renderDescription(value: string, accent: string): string {
  const lines = descriptionLines(value);
  if (!lines.length) return '';

  if (lines.length === 1 && !/^[\u2022\-*]/.test(value.trim())) {
    return `<p style="margin:3pt 0 0 0;color:#374151;">${text(lines[0])}</p>`;
  }

  return lines
    .map(line => `<p style="margin:1.5pt 0;color:#374151;"><span style="color:${accent};font-weight:bold;">&#8226;</span>&nbsp;&nbsp;${text(line)}</p>`)
    .join('');
}

function renderSectionTitle(
  title: string,
  accent: string,
  headingColor: string,
  align: string,
  includeTopRule = false,
): string {
  const topRuleMarker = includeTopRule
    ? `__SIRAMIX_TOP_RULE_${accent.slice(1).toUpperCase()}__`
    : '';
  const ruleMarker = `__SIRAMIX_RULE_${accent.slice(1).toUpperCase()}__`;
  return `<p style="margin:6pt 0 3pt 0;padding:0 0 3pt 0;text-align:${align};color:${headingColor};font-size:10.5pt;font-weight:bold;letter-spacing:.4pt;">${topRuleMarker}${text(title.toUpperCase())}${ruleMarker}</p>`;
}

function renderExperience(items: WorkExperience[], accent: string, align: string): string {
  return items.map(item => {
    const dates = dateRange(item.startDate, item.endDate);
    return `<div style="page-break-inside:avoid;margin:0 0 4pt 0;">
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:360pt;vertical-align:top;text-align:${align};padding:0;">
            <p style="margin:0;font-size:10.5pt;font-weight:bold;color:#111827;">${text(item.title)}</p>
            ${item.company ? `<p style="margin:1pt 0 0 0;font-size:9.5pt;font-weight:bold;color:${accent};">${text(item.company)}</p>` : ''}
          </td>
          <td style="width:140pt;vertical-align:top;text-align:${align === 'right' ? 'left' : 'right'};padding:0;">
            <p style="margin:0;font-size:8.5pt;color:#4b5563;">${dates}</p>
          </td>
        </tr>
      </table>
      ${renderDescription(item.description, accent)}
    </div>`;
  }).join('');
}

function renderEducation(items: Education[], accent: string, align: string): string {
  return items.map(item => {
    const dates = dateRange(item.startDate, item.endDate);
    return `<div style="page-break-inside:avoid;margin:0 0 4pt 0;">
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:360pt;vertical-align:top;text-align:${align};padding:0;">
            <p style="margin:0;font-size:10pt;font-weight:bold;color:#111827;">${text(item.degree)}</p>
            ${item.institution ? `<p style="margin:1pt 0 0 0;font-size:9.5pt;font-weight:bold;color:${accent};">${text(item.institution)}</p>` : ''}
          </td>
          <td style="width:140pt;vertical-align:top;text-align:${align === 'right' ? 'left' : 'right'};padding:0;">
            <p style="margin:0;font-size:8.5pt;color:#4b5563;">${dates}</p>
          </td>
        </tr>
      </table>
      ${item.description ? `<p style="margin:3pt 0 0 0;color:#4b5563;">${text(item.description)}</p>` : ''}
    </div>`;
  }).join('');
}

function renderCompactExperience(items: WorkExperience[], accent: string): string {
  return items.map(item => {
    const dates = dateRange(item.startDate, item.endDate);
    return `<p style="margin:0;font-size:10pt;font-weight:bold;color:#111827;">${text(item.title)}</p>
      <p style="margin:1pt 0 0 0;font-size:8.8pt;color:#4b5563;">
        ${item.company ? `<span style="font-weight:bold;color:${accent};">${text(item.company)}</span>` : ''}
        ${item.company && dates ? '&nbsp;&nbsp; | &nbsp;&nbsp;' : ''}${dates}
      </p>
      ${renderDescription(item.description, accent)}
      <p style="margin:0 0 3pt 0;font-size:1pt;line-height:1pt;">&nbsp;</p>`;
  }).join('');
}

function renderCompactEducation(items: Education[], accent: string): string {
  return items.map(item => {
    const dates = dateRange(item.startDate, item.endDate);
    return `<p style="margin:0;font-size:9.8pt;font-weight:bold;color:#111827;">${text(item.degree)}</p>
      <p style="margin:1pt 0 0 0;font-size:8.8pt;color:#4b5563;">
        ${item.institution ? `<span style="font-weight:bold;color:${accent};">${text(item.institution)}</span>` : ''}
        ${item.institution && dates ? '&nbsp;&nbsp; | &nbsp;&nbsp;' : ''}${dates}
      </p>
      ${item.description ? `<p style="margin:2pt 0 0 0;color:#4b5563;">${text(item.description)}</p>` : ''}
      <p style="margin:0 0 3pt 0;font-size:1pt;line-height:1pt;">&nbsp;</p>`;
  }).join('');
}

function renderCompactSkills(items: Skill[], accent: string): string {
  return items.map(item => `<p style="margin:0 0 3pt 0;font-size:9.2pt;font-weight:bold;color:#374151;"><span style="color:${accent};">&#8226;</span>&nbsp;&nbsp;${text(item.name)}</p>`).join('');
}

function renderCompactCustomItems(items: CustomSectionItem[], accent: string): string {
  return items.map(item => {
    const dates = dateRange(item.startDate, item.endDate);
    return `<p style="margin:0;font-size:9.8pt;font-weight:bold;color:#111827;">${text(item.primaryText)}</p>
      <p style="margin:1pt 0 0 0;font-size:8.7pt;color:#4b5563;">
        ${item.secondaryText ? `<span style="font-weight:bold;color:${accent};">${text(item.secondaryText)}</span>` : ''}
        ${item.secondaryText && dates ? '&nbsp;&nbsp; | &nbsp;&nbsp;' : ''}${dates}
      </p>
      ${item.description ? `<p style="margin:2pt 0 0 0;color:#4b5563;">${text(item.description)}</p>` : ''}
      <p style="margin:0 0 3pt 0;font-size:1pt;line-height:1pt;">&nbsp;</p>`;
  }).join('');
}

function renderSkills(items: Skill[], accent: string, compact = false): string {
  const columns = compact ? 1 : items.length > 4 ? 3 : 2;
  const cellWidth = Math.floor(500 / columns);
  const rows: string[] = [];
  for (let index = 0; index < items.length; index += columns) {
    const rowItems = items.slice(index, index + columns);
    const cells = rowItems
      .map(item => `<td style="width:${cellWidth}pt;padding:2pt ${compact ? '0' : '10pt'} 2pt 0;vertical-align:top;border:none;">
        <p style="margin:0;font-size:9.5pt;font-weight:bold;color:#374151;"><span style="color:${accent};">&#8226;</span>&nbsp;&nbsp;${text(item.name)}</p>
      </td>`)
      .join('');
    const emptyCells = Array.from(
      { length: columns - rowItems.length },
      () => `<td style="width:${cellWidth}pt;border:none;"></td>`,
    ).join('');
    rows.push(`<tr>${cells}${emptyCells}</tr>`);
  }
  return `<table role="presentation" style="width:100%;border-collapse:collapse;">${rows.join('')}</table>`;
}

function renderCustomItems(items: CustomSectionItem[], accent: string, align: string): string {
  return items.map(item => `<div style="page-break-inside:avoid;margin:0 0 4pt 0;">
    <table role="presentation" style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="width:360pt;vertical-align:top;text-align:${align};padding:0;">
          <p style="margin:0;font-size:10pt;font-weight:bold;color:#111827;">${text(item.primaryText)}</p>
          ${item.secondaryText ? `<p style="margin:1pt 0 0 0;font-size:9pt;font-weight:bold;color:${accent};">${text(item.secondaryText)}</p>` : ''}
        </td>
        <td style="width:140pt;vertical-align:top;text-align:${align === 'right' ? 'left' : 'right'};padding:0;">
          <p style="margin:0;font-size:8.5pt;color:#4b5563;">${dateRange(item.startDate, item.endDate)}</p>
        </td>
      </tr>
    </table>
    ${item.description ? `<p style="margin:3pt 0 0 0;color:#4b5563;">${text(item.description)}</p>` : ''}
  </div>`).join('');
}

function renderContact(data: ResumeData, accent: string, language: Language, stacked = false): string {
  const { personalInfo } = data;
  const websiteUrl = getSafeExternalUrl(personalInfo.website);
  const values = [
    personalInfo.phone && text(personalInfo.phone),
    personalInfo.email && `<a href="mailto:${text(personalInfo.email)}" style="color:${accent};text-decoration:none;">${text(personalInfo.email)}</a>`,
    personalInfo.location && text(personalInfo.location),
    personalInfo.website && (websiteUrl
      ? `<a href="${escapeHtml(websiteUrl)}" style="color:${accent};text-decoration:none;">${text(personalInfo.website)}</a>`
      : text(personalInfo.website)),
  ].filter(Boolean);

  if (!values.length) return '';
  if (stacked) {
    return values.map(value => `<p style="margin:0 0 4pt 0;font-size:9pt;color:#4b5563;">${value}</p>`).join('');
  }

  const separator = language === 'ar' ? '&nbsp;&nbsp; | &nbsp;&nbsp;' : '&nbsp;&nbsp; &#8226; &nbsp;&nbsp;';
  return `<p style="margin:4pt 0 0 0;text-align:center;font-size:8.8pt;color:#4b5563;">${values.join(separator)}</p>`;
}

function buildSection(
  key: string,
  data: ResumeData,
  language: Language,
  accent: string,
  headingColor: string,
  align: string,
  constrainedColumn = false,
  includeTopRule = false,
): string {
  const title = data.sectionTitles[key] || BASE_SECTION_TITLES[language][key] || key;
  let content = '';

  if (key === 'summary') content = data.summary ? `<p style="margin:0;color:#374151;">${text(data.summary)}</p>` : '';
  else if (key === 'experience') content = constrainedColumn
    ? renderCompactExperience(data.experience, accent)
    : renderExperience(data.experience, accent, align);
  else if (key === 'education') content = constrainedColumn
    ? renderCompactEducation(data.education, accent)
    : renderEducation(data.education, accent, align);
  else if (key === 'skills') content = constrainedColumn
    ? renderCompactSkills(data.skills, accent)
    : renderSkills(data.skills, accent);
  else content = constrainedColumn
    ? renderCompactCustomItems(data.customSectionsData[key] || [], accent)
    : renderCustomItems(data.customSectionsData[key] || [], accent, align);

  if (!content) return '';
  if (constrainedColumn) {
    return `${renderSectionTitle(title, accent, headingColor, align, includeTopRule)}${content}`;
  }

  return `<div style="page-break-inside:auto;">
    ${renderSectionTitle(title, accent, headingColor, align, includeTopRule)}
    ${content}
  </div>`;
}

export function buildDocxHtml(
  data: ResumeData,
  options: TemplateOptions,
  language: Language,
): string {
  const isRtl = language === 'ar';
  const direction = isRtl ? 'rtl' : 'ltr';
  const align = isRtl ? 'right' : 'left';
  const accent = safeColor(options.accentColor);
  const headingColor = TEMPLATE_HEADING_COLORS[options.template] || '#111827';
  const layout = TEMPLATE_LAYOUTS[options.template] || 'single';
  const font = getFontFamilyOption(options.fontFamily).name.replace(/\s+\(.+\)$/, '');
  const fontSize = /^\d+(\.\d+)?pt$/.test(options.fontSize) ? options.fontSize : '10pt';
  const lineHeight = options.lineSpacing === 'compact' ? '1.1' : options.lineSpacing === 'spacious' ? '1.4' : '1.2';
  const centeredHeader = layout === 'centered' || options.template === 'classic' || options.template === 'modern';

  const headerAlign = centeredHeader ? 'center' : align;
  const header = `<div style="margin:0 0 5pt 0;padding:0 0 4pt 0;text-align:${headerAlign};page-break-inside:avoid;">
    <p style="margin:0;text-align:${headerAlign};font-size:21pt;line-height:1;font-weight:bold;color:${options.template === 'classic' || options.template === 'modern' ? accent : headingColor};">${text(data.personalInfo.name)}</p>
    ${data.personalInfo.title ? `<p style="margin:3pt 0 0 0;text-align:${headerAlign};font-size:11pt;font-weight:bold;color:${accent};">${text(data.personalInfo.title)}</p>` : ''}
    ${renderContact(data, accent, language)}
  </div>`;

  const mainKeys = data.sectionOrder.filter(key => key !== 'skills');
  const customKeys = data.sectionOrder.filter(key => !['summary', 'experience', 'education', 'skills'].includes(key));
  let body = '';

  if (layout === 'two-column') {
    const mainSections = mainKeys
      .filter(key => !customKeys.includes(key))
      .map(key => buildSection(key, data, language, accent, headingColor, align, true))
      .join('');
    const sidebarContact = options.template === 'modern'
      ? `${renderSectionTitle(BASE_SECTION_TITLES[language].contact, accent, headingColor, align)}${renderContact(data, accent, language, true)}`
      : '';
    const sidebarSections = [
      sidebarContact,
      buildSection('skills', data, language, accent, headingColor, align, true),
      ...customKeys.map(key => buildSection(key, data, language, accent, headingColor, align, true)),
    ].join('');

    body = `<table role="presentation" style="width:100%;border-collapse:collapse;table-layout:fixed;" dir="${direction}">
      <tr>
        <td style="width:335pt;vertical-align:top;padding:${isRtl ? '0 0 0 16pt' : '0 16pt 0 0'};text-align:${align};">${mainSections}</td>
        <td style="width:165pt;vertical-align:top;padding:${isRtl ? '0 16pt 0 0' : '0 0 0 16pt'};border-${isRtl ? 'right' : 'left'}:1pt solid #e5e7eb;text-align:${align};">${sidebarSections}</td>
      </tr>
    </table>`;
  } else {
    body = data.sectionOrder
      .map((key, index) => buildSection(key, data, language, accent, headingColor, align, false, index === 0))
      .join('');
  }

  return `<!doctype html>
  <html lang="${language}" dir="${direction}">
    <head>
      <meta charset="utf-8">
      <title>SiraMix Resume</title>
      <style>
        html, body { margin:0; padding:0; background:#ffffff; color:#111827; }
        body, p, td, a { font-family:"${escapeHtml(font)}", Arial, sans-serif; font-size:${fontSize}; line-height:${lineHeight}; }
        table { mso-table-lspace:0pt; mso-table-rspace:0pt; border:none; }
        tr, td { border:none; }
        p { orphans:2; widows:2; }
        a { color:${accent}; }
      </style>
    </head>
    <body dir="${direction}" style="direction:${direction};text-align:${align};background:#ffffff;color:#111827;">
      ${header}
      ${body}
    </body>
  </html>`;
}
