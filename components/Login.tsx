import React, { useState } from 'react';
import { TEMPLATES } from '../constants';
import { useLanguage } from '../i18n';
import { useAuth } from './AuthContext';
import { Logo } from './Logo';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';

interface LoginProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z" />
    <path fill="#EA4335" d="M12 6c1.6 0 3 .5 4.1 1.6l3.1-3A10 10 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 6Z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
    <path d="m5 10.5 3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Login: React.FC<LoginProps> = ({ theme, setTheme }) => {
  const { signInWithGoogle, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [authError, setAuthError] = useState<string | null>(null);
  const isRtl = language === 'ar';
  const featuredTemplates = TEMPLATES.filter(template =>
    ['emerald-two-column', 'audit-classic', 'minimal-technical'].includes(template.id),
  );

  const copy = {
    navTemplates: isRtl ? 'القوالب' : 'Templates',
    navBenefits: isRtl ? 'لماذا سيرة ميكس؟' : 'Why SiraMix?',
    signIn: isRtl ? 'الدخول عبر Google' : 'Continue with Google',
    loading: isRtl ? 'جارٍ فتح حسابك...' : 'Opening your account...',
    eyebrow: isRtl ? 'سيرتك. بلغتين. من مكان واحد.' : 'Two languages. One polished resume.',
    titleStart: isRtl ? 'سيرة ذاتية' : 'A resume that',
    titleAccent: isRtl ? 'تفتح لك الباب.' : 'gets you seen.',
    body: isRtl
      ? 'ابنِ نسخة عربية وإنجليزية احترافية، اختبر توافقها مع ATS، وصدّرها خلال دقائق.'
      : 'Build polished Arabic and English resumes, check ATS readiness, and export in minutes.',
    freeNote: isRtl ? 'مجاني للبدء · لا بطاقة · لا علامة مائية' : 'Free to start · No card · No watermark',
    templatesEyebrow: isRtl ? 'اختر أسلوبك' : 'Choose your style',
    templatesTitle: isRtl ? 'قوالب حقيقية، بلا تعقيد.' : 'Real templates. Zero clutter.',
    templatesBody: isRtl
      ? 'مصممة لتُقرأ بوضوح من مسؤولي التوظيف وأنظمة الفرز.'
      : 'Designed for recruiters and applicant tracking systems.',
    benefitTitle: isRtl ? 'كل ما تحتاجه. فقط.' : 'Everything you need. Nothing you do not.',
    finalTitle: isRtl ? 'فرصتك القادمة تبدأ بسيرة أقوى.' : 'Your next opportunity starts with a stronger resume.',
  };

  const benefits = isRtl
    ? ['نسختان مستقلتان بالعربية والإنجليزية', 'فحص ATS فوري أثناء الكتابة', 'تصدير PDF وDOCX وJPG']
    : ['Independent Arabic and English versions', 'Instant ATS feedback while you write', 'Export to PDF, DOCX, and JPG'];

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setAuthError(isRtl ? `تعذر تسجيل الدخول. ${message}` : `Sign in failed. ${message}`);
    }
  };

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
      className="landing-page min-h-screen w-[100vw] max-w-[100vw] overflow-x-clip bg-[#f4f1e9] font-thmanyah text-[#12231e] selection:bg-[#ff6b4a] selection:text-white dark:bg-[#0d1714] dark:text-[#f7f4ec]"
    >
      <header className="relative z-50">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 lg:px-8">
          <Logo size="md" className="[&>span]:hidden sm:[&>span]:inline" />

          <nav className="hidden items-center gap-7 text-sm font-bold text-[#52615c] dark:text-white/60 md:flex">
            <a href="#templates" className="transition hover:text-[#ff6b4a]">{copy.navTemplates}</a>
            <a href="#benefits" className="transition hover:text-[#ff6b4a]">{copy.navBenefits}</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(isRtl ? 'en' : 'ar')}
              className="grid h-10 min-w-10 place-items-center rounded-full border border-[#12231e]/10 bg-white/60 px-3 text-xs font-black backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {isRtl ? 'EN' : 'ع'}
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#12231e]/10 bg-white/60 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label={isRtl ? 'تغيير المظهر' : 'Toggle theme'}
            >
              <span className="[&>svg]:h-4 [&>svg]:w-4">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</span>
            </button>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="hidden h-10 items-center gap-2 rounded-full bg-[#12231e] px-5 text-sm font-black text-white transition hover:bg-[#ff6b4a] disabled:opacity-60 dark:bg-[#f7f4ec] dark:text-[#12231e] sm:flex"
            >
              <GoogleMark />
              {copy.signIn}
            </button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -start-32 top-12 h-72 w-72 rounded-full bg-[#67c7a5]/25 blur-3xl" />
        <div className="pointer-events-none absolute -end-20 -top-20 h-96 w-96 rounded-full bg-[#ffbf69]/30 blur-3xl" />

        <div className="relative mx-auto grid min-h-[650px] min-w-0 max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-24 lg:pt-16">
          <div className="min-w-0 animate-rise-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#12231e]/10 bg-white/70 px-4 py-2 text-sm font-black text-[#17664f] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[#83e0bf]">
              <span className="h-2 w-2 rounded-full bg-[#ff6b4a]" />
              {copy.eyebrow}
            </div>

            <h1 className="max-w-2xl text-[3rem] font-black leading-[1.02] tracking-[-0.04em] sm:text-7xl sm:leading-[0.98] lg:text-[5.2rem]">
              <span className="block">{copy.titleStart}</span>
              <span className="block text-[#ff6b4a]">{copy.titleAccent}</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg font-bold leading-8 text-[#5c6863] dark:text-white/65 sm:text-xl sm:leading-9">
              {copy.body}
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#12231e] px-7 text-base font-black text-white shadow-[0_16px_40px_rgba(18,35,30,0.2)] transition hover:-translate-y-1 hover:bg-[#ff6b4a] disabled:translate-y-0 disabled:opacity-60 dark:bg-[#f7f4ec] dark:text-[#12231e] sm:w-auto"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white">
                  <GoogleMark />
                </span>
                {loading ? copy.loading : copy.signIn}
                <span className="text-lg transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1">←</span>
              </button>
            </div>

            <p className="mt-4 text-xs font-bold text-[#748079] dark:text-white/40">{copy.freeNote}</p>
            {authError && (
              <div className="mt-5 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                {authError}
              </div>
            )}
          </div>

          <div className="relative mx-auto min-w-0 w-full max-w-[580px] animate-rise-in [animation-delay:120ms]">
            <div className="absolute -end-4 -top-5 z-20 rotate-3 rounded-2xl bg-[#ff6b4a] px-5 py-3 text-sm font-black text-white shadow-xl sm:-end-8">
              ATS <span className="text-xl">94</span>
              <span className="opacity-70">/100</span>
            </div>

            <div className="relative min-w-0 overflow-hidden rounded-[2rem] border border-[#12231e]/10 bg-[#12231e] p-2.5 shadow-[0_35px_90px_rgba(18,35,30,0.24)] dark:border-white/10">
              <div className="flex h-10 items-center gap-2 px-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b4a]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbf69]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#67c7a5]" />
                <span className="mx-auto text-[10px] font-bold tracking-[0.18em] text-white/40">SIRAMIX EDITOR</span>
              </div>

              <div className="grid min-h-[430px] min-w-0 grid-cols-[64px_minmax(0,1fr)] overflow-hidden rounded-[1.4rem] bg-[#ece9df] sm:grid-cols-[110px_minmax(0,1fr)]">
                <aside className="border-e border-[#12231e]/10 bg-[#e2ded2] p-3 sm:p-4">
                  <div className="mb-7 h-8 rounded-lg bg-[#12231e]" />
                  <div className="space-y-3">
                    {[0, 1, 2, 3, 4].map(item => (
                      <div key={item} className={`h-8 rounded-lg ${item === 0 ? 'bg-white shadow-sm' : 'bg-[#12231e]/5'}`} />
                    ))}
                  </div>
                </aside>

                <div className="min-w-0 p-3 sm:p-7">
                  <div className="mx-auto min-h-[370px] w-full max-w-[330px] bg-white p-5 shadow-[0_16px_35px_rgba(18,35,30,0.12)] sm:p-8">
                    <div className="flex items-start justify-between border-b-2 border-[#17664f] pb-5">
                      <div>
                        <div className="h-4 w-28 rounded-full bg-[#12231e]" />
                        <div className="mt-2 h-2 w-20 rounded-full bg-[#67c7a5]" />
                      </div>
                      <div className="grid h-11 w-11 place-items-center rounded-full bg-[#ffbf69]/40 text-xs font-black text-[#12231e]">
                        SM
                      </div>
                    </div>

                    <div className="mt-6 space-y-6">
                      {[['w-20', 3], ['w-16', 2], ['w-14', 3]].map(([width, lines], index) => (
                        <div key={index}>
                          <div className={`mb-3 h-2.5 ${width} rounded-full bg-[#17664f]`} />
                          <div className="space-y-2">
                            {Array.from({ length: Number(lines) }).map((_, line) => (
                              <div key={line} className={`h-1.5 rounded-full bg-[#12231e]/10 ${line === Number(lines) - 1 ? 'w-4/5' : 'w-full'}`} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 start-4 z-20 flex items-center gap-2 rounded-2xl border border-[#12231e]/10 bg-white px-4 py-3 text-xs font-black text-[#17664f] shadow-xl dark:border-white/10 dark:bg-[#192720] dark:text-[#83e0bf] sm:start-8">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#67c7a5]/20"><CheckIcon /></span>
              {isRtl ? 'محفوظ تلقائيًا' : 'Saved automatically'}
            </div>
          </div>
        </div>
      </section>

      <section id="templates" className="relative border-y border-[#12231e]/10 bg-white/55 py-20 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ff6b4a]">{copy.templatesEyebrow}</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.035em] sm:text-5xl">{copy.templatesTitle}</h2>
            </div>
            <p className="max-w-md text-base font-bold leading-7 text-[#66716c] dark:text-white/55">{copy.templatesBody}</p>
          </div>

          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
            {featuredTemplates.map((template, index) => (
              <article
                key={template.id}
                className="group grid grid-cols-[112px_1fr] items-center gap-5 rounded-[1.6rem] border border-[#12231e]/10 bg-[#f8f6ef] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5 sm:grid-cols-[130px_1fr]"
              >
                <div className="aspect-[3/4] rounded-lg bg-white p-3 shadow-sm">
                  <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: template.accent }} />
                  <div className="mt-2 h-1 w-1/2 rounded-full bg-slate-200" />
                  <div className="my-3 h-px bg-slate-100" />
                  <div className={template.layout === 'single' || template.layout === 'minimal' ? 'space-y-2' : 'grid grid-cols-[1.5fr_0.8fr] gap-2'}>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map(line => <div key={line} className="h-1 rounded-full bg-slate-200" />)}
                    </div>
                    {template.layout !== 'single' && template.layout !== 'minimal' && (
                      <div className="rounded opacity-20" style={{ backgroundColor: template.accent }} />
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-black text-[#ff6b4a]">0{index + 1}</span>
                  <h3 className="mt-2 text-xl font-black">{isRtl ? template.nameAr : template.nameEn}</h3>
                  <p className="mt-2 text-sm font-bold text-[#748079] dark:text-white/45">
                    {isRtl ? template.categoryAr : template.categoryEn}
                  </p>
                  <span className="mt-5 inline-flex rounded-full bg-[#67c7a5]/20 px-3 py-1 text-[10px] font-black text-[#17664f] dark:text-[#83e0bf]">
                    ATS READY
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-[#12231e] text-white">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] gap-10 px-5 py-16 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ffbf69]">SIRAMIX</p>
            <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.035em] sm:text-5xl">{copy.benefitTitle}</h2>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div key={benefit} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#67c7a5] text-[#12231e]">
                  <CheckIcon />
                </span>
                <p className="mt-5 text-base font-black leading-7">{benefit}</p>
                <span className="mt-6 block text-xs font-black text-white/25">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#ffbf69] text-[#12231e]">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-7 px-5 py-14 sm:flex-row sm:items-center lg:px-8">
          <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">{copy.finalTitle}</h2>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-3 rounded-full bg-[#12231e] px-7 text-base font-black text-white transition hover:-translate-y-1 hover:bg-[#ff6b4a] disabled:opacity-60 sm:w-auto"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white"><GoogleMark /></span>
            {copy.signIn}
          </button>
        </div>
      </section>

      <footer className="bg-[#f4f1e9] dark:bg-[#0d1714]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-7 lg:px-8">
          <Logo size="sm" />
          <p className="text-xs font-bold text-[#748079] dark:text-white/35">
            © {new Date().getFullYear()} SiraMix
          </p>
        </div>
      </footer>
    </main>
  );
};
