import React, { useMemo, useState } from 'react';
import { TEMPLATES } from '../constants';
import { useLanguage } from '../i18n';
import { useAuth } from './AuthContext';
import { Logo } from './Logo';
import { MoonIcon } from './icons/MoonIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SunIcon } from './icons/SunIcon';

interface LoginProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const productShots = [
  { ar: 'المحتوى', en: 'Content', detailAr: 'أقسام واضحة وتعبئة مباشرة', detailEn: 'Clear sections and fast editing' },
  { ar: 'القوالب', en: 'Templates', detailAr: '7 قوالب واقعية داخل المحرر', detailEn: '7 realistic editor templates' },
  { ar: 'التصدير', en: 'Export', detailAr: 'PDF وDOCX وJPG بنقرة واحدة', detailEn: 'PDF, DOCX, and JPG in one click' },
];

const steps = [
  { ar: 'اختر قالبًا يناسب قطاعك', en: 'Choose a field-ready template' },
  { ar: 'اكتب نسخة عربية وإنجليزية مستقلة', en: 'Write separate Arabic and English versions' },
  { ar: 'صدّر سيرتك وقدّم بثقة', en: 'Export and apply with confidence' },
];

const faqs = [
  {
    ar: ['هل أقدر أبدأ مجانًا؟', 'نعم. يمكنك تجربة المحرر والقوالب والتصدير بدون بطاقة بنكية.'],
    en: ['Can I start for free?', 'Yes. You can try the editor, templates, and exports without a card.'],
  },
  {
    ar: ['هل القوالب مناسبة للـ ATS؟', 'القوالب مبنية بعناوين وأقسام واضحة تساعد أنظمة الفرز على قراءة السيرة.'],
    en: ['Are the templates ATS-friendly?', 'Templates use clear structure and familiar section labels for screening systems.'],
  },
  {
    ar: ['هل العربية والإنجليزية نفس المحتوى؟', 'لا. يمكنك بناء نسختين مستقلتين من نفس الحساب، وليست ترجمة تلقائية.'],
    en: ['Are Arabic and English the same content?', 'No. You can build two independent versions from the same account.'],
  },
];

export const Login: React.FC<LoginProps> = ({ theme, setTheme }) => {
  const { signInWithGoogle, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [authError, setAuthError] = useState<string | null>(null);
  const isRtl = language === 'ar';
  const featuredTemplates = useMemo(() => TEMPLATES.filter(template => !['classic', 'modern'].includes(template.id)), []);

  const copy = {
    navFeatures: isRtl ? 'المزايا' : 'Features',
    navTemplates: isRtl ? 'القوالب' : 'Templates',
    navFaq: isRtl ? 'الأسئلة' : 'FAQ',
    heroEyebrow: isRtl ? 'سيرتان مستقلتان: عربية وإنجليزية' : 'Two independent resumes: Arabic and English',
    heroTitle: isRtl ? 'سيرة جاهزة للتقديم قبل أن تفوتك الفرصة' : 'Build the resume before the opportunity moves on',
    heroBody: isRtl
      ? 'سيرا ميكس يساعدك تبني سيرة احترافية للسوق السعودي والعربي: قوالب واقعية، فحص ATS محلي، وتصدير فوري بدون تعقيد.'
      : 'SiraMix helps you build polished resumes for serious applications: realistic templates, local ATS checks, and clean exports.',
    primaryCta: isRtl ? 'ابدأ الآن عبر Google' : 'Continue with Google',
    secondaryCta: isRtl ? 'شاهد القوالب' : 'View templates',
    heroNote: isRtl ? 'مجاني للبدء، بدون بطاقة بنكية، وبدون علامة مائية.' : 'Free to start. No card. No watermark.',
    templatesTitle: isRtl ? 'قوالب واقعية داخل النظام' : 'Real templates inside the product',
    templatesBody: isRtl ? 'المعرض هنا ليس رسومات تسويقية. هذه نفس القوالب المتاحة داخل المحرر والتصدير.' : 'These are not marketing mockups. They are the same templates available in the editor and exports.',
    productTitle: isRtl ? 'كيف تبدو داخل المحرر؟' : 'What does the editor feel like?',
    featuresTitle: isRtl ? 'مصممة للباحث العربي عن عمل' : 'Designed for Arabic-first job seekers',
    bottomTitle: isRtl ? 'جاهز تبني سيرة تليق بخبرتك؟' : 'Ready to build a resume that carries your experience?',
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setAuthError(isRtl ? `تعذر بدء تسجيل الدخول. ${message}` : `Could not start sign in. ${message}`);
    }
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen overflow-x-hidden bg-[#f5f0e8] text-[#202432] dark:bg-[#0f1418] dark:text-white font-thmanyah">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f5f0e8]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1418]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Logo size="md" showText={false} />
          <nav className="hidden items-center gap-8 text-sm font-black text-[#62635f] dark:text-white/65 md:flex">
            <a href="#features" className="transition hover:text-[#123d35]">{copy.navFeatures}</a>
            <a href="#templates" className="transition hover:text-[#123d35]">{copy.navTemplates}</a>
            <a href="#faq" className="transition hover:text-[#123d35]">{copy.navFaq}</a>
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setLanguage(isRtl ? 'en' : 'ar')} className="h-10 rounded-full border border-black/10 bg-white px-3 text-xs font-black shadow-sm dark:border-white/10 dark:bg-white/10">
              {isRtl ? 'EN' : 'عربي'}
            </button>
            <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
              <span className="[&>svg]:h-5 [&>svg]:w-5">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</span>
            </button>
            <button type="button" onClick={handleSignIn} disabled={loading} className="hidden rounded-full bg-[#17201d] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 disabled:opacity-60 sm:inline-flex">
              {copy.primaryCta}
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(213,255,99,0.35),transparent_28%),radial-gradient(circle_at_18%_8%,rgba(22,101,82,0.18),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 lg:grid-cols-[1fr_0.88fr] lg:px-8 lg:py-24">
          <div className="animate-rise-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-sm font-black text-[#126052] shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-[#d5ff63]">
              <SparklesIcon className="h-4 w-4" />
              {copy.heroEyebrow}
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-[#202432] dark:text-white md:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-bold leading-9 text-[#64625c] dark:text-white/70 md:text-xl">
              {copy.heroBody}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={handleSignIn} disabled={loading} className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#17201d] px-8 text-base font-black text-white shadow-xl shadow-black/15 transition hover:-translate-y-0.5 disabled:opacity-60">
                {loading ? (isRtl ? 'جار التحميل...' : 'Loading...') : copy.primaryCta}
              </button>
              <a href="#templates" className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-black/10 bg-white px-7 text-base font-black text-[#17201d] shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white">
                {copy.secondaryCta}
              </a>
            </div>
            <p className="mt-4 text-sm font-bold text-[#73716a] dark:text-white/55">{copy.heroNote}</p>
            {authError && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">{authError}</div>}
          </div>

          <div className="animate-float-slow rounded-[2rem] border border-black/10 bg-white p-4 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-[#171d22]">
            <div className="flex items-center justify-between rounded-2xl bg-[#f7fbf4] px-4 py-3 text-[11px] font-black dark:bg-white/5">
              {['Arabic', 'English', 'ATS', 'Export'].map((item, index) => (
                <span key={item} className={index === 2 ? 'rounded-full bg-[#d5ff63] px-2 py-1 text-[#17201d]' : 'text-[#59615d] dark:text-white/60'}>{item}</span>
              ))}
            </div>
            <div className="mt-4 rounded-[1.5rem] bg-[#fbfcfa] p-6 dark:bg-[#101418]">
              <div className="flex items-start justify-between border-b border-black/10 pb-4 dark:border-white/10">
                <div>
                  <div className="h-4 w-44 animate-type-line rounded-full bg-[#202432] dark:bg-white" />
                  <div className="mt-3 h-2.5 w-36 animate-type-line rounded-full bg-[#18a56f]" />
                </div>
                <div className="rounded-2xl bg-[#d5ff63] px-3 py-2 text-xs font-black text-[#17201d]">ATS 92%</div>
              </div>
              <div className="mt-5 space-y-4">
                {[0, 1, 2, 3].map(row => (
                  <div key={row} className="rounded-2xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="h-2.5 w-2/5 rounded-full bg-[#202432]/85 dark:bg-white/80" />
                    <div className="mt-3 h-2 w-full rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="mt-2 h-2 w-5/6 rounded-full bg-black/10 dark:bg-white/10" />
                  </div>
                ))}
              </div>
              <div className="mt-5 inline-flex rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-700">{isRtl ? 'PDF جاهز للتصدير' : 'PDF ready to export'}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-[#12181d]">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.en} className="reveal-card rounded-2xl border border-black/5 bg-[#f5f0e8] p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="mb-6 grid h-11 w-11 place-items-center rounded-xl bg-[#17201d] text-base font-black text-white">{index + 1}</div>
                <h3 className="text-xl font-black">{isRtl ? step.ar : step.en}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-black leading-tight md:text-5xl">{copy.templatesTitle}</h2>
              <p className="mt-4 max-w-2xl text-base font-bold leading-8 text-[#64625c] dark:text-white/65">{copy.templatesBody}</p>
            </div>
            <button type="button" onClick={handleSignIn} className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10">
              {copy.primaryCta}
            </button>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTemplates.map(template => (
              <article key={template.id} className="group rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                <div className="aspect-[3/4] rounded-xl bg-[#f7fbf4] p-4 dark:bg-[#101418]">
                  <div className="h-full rounded-lg border bg-white p-3 dark:border-white/10 dark:bg-[#171d22]" style={{ borderColor: `${template.accent}55` }}>
                    <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: template.accent }} />
                    <div className="mt-2 h-1.5 w-1/2 rounded-full bg-slate-300" />
                    <div className="my-4 h-px bg-slate-200" />
                    <div className={template.layout === 'single' || template.layout === 'centered' || template.layout === 'minimal' ? 'space-y-2' : 'grid grid-cols-[1.5fr_1fr] gap-2'}>
                      <div className="space-y-2">
                        <div className="h-1.5 rounded-full bg-slate-200" />
                        <div className="h-1.5 w-5/6 rounded-full bg-slate-200" />
                        <div className="h-1.5 w-3/4 rounded-full bg-slate-200" />
                        <div className="h-1.5 rounded-full bg-slate-200" />
                      </div>
                      {!(template.layout === 'single' || template.layout === 'centered' || template.layout === 'minimal') && <div className="rounded-lg opacity-25" style={{ backgroundColor: template.accent }} />}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black">{isRtl ? template.nameAr : template.nameEn}</h3>
                    <p className="mt-1 text-xs font-bold text-[#686761] dark:text-white/60">{isRtl ? template.categoryAr : template.categoryEn}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-700">ATS</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#17201d] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">{copy.featuresTitle}</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {productShots.map(shot => (
              <article key={shot.en} className="rounded-2xl border border-white/10 bg-white/[0.07] p-6">
                <h3 className="text-2xl font-black text-[#d5ff63]">{isRtl ? shot.ar : shot.en}</h3>
                <p className="mt-4 text-base font-bold leading-8 text-white/70">{isRtl ? shot.detailAr : shot.detailEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <h2 className="text-center text-4xl font-black">{isRtl ? 'أسئلة مهمة قبل البدء' : 'Before you start'}</h2>
          <div className="mt-10 space-y-4">
            {faqs.map(item => {
              const [q, a] = isRtl ? item.ar : item.en;
              return (
                <details key={q} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <summary className="cursor-pointer text-lg font-black">{q}</summary>
                  <p className="mt-4 text-base font-bold leading-8 text-[#686761] dark:text-white/65">{a}</p>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-black/5 bg-white px-6 py-12 text-center shadow-xl shadow-black/10 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-4xl font-black leading-tight md:text-5xl">{copy.bottomTitle}</h2>
          <button type="button" onClick={handleSignIn} disabled={loading} className="mt-8 rounded-full bg-[#17201d] px-8 py-4 text-base font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60">
            {copy.primaryCta}
          </button>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white py-10 text-center dark:border-white/10 dark:bg-[#101418]">
        <div className="flex items-center justify-center gap-3">
          <Logo size="sm" showText={false} />
          <span className="text-lg font-black">SiraMix</span>
        </div>
        <p className="mt-3 text-sm font-bold text-[#74736d] dark:text-white/50">
          {isRtl ? 'صناعة عربية لسيرة أوضح وأقوى' : 'Arabic-first resume building for stronger applications'}
        </p>
      </footer>
    </main>
  );
};
