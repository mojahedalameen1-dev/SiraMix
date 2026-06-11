import React from 'react';
import { useAuth } from './AuthContext';
import { useLanguage, useTranslation } from '../i18n';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { Logo } from './Logo';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface LoginProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const templatesData = [
  {
    id: 't1',
    nameAr: 'قالب المحاسبة الأنيق (Danielle)',
    nameEn: 'ATS Stylish Accounting (Danielle)',
    tagAr: 'مالي وإداري',
    tagEn: 'Finance & Admin',
    badgeAr: 'متوافق مع الـ ATS',
    badgeEn: 'ATS-Friendly',
    bgColor: 'bg-[#EAF4FE] dark:bg-[#EAF4FE]',
    textColor: 'text-gray-800',
    accentColor: '#059669',
    renderMini: (isRtl: boolean) => (
      <div className={`absolute inset-0 p-3 flex flex-col justify-between text-left font-sans text-[5.5px] bg-[#EBF5F0] text-gray-800 rounded-b-xl border-t-4 border-emerald-600 ${isRtl ? 'dir-rtl text-right' : 'dir-ltr text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="border-b-[0.5px] border-emerald-600/30 pb-2">
          <div className="font-extrabold text-emerald-800 text-[10px] leading-tight">{isRtl ? 'دانية الشهري' : 'Danielle Brasseur'}</div>
          <div className="text-[5px] text-emerald-700 font-bold tracking-wider uppercase leading-none mt-1">{isRtl ? 'محاسب مالي أول' : 'Senior Financial Accountant'}</div>
          <div className="flex gap-2 text-gray-500 mt-1.5 leading-none text-[4.5px]">
            <span>📞 +966 50 111 2233</span>
            <span>✉️ danielle@example.com</span>
            <span>📍 {isRtl ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia'}</span>
          </div>
        </div>
        
        <div className="text-gray-600 leading-[1.3] text-[4.5px] mt-2 h-[26px] overflow-hidden">
          {isRtl ? 
          'مدير حسابات مالي متخصص مع خبرة تزيد عن 7 سنوات في التخطيط المالي، تحليل البيانات، إدارة الميزانيات وتطوير الاستراتيجيات المالية للشركات الكبرى. قدرة استثنائية على قيادة فرق العمل وضمان الامتثال للأنظمة والتشريعات الضريبية.' 
          : 'Detail-oriented Senior Controller with over 7 years of expert knowledge in general accounting procedures, compliance, corporate financial statements, and driving corporate financial strategies to maximize revenue.'}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 flex-1 overflow-hidden">
          <div className="col-span-2 space-y-2">
            <div>
              <div className="font-bold text-emerald-800 border-b-[0.5px] border-emerald-600/20 text-[5px] uppercase pb-0.5">{isRtl ? 'الخبرة المهنية' : 'Experience'}</div>
              <div className="mt-1 space-y-2">
                <div>
                  <div className="flex justify-between font-bold text-gray-700 text-[4.5px]">
                    <span>{isRtl ? 'كبير المحاسبين | شركة نيوم للاستثمار' : 'Lead Accountant | NEOM Investment'}</span>
                    <span className="text-gray-400 font-normal">{isRtl ? '2021 - الحاضر' : '2021 - Pres'}</span>
                  </div>
                  <div className="text-gray-500 mt-0.5 leading-tight text-[4px]">{isRtl ? '• إدارة المراجعات المالية المستمرة والعمليات المالية مما أدى إلى توفير 15% من التكاليف التشغيلية.\n• الإشراف على ميزانية سنوية تقدر بـ 50 مليون ريال.' : '• Managed continuous audit readiness & financial operations leading to 15% efficiency savings.\n• Directed annual budget preparations exceeding $10M.'}</div>
                </div>
                <div>
                  <div className="flex justify-between font-bold text-gray-700 text-[4.5px]">
                    <span>{isRtl ? 'محاسب مالي | أرامكو السعودية' : 'Financial Analyst | Aramco'}</span>
                    <span className="text-gray-400 font-normal">{isRtl ? '2018 - 2021' : '2018 - 2021'}</span>
                  </div>
                  <div className="text-gray-500 mt-0.5 leading-tight text-[4px]">{isRtl ? '• إعداد التقارير الضريبية وتحليل القوائم المالية بشكل ربع سنوي.' : '• Oversaw taxation, payroll, and quarterly financial reports.'}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`space-y-2 border-emerald-600/20 ${isRtl ? 'border-r-[0.5px] pr-2' : 'border-l-[0.5px] pl-2'}`}>
            <div>
              <div className="font-bold text-emerald-800 border-b-[0.5px] border-emerald-600/20 text-[5px] uppercase pb-0.5">{isRtl ? 'التعليم' : 'Education'}</div>
              <div className="mt-1">
                <div className="font-bold text-gray-700 text-[4.5px]">{isRtl ? 'ماجستير في المحاسبة' : 'M.S. Accounting'}</div>
                <div className="text-gray-500 text-[4px]">{isRtl ? 'جامعة الملك سعود (2018)' : 'King Saud Univ. (2018)'}</div>
              </div>
              <div className="mt-1.5">
                <div className="font-bold text-gray-700 text-[4.5px]">{isRtl ? 'بكالوريوس إدارة أعمال' : 'B.A. Business Admin'}</div>
                <div className="text-gray-500 text-[4px]">{isRtl ? 'جامعة اليمامة (2016)' : 'Al Yamamah Univ. (2016)'}</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-emerald-800 border-b-[0.5px] border-emerald-600/20 text-[5px] uppercase pb-0.5">{isRtl ? 'المهارات' : 'Skills'}</div>
              <div className="flex flex-wrap gap-1 mt-1 text-[4px]">
                <span className="bg-emerald-50 text-emerald-800 rounded border border-emerald-100 px-1 py-0.5">{isRtl ? 'التحليل المالي' : 'Fin. Analysis'}</span>
                <span className="bg-emerald-50 text-emerald-800 rounded border border-emerald-100 px-1 py-0.5">{isRtl ? 'الضرائب (ZATCA)' : 'Corporate Tax'}</span>
                <span className="bg-emerald-50 text-emerald-800 rounded border border-emerald-100 px-1 py-0.5">{isRtl ? 'التدقيق الداخلي' : 'Internal Audit'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 't2',
    nameAr: 'قالب الكادر الطبي الوردي (Shir)',
    nameEn: 'Extended ATS Healthcare (Shir)',
    tagAr: 'طبي وتمريض',
    tagEn: 'Healthcare & Medical',
    badgeAr: 'عمود جانبي أنيق',
    badgeEn: 'Warm Palette',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    renderMini: (isRtl: boolean) => (
      <div className={`absolute inset-0 p-3 pb-2 flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} text-left font-sans text-[5.5px] bg-[#FBF1EB] text-gray-800 rounded-b-xl`}>
        <div className={`w-[65%] flex flex-col justify-between ${isRtl ? 'pl-2 text-right' : 'pr-2'}`}>
          <div>
            <div className="font-black text-amber-950 text-[10px] tracking-wide uppercase">{isRtl ? 'د. شير روزنستاين' : 'Shir Rosenstein'}</div>
            <div className="text-amber-700/80 font-bold text-[5px] uppercase tracking-wider">{isRtl ? 'أخصائي سحب دم معتمد' : 'Certified Phlebotomist'}</div>
            <div className="text-gray-600 leading-[1.3] text-[4.5px] mt-1 h-[26px] overflow-hidden">
               {isRtl ? 'أخصائي سحب دم مرخص يتمتع بخبرة ممتازة في التعامل مع مختلف الفئات العمرية. سجل حافل بالدقة والإجراءات السريرية الآمنة مع الحرص العالي على سلامة المرضى.' : 'Dedicated Phlebotomist with 5+ years of clinical experience. Proven track record of zero sample errors and high patient satisfaction.'}
            </div>
          </div>

          <div className="mt-1">
            <div className="font-bold text-amber-900 border-b-[0.5px] border-amber-900/30 text-[5px] uppercase mb-1 pb-0.5">{isRtl ? 'الخبرة العملية' : 'Experience'}</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between font-bold text-gray-800 text-[4.5px]">
                  <span>{isRtl ? 'رئيس قسم سحب الدم | مستشفى الحبيب' : 'Lead Blood Draw Tech | General Hosp.'}</span>
                  <span className="text-gray-500 font-normal">{isRtl ? '2021 - الحاضر' : '2021 - Pres'}</span>
                </div>
                <div className="text-gray-600 leading-[1.2] text-[4px] mt-0.5">{isRtl ? '• إجراء أكثر من 50 سحبة دم يومياً لمرضى الأطفال والبالغين بدقة متناهية ودون أخطاء مخبرية.\n• تدريب 10 موظفين جدد على بروتوكولات السلامة.' : '• Conducted pediatric blood draws and standardized lab preparation with zero sample errors.\n• Assessed and verified equipment calibration daily.'}</div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-gray-800 text-[4.5px]">
                  <span>{isRtl ? 'فني مختبر | مختبرات البرج' : 'Lab Technician | BioLabs'}</span>
                  <span className="text-gray-500 font-normal">2018 - 2021</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`w-[35%] bg-amber-900/5 rounded p-2 flex flex-col border-amber-900/10 ${isRtl ? 'border-r text-right' : 'border-l pl-2 text-left'}`}>
          <div className="mb-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-200/50 border-2 border-amber-700/20 overflow-hidden mb-2">
               {/* simulated avatar placeholder */}
               <div className="w-full h-full text-amber-700 flex items-center justify-center">
                 <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
               </div>
            </div>
            <div className="font-bold text-amber-900 text-[5px] uppercase mb-1 pb-0.5 border-b border-amber-900/10">{isRtl ? 'معلومات التواصل' : 'Contact'}</div>
            <div className="space-y-1 text-gray-700 text-[4px] leading-tight break-all">
              <div>📍 {isRtl ? 'جدة، المملكة العربية السعودية' : 'Jeddah, KSA'}</div>
              <div dir="ltr" className={isRtl ? "text-right" : ""}>📞 +966 55 019 2211</div>
              <div dir="ltr" className={isRtl ? "text-right" : ""}>✉️ shir.r@domain.com</div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="font-bold text-amber-900 text-[5px] uppercase mb-1 pb-0.5 border-b border-amber-900/10">{isRtl ? 'المهارات' : 'Skills'}</div>
            <div className="space-y-1 text-gray-700 text-[4px] leading-tight">
              <div>• {isRtl ? 'سحب الدم الوريدي' : 'Venipuncture'}</div>
              <div>• {isRtl ? 'سلامة المختبرات' : 'Lab Safety'}</div>
              <div>• {isRtl ? 'رعاية الأطفال' : 'Pediatric care'}</div>
              <div>• {isRtl ? 'تحليل العينات' : 'Sample Analysis'}</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 't3',
    nameAr: 'قالب كلاسيك هادئ (Chanchal)',
    nameEn: 'ATS Simple Classic (Chanchal)',
    tagAr: 'قالب عام متوافق',
    tagEn: 'General & Clean',
    badgeAr: 'سهل التتبع والفرز',
    badgeEn: 'Highly Scannable',
    renderMini: (isRtl: boolean) => (
      <div className={`absolute inset-0 p-4 flex flex-col text-left font-serif text-[5px] bg-white text-gray-800 rounded-b-xl border-t-[6px] border-emerald-800/80 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className="text-center pb-2 border-b border-gray-200 mb-2">
          <div className="font-normal text-emerald-800 text-[11px] font-sans tracking-wide">{isRtl ? 'تشانشال شارما' : 'Chanchal Sharma'}</div>
          <div className="text-gray-500 uppercase font-sans tracking-wider text-[5px] leading-none mt-1.5">{isRtl ? 'مدير مكتب تنفيذي مهني' : 'Professional Office Manager'}</div>
          <div className="text-gray-400 mt-2 flex justify-center gap-2 text-[4.5px] font-sans leading-none">
            <span dir="ltr">+966 54 555 0100</span>
            <span>•</span>
            <span dir="ltr">chanchal@domain.com</span>
            <span>•</span>
            <span>{isRtl ? 'الرياض' : 'Riyadh'}</span>
          </div>
        </div>

        <div className="text-gray-600 font-sans text-[4.5px] text-center px-4 mb-2 h-[22px] overflow-hidden leading-[1.3]">
          {isRtl ? 'مدير مكتب محترف يتمتع بخبرة تزيد عن 8 سنوات في الإدارة بكفاءة عالية وتنظيم العمليات اليومية للشركات، وإدارة الموارد البشرية وشؤون الموظفين ببراعة تامة.' : 'Professional and experienced office manager with over 8 years of efficient administration and organizational operations. Proven track record shaping office culture.'}
        </div>

        <div className="flex-1 space-y-2.5 overflow-hidden font-sans">
          <div>
            <div className="font-bold text-emerald-850 text-[5px] tracking-wider uppercase mb-1 pb-0.5 border-b border-gray-100">{isRtl ? 'الخبرة العملية' : 'Professional Experience'}</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between font-bold text-gray-800 text-[4.5px]">
                  <span>{isRtl ? 'مدير إدارة | حلول التقنية الحديثة' : 'Office Administrator | Tech Solutions'}</span>
                  <span className="text-gray-500 font-normal">{isRtl ? '2020 - الحاضر' : '2020 - Present'}</span>
                </div>
                <div className="text-gray-600 leading-[1.3] text-[4px] mt-0.5">
                  {isRtl ? '• تنسيق العمليات اللوجستية المتكاملة للمكتب وإعداد 40+ موظف جديد لبيئة العمل بأعلى المعايير.' : '• Coordinated complete office logistics, onboarded 40+ hires, and automated payroll reporting reducing delays.'}
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-gray-800 text-[4.5px]">
                  <span>{isRtl ? 'منسق إداري | الفطيم للاستثمار' : 'General Coordinator | Alpha Group'}</span>
                  <span className="text-gray-500 font-normal">2017 - 2020</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="font-bold text-emerald-850 text-[5px] tracking-wider uppercase mb-1 pb-0.5 border-b border-gray-100">{isRtl ? 'المؤهلات العلمية' : 'Education'}</div>
              <div className="font-bold text-gray-800 text-[4.5px]">{isRtl ? 'بكالوريوس إدارة أعمال' : 'B.A. Business'}</div>
              <div className="text-gray-500 text-[4px]">{isRtl ? 'جامعة الملك عبدالعزيز (2017)' : 'Yellows College (2017)'}</div>
            </div>
            <div>
              <div className="font-bold text-emerald-850 text-[5px] tracking-wider uppercase mb-1 pb-0.5 border-b border-gray-100">{isRtl ? 'الكفاءات' : 'Core Proficiencies'}</div>
              <div className="grid grid-cols-2 gap-1 text-[4px] text-gray-600">
                <div>• {isRtl ? 'إدارة المكاتب' : 'Office Mgmt'}</div>
                <div>• {isRtl ? 'الموارد البشرية' : 'HR Operations'}</div>
                <div>• {isRtl ? 'جدولة متقدمة' : 'Logistics'}</div>
                <div>• {isRtl ? 'حل المشكلات' : 'Problem Solving'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 't4',
    nameAr: 'قالب الطبيب العصري الملون (Alexander)',
    nameEn: 'ATS Healthcare Gradient (Alexander)',
    tagAr: 'طبي مبدع',
    tagEn: 'Creative Health',
    badgeAr: 'تدرج مذهل',
    badgeEn: 'Vibrant Spectrum',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
    renderMini: (isRtl: boolean) => (
      <div className={`absolute inset-0 p-3 flex flex-col justify-between text-left font-sans text-[5.5px] bg-gradient-to-tr from-[#E0F2FE] via-[#EFF6FF] to-[#FCE7F3] text-[#1E1B4B] rounded-b-xl border-t-4 border-indigo-700 ${isRtl ? 'text-right' : 'text-left'}`}>
        <div className={`flex justify-between items-start border-b-[0.5px] border-indigo-900/10 pb-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <div className="font-extrabold text-indigo-900 text-[10px] leading-tight">{isRtl ? 'د. ألكسندر مارتنسون' : 'Alexander Martensson'}</div>
            <div className="text-purple-700 font-bold text-[4.5px] tracking-wide uppercase mt-1">{isRtl ? 'طبيب عام (GP)' : 'General Practitioner'}</div>
          </div>
          <div className={`text-indigo-900/80 text-[4px] leading-tight ${isRtl ? 'text-left' : 'text-right'} font-medium`}>
            <div>alexander@health.com</div>
            <div>+966 54 111 2222</div>
            <div>{isRtl ? 'المستشفى السعودي الألماني' : 'SGH Hospital'}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2 flex-1 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="col-span-2 space-y-2">
            <div>
              <div className="font-extrabold text-indigo-950 text-[5px] uppercase tracking-wider mb-1 pb-0.5 border-b border-indigo-900/10">{isRtl ? 'الخبرة السريرية' : 'Experience'}</div>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between font-bold text-indigo-900 text-[4.5px]">
                    <span>{isRtl ? 'طبيب عام | الرعاية الأولية' : 'General Practitioner'}</span>
                    <span className="text-gray-600 font-normal">{isRtl ? '2021 - الحاضر' : '2021 - Pres'}</span>
                  </div>
                  <p className="text-gray-700 text-[4px] leading-[1.3] mt-0.5">{isRtl ? '• تشخيص الأمراض الحادة والمزمنة وإدارة الحالات الطارئة.\n• تقديم استشارات وقائية لأكثر من 30 مريض يومياً.\n• إحالة الحالات المعقدة للتشخيص المتقدم والعمليات.' : '• Diagnosed acute diseases, managed emergency rooms, and structured patient counseling.\n• Executed triage protocols securely.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`space-y-2 border-indigo-900/10 ${isRtl ? 'border-r pl-0 pr-2' : 'border-l pl-2 pr-0'}`}>
            <div>
              <div className="font-extrabold text-indigo-950 text-[5px] uppercase tracking-wider mb-1 pb-0.5 border-b border-indigo-900/10">{isRtl ? 'التخصصات' : 'Core'}</div>
              <div className="space-y-1 text-gray-800 text-[4px] leading-tight font-medium">
                <div>• {isRtl ? 'رعاية المرضى' : 'Patient Care'}</div>
                <div>• {isRtl ? 'الأشعة التشخيصية' : 'Diagnostics'}</div>
                <div>• {isRtl ? 'إدارة الطوارئ (ER)' : 'ER Operations'}</div>
                <div>• {isRtl ? 'الطب الوقائي' : 'Preventive Med'}</div>
              </div>
            </div>
            <div>
              <div className="font-extrabold text-indigo-950 text-[5px] uppercase tracking-wider mb-1 pb-0.5 border-b border-indigo-900/10 mt-1">{isRtl ? 'التعليم' : 'Edu'}</div>
               <div className="space-y-1 text-gray-800 text-[4px] leading-tight font-medium">
                <div>{isRtl ? 'بكالوريوس طب وجراحة' : 'MBBS Degree'}</div>
                <div className="text-indigo-800 text-[3.5px]">{isRtl ? 'جامعة أكسفورد' : 'Oxford Univ.'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 't5',
    nameAr: 'قالب الكلاسيكي أحادي اللون (Serif)',
    nameEn: 'ATS Office Manager Monochrome (Serif)',
    tagAr: 'إداري رسمي',
    tagEn: 'Formal Corporate',
    badgeAr: 'أعلى تقييم للفرز الآلي',
    badgeEn: 'Top ATS Score',
    renderMini: (isRtl: boolean) => (
      <div className={`absolute inset-0 p-4 flex flex-col justify-between text-left font-serif text-[5.5px] bg-white text-gray-950 rounded-b-xl border-t-[5px] border-gray-900 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center pb-2">
          <div className="font-bold text-gray-900 text-[11px] uppercase tracking-wide">{isRtl ? 'فهد الدوسري' : 'CHANCHAL SHARMA'}</div>
          <div className="text-[4.5px] font-sans tracking-wider uppercase text-gray-500 mt-1 leading-none">{isRtl ? 'مدير مكتب معتمد / أخصائي موارد بشرية' : 'Certified Office Manager / HR Specialist'}</div>
          <div className="text-gray-400 font-sans mt-1.5 flex justify-center gap-2 text-[4px] leading-none">
            <span dir="ltr">+966 50 000 1111</span>
            <span>•</span>
            <span dir="ltr">fahad@example.com</span>
            <span>•</span>
            <span>{isRtl ? 'الدمام، السعودية' : 'Dammam, KSA'}</span>
          </div>
          <div className="h-[1px] bg-gray-900 w-full mt-2"></div>
        </div>

        <div className="mt-1 flex-1 space-y-2 overflow-hidden">
          <div>
            <div className="font-sans font-extrabold text-gray-950 text-[5px] uppercase tracking-wider mb-1 pb-0.5 border-b-2 border-gray-900">{isRtl ? 'التاريخ الوظيفي' : 'Work History'}</div>
            <div className="space-y-1.5 font-sans">
              <div>
                <div className="flex justify-between font-bold text-gray-900 text-[4.5px]">
                  <span>{isRtl ? 'مدير مكتب أول — فنجارد للاستشارات' : 'Senior Office Admin — Vanguard Inc.'}</span>
                  <span className="font-sans text-gray-500 font-normal">{isRtl ? 'يناير 2021 — الحاضر' : 'Jan 2021 — Pres'}</span>
                </div>
                <div className="text-gray-700 leading-[1.3] text-[4px] mt-0.5">
                  {isRtl ? '• الإشراف على الشؤون اللوجستية اليومية للمكتب، وتنظيم وتوجيه أكثر من 250 موظفاً والمحافظة على ميزانية التشغيل.\n• إعداد برامج تدريبية وتطويرية وإطلاق نظام الحضور والانصراف الآلي.' : '• Supervised daily logistics and onboarded 250+ employees, keeping budget on track.\n• Implemented automated HR management systems.'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="font-sans font-extrabold text-gray-950 text-[5px] uppercase tracking-wider mb-1 pb-0.5 border-b-2 border-gray-900 font-sans">{isRtl ? 'التعليم' : 'Education'}</div>
            <div className="flex justify-between font-bold text-gray-900 text-[4.5px] font-sans">
              <span>{isRtl ? 'بكالوريوس إدارة أعمال — جامعة الإمام' : 'B.B.A. Management — Syracuse School'}</span>
              <span className="font-sans text-gray-500 font-normal">2018</span>
            </div>
          </div>
          
           <div>
            <div className="font-sans font-extrabold text-gray-950 text-[5px] uppercase tracking-wider mb-1 pb-0.5 border-b-2 border-gray-900 font-sans">{isRtl ? 'المهارات الاحترافية' : 'Skills'}</div>
            <div className="grid grid-cols-3 gap-1 font-bold text-gray-700 text-[4px] font-sans">
               <span>• {isRtl ? 'تخطيط המوارد (ERP)' : 'ERP Planning'}</span>
               <span>• {isRtl ? 'العلاقات العامة' : 'Public Relations'}</span>
               <span>• {isRtl ? 'نظام العمل (مُدد)' : 'Labor Systems'}</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 't6',
    nameAr: 'قالب الخطاب والمستشار والتميز (Olivia)',
    nameEn: 'ATS Executive Statement (Olivia)',
    tagAr: 'خطاب واستشارات',
    tagEn: 'Consulting & Executive',
    badgeAr: 'حديث ومميز',
    badgeEn: 'Modern Letter',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    renderMini: (isRtl: boolean) => (
      <div className={`absolute inset-0 p-4 flex flex-col justify-between text-left font-sans text-[5.5px] bg-white text-gray-900 rounded-b-xl ${isRtl ? 'border-r-4 text-right' : 'border-l-4 text-left'} border-indigo-950`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-extrabold text-indigo-950 text-[11px] tracking-tight">{isRtl ? 'أوليفيا ويلسون' : 'Olivia Wilson'}</div>
              <div className="text-gray-500 text-[5px] leading-none mt-1">{isRtl ? 'مستشار إستراتيجي أول' : 'Senior Strategic Consultant'}</div>
            </div>
            <div className={`text-[4px] text-gray-500 font-medium leading-tight ${isRtl ? 'text-left' : 'text-right'}`}>
              <div>{isRtl ? 'حي العليا، الرياض 12211' : '123 Anywhere St.'}</div>
              <div dir="ltr" className={isRtl ? 'text-left' : 'text-right'}>hello@reallygreatsite.com</div>
              <div dir="ltr" className={isRtl ? 'text-left mt-0.5' : 'text-right mt-0.5'}>+966 50 123 4567</div>
            </div>
          </div>
          <div className="h-[0.5px] bg-indigo-950/25 w-full mt-2"></div>
        </div>

        <div className="flex-1 mt-2 overflow-hidden">
          <div className="font-bold text-indigo-950 text-[5.5px] uppercase mb-1">{isRtl ? 'الملخص التنفيذي' : 'Executive Statement'}</div>
          <p className="text-gray-600 leading-[1.4] text-[4px] text-justify font-normal">
            {isRtl ? 'مستشار إستراتيجي محترف متخصص في صياغة خطابات الأعمال، وبناء خطط التواصل المؤسسي الموجه. خبرة تزيد عن 8 سنوات في قيادة المشاريع الاستشارية الكبرى وتحسين الأداء التشغيلي في بيئات العمل المعقدة، وتقديم حلول مستدامة تعزز كفاءة الإنفاق وتوفر التكاليف التشغيلية بشكل جذري وملحوظ.' : 'Strategic Consultant and specialized executive with over 8 years driving corporate communications and high-level advisory projects. Proven expertise in overhauling operational bottlenecks, optimizing supply chains, and steering cross-departmental excellence within Fortune 500 tech environments.'}
          </p>
          <div className="mt-2 text-indigo-900 border-t-[0.5px] border-indigo-900/10 pt-1 text-[4.5px] font-bold uppercase">{isRtl ? 'المحاور الرئيسية' : 'Key Directives'}</div>
          <div className="mt-1 grid grid-cols-2 gap-2 text-gray-700 text-[4px]">
            <div>• {isRtl ? 'حوكمة الشركات' : 'Corporate Governance'}</div>
            <div>• {isRtl ? 'التخطيط الاستراتيجي' : 'Strategic Planning'}</div>
            <div>• {isRtl ? 'إدارة الأزمات المالية' : 'Crisis Management'}</div>
            <div>• {isRtl ? 'خطابات التأثير العالي' : 'Executive Pitching'}</div>
          </div>
        </div>

        <div className="text-right mt-2 border-t border-gray-200 pt-2 flex justify-between items-center">
          <span className="text-[4px] text-gray-400">{isRtl ? 'الاعتماد والتوقيع' : 'Official Signature'}</span>
          <div className="inline-block">
            <div className="font-serif italic text-indigo-900 text-[6.5px]">{isRtl ? 'Olivia W.' : 'Olivia Wilson'}</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 't7',
    nameAr: 'قالب الأفق الساطع الكحلي (Rachelle)',
    nameEn: 'ATS Premium Royal Column (Rachelle)',
    tagAr: 'مبيعات وإدارة مشاريع',
    tagEn: 'Tech & Engineering',
    badgeAr: 'أزرق كحلي فخم',
    badgeEn: 'Cobalt Header Theme',
    renderMini: (isRtl: boolean) => (
      <div className={`absolute inset-0 p-0 flex flex-col justify-between text-left font-sans text-[5px] bg-white text-gray-800 rounded-b-xl ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={`bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-xl ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <div className="font-extrabold text-[10px] uppercase tracking-wide">{isRtl ? 'راشيل بودري' : 'Rachelle Beaudry'}</div>
            <div className="text-blue-100 font-semibold tracking-wider text-[4px] mt-1">{isRtl ? 'تنفيذي حسابات تقنية الكبرى' : 'Enterprise Account Executive'}</div>
          </div>
          <div className={`text-[3.5px] text-blue-100 leading-tight font-medium ${isRtl ? 'text-left' : 'text-right'}`}>
            <div dir="ltr">{isRtl ? 'rachelle@domain.com ✉️' : '✉️ rachelle@domain.com'}</div>
            <div>{isRtl ? 'دبي، الإمارات العربية المتحدة 📍' : '📍 Dubai, UAE'}</div>
            <div dir="ltr">{isRtl ? '+971 50 123 4567 📞' : '📞 +971 50 123 4567'}</div>
          </div>
        </div>

        <div className="p-4 flex-1 space-y-2 overflow-hidden">
          <div>
            <div className="text-blue-700 font-extrabold text-[5px] uppercase border-b border-blue-200 pb-0.5 mb-1">{isRtl ? 'الخبرة التنفيذية' : 'Executive Experience'}</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between font-bold text-gray-800 text-[4.5px]">
                  <span>{isRtl ? 'مدير مبيعات إقليمي | حلول السحابة' : 'Senior Sales lead | SaaS Ventures'}</span>
                  <span className="text-gray-500 font-normal">{isRtl ? '2021 - الحاضر' : '2021 - Pres'}</span>
                </div>
                <div className="text-gray-600 mt-0.5 leading-[1.3] text-[4px]">
                  {isRtl ? '• قيادة فريق من 12 تنفيذي مبيعات وتحقيق نمو بنسبة 45% في إيرادات التراخيص المتكررة خلال العامين الماضيين.\n• بناء علاقات استراتيجية حيوية.' : '• Drove $2.4M recurring license revenue, modernizing core pipeline.\n• Led a 12-person regional tech sales team.'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-blue-700 font-extrabold text-[5px] uppercase border-b border-blue-200 pb-0.5 mb-1 font-sans">{isRtl ? 'المؤهلات الأكاديمية' : 'Academic'}</div>
            <div className="flex justify-between font-bold text-gray-800 text-[4.5px]">
              <span>{isRtl ? 'ماجستير تقنية المعلومات | جامعة ستانفورد' : 'M.S. Management | Stanford University'}</span>
              <span className="text-gray-500 font-normal">2018</span>
            </div>
          </div>

          <div>
             <div className="text-blue-700 font-extrabold text-[5px] uppercase border-b border-blue-200 pb-0.5 mb-1 font-sans">{isRtl ? 'الخبرات التقنية' : 'Tech Skills'}</div>
             <div className="text-gray-600 text-[4px] leading-snug">
               {isRtl ? 'مبيعات B2B، الحوسبة السحابية (AWS، Azure)، استراتيجيات CRM (Salesforce)، قيادة الفرق وتطوير الأعمال.' : 'B2B Sales, Cloud Solutions (AWS, Azure), CRM (Salesforce, HubSpot), Business Development, Executive Pitching.'}
             </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 't8',
    nameAr: 'قالب المسار المزدوج (Olivia Classic)',
    nameEn: 'ATS Chronological Classic (Olivia)',
    tagAr: 'خدمة عملاء وإداري',
    tagEn: 'Customer Success & Admin',
    badgeAr: 'كلاسيك معتمد في السعودية',
    badgeEn: 'ATS Classic Standard',
    renderMini: (isRtl: boolean) => (
      <div className={`absolute inset-0 p-4 flex flex-col justify-between text-left font-sans text-[5px] bg-white text-gray-900 rounded-b-xl border-t-[5px] border-cyan-800 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center pb-2 border-b border-gray-100">
          <div className="text-cyan-900 font-extrabold text-[11px] uppercase">{isRtl ? 'سارة القحطاني' : 'Olivia Wilson'}</div>
          <div className="text-cyan-700 font-bold tracking-wider text-[5px] uppercase mt-1 leading-none">{isRtl ? 'مسؤول الدعم الإداري للشركات' : 'Corporate Administrative Assistant'}</div>
          <div className="text-gray-400 mt-1.5 flex justify-center gap-2 text-[4px] leading-none">
            <span dir="ltr">hello@example.com</span>
            <span>•</span>
            <span dir="ltr">+966 50 123 4567</span>
            <span>•</span>
            <span>{isRtl ? 'جدة' : 'Jeddah'}</span>
          </div>
        </div>

        <div className="mt-1 flex-1 space-y-2 overflow-hidden">
          <div className="text-gray-600 font-sans text-[4px] text-center px-4 mb-2 h-[20px] overflow-hidden leading-[1.3]">
            {isRtl ? 'مختصة إدارية تملك الحماس والالتزام، مع 3 سنوات من الخبرة في تنظيم المواعيد التنفيذية، وإدارة اللوجستيات وتحسين قنوات التواصل الداخلي للشركات.' : 'Dedicated administrative professional with 3+ years managing complex executive scheduling, corporate logistics, and inter-departmental communications.'}
          </div>

          <div>
            <div className="text-cyan-800 font-bold text-[5px] uppercase border-b border-cyan-100 mb-1 pb-0.5">{isRtl ? 'التجارب العملية' : 'Experience'}</div>
            <div>
              <div className="flex justify-between font-bold text-gray-800 text-[4.5px]">
                <span>{isRtl ? 'أخصائي إداري | شركة المتقدمة للتقنية' : 'Administrative Specialist | Arrowai'}</span>
                <span className="text-gray-500 font-normal">{isRtl ? '2023 - الحاضر' : '2023 - Pres'}</span>
              </div>
              <p className="text-gray-600 mt-0.5 leading-[1.3] text-[4px]">
                {isRtl ? '• تنسيق جداول الأعمال والرحلات، وإعداد تقارير الأداء وتقليل تكاليف المشتريات المكتبية بنسبة 20%.' : '• Managed calendars, travel logistics, and optimized supply channels, saving 20% on office procurement.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-cyan-800 font-bold text-[5px] uppercase border-b border-cyan-100 mb-1 pb-0.5">{isRtl ? 'الشهادات الجامعية' : 'Education'}</div>
              <div className="text-gray-800 leading-snug text-[4px] font-bold">{isRtl ? 'بكالوريوس اتصال مؤسسي' : 'B.S. Business Excellence'}</div>
              <div className="text-gray-500 leading-snug text-[3.5px]">{isRtl ? 'جامعة عفت (2022)' : 'Effat Univ. (2022)'}</div>
            </div>
            <div>
              <div className="text-cyan-800 font-bold text-[5px] uppercase border-b border-cyan-100 mb-1 pb-0.5">{isRtl ? 'نقاط القوة' : 'Competencies'}</div>
              <ul className="text-gray-600 text-[4px] leading-tight space-y-0.5">
                <li>• {isRtl ? 'الجدولة والتنسيق' : 'Scheduling & Logistics'}</li>
                <li>• {isRtl ? 'برامج الاوفيس' : 'MS Office Mastery'}</li>
                <li>• {isRtl ? 'التواصل الكتابي' : 'Written Comms'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export const Login: React.FC<LoginProps> = ({ theme, setTheme }) => {
  const { signInWithGoogle, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const isRtl = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#121212]' : 'bg-[#F9F7F4]'} text-gray-900 dark:text-gray-100 ${isRtl ? 'font-arabic' : 'font-sans'} transition-colors duration-300 selection:bg-[#00B5A5] selection:text-white`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 w-full ${theme === 'dark' ? 'bg-[#121212]/90' : 'bg-[#F9F7F4]/90'} backdrop-blur-md border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo size="xl" className="hover:scale-105 transition-transform duration-300 drop-shadow-md" />
          </div>
          
          <nav className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 font-medium text-sm text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-[#00B5A5] transition-colors">{isRtl ? 'المميزات' : 'Features'}</a>
              <a href="#templates" className="hover:text-[#00B5A5] transition-colors">{isRtl ? 'القوالب' : 'Templates'}</a>
              <a href="#how-it-works" className="hover:text-[#00B5A5] transition-colors">{isRtl ? 'كيفية العمل' : 'How it works'}</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="w-10 h-10 flex items-center justify-center font-bold text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                aria-label="Toggle language"
              >
                {language === 'en' ? 'ع' : 'EN'}
              </button>
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2 px-4 sm:px-5 bg-[#261E5A] hover:bg-[#1a1442] dark:bg-[#00B5A5] dark:text-white dark:hover:bg-[#008f82] text-white rounded-full font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isRtl ? 'ابدأ الآن' : 'Get Started'}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 z-10 relative">
          <div className="absolute -top-20 start-0 -translate-x-1/3 rtl:translate-x-1/3 w-64 h-64 bg-[#00B5A5] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
          <div className="absolute -top-20 end-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>
          
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            {isRtl ? 'سيرتك الذاتية.. بوابتك لفرص تدعم رؤيتنا وطموح وطننا!' : 'Build a professional, smart resume tailored for Saudi market success'}
          </h2>
          
          <div className="space-y-4 max-w-xl">
            <p className="text-lg lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {isRtl 
                ? 'أول منصة متوافقة ١٠٠٪ مع متطلبات جدارات وصندوق هدف، وكبرى الشركات والوزارات في المملكة. مجانية بالكامل، بدون علامات مائية وبتحميل غير محدود!'
                : 'SiraMix of Saudi Arabia is 100% compliant with local HRSD ministries, jadarat, and advanced recruiters.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-4 w-full sm:w-auto">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="group flex flex-row items-center justify-center gap-3 py-4 px-8 bg-[#261E5A] hover:bg-[#1a1442] dark:bg-[#00B5A5] dark:text-white dark:hover:bg-[#008f82] text-white rounded-full font-bold text-lg shadow-xl shadow-purple-900/10 transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50"
            >
              <span>
                {isRtl ? 'سجّل معنا بلمسة واحدة عبر Google' : 'Sign in with Google'}
              </span>
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center gap-4 pt-6">
            <div className="flex -space-x-3">
              {isRtl ? (
                <>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-[#00B5A5] text-white flex items-center justify-center font-bold text-sm">س</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-[#261E5A] text-white flex items-center justify-center font-bold text-sm">م</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-[#EA4335] text-white flex items-center justify-center font-bold text-sm">ع</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-500 text-white flex items-center justify-center font-bold text-sm">ف</div>
                </>
              ) : (
                <>
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800" src="https://i.pravatar.cc/100?img=1" alt="user" />
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800" src="https://i.pravatar.cc/100?img=2" alt="user" />
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800" src="https://i.pravatar.cc/100?img=3" alt="user" />
                  <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800" src="https://i.pravatar.cc/100?img=4" alt="user" />
                </>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {isRtl ? 'موثوق من آلاف المحترفين في السعودية' : 'Trusted by thousands of users'}
            </p>
          </div>
        </div>
        
        {/* Hero Visual Collage */}
        <div className="flex-1 relative w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md aspect-[3/4] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 rotate-3 transform transition-transform hover:rotate-0 duration-500 border border-gray-100 dark:border-gray-700">
            {/* Mockup Resume Header */}
            <div className="flex gap-4 items-center border-b pb-4 mb-4 border-gray-100 dark:border-gray-700">
               <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600"></div>
               <div className="space-y-2 flex-1">
                 <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                 <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/3"></div>
               </div>
            </div>
            {/* Mockup Resume Content */}
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-3"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
              <div className="absolute top-10 start-0 lg:-start-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 animate-bounce">
                <div className="bg-green-100 text-green-600 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm">ATS Friendly</p>
                  <p className="text-xs text-gray-500">100% Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges section */}
      <section className="border-t border-gray-200 dark:border-gray-800 py-12 bg-white dark:bg-[#121212]">
         <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 justify-center text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-[#F9F7F4] dark:bg-gray-800 rounded-full text-[#382E6A] dark:text-[#00B5A5]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <h3 className="font-bold text-lg">{isRtl ? 'السيرة الأولى مجانية مدى الحياة' : '1st resume, free forever'}</h3>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-[#F9F7F4] dark:bg-gray-800 rounded-full text-[#382E6A] dark:text-[#00B5A5]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-bold text-lg">{isRtl ? 'بياناتك في أمان تام' : 'Privacy & GDPR compliant'}</h3>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-[#F9F7F4] dark:bg-gray-800 rounded-full text-[#382E6A] dark:text-[#00B5A5]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
              <h3 className="font-bold text-lg">{isRtl ? 'قوالب تتخطى الفرز الآلي' : 'Professional Templates'}</h3>
            </div>
         </div>
      </section>

      {/* "Create a Professional Resume in Minutes" block */}
      <section id="how-it-works" className="py-24 bg-[#F9F7F4] dark:bg-[#121212]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              {isRtl ? 'كيف تنشئ سيرتك في دقائق؟' : 'Create a professional resume in minutes'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {isRtl ? 'بخطوات بسيطة وواضحة، صمم سيرة ذاتية احترافية تبرز مهاراتك:' : 'SiraMix makes it easy to create and edit your resume. Here\'s how it works:'}
            </p>
          </div>

          <div className="space-y-32">
            {/* Step 1 */}
            <div className={`flex flex-col ${isRtl ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-105 dark:border-gray-700/60 relative overflow-hidden group">
                  <div className="text-[9px] text-gray-400 font-mono mb-4 text-left">CHOOSE_TEMPLATE_PANEL</div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Tiny representation of selected vs not-selected templates */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-2 relative bg-gray-50/50 dark:bg-gray-900/50">
                      <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-sm mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-1 bg-gray-250 dark:bg-gray-850 w-full rounded-sm"></div>
                        <div className="h-1 bg-gray-250 dark:bg-gray-850 w-5/6 rounded-sm"></div>
                      </div>
                    </div>
                    <div className="border-2 border-[#00B5A5] bg-[#00B5A5]/5 rounded-xl p-2 relative">
                      <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-[#00B5A5] rounded-full flex items-center justify-center text-[6px] text-white font-bold">✓</div>
                      <div className="h-6 w-1/4 bg-[#00B5A5]/30 rounded-sm mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-1 bg-[#00B5A5]/20 w-full rounded-sm"></div>
                        <div className="h-1 bg-[#00B5A5]/20 w-4/5 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#EBF5F0] dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/20 text-left font-sans text-[8px] space-y-1">
                    <div className="font-bold text-emerald-800 dark:text-emerald-400">Danielle Brasseur (Accounting)</div>
                    <div className="h-[0.5px] bg-emerald-600/10 w-full"></div>
                    <div className="text-gray-500 dark:text-gray-400 leading-tight">Selected premium mint theme: Perfectly aligned for Arabic Calibri font.</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  1. {isRtl ? 'اختر القالب اللذي يناسب طموحك' : 'Choose a template'}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {isRtl ? 'اختر من بين قوالبنا الاحترافية الثمانية الجديدة المصممة خصيصاً لتناسب متطلبات سوق العمل وكبرى الشركات والمستشفيات في المملكة.' : 'Select one of SiraMix\'s professionally designed resume templates or design your own resume template and save it.'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex flex-col ${isRtl ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16`}>
               <div className="flex-1 flex justify-center">
                <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/60 text-left">
                  <div className="text-[9px] text-gray-400 font-mono mb-4 text-left">EXPERIENCE_BUILDER_FIELD</div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                        {isRtl ? 'المسمى الوظيفي / Job Title' : 'Job Title'}
                      </label>
                      <div className="w-full bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                        <span>{isRtl ? 'مدير حسابات مالية' : 'Senior Financial Lead'}</span>
                        <span className="w-1.5 h-3.5 bg-[#00B5A5] animate-pulse"></span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                        {isRtl ? 'الجهة الموظفة / Employer (Riyadh)' : 'Employer'}
                      </label>
                      <div className="w-full bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-400">
                        {isRtl ? 'مجموعة سار ومشاريع المترو بالرياض' : 'Metro Project Consulting'}
                      </div>
                    </div>
                    {/* Simulated live suggestion */}
                    <div className="bg-[#00B5A5]/10 border border-[#00B5A5]/25 p-2.5 rounded-lg text-[9.5px] flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                      <SparklesIcon className="w-4 h-4 text-[#00B5A5] shrink-0" />
                      <span>{isRtl ? 'مستشار الذكاء الاصطناعي: تمت ترقية الوصف المهني لأعلى نسبة قبول ATS!' : 'AI Assist: Tailored and parsed with premium language parameters.'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  2. {isRtl ? 'اكتب خبراتك بروح تسويقية' : 'Add your experience'}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {isRtl ? 'عبئ بياناتك الوظيفية وسنتكفل بتحسين الصياغة بلهجة احترافية دقيقة، أو ارفع ملفك القديم ليتم تفريغه تلقائياً.' : 'Fill your resume with content. We\'ll guide you along the way. You can also import an existing resume.'}
                </p>
              </div>
            </div>

             {/* Step 3 */}
             <div className={`flex flex-col ${isRtl ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-105 dark:border-gray-700/60 relative overflow-hidden flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#00B5A5]/10 flex items-center justify-center text-[#00B5A5] mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
                    {isRtl ? 'سيرة-ميكس-النهائية.pdf' : 'SiraMix_Resume_v2.pdf'}
                  </h4>
                  <p className="text-xs text-gray-400 mb-4">{isRtl ? 'تنزيل فوري عالي الدقة والمطابقة' : 'Ready to download immediately'}</p>
                  
                  <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-[#00B5A5] h-full rounded-full w-full animate-pulse"></div>
                  </div>
                  <div className="flex justify-between w-full text-[9px] text-[#00B5A5] font-bold">
                    <span>100% {isRtl ? 'جاهز ومدعوم بالكامل' : 'Completed'}</span>
                    <span>495 KB</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  3. {isRtl ? 'حمل سيرتك الذاتية بلا قيود' : 'Download unlimited PDFs'}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {isRtl ? 'احصل على نسختك المطابقة فوراً بصيغة PDF قابلة للتعديل والتحميل اللامحدود وفي أي وقت يناسبك وبدون أي عقبات.' : 'Your resume draft is automatically saved in your account. Update and download unlimited PDFs whenever you need.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-24 bg-white dark:bg-[#121212]">
        <div className="container mx-auto px-6">
          <div className="text-center md:text-left mb-16 max-w-3xl">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              {isRtl ? 'اختر من بين 8 قوالب سيرة ذاتية احترافية جديدة' : 'Choose from 8 Professional New Templates'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {isRtl 
                ? 'قوالب السيرة الذاتية صممت بعناية فائقة لتناسب متطلبات سوق العمل السعودي وتجتاز جميع أنظمة الفرز بذكاء.' 
                : 'Free resume templates crafted with meticulous design to pass modern applicant tracking systems and stand out in any boardroom.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {templatesData.map((template) => {
              const badgeText = isRtl ? template.badgeAr : template.badgeEn;
              const tagText = isRtl ? template.tagAr : template.tagEn;
              const nameText = isRtl ? template.nameAr : template.nameEn;
              
              return (
                <div 
                  key={template.id} 
                  onClick={signInWithGoogle}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/60 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl cursor-pointer relative group flex flex-col aspect-[1/1.414]"
                >
                  {/* Miniature Specimen Header */}
                  <div className="p-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs font-semibold shrink-0">
                    <span className="text-gray-500 dark:text-gray-400 font-mono text-[9px]">{template.id.toUpperCase()}-PREMIUM</span>
                    <span className="bg-[#00B5A5]/10 text-[#00B5A5] dark:text-[#00e3cf] px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">{tagText}</span>
                  </div>

                  {/* Fully Coded Live CSS Miniature Resume Sheet */}
                  <div className="relative flex-1 bg-white overflow-hidden shadow-inner select-none pointer-events-none">
                    {template.renderMini(isRtl)}
                    
                    {/* Glassmorphism Interactive Hover Screen */}
                    <div className="absolute inset-0 bg-[#261E5A]/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-[#00B5A5] flex items-center justify-center text-white mb-4 shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-bold text-lg mb-2">
                        {isRtl ? 'تصميم ذكي ومتكامل' : 'Smart Dynamic Architecture'}
                      </p>
                      <button className="bg-[#00B5A5] hover:bg-[#009e90] text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all">
                        {isRtl ? 'ابدأ بهذا القالب مجاناً' : 'Build with this template'}
                      </button>
                      <span className="text-white/60 text-xs mt-3 block font-mono">
                        {isRtl ? '✓ متوافق تماماً مع أنظمة الفرز (ATS)' : '✓ Fully ATS Compliant'}
                      </span>
                    </div>
                  </div>

                  {/* Template Meta Footer */}
                  <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 flex flex-col gap-1.5">
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 tracking-tight block truncate">
                      {nameText}
                    </h3>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {isRtl ? 'تخطيط حر وذكي' : 'Modular Auto-Fit'}
                      </span>
                      <span className="text-[#00B5A5] font-semibold text-[11px] bg-[#00B5A5]/10 px-1.5 py-0.5 rounded-full">
                        {badgeText}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12">
             <button onClick={signInWithGoogle} className="px-8 py-3 bg-[#261E5A] hover:bg-[#20194c] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
               {isRtl ? 'تصفح كافة القوالب المجانية (8+) للمنصة' : 'Browse All Supporting Layouts'}
             </button>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 bg-[#F9F7F4] dark:bg-[#121212]">
        <div className="container mx-auto px-6">
          <div className="text-center md:text-left mb-16 max-w-2xl">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              {isRtl ? "ما الذي يشمله خطة SiraMix المجانية" : "What's included in SiraMix's Free Plan"}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {isRtl 
                ? "لن تجد خطة مجانية أكثر سخاءً بين أدوات بناء السيرة الذاتية. إليك ما تحصل عليه:"
                : "You won't find a more generous free plan among resume builders. Here's what you get with our free plan."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            <div>
               <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-800 mb-4">
                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{isRtl ? "سيرتك الأولى مجانية بالكامل" : "Your First Resume is Free Forever"}</h4>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{isRtl ? "أنشئ، عدل، واحفظ سيرة واحدة مجاناً مدى الحياة وبدون طلب بطاقة ائتمانية." : "Create, edit, and save one resume for free for life. No trial period. No credit card."}</p>
            </div>
            <div>
               <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-800 mb-4">
                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{isRtl ? "سيرتك باسمك" : "Just You on Your Resume"}</h4>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{isRtl ? "ما راح نضيف أي شعار أو علامة مائية على سيرتك. أردناها ملكك بالكامل لتتألق بها." : "We never brand your resume. No SiraMix logo and no watermarks. Your resume is your place to shine."}</p>
            </div>
            <div>
               <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-800 mb-4">
                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               </div>
               <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{isRtl ? "تحميل PDF لا محدود" : "Unlimited PDF Downloads"}</h4>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{isRtl ? "عدل وحمل سيرتك بصيغة PDF وقت ما تحب، بدون أي قيود على عدد مرات التحميل." : "Update, edit, and download your one free resume as often as you like. There are no download limits."}</p>
            </div>
            <div>
               <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-800 mb-4">
                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
               </div>
               <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{isRtl ? "قوالب لتخطي الفرز الآلي" : "50+ Customizable Templates"}</h4>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{isRtl ? "جميع القوالب مصممة لتكون متوافقة مع أنظمة تتبع المتقدمين (ATS) وتخصيص سهل للتصميم." : "Choose from professional, ATS-friendly templates and fully customize structure, layout, and design."}</p>
            </div>
            <div>
               <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-800 mb-4">
                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               </div>
               <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{isRtl ? "استيراد بياناتك أو بدء جديد" : "Import Content or Start From Scratch"}</h4>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{isRtl ? "ارفع سيرتك السابقة وسنقوم بالتقاط البيانات لتوفير وقتك، أو ابدأ بصفحة بيضاء." : "Upload content from an existing resume file, or start from a blank page."}</p>
            </div>
            <div>
               <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-800 mb-4">
                 <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
               </div>
               <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{isRtl ? "خصوصيتك أولوية" : "We Respect Your Privacy"}</h4>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{isRtl ? "بياناتك الشخصية مشفرة ولا يتم مشاركتها مع أي طرف ثالث، ولك حرية مسحها بأي وقت." : "SiraMix is privacy-first and GDPR-compliant. We don't share your personal data, and you can delete it anytime."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-white dark:bg-[#121212] overflow-hidden">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              {isRtl ? "محبوب وموثوق من الملايين" : "Loved & Trusted by Millions of Users"}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
               {isRtl ? "يستخدمه ملايين الباحثين عن عمل، وتتخطى تقييماته التوقعات دائمًا." : "Used by countless job seekers worldwide, SiraMix is top-rated for its ease of use."}
            </p>
          </div>
          
          <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-8 snap-x overscroll-x-contain max-w-full px-1" dir={isRtl ? 'rtl' : 'ltr'}>
             <div className="shrink-0 w-[min(300px,calc(100vw-3rem))] md:w-[400px] bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm snap-center">
               <p className="italic text-gray-600 dark:text-gray-300 mb-6">
                 {isRtl ? "أداة رائعة جداً اختصرت علي وقت طويل في التصميم والتنسيق. القوالب احترافية وملائمة جداً لسوقنا." : "\"I absolutely love this site. It has made a huge difference in my and so many of my friends' career paths. Super easy to edit.\""}
               </p>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#EA4335] text-white flex items-center justify-center font-bold">{isRtl ? 'س' : 'G'}</div>
                 <div>
                   <p className="font-bold text-sm">{isRtl ? 'سلطان العتيبي' : 'Siobhan K.'}</p>
                   <p className="text-xs text-gray-500">Google Review</p>
                 </div>
               </div>
             </div>
             <div className="shrink-0 w-[min(300px,calc(100vw-3rem))] md:w-[400px] bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm snap-center">
               <p className="italic text-gray-600 dark:text-gray-300 mb-6">
                 {isRtl ? "تجربة ممتازة وبدون أي رسوم مخفية أو علامات مائية. التنظيم واضح والتصميم مريح للعين، أنصح بها بشدة." : "\"Great option totally free of cost and without watermarks even for the basic service. Easy format, looks clean and clear.\""}
               </p>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#00B5A5] text-white flex items-center justify-center font-bold">{isRtl ? 'ر' : 'I'}</div>
                 <div>
                   <p className="font-bold text-sm">{isRtl ? 'ريم الدوسري' : 'Isabel R.'}</p>
                   <p className="text-xs text-gray-500">Trustpilot Review</p>
                 </div>
               </div>
             </div>
             <div className="shrink-0 w-[min(300px,calc(100vw-3rem))] md:w-[400px] bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm snap-center">
               <p className="italic text-gray-600 dark:text-gray-300 mb-6">
                 {isRtl ? "أول مرة أشوف أداة تطلع السيرة الذاتية بهذي الاحترافية وفي دقائق معدودة. فعلاً منصة ترفع الرأس." : "\"[...] I recently tried SiraMix, and I'm amazed at how quickly it lets you craft a polished, modern CV - literally in just minutes.\""}
               </p>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center font-bold">in</div>
                 <div>
                   <p className="font-bold text-sm">{isRtl ? 'عبدالله القحطاني' : 'Vaibhavi R.'}</p>
                   <p className="text-xs text-gray-500">LinkedIn Post</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#F9F7F4] dark:bg-[#121212]">
         <div className="container mx-auto px-6 max-w-3xl">
           <h2 className="text-3xl lg:text-4xl font-black text-center text-gray-900 dark:text-white mb-12">
              {isRtl ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: isRtl ? "وش هو SiraMix وكيف يشتغل؟" : "What is SiraMix and how does it work?",
                  a: isRtl ? "منصة SiraMix هي أداة ذكية تساعدك في بناء سيرة ذاتية احترافية تتوافق مع معايير سوق العمل وأنظمة الفرز الآلي (ATS). تختار القالب، تدخل بياناتك، وتحملها مباشرة." : "SiraMix is a smart tool that helps you build a professional, ATS-friendly resume. Choose a template, enter your details, and download instantly."
                },
                {
                  q: isRtl ? "هل الخدمة مجانية فعلاً؟" : "Is SiraMix really free?",
                  a: isRtl ? "نعم، باقتنا الأساسية تتيح لك إنشاء سيرة ذاتية واحدة وتحميلها بصيغة PDF بشكل لا محدود ومجاناً بالكامل." : "Yes, our primary plan allows you to create one resume and download unlimited PDFs completely for free."
                },
                {
                  q: isRtl ? "هل أقدر أحدث سيرتي بعدين؟" : "Can I update my resume later?",
                  a: isRtl ? "أكيد، نظامنا يحفظ سيرتك تلقائياً بحيث تقدر ترجع في أي وقت، تعدل بياناتك، وتحمل النسخة المحدثة فوراً." : "Definitely. Our system auto-saves your resume so you can return anytime, edit your info, and download the updated version."
                },
                {
                  q: isRtl ? "هل قوالبكم تتوافق مع نظام الفرز الآلي (ATS)؟" : "Are SiraMix resumes ATS-friendly?",
                  a: isRtl ? "جميع قوالبنا مصممة ومختبرة لضمان قراءتها بسلاسة من قبل أنظمة تتبع المتقدمين (ATS) المستخدمة في كبرى الشركات داخل المملكة وخارجها." : "All of our templates are designed and tested to be easily read by Applicant Tracking Systems (ATS) used by major companies."
                },
                {
                  q: isRtl ? "هل بياناتي الشخصية بأمان؟" : "Is my personal data secure?",
                  a: isRtl ? "نولي خصوصيتك أعلى درجات الأهمية. جميع البيانات مشفرة ولا نقوم ببيعها أو مشاركتها مع أي جهة خارجية." : "We prioritize your privacy above all. All data is encrypted and we do not sell or share it with third parties."
                },
              ].map((faq, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col group cursor-pointer hover:border-gray-300 transition-colors">
                   <div className="flex justify-between items-center w-full">
                     <h3 className="font-bold text-gray-800 dark:text-gray-200">{faq.q}</h3>
                     <svg className="w-5 h-5 text-gray-400 group-hover:text-[#00B5A5] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                   </div>
                   <p className="text-gray-600 dark:text-gray-400 mt-3 hidden group-hover:block leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* CTA bottom section */}
      <section className="py-24 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-gray-800 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-black mb-8 text-gray-900 dark:text-white">
             {isRtl ? 'هل أنت مستعد لبناء سيرتك الذاتية؟' : 'Ready to build your resume?'}
          </h2>
          <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 py-4 px-10 bg-[#261E5A] hover:bg-[#1a1442] dark:bg-[#00B5A5] dark:text-white dark:hover:bg-[#008f82] text-white rounded-full font-bold text-xl shadow-xl transition-all hover:scale-105 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isRtl ? 'جرب مجاناً الآن' : 'Try for free now'}</span>
          </button>
        </div>
      </section>

      {/* Footer credits */}
      <footer className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center text-sm font-medium text-gray-500">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Logo size="sm" showText={false} className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SiraMix</span>
          </div>
          <p>{isRtl ? 'تم تنفيذه من قبل المهندس Mojahed alameen' : 'Developed by Mojahed alameen'}</p>
        </div>
      </footer>
    </div>
  );
};
