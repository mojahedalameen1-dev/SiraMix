import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from '../i18n';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { Logo } from './Logo';
import { SparklesIcon } from './icons/SparklesIcon';

interface LoginProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const metrics = [
  { value: '+8', labelAr: 'قوالب عربية وإنجليزية', labelEn: 'Arabic & English templates' },
  { value: 'ATS', labelAr: 'تنسيق مناسب للفرز الآلي', labelEn: 'ATS-ready structure' },
  { value: 'PDF', labelAr: 'تصدير فوري بدون علامة مائية', labelEn: 'No-watermark exports' },
];

const steps = [
  {
    titleAr: 'اختر قالبًا يليق بقطاعك',
    titleEn: 'Pick a template for your field',
    bodyAr: 'ابدأ من قالب مرتب للمحاسبة، الإدارة، التقنية، الرعاية الصحية أو قالب عام قابل للتخصيص.',
    bodyEn: 'Start with a clean template for finance, admin, tech, healthcare, or a flexible general layout.',
  },
  {
    titleAr: 'اكتب محتوى مهنيًا واضحًا',
    titleEn: 'Write sharper career content',
    bodyAr: 'رتب الخبرات والمهارات والإنجازات بصياغة مفهومة للمسؤول وقابلة للقراءة من أنظمة ATS.',
    bodyEn: 'Structure experience, skills, and achievements in a recruiter-friendly and ATS-readable format.',
  },
  {
    titleAr: 'نزّل سيرتك وقدّم بثقة',
    titleEn: 'Download and apply confidently',
    bodyAr: 'صدّر سيرتك كملف PDF أو صورة، واحتفظ بنسخة قابلة للتعديل في أي وقت.',
    bodyEn: 'Export as PDF or image and keep an editable version ready for later updates.',
  },
];

const featureCards = [
  {
    titleAr: 'تجربة عربية أصلية',
    titleEn: 'Native Arabic experience',
    bodyAr: 'اتجاه RTL، محتوى عربي طبيعي، ومساحات قراءة مريحة للباحثين عن عمل في السوق السعودي والخليجي.',
    bodyEn: 'RTL layout, natural Arabic copy, and readable spacing for GCC job seekers.',
  },
  {
    titleAr: 'مصمم للتقديم الحقيقي',
    titleEn: 'Built for real applications',
    bodyAr: 'لا يركز على الشكل فقط؛ بل يساعدك على إبراز الدور، النتائج، الكلمات المفتاحية، وسهولة الفحص.',
    bodyEn: 'Not just visual polish. It helps surface roles, outcomes, keywords, and scan-friendly sections.',
  },
  {
    titleAr: 'خصوصية وتحكم',
    titleEn: 'Privacy and control',
    bodyAr: 'سيرتك تبقى باسمك، بدون علامة مائية، ويمكنك تعديلها أو حذفها عند الحاجة.',
    bodyEn: 'Your resume stays yours, without watermarks, and can be edited or deleted when needed.',
  },
];

const templateNames = [
  ['محترف تنفيذي', 'Executive'],
  ['تقني حديث', 'Modern Tech'],
  ['محاسبة ومالية', 'Finance'],
  ['طبي وإداري', 'Healthcare'],
];

export const Login: React.FC<LoginProps> = ({ theme, setTheme }) => {
  const { signInWithGoogle, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [authError, setAuthError] = useState<string | null>(null);
  const isRtl = language === 'ar';

  const copy = {
    navFeatures: isRtl ? 'المزايا' : 'Features',
    navTemplates: isRtl ? 'القوالب' : 'Templates',
    navFaq: isRtl ? 'الأسئلة' : 'FAQ',
    heroEyebrow: isRtl ? 'سيرة ذاتية عربية وإنجليزية في دقائق' : 'Arabic and English resumes in minutes',
    heroTitle: isRtl
      ? 'سيرة ذاتية تقنع المسؤول قبل المقابلة'
      : 'A resume that earns attention before the interview',
    heroBody: isRtl
      ? 'سيرا ميكس يساعدك تبني سيرة احترافية بلغة عربية واضحة، تنسيق نظيف، وقوالب مناسبة للتقديم في الشركات داخل المملكة وخارجها.'
      : 'SiraMix helps you build a polished resume with clean structure, bilingual support, and templates made for serious job applications.',
    primaryCta: isRtl ? 'ابدأ الآن عبر Google' : 'Continue with Google',
    secondaryNote: isRtl ? 'مجاني للبدء، بدون بطاقة بنكية وبدون علامة مائية' : 'Free to start. No card. No watermark.',
    previewName: isRtl ? 'نورة العتيبي' : 'Noura Alotaibi',
    previewRole: isRtl ? 'مديرة عمليات | خبرة 7 سنوات' : 'Operations Manager | 7 years',
    previewSummary: isRtl
      ? 'قائدة تشغيل تملك خبرة في تحسين الإجراءات، إدارة الفرق، ورفع مؤشرات الأداء في بيئات عمل سريعة.'
      : 'Operations leader experienced in process improvement, team management, and performance growth.',
    stepsTitle: isRtl ? 'من صفحة فارغة إلى سيرة جاهزة للتقديم' : 'From blank page to application-ready resume',
    featuresTitle: isRtl ? 'تجربة مصممة للباحث العربي عن عمل' : 'Designed for Arabic-first job seekers',
    templatesTitle: isRtl ? 'قوالب هادئة، واضحة، وتقرأها أنظمة التوظيف' : 'Clean templates that hiring systems can read',
    faqTitle: isRtl ? 'أسئلة مهمة قبل البدء' : 'Before you start',
    bottomTitle: isRtl ? 'جاهز تبني سيرة تليق بخبرتك؟' : 'Ready to build a stronger resume?',
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setAuthError(
        isRtl
          ? `تعذر بدء تسجيل الدخول. ${message}`
          : `Could not start sign in. ${message}`
      );
    }
  };

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen overflow-x-hidden bg-[#f7f3ed] text-[#202432] dark:bg-[#101418] dark:text-white font-thmanyah"
    >
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f3ed]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#101418]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Logo size="md" showText={false} />

          <nav className="hidden items-center gap-8 text-sm font-bold text-[#5f625d] dark:text-white/65 md:flex">
            <a href="#features" className="hover:text-[#202432] dark:hover:text-white">{copy.navFeatures}</a>
            <a href="#templates" className="hover:text-[#202432] dark:hover:text-white">{copy.navTemplates}</a>
            <a href="#faq" className="hover:text-[#202432] dark:hover:text-white">{copy.navFaq}</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(isRtl ? 'en' : 'ar')}
              aria-label="Toggle language"
              className="h-10 min-w-10 rounded-full border border-black/10 bg-white px-3 text-sm font-black text-[#202432] shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              {isRtl ? 'EN' : 'ع'}
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#202432] shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              <span className="flex h-5 w-5 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </span>
            </button>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="hidden rounded-full bg-[#202432] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#0f1219] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex dark:bg-[#d5ff63] dark:text-[#101418]"
            >
              {copy.primaryCta}
            </button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_25%_20%,rgba(213,255,99,0.35),transparent_32%),radial-gradient(circle_at_75%_5%,rgba(22,163,121,0.18),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_0.85fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-black text-[#2f6f4e] shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-[#d5ff63]">
              <SparklesIcon className="h-4 w-4" />
              {copy.heroEyebrow}
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-normal text-[#202432] dark:text-white md:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-xl font-medium leading-9 text-[#65645f] dark:text-white/70">
              {copy.heroBody}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-[#202432] px-8 text-base font-black text-white shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:bg-[#0f1219] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#d5ff63] dark:text-[#101418]"
              >
                {loading ? (isRtl ? 'جار التحميل...' : 'Loading...') : copy.primaryCta}
              </button>
              <p className="text-sm font-bold text-[#74736d] dark:text-white/55">{copy.secondaryNote}</p>
            </div>

            {authError && (
              <div className="mt-5 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold leading-7 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
                {authError}
              </div>
            )}

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map((item) => (
                <div key={item.value} className="rounded-3xl border border-black/5 bg-white/65 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="text-3xl font-black text-[#202432] dark:text-[#d5ff63]">{item.value}</div>
                  <div className="mt-2 text-sm font-bold leading-6 text-[#686761] dark:text-white/60">
                    {isRtl ? item.labelAr : item.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-black/10 bg-white p-4 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-[#171d22]">
              <div className="rounded-[1.5rem] bg-[#f9fbf7] p-6 dark:bg-[#0f1418]">
                <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
                  <div>
                    <p className="text-3xl font-black text-[#202432] dark:text-white">{copy.previewName}</p>
                    <p className="mt-2 text-sm font-black text-[#2f6f4e] dark:text-[#d5ff63]">{copy.previewRole}</p>
                  </div>
                  <div className="rounded-2xl bg-[#d5ff63] px-3 py-2 text-xs font-black text-[#202432]">ATS 92%</div>
                </div>
                <p className="mt-5 text-sm font-medium leading-7 text-[#65645f] dark:text-white/65">{copy.previewSummary}</p>
                <div className="mt-6 space-y-4">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="rounded-2xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="h-3 w-2/5 rounded-full bg-[#202432]/80 dark:bg-white/80" />
                      <div className="mt-3 h-2 w-full rounded-full bg-black/10 dark:bg-white/10" />
                      <div className="mt-2 h-2 w-4/5 rounded-full bg-black/10 dark:bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-[#12181d]">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="max-w-3xl text-4xl font-black leading-tight text-[#202432] dark:text-white md:text-5xl">
            {copy.stepsTitle}
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.titleEn} className="rounded-3xl border border-black/5 bg-[#f7f3ed] p-7 dark:border-white/10 dark:bg-white/5">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#202432] text-lg font-black text-white dark:bg-[#d5ff63] dark:text-[#101418]">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-black text-[#202432] dark:text-white">{isRtl ? step.titleAr : step.titleEn}</h3>
                <p className="mt-4 text-base font-medium leading-8 text-[#686761] dark:text-white/65">{isRtl ? step.bodyAr : step.bodyEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-4xl font-black leading-tight text-[#202432] dark:text-white md:text-5xl">
              {copy.templatesTitle}
            </h2>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-black text-[#202432] shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              {isRtl ? 'استعرض القوالب داخل المحرر' : 'Browse templates in editor'}
            </button>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {templateNames.map(([ar, en], index) => (
              <div key={en} className="group rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                <div className="aspect-[3/4] rounded-2xl bg-[#f9fbf7] p-4 dark:bg-[#0f1418]">
                  <div className={`h-full rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-[#171d22] ${index % 2 === 0 ? 'border-[#2f6f4e]/30' : 'border-[#d8a15d]/35'}`}>
                    <div className="h-3 w-2/3 rounded-full bg-[#202432]" />
                    <div className="mt-2 h-2 w-1/2 rounded-full bg-black/15" />
                    <div className="my-5 h-px bg-black/10" />
                    <div className="space-y-3">
                      <div className="h-2 rounded-full bg-black/10" />
                      <div className="h-2 w-5/6 rounded-full bg-black/10" />
                      <div className="h-2 w-2/3 rounded-full bg-black/10" />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-2">
                      <div className="h-16 rounded-lg bg-[#d5ff63]/45" />
                      <div className="h-16 rounded-lg bg-black/5" />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-lg font-black text-[#202432] dark:text-white">{isRtl ? ar : en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#202432] py-20 text-white dark:bg-black">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">{copy.featuresTitle}</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <article key={feature.titleEn} className="rounded-3xl border border-white/10 bg-white/7 p-7">
                <h3 className="text-2xl font-black text-[#d5ff63]">{isRtl ? feature.titleAr : feature.titleEn}</h3>
                <p className="mt-4 text-base font-medium leading-8 text-white/70">{isRtl ? feature.bodyAr : feature.bodyEn}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <h2 className="text-center text-4xl font-black text-[#202432] dark:text-white">{copy.faqTitle}</h2>
          <div className="mt-10 space-y-4">
            {[
              [isRtl ? 'هل أقدر أبدأ مجانًا؟' : 'Can I start for free?', isRtl ? 'نعم. يمكنك إنشاء سيرة وتجربة القوالب والتصدير بدون بطاقة بنكية.' : 'Yes. You can create a resume, try templates, and export without a card.'],
              [isRtl ? 'هل القوالب مناسبة للـ ATS؟' : 'Are templates ATS-friendly?', isRtl ? 'القوالب مصممة ببنية واضحة وعناوين مألوفة تساعد أنظمة الفرز على قراءة المحتوى.' : 'Templates use clear structure and familiar section labels to help screening systems parse content.'],
              [isRtl ? 'لماذا أحتاج تسجيل الدخول؟' : 'Why do I need to sign in?', isRtl ? 'حتى نحفظ سيرتك بأمان ونرجعها لك عند تعديلها أو تحميل نسخة جديدة.' : 'So your resume can be saved securely and restored when you edit or export again.'],
            ].map(([q, a]) => (
              <details key={q} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <summary className="cursor-pointer text-lg font-black text-[#202432] dark:text-white">{q}</summary>
                <p className="mt-4 text-base font-medium leading-8 text-[#686761] dark:text-white/65">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#d5ff63] px-6 py-12 text-center text-[#202432] shadow-xl shadow-black/10">
          <h2 className="text-4xl font-black leading-tight md:text-5xl">{copy.bottomTitle}</h2>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="mt-8 inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#202432] px-8 text-base font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {copy.primaryCta}
          </button>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white py-10 text-center dark:border-white/10 dark:bg-[#101418]">
        <div className="flex items-center justify-center gap-3">
          <Logo size="sm" showText={false} />
          <span className="text-lg font-black text-[#202432] dark:text-white">SiraMix</span>
        </div>
        <p className="mt-3 text-sm font-bold text-[#74736d] dark:text-white/50">
          {isRtl ? 'صناعة عربية لسير ذاتية أوضح وأقوى' : 'Arabic-first resume building for stronger applications'}
        </p>
      </footer>
    </main>
  );
};
