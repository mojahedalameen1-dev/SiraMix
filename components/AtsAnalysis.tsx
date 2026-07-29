import React, { useMemo } from 'react';
import { ResumeData } from '../types';
import { CircularProgress } from './CircularProgress';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { useTranslation } from '../i18n';

interface AtsAnalysisProps {
  data: ResumeData;
  onSelectSection?: (section: string) => void;
}

type CheckStatus = 'passed' | 'warning' | 'error';

interface AtsCheck {
  id: string;
  section: string;
  status: CheckStatus;
  points: number;
  maxPoints: number;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  fixEn?: string;
  fixAr?: string;
}

const actionVerbsEn = ['led', 'managed', 'built', 'improved', 'reduced', 'increased', 'delivered', 'implemented', 'optimized', 'created'];
const actionVerbsAr = ['قدت', 'أدرت', 'طورت', 'حسنت', 'خفضت', 'رفعت', 'نفذت', 'أنشأت', 'حققت', 'نسقت'];

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function analyzeResume(data: ResumeData): { score: number; checks: AtsCheck[] } {
  const info = data.personalInfo;
  const summaryWords = countWords(data.summary || '');
  const experienceText = data.experience.map(item => item.description).join(' ').toLowerCase();
  const hasMetrics = /\d+|%|٪|ريال|مليون|ألف|kpi|users|customers|sales/i.test(experienceText);
  const hasActionVerbs = [...actionVerbsEn, ...actionVerbsAr].some(verb => experienceText.includes(verb.toLowerCase()));
  const hasBullets = data.experience.some(item => /(^|\n)\s*(-|•|\*)/.test(item.description || ''));

  const checks: AtsCheck[] = [
    {
      id: 'contact',
      section: 'personalInfo',
      status: info.name && info.title && info.email && info.phone ? 'passed' : 'error',
      points: info.name && info.title && info.email && info.phone ? 20 : 8,
      maxPoints: 20,
      titleEn: 'Core contact details',
      titleAr: 'بيانات التواصل الأساسية',
      bodyEn: 'Name, job title, email, and phone are required for recruiter follow-up.',
      bodyAr: 'الاسم، المسمى الوظيفي، البريد، ورقم الجوال عناصر أساسية لتواصل مسؤول التوظيف.',
      fixEn: 'Complete the missing personal information fields.',
      fixAr: 'أكمل الحقول الناقصة في المعلومات الشخصية.',
    },
    {
      id: 'summary',
      section: 'summary',
      status: summaryWords >= 30 && summaryWords <= 100 ? 'passed' : summaryWords > 0 ? 'warning' : 'error',
      points: summaryWords >= 30 && summaryWords <= 100 ? 18 : summaryWords > 0 ? 10 : 0,
      maxPoints: 18,
      titleEn: 'Focused professional summary',
      titleAr: 'ملخص مهني مركز',
      bodyEn: 'A strong summary gives recruiters a quick reason to continue reading.',
      bodyAr: 'الملخص القوي يعطي مسؤول التوظيف سببًا سريعًا لإكمال قراءة السيرة.',
      fixEn: 'Write 30-100 words covering seniority, specialization, and measurable value.',
      fixAr: 'اكتب من 30 إلى 100 كلمة توضح خبرتك وتخصصك والقيمة التي تقدمها.',
    },
    {
      id: 'experience',
      section: 'experience',
      status: data.experience.length ? 'passed' : 'error',
      points: data.experience.length ? 18 : 0,
      maxPoints: 18,
      titleEn: 'Work experience present',
      titleAr: 'وجود الخبرة العملية',
      bodyEn: 'ATS and recruiters give high weight to work history and responsibilities.',
      bodyAr: 'أنظمة الفرز ومسؤولو التوظيف يعطون الخبرة العملية وزنًا عاليًا.',
      fixEn: 'Add at least one recent role with company, dates, and responsibilities.',
      fixAr: 'أضف وظيفة واحدة على الأقل مع الشركة والتواريخ والمسؤوليات.',
    },
    {
      id: 'experience-quality',
      section: 'experience',
      status: hasBullets && hasActionVerbs ? 'passed' : data.experience.length ? 'warning' : 'error',
      points: hasBullets && hasActionVerbs ? 16 : data.experience.length ? 8 : 0,
      maxPoints: 16,
      titleEn: 'Readable achievement bullets',
      titleAr: 'نقاط إنجاز قابلة للقراءة',
      bodyEn: 'Bullet points with action verbs are easier for ATS and recruiters to scan.',
      bodyAr: 'النقاط التي تبدأ بأفعال عملية أسهل قراءة لأنظمة الفرز ومسؤولي التوظيف.',
      fixEn: 'Use bullets that start with verbs such as Led, Improved, Delivered, or Arabic equivalents.',
      fixAr: 'استخدم نقاطًا تبدأ بأفعال مثل: قدت، حسنت، نفذت، حققت.',
    },
    {
      id: 'metrics',
      section: 'experience',
      status: hasMetrics ? 'passed' : data.experience.length ? 'warning' : 'error',
      points: hasMetrics ? 12 : data.experience.length ? 5 : 0,
      maxPoints: 12,
      titleEn: 'Measurable impact',
      titleAr: 'إنجازات قابلة للقياس',
      bodyEn: 'Numbers, percentages, and scale make achievements more credible.',
      bodyAr: 'الأرقام والنسب وحجم العمل تجعل الإنجازات أكثر إقناعًا.',
      fixEn: 'Add realistic numbers: team size, growth, time saved, revenue, or volume.',
      fixAr: 'أضف أرقامًا واقعية مثل حجم الفريق، نسبة التحسن، الوقت الموفر، أو حجم المبيعات.',
    },
    {
      id: 'skills',
      section: 'skills',
      status: data.skills.length >= 6 && data.skills.length <= 15 ? 'passed' : data.skills.length ? 'warning' : 'error',
      points: data.skills.length >= 6 && data.skills.length <= 15 ? 16 : data.skills.length ? 8 : 0,
      maxPoints: 16,
      titleEn: 'Keyword skills balance',
      titleAr: 'توازن الكلمات المفتاحية',
      bodyEn: 'A focused skills list helps ATS match the resume to the target role.',
      bodyAr: 'قائمة المهارات المركزة تساعد أنظمة الفرز على مطابقة السيرة مع الوظيفة المستهدفة.',
      fixEn: 'Aim for 6-15 relevant skills and remove outdated or unrelated terms.',
      fixAr: 'استهدف من 6 إلى 15 مهارة مرتبطة بالوظيفة واحذف المهارات القديمة أو غير المهمة.',
    },
  ];

  const max = checks.reduce((sum, check) => sum + check.maxPoints, 0);
  const points = checks.reduce((sum, check) => sum + check.points, 0);
  return { score: Math.round((points / max) * 100), checks };
}

export const AtsAnalysis: React.FC<AtsAnalysisProps> = ({ data, onSelectSection }) => {
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const analysis = useMemo(() => analyzeResume(data), [data]);
  const topFixes = analysis.checks.filter(check => check.status !== 'passed').slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="brand-surface relative overflow-hidden rounded-2xl p-5">
        <div className="pointer-events-none absolute -end-12 -top-12 h-36 w-36 rounded-full bg-[#67c7a5]/15 blur-2xl" />
        <div className="flex flex-col items-center gap-5 md:flex-row">
          <CircularProgress score={analysis.score} size={116} strokeWidth={10} />
          <div className="flex-1 text-center md:text-start">
            <h3 className="text-xl font-black text-foreground">{t('ats.title')}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{t('ats.subtitle')}</p>
            <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black ${analysis.score >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-700'}`}>
              {analysis.score >= 80 ? t('ats.excellent') : t('ats.needsWork')}
            </span>
          </div>
        </div>
      </div>

      {topFixes.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <h4 className="mb-3 text-sm font-black text-amber-800 dark:text-amber-300">{t('ats.topFixes')}</h4>
          <div className="space-y-3">
            {topFixes.map(check => (
              <button
                key={check.id}
                onClick={() => onSelectSection?.(check.section)}
                className="w-full rounded-xl bg-background p-3 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="block text-sm font-black text-foreground">{isRtl ? check.titleAr : check.titleEn}</span>
                <span className="mt-1 block text-xs leading-6 text-muted-foreground">{isRtl ? check.fixAr : check.fixEn}</span>
                <span className="mt-2 inline-flex text-xs font-black text-[#17664f] dark:text-[#83e0bf]">{t('ats.goToSection')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="px-1 text-xs font-black uppercase tracking-widest text-muted-foreground">{t('ats.allChecks')}</h4>
        {analysis.checks.map(check => {
          const passed = check.status === 'passed';
          const warning = check.status === 'warning';
          return (
            <div
              key={check.id}
              className={`rounded-2xl border p-4 ${passed ? 'border-emerald-500/20 bg-emerald-500/5' : warning ? 'border-amber-500/20 bg-amber-500/5' : 'border-red-500/20 bg-red-500/5'}`}
            >
              <div className="flex items-start gap-3">
                <span className={passed ? 'text-emerald-600' : warning ? 'text-amber-600' : 'text-red-600'}>
                  {passed ? <CheckCircleIcon className="h-5 w-5" /> : <LightbulbIcon className="h-5 w-5" />}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h5 className="text-sm font-black text-foreground">{isRtl ? check.titleAr : check.titleEn}</h5>
                    <span className="rounded-full bg-background px-2 py-1 text-[10px] font-black text-muted-foreground">
                      {check.status === 'passed' ? t('ats.passed') : check.status === 'warning' ? t('ats.warning') : t('ats.error')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{isRtl ? check.bodyAr : check.bodyEn}</p>
                  {!passed && (
                    <button onClick={() => onSelectSection?.(check.section)} className="mt-3 text-xs font-black text-[#17664f] hover:text-[#ff6b4a] dark:text-[#83e0bf]">
                      {t('ats.goToSection')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
