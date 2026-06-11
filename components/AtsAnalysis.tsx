import React, { useMemo } from 'react';
import { ResumeData } from '../types';
import { CircularProgress } from './CircularProgress';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { useLanguage } from '../i18n';

interface AtsAnalysisProps {
  data: ResumeData;
}

interface CritiqueItem {
  id: string;
  category: 'contact' | 'summary' | 'experience' | 'skills' | 'layout';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  status: 'passed' | 'warning' | 'error';
  improvementEn?: string;
  improvementAr?: string;
}

const ENGLISH_ACTION_VERBS = [
  'led', 'developed', 'designed', 'managed', 'created', 'implemented', 
  'improved', 'analyzed', 'boosted', 'architected', 'crafted', 'engineered', 
  'coordinated', 'delivered', 'supervised', 'maximized', 'built', 'optimized',
  'achieved', 'initiated', 'resolved', 'streamlined', 'mentored', 'orchestrated'
];

const ARABIC_ACTION_VERBS = [
  'قيادة', 'تطوير', 'تصميم', 'إدارة', 'إنشاء', 'تنفيذ', 'تحسين', 'تحليل', 
  'زيادة', 'هندسة', 'تنسيق', 'تسليم', 'إشراف', 'بناء', 'تبسيط', 'توجيه',
  'تنظيم', 'أرشفة', 'إشراف', 'إنجاز', 'حل', 'صياغة', 'تأمين'
];

export const AtsAnalysis: React.FC<AtsAnalysisProps> = ({ data }) => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const analysis = useMemo(() => {
    const critiques: CritiqueItem[] = [];
    let score = 0;

    // 1. Personal Info Check (Max 25 pts)
    const info = data.personalInfo;
    let personalScore = 0;

    // Full name check
    const hasName = !!info.name?.trim();
    if (hasName) {
      personalScore += 5;
    }
    critiques.push({
      id: 'info-name',
      category: 'contact',
      titleEn: 'Full Name',
      titleAr: 'الاسم الكامل',
      descriptionEn: hasName ? 'Full name is clearly provided.' : 'Full name is missing from contact details.',
      descriptionAr: hasName ? 'تم توفير الاسم الكامل بوضوح.' : 'الاسم الكامل مفقود من تفاصيل الاتصال.',
      status: hasName ? 'passed' : 'error',
      improvementEn: hasName ? undefined : 'Add your full legal name at the very top of your resume.',
      improvementAr: hasName ? undefined : 'أضف اسمك الكامل في الجزء العلوي من سيرتك الذاتية.'
    });

    // Professional Job Title check
    const hasTitle = !!info.title?.trim();
    if (hasTitle) {
      personalScore += 5;
    }
    critiques.push({
      id: 'info-title',
      category: 'contact',
      titleEn: 'Professional Title',
      titleAr: 'المسمى الوظيفي المهني',
      descriptionEn: hasTitle ? `Job title is defined: "${info.title}".` : 'Professional title is missing.',
      descriptionAr: hasTitle ? `تم تحديد المسمى الوظيفي المهني: "${info.title}".` : 'المسمى الوظيفي المهني مفقود.',
      status: hasTitle ? 'passed' : 'warning',
      improvementEn: hasTitle ? undefined : 'Add a clear target job title under your name matching the job you are applying for.',
      improvementAr: hasTitle ? undefined : 'أضف مسمى وظيفي مستهدف واضح أسفل اسمك مباشرة ليتطابق مع الوظيفة التي تتقدم لها.'
    });

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasEmail = !!info.email?.trim();
    const isEmailValid = hasEmail && emailRegex.test(info.email);
    if (isEmailValid) {
      personalScore += 5;
    }
    critiques.push({
      id: 'info-email',
      category: 'contact',
      titleEn: 'Email Address',
      titleAr: 'البريد الإلكتروني',
      descriptionEn: isEmailValid ? 'Email is present and valid.' : (hasEmail ? 'Email format looks invalid.' : 'No email address found.'),
      descriptionAr: isEmailValid ? 'البريد الإلكتروني متوفر وصحيح.' : (hasEmail ? 'صيغة البريد الإلكتروني غير صالحة.' : 'لم يتم العثور على بريد إلكتروني.'),
      status: isEmailValid ? 'passed' : 'error',
      improvementEn: isEmailValid ? undefined : 'Provide a professional personal email address (e.g., name@email.com).',
      improvementAr: isEmailValid ? undefined : 'أدخل بريدًا إلكترونيًا رسميًا واحترافيًا (مثل name@email.com).'
    });

    // Phone check
    const hasPhone = !!info.phone?.trim();
    if (hasPhone) {
      personalScore += 5;
    }
    critiques.push({
      id: 'info-phone',
      category: 'contact',
      titleEn: 'Phone Number',
      titleAr: 'رقم الهاتف',
      descriptionEn: hasPhone ? 'Phone number is provided.' : 'No phone number provided.',
      descriptionAr: hasPhone ? 'تم تقديم رقم الهاتف.' : 'رقم الهاتف غير مضاف.',
      status: hasPhone ? 'passed' : 'error',
      improvementEn: hasPhone ? undefined : 'Provide a reachable phone number with your country code.',
      improvementAr: hasPhone ? undefined : 'أضف رقم هاتف متاح للاتصال به مع رمز الدولة.'
    });

    // Location check
    const hasLocation = !!info.location?.trim();
    if (hasLocation) {
      personalScore += 5;
    }
    critiques.push({
      id: 'info-location',
      category: 'contact',
      titleEn: 'Location (City, Country)',
      titleAr: 'الموقع (المدينة والبلد)',
      descriptionEn: hasLocation ? 'Location details are specified.' : 'Your location is missing.',
      descriptionAr: hasLocation ? 'تم تحديد تفاصيل الموقع.' : 'موقعك الجغرافي مفقود.',
      status: hasLocation ? 'passed' : 'warning',
      improvementEn: hasLocation ? undefined : 'ATS parses geographic keywords; add your City and State/Country (e.g. San Francisco, CA or الرياض، السعودية).',
      improvementAr: hasLocation ? undefined : 'تقوم أنظمة ATS بتحليل الكلمات المفتاحية لموقعك؛ أضف مدينتك وجنسيتك/بلدك.'
    });

    score += personalScore;

    // 2. Professional Summary (Max 15 pts)
    let summaryScore = 0;
    const summary = data.summary?.trim() || '';
    const wordCount = summary ? summary.split(/\s+/).length : 0;

    if (wordCount > 0) {
      summaryScore += 5; // Has summary
      if (wordCount >= 30 && wordCount <= 100) {
        summaryScore += 10; // Ideal length
        critiques.push({
          id: 'summary-len',
          category: 'summary',
          titleEn: 'Professional Summary',
          titleAr: 'الملخص المهني',
          descriptionEn: `Your summary contains ${wordCount} words (ideal length is 30-100 words).`,
          descriptionAr: `يحتوي ملفك الشخصي/الملخص المهني على ${wordCount} كلمة (الطول المثالي هو 30-100 كلمة).`,
          status: 'passed'
        });
      } else if (wordCount < 30) {
        summaryScore += 4;
        critiques.push({
          id: 'summary-len',
          category: 'summary',
          titleEn: 'Professional Summary',
          titleAr: 'الملخص المهني',
          descriptionEn: `Your summary is quite short (${wordCount} words).`,
          descriptionAr: `ملخصك المهني قصير نسبيًا (${wordCount} كلمة).`,
          status: 'warning',
          improvementEn: 'Expand on your core accomplishments, main technologies, and experience to make it look full and rich (minimum 30 words).',
          improvementAr: 'توسع في ذكر إنجازاتك الأساسية وخبراتك لجعل الملخص المهني غنيًا بالكلمات المفتاحية (30 كلمة كحد أدنى).'
        });
      } else {
        summaryScore += 4;
        critiques.push({
          id: 'summary-len',
          category: 'summary',
          titleEn: 'Professional Summary',
          titleAr: 'الملخص المهني',
          descriptionEn: `Your summary is a bit too long (${wordCount} words).`,
          descriptionAr: `ملخصك المهني طويل بعض الشيء (${wordCount} كلمة).`,
          status: 'warning',
          improvementEn: 'Aim for a concise elevator pitch of around 30 to 100 words. Too much text decreases recruiter skimmability.',
          improvementAr: 'احرص على كتابة نبذة موجزة تتراوح بين 30 إلى 100 كلمة كحد أقصى لتسهيل القراءة السريعة من قبل مسؤولي التوظيف.'
        });
      }
    } else {
      critiques.push({
        id: 'summary-len',
        category: 'summary',
        titleEn: 'Professional Summary',
        titleAr: 'الملخص المهني',
        descriptionEn: 'No professional summary found.',
        descriptionAr: 'الملخص المهني غير متوفر.',
        status: 'error',
        improvementEn: 'Write a powerful 3-4 sentence paragraph highlighting your seniority, core domain expertise, and the value you bring to a team.',
        improvementAr: 'اكتب فقرة قوية من 3 إلى 4 جمل تلخص فيها مستواك المهني وخبراتك الأساسية والقيمة التي تقدمها للشركة.'
      });
    }
    score += summaryScore;

    // 3. Work Experience Detail (Max 30 pts)
    let experienceScore = 0;
    const expItems = data.experience || [];

    if (expItems.length > 0) {
      experienceScore += 10; // At least one experience

      // Check bullet points
      const hasBullets = expItems.every(exp => {
        const desc = exp.description || '';
        return desc.includes('\n') || desc.includes('-') || desc.includes('•') || desc.includes('*');
      });

      if (hasBullets) {
        experienceScore += 10;
        critiques.push({
          id: 'exp-bullets',
          category: 'experience',
          titleEn: 'Bullet Points Utilization',
          titleAr: 'استخدام النقاط النقطية (Bullets)',
          descriptionEn: 'You structured your experience tasks using lists/bullet points. ATS systems parse these perfectly.',
          descriptionAr: 'قمت بتنظيم مهامك وخبراتك العملية باستخدام القوائم المنقطة. هذا يسهل على أنظمة ATS قراءتها بسلاسة.',
          status: 'passed'
        });
      } else {
        critiques.push({
          id: 'exp-bullets',
          category: 'experience',
          titleEn: 'Bullet Points Structure',
          titleAr: 'هيكلة النقاط النقطية',
          descriptionEn: 'Some experience descriptions look like big paragraphs instead of lists.',
          descriptionAr: 'بعض أوصاف الخبرات العملية تبدو كفقرة نصية ضخمة بدلًا من قائمة نقطية.',
          status: 'warning',
          improvementEn: 'Convert your achievements and duties into bullet points (using a hyphen "-" at the beginning of each line) to drastically improve scan readability.',
          improvementAr: 'حول واجباتك وإنجازاتك اليومية إلى نقاط متتالية (باستخدام علامة الشرطة "-" في بداية كل سطر) لتسهيل القراءة.'
        });
      }

      // Check action verbs
      let actionVerbsFound = 0;
      let totalVerbsChecked = 0;

      expItems.forEach(exp => {
        const descLower = (exp.description || '').toLowerCase();
        ENGLISH_ACTION_VERBS.forEach(verb => {
          if (descLower.includes(verb)) actionVerbsFound++;
        });
        ARABIC_ACTION_VERBS.forEach(verb => {
          if (descLower.includes(verb)) actionVerbsFound++;
        });
        totalVerbsChecked++;
      });

      const hasActionVerbs = actionVerbsFound >= totalVerbsChecked;
      if (hasActionVerbs) {
        experienceScore += 5;
        critiques.push({
          id: 'exp-actions',
          category: 'experience',
          titleEn: 'Strong Action Verbs Present',
          titleAr: 'استخدام أفعال قيادية قوية',
          descriptionEn: 'We detected strong professional action words in your roles (e.g., Created, Designed, Led).',
          descriptionAr: 'لقد تم رصد كلمات وأفعال قيادية قوية في أوصافك الوظيفية (مثل: إدارة، قيادة، تنفيذ، تحسين).',
          status: 'passed'
        });
      } else {
        critiques.push({
          id: 'exp-actions',
          category: 'experience',
          titleEn: 'Action Verb Density',
          titleAr: 'نشاط الأفعال القيادية',
          descriptionEn: 'Few strong recruitment action verbs were identified in your experience narratives.',
          descriptionAr: 'تم رصد عدد قليل جدًا من الأفعال القيادية القوية في أوصاف خبراتك العملية.',
          status: 'warning',
          improvementEn: 'Begin your bullet points with powerful action verbs like "Led research on...", "Implemented API...", "Optimized load rates..." or their Arabic equivalents.',
          improvementAr: 'ابدأ كل سطر وظيفي بفعل عملي قوي وواضح مثل "قيادة المشروع المهني..." أو "تنفيذ الواجهات..." أو "تحسين سرعة الصفحات...".'
        });
      }

      // Check numeric impact / metrics
      let hasMetrics = false;
      expItems.forEach(exp => {
        const desc = exp.description || '';
        // regex targets numbers, percentages, or dollar amounts
        if (/\d+[%٪$]|\d+\s*(years|months|employees|users|%|percent|دولار|مستخدم|عميل|جنيه|ريال)/gi.test(desc) || /\d+/.test(desc)) {
          hasMetrics = true;
        }
      });

      if (hasMetrics) {
        experienceScore += 5;
        critiques.push({
          id: 'exp-metrics',
          category: 'experience',
          titleEn: 'Quantified Impact',
          titleAr: 'تأثير كمي وقابل للقياس',
          descriptionEn: 'You included numeric results, percentages, or budgets representing your accomplishments.',
          descriptionAr: 'قمت بتوفير لغة أرقام ونسب مئوية تدل على نتائج حقيقية وقابلة للقياس لإنجازاتك.',
          status: 'passed'
        });
      } else {
        critiques.push({
          id: 'exp-metrics',
          category: 'experience',
          titleEn: 'Quantifying Results',
          titleAr: 'إضافة نتائج رقمية',
          descriptionEn: 'No quantifiable results or numbers found in your work roles.',
          descriptionAr: 'لم نجد أرقامًا أو نسبًا مئوية ترمز إلى الإنجاز الفعلي في خبراتك.',
          status: 'warning',
          improvementEn: 'Incorporate realistic metrics whenever possible. (e.g., "Boosted API response speeds by 30%" or "Led and coordinated a team of 4 junior staff").',
          improvementAr: 'احرص على إدراج إنجازات رقمية مثل "تحسين سرعة معالجة البيانات بنسبة 25٪" أو "زيادة المبيعات بمقدار 15 ألف دولار".'
        });
      }
    } else {
      critiques.push({
        id: 'exp-history',
        category: 'experience',
        titleEn: 'Work History Missing',
        titleAr: 'تاريخ العمل والخبرات مفقود',
        descriptionEn: 'You have not added any work experience items yet.',
        descriptionAr: 'لم تضف أي خبرات عملية أو وظائف سابقة حتى الآن.',
        status: 'error',
        improvementEn: 'Employers and ATS place the highest value on your employment history. Introduce your current and past roles.',
        improvementAr: 'تضع خوارزميات التوظيف والشركات الوزن الأكبر على تاريخ العمل. أضف على الأقل وظيفتين سابقتين.'
      });
    }

    score += experienceScore;

    // 4. Skills Section Optimization (Max 20 pts)
    let skillsScore = 0;
    const skillsCount = data.skills?.length || 0;

    if (skillsCount >= 6 && skillsCount <= 15) {
      skillsScore = 20;
      critiques.push({
        id: 'skills-density',
        category: 'skills',
        titleEn: 'Keywords & Skills Density',
        titleAr: 'كثافة المهارات والكلمات المفتاحية',
        descriptionEn: `Optimized list with ${skillsCount} skills (perfect range is 6-15 skills).`,
        descriptionAr: `قائمة ممتازة تحتوي على ${skillsCount} مهارة (النطاق المثالي هو بين 6 إلى 15 مهارة).`,
        status: 'passed'
      });
    } else if (skillsCount > 0 && skillsCount < 6) {
      skillsScore = 12;
      critiques.push({
        id: 'skills-density',
        category: 'skills',
        titleEn: 'Keywords & Skills Balance',
        titleAr: 'توازن المهارات',
        descriptionEn: `You only added ${skillsCount} skills (underrepresented).`,
        descriptionAr: `لقد قمت بإضافة ${skillsCount} مهارات فقط (تمثيل منخفض).`,
        status: 'warning',
        improvementEn: 'Add more core tech skills, standard tooling, or soft skills matching your sector keyword references (aim for at least 6).',
        improvementAr: 'أضف المزيد من المهارات التقنية والأدوات المساعدة لتثري الكلمات المفتاحية لمجالك (استهدف 6 مهارات كحد أدنى).'
      });
    } else if (skillsCount > 15) {
      skillsScore = 15;
      critiques.push({
        id: 'skills-density',
        category: 'skills',
        titleEn: 'Skills Keyword Stuffing Guard',
        titleAr: 'تجنب حشو المهارات العشوائي',
        descriptionEn: `A long list of ${skillsCount} skills can look like keyword stuffing.`,
        descriptionAr: `قائمة طويلة جدًا تحتوي على ${skillsCount} مهارة قد تبدو كحشو عشوائي للكلمات المفتاحية.`,
        status: 'warning',
        improvementEn: 'Filter out old or low-priority skills to keep your resume highly targeted to your target role.',
        improvementAr: 'صَفِّ المهارات القديمة أو الفرعية وحافظ فقط على المهارات الأساسية ذات الصلة المباشرة بالمنصب المستهدف.'
      });
    } else {
      critiques.push({
        id: 'skills-density',
        category: 'skills',
        titleEn: 'Skills Not Found',
        titleAr: 'المهارات غير متوفرة',
        descriptionEn: 'You do not have any core tech/soft skills declared.',
        descriptionAr: 'لم تقم بتحديد أو إدراج أي مهارات أساسية لقائمة السيرة الذاتية.',
        status: 'error',
        improvementEn: 'ATS systems heavily score resumes based on standard keyword matches. Populate your skills list immediately.',
        improvementAr: 'تعتمد السير الذاتية بالكامل على الكلمات المفتاحية في عمليات التصفية. ابدأ بإضافة مهاراتك المهمة الآن.'
      });
    }
    score += skillsScore;

    // 5. Structure & General Layout (Max 10 pts)
    let layoutScore = 0;
    const eduItems = data.education || [];

    if (eduItems.length > 0) {
      layoutScore += 5;
    }
    critiques.push({
      id: 'structure-education',
      category: 'layout',
      titleEn: 'Academic Education Track',
      titleAr: 'تاريخ التعليم الأكاديمي',
      descriptionEn: eduItems.length > 0 ? 'At least one education credential was verified.' : 'No education records added.',
      descriptionAr: eduItems.length > 0 ? 'تم التحقق من وجود مؤهل تعليمي واحد على الأقل.' : 'مؤهلات التعليم والدراسة مفقودة.',
      status: eduItems.length > 0 ? 'passed' : 'error',
      improvementEn: eduItems.length > 0 ? undefined : 'Add details about your college degrees, bootcamps, or certified educational records.',
      improvementAr: eduItems.length > 0 ? undefined : 'أضف تفاصيل شهادتك الجامعية أو معهد التدريب أو الشهادات الأكاديمية المدعومة.'
    });

    const isOrderLogical = data.sectionOrder.includes('experience') && data.sectionOrder.includes('education');
    if (isOrderLogical) {
      layoutScore += 5;
    }
    critiques.push({
      id: 'structure-sections',
      category: 'layout',
      titleEn: 'ATS Standard Section Layout',
      titleAr: 'تنظيم الأقسام القياسي لـ ATS',
      descriptionEn: isOrderLogical ? 'Standard primary sections (Work History & Study) are configured.' : 'Major structural sections are missing.',
      descriptionAr: isOrderLogical ? 'أقسام هيكل السيرة الذاتية الأساسية (الخبرة والدراسة) منسقة وصحيحة.' : 'الأقسام الهيكلية الرئيسية مفقودة.',
      status: isOrderLogical ? 'passed' : 'error',
      improvementEn: isOrderLogical ? undefined : 'Ensure "experience" and "education" are correctly arranged in your build profile.',
      improvementAr: isOrderLogical ? undefined : 'تأكد من إدراج قسم الخبرات والتعليم ضمن ترتيب سيرتك الذاتية بشكل صحيح.'
    });

    score += layoutScore;

    return {
      score,
      critiques
    };
  }, [data]);

  const passedChecksCount = analysis.critiques.filter(c => c.status === 'passed').length;
  const totalChecksCount = analysis.critiques.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic Header Score Widget */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-2xl border border-border shadow-sm">
        <CircularProgress score={analysis.score} size={130} strokeWidth={11} />
        <div className="flex-grow text-center md:text-start space-y-2">
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">
            {isRtl ? 'تحليل السيرة الذاتية (ATS)' : 'Real-time ATS Score'}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {isRtl 
              ? `قامت خوارزمية التدقيق بفحص سيرتك الذاتية وتطبيق ${totalChecksCount} قواعد لمطابقة معايير الفرز العالمية.` 
              : `Our parser checked your resume against ${totalChecksCount} automated recruitment guidelines.`}
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-border">
              {isRtl ? `✔️ نجح: ${passedChecksCount}/${totalChecksCount}` : `✔️ Passed: ${passedChecksCount}/${totalChecksCount}`}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
              {analysis.score >= 80 
                ? (isRtl ? '🏆 ممتاز للتقديم المباشر' : '🏆 Outstanding Structure') 
                : (isRtl ? '⚡ يحتاج بعض التحسينات' : '⚡ Action Required')}
            </span>
          </div>
        </div>
      </div>

      {/* Critiques List grouped by state */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
          {isRtl ? 'قائمة الفحوصات والتحسينات الموصى بها:' : 'Analysis Checkpoints & Action Plan:'}
        </h4>

        {analysis.critiques.map((critique) => {
          const isPassed = critique.status === 'passed';
          const isWarning = critique.status === 'warning';
          
          return (
            <div 
              key={critique.id} 
              className={`p-4 rounded-xl border transition-all ${
                isPassed 
                  ? 'bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10' 
                  : isWarning 
                    ? 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10' 
                    : 'bg-red-500/5 border-red-500/20 dark:bg-red-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Visual Status Indicator Icon */}
                {isPassed ? (
                  <span className="text-emerald-500 shrink-0 mt-0.5">
                    <CheckCircleIcon className="w-5 h-5" />
                  </span>
                ) : (
                  <span className={`${isWarning ? 'text-amber-500' : 'text-red-500'} shrink-0 mt-0.5`}>
                    <LightbulbIcon className="w-5 h-5 animate-pulse" />
                  </span>
                )}

                {/* Critiques content */}
                <div className="space-y-1.5 flex-grow">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-sm font-bold text-foreground leading-none">
                      {isRtl ? critique.titleAr : critique.titleEn}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      isPassed 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : isWarning 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {isPassed 
                        ? (isRtl ? 'محقق' : 'VERIFIED') 
                        : isWarning 
                          ? (isRtl ? 'تنبيه' : 'ADVICE') 
                          : (isRtl ? 'مطلوب' : 'CRITICAL')}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isRtl ? critique.descriptionAr : critique.descriptionEn}
                  </p>

                  {/* Recommendation block if not passed */}
                  {!isPassed && (critique.improvementEn || critique.improvementAr) && (
                    <div className="mt-2.5 p-2.5 bg-background border border-border rounded-lg text-xs flex items-start gap-2 text-foreground leading-relaxed">
                      <span className="text-xs font-bold text-blue-500">💡</span>
                      <div>
                        <span className="font-bold underline text-blue-500 block mb-0.5">
                          {isRtl ? 'خطوة الحل المقترحة:' : 'Recommended Fix:'}
                        </span>
                        {isRtl ? critique.improvementAr : critique.improvementEn}
                      </div>
                    </div>
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
