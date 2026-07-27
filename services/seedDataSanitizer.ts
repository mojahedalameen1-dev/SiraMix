import { DEFAULT_RESUME_DATA, DEFAULT_RESUME_DATA_AR } from '../constants';
import { DualResumeData, ResumeData } from '../types';

// Non-reversible fingerprints identify only the legacy demo profiles.
const LEGACY_ENGLISH_FINGERPRINTS = new Set([4232773516, 3497012061]);
const LEGACY_ARABIC_FINGERPRINTS = new Set([1173661670, 3497012061, 3311097838]);

function fingerprint(value: string): number {
  let hash = 2166136261;
  for (const character of value.trim().toLowerCase()) {
    hash ^= character.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function containsLegacyProfile(data: ResumeData, fingerprints: Set<number>): boolean {
  const values = [
    data.personalInfo.name,
    data.personalInfo.email,
    data.personalInfo.phone,
  ].filter(Boolean);

  return values.some(value => fingerprints.has(fingerprint(value)));
}

function isResumeData(value: unknown): value is ResumeData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ResumeData>;
  return Boolean(
    candidate.personalInfo
    && typeof candidate.personalInfo === 'object'
    && Array.isArray(candidate.experience)
    && Array.isArray(candidate.education)
    && Array.isArray(candidate.skills),
  );
}

export function sanitizeLegacySeedData(input: unknown): {
  data: DualResumeData;
  changed: boolean;
} {
  if (isResumeData(input)) {
    return {
      data: {
        en: structuredClone(input),
        ar: structuredClone(input),
      },
      changed: true,
    };
  }

  if (!input || typeof input !== 'object') {
    return {
      data: {
        en: structuredClone(DEFAULT_RESUME_DATA),
        ar: structuredClone(DEFAULT_RESUME_DATA_AR),
      },
      changed: true,
    };
  }

  const candidate = input as Partial<DualResumeData>;
  if (!isResumeData(candidate.en) || !isResumeData(candidate.ar)) {
    return {
      data: {
        en: isResumeData(candidate.en) ? candidate.en : structuredClone(DEFAULT_RESUME_DATA),
        ar: isResumeData(candidate.ar) ? candidate.ar : structuredClone(DEFAULT_RESUME_DATA_AR),
      },
      changed: true,
    };
  }

  const data = candidate as DualResumeData;
  const clearEnglish = containsLegacyProfile(data.en, LEGACY_ENGLISH_FINGERPRINTS);
  const clearArabic = containsLegacyProfile(data.ar, LEGACY_ARABIC_FINGERPRINTS);

  if (!clearEnglish && !clearArabic) {
    return { data, changed: false };
  }

  return {
    data: {
      en: clearEnglish ? structuredClone(DEFAULT_RESUME_DATA) : data.en,
      ar: clearArabic ? structuredClone(DEFAULT_RESUME_DATA_AR) : data.ar,
    },
    changed: true,
  };
}
