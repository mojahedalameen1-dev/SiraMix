import React, { useEffect, useRef, useState } from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { Resume } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useLanguage, useTranslation } from '../i18n';
import { Logo } from './Logo';
import { AuthUser } from './AuthContext';

export type SaveStatus = 'saved' | 'saving' | 'error';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  resumes: Resume[];
  activeResumeId: string;
  setActiveResumeId: (id: string) => void;
  addResume: () => void;
  deleteResume: (id: string) => void;
  renameResume: (id: string, newName: string) => void;
  currentResumeName: string;
  user: AuthUser;
  signOut: () => Promise<void>;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
  currentCompletion: number;
  otherCompletion: number;
  onCopyStructure: () => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  resumes,
  activeResumeId,
  setActiveResumeId,
  addResume,
  deleteResume,
  renameResume,
  currentResumeName,
  user,
  signOut,
  saveStatus,
  onRetrySave,
  currentCompletion,
  otherCompletion,
  onCopyStructure,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(currentResumeName);
  const [moreOpen, setMoreOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const isRtl = language === 'ar';

  useEffect(() => {
    setNameInputValue(currentResumeName);
  }, [currentResumeName]);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commitName = () => {
    const nextName = nameInputValue.trim();
    if (nextName && nextName !== currentResumeName) {
      renameResume(activeResumeId, nextName);
    } else {
      setNameInputValue(currentResumeName);
    }
    setIsEditingName(false);
  };

  const userAvatar = user?.user_metadata?.avatar_url;
  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userFullName.split(' ').map((part: string) => part[0]).join('').toUpperCase().slice(0, 2);

  const saveLabel = saveStatus === 'saving' ? t('header.saveSaving') : saveStatus === 'error' ? t('header.saveError') : t('header.saveSaved');
  const saveClass = saveStatus === 'saving'
    ? 'bg-[#67c7a5]/15 text-[#17664f] dark:text-[#83e0bf]'
    : saveStatus === 'error'
      ? 'bg-red-500/10 text-red-700 dark:text-red-300'
      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  const activeCopy = isRtl ? 'نسخة مستقلة، ليست ترجمة تلقائية' : 'Independent version, not auto-translated';
  const activeHint = isRtl
    ? 'اكتب محتوى مناسبًا لكل سوق. الإجراء النادر مثل نسخ هيكل الأقسام موجود في قائمة المزيد.'
    : 'Write market-specific content. Rare actions such as copying section structure live in the More menu.';

  const languageButton = (value: 'ar' | 'en', label: string, completion: number) => (
    <button
      type="button"
      onClick={() => setLanguage(value)}
      className={`relative rounded-xl px-3 py-2 text-xs font-black transition-all ${
        language === value
          ? 'brand-tab-active'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
      aria-pressed={language === value}
    >
      <span className="inline-flex items-center gap-1.5">
        {language === value && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
        <span>{label}</span>
        <span className="opacity-80">{completion}%</span>
      </span>
    </button>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-[#67c7a5]/25 bg-card/88 shadow-[0_12px_40px_rgba(18,35,30,0.07)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="brand-logo-motion shrink-0 rounded-2xl border border-[#67c7a5]/25 bg-background/80 p-1.5 shadow-sm">
            <Logo showText={false} size="md" className="xl:hidden" />
            <Logo size="md" className="hidden xl:inline-flex" />
          </div>

          <div className="flex min-w-0 items-center gap-1 rounded-2xl border border-border/80 bg-background/80 p-1 shadow-sm">
            <select
              value={activeResumeId}
              onChange={(e) => setActiveResumeId(e.target.value)}
              className="max-w-28 rounded-xl border-0 bg-transparent px-2 py-2 text-sm font-bold text-foreground outline-none sm:max-w-44"
              aria-label={t('header.selectResume')}
            >
              {resumes.map(resume => (
                <option key={resume.id} value={resume.id}>{resume.name}</option>
              ))}
            </select>

            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={nameInputValue}
                onChange={(event) => setNameInputValue(event.target.value)}
                onBlur={commitName}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') nameInputRef.current?.blur();
                  if (event.key === 'Escape') {
                    setNameInputValue(currentResumeName);
                    setIsEditingName(false);
                  }
                }}
                className="hidden w-36 rounded-xl bg-card px-3 py-2 text-sm font-bold ring-2 ring-[#00B5A5]/30 sm:block"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="hidden max-w-44 truncate rounded-xl px-3 py-2 text-sm font-black text-foreground transition hover:bg-accent sm:block"
                title={t('header.renameResume')}
              >
                {currentResumeName}
              </button>
            )}

            <button type="button" onClick={addResume} className="rounded-xl p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label={t('header.addNewResume')}>
              <PlusIcon />
            </button>
            <button
              type="button"
              onClick={() => deleteResume(activeResumeId)}
              className="rounded-xl p-2 text-red-500 transition hover:bg-red-500/10"
              aria-label={t('header.deleteCurrentResume')}
            >
              <TrashIcon />
            </button>
          </div>

          <div className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black sm:inline-flex ${saveClass}`}>
            <span className={`h-2 w-2 rounded-full ${saveStatus === 'saving' ? 'animate-pulse bg-[#00B5A5]' : saveStatus === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {saveLabel}
            {saveStatus === 'error' && (
              <button type="button" onClick={onRetrySave} className="ms-1 underline underline-offset-2">
                {t('header.retrySave')}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="group relative hidden items-center gap-1 rounded-2xl border border-border/80 bg-background/80 p-1 shadow-sm md:flex">
            {languageButton('ar', 'العربية', language === 'ar' ? currentCompletion : otherCompletion)}
            {languageButton('en', 'English', language === 'en' ? currentCompletion : otherCompletion)}
            <div className="pointer-events-none absolute start-1/2 top-[calc(100%+0.5rem)] z-40 hidden w-72 -translate-x-1/2 rounded-2xl border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground shadow-2xl group-hover:block">
              <strong className="mb-1 block text-foreground">{activeCopy}</strong>
              {activeHint}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:border-[#67c7a5]/30 hover:bg-[#67c7a5]/10 hover:text-[#17664f]"
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setMoreOpen(prev => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-[#67c7a5]/40 hover:bg-[#67c7a5]/10 hover:text-[#17664f]"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              aria-label={isRtl ? 'المزيد' : 'More'}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 6.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </button>

            {moreOpen && (
              <div className="absolute end-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl">
                <div className="mb-2 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-muted-foreground md:hidden">
                  <p className="mb-2 text-foreground">{activeCopy}</p>
                  <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-background p-1">
                    {languageButton('ar', 'العربية', language === 'ar' ? currentCompletion : otherCompletion)}
                    {languageButton('en', 'English', language === 'en' ? currentCompletion : otherCompletion)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { onCopyStructure(); setMoreOpen(false); }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm font-bold transition hover:bg-accent"
                >
                  <span>{isRtl ? 'نسخ هيكل الأقسام فقط' : 'Copy section structure only'}</span>
                  <span className="text-xs text-muted-foreground">{language === 'ar' ? 'EN' : 'AR'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-s border-border ps-3">
            {userAvatar ? (
              <img src={userAvatar} alt={userFullName} referrerPolicy="no-referrer" className="h-9 w-9 rounded-full border-2 border-[#67c7a5] object-cover shadow-sm" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#67c7a5]/20 text-xs font-black text-[#17664f] ring-1 ring-[#67c7a5]/35 dark:text-[#83e0bf]">
                {userInitials}
              </div>
            )}
            <div className="text-start">
              <p className="hidden max-w-[140px] truncate text-xs font-black text-foreground sm:block" title={userFullName}>{userFullName}</p>
              <button type="button" onClick={signOut} className="text-[11px] font-black text-red-500 hover:text-red-600">
                {t('header.signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
