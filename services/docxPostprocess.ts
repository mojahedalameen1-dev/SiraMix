import JSZip from 'jszip';

const BORDER_SIDES = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'];
const DIVIDER_MARKER = /__SIRAMIX_RULE_([0-9A-F]{6})__/;
const TOP_DIVIDER_MARKER = /__SIRAMIX_TOP_RULE_([0-9A-F]{6})__/;

function nilTableBorders(): string {
  return `<w:tblBorders>${BORDER_SIDES
    .map(side => `<w:${side} w:val="nil"/>`)
    .join('')}</w:tblBorders>`;
}

function applyDividerRules(input: string): string {
  return input.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g, paragraph => {
    const bottomMarker = paragraph.match(DIVIDER_MARKER);
    const topMarker = paragraph.match(TOP_DIVIDER_MARKER);
    if (!bottomMarker && !topMarker) return paragraph;

    const divider = `<w:pBdr>${
      topMarker
        ? `<w:top w:val="single" w:sz="8" w:space="4" w:color="${topMarker[1]}"/>`
        : ''
    }${
      bottomMarker
        ? `<w:bottom w:val="single" w:sz="8" w:space="4" w:color="${bottomMarker[1]}"/>`
        : ''
    }</w:pBdr>`;
    const withoutMarker = paragraph
      .replace(TOP_DIVIDER_MARKER, '')
      .replace(DIVIDER_MARKER, '');

    if (withoutMarker.includes('<w:pPr>')) {
      return withoutMarker.replace('<w:pPr>', `<w:pPr>${divider}`);
    }

    return withoutMarker.replace(/^(<w:p(?:\s[^>]*)?>)/, `$1<w:pPr>${divider}</w:pPr>`);
  });
}

export async function finalizeDocx(input: Buffer): Promise<Buffer> {
  const archive = await JSZip.loadAsync(input);
  const documentFile = archive.file('word/document.xml');
  if (!documentFile) return input;

  const documentXml = await documentFile.async('string');
  const borderlessXml = documentXml
    .replace(/<w:tblBorders>[\s\S]*?<\/w:tblBorders>/g, nilTableBorders())
    .replace(/<w:tcBorders>[\s\S]*?<\/w:tcBorders>/g, '')
    .replace(/<w:shd\b[^>]*\/>/g, '');

  const compactClosingParagraph = [
    '<w:p><w:pPr>',
    '<w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/>',
    '</w:pPr><w:r><w:rPr>',
    '<w:sz w:val="2"/><w:szCs w:val="2"/>',
    '</w:rPr></w:r></w:p>',
  ].join('');
  const cleanedXml = applyDividerRules(borderlessXml).replace(
    /<w:p>\s*<w:pPr>\s*<w:spacing w:lineRule="auto"\/>\s*<\/w:pPr>\s*<w:r>\s*<w:rPr\/>\s*<\/w:r>\s*<\/w:p>\s*(?=<\/w:body>)/,
    compactClosingParagraph,
  );

  archive.file('word/document.xml', cleanedXml);
  return archive.generateAsync({ type: 'nodebuffer' });
}
