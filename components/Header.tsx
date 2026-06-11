import React, { useEffect, useRef, useState } from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { Resume } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useLanguage, useTranslation } from '../i18n';
import { Logo } from './Logo';

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
  user: any;
  signOut: () => Promise<void>;
  saveStatus: SaveStatus;
  onRetrySave: () => void;
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
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(currentResumeName);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    setNameInputValue(currentResumeName);
  }, [currentResumeName]);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

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
    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
    : saveStatus === 'error'
      ? 'bg-red-500/10 text-red-700 dark:text-red-300'
      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          <div className="shrink-0 pe-2 lg:pe-4">
            <Logo showText={false} size="md" />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1">
            <select
              value={activeResumeId}
              onChange={(e) => setActiveResumeId(e.target.value)}
              className="max-w-44 rounded-xl border-0 bg-transparent px-2 py-2 text-sm font-bold text-foreground outline-none"
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
                onChange={(e) => setNameInputValue(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') nameInputRef.current?.blur();
                  if (e.key === 'Escape') {
                    setNameInputValue(currentResumeName);
                    setIsEditingName(false);
                  }
                }}
                className="w-36 rounded-xl bg-card px-3 py-2 text-sm font-bold ring-2 ring-[#00B5A5]/30"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="max-w-44 truncate rounded-xl px-3 py-2 text-sm font-black text-foreground hover:bg-accent"
                title={t('header.renameResume')}
              >
                {currentResumeName}
              </button>
            )}

            <button onClick={addResume} className="rounded-xl p-2 text-muted-foreground hover:bg-accent" aria-label={t('header.addNewResume')}>
              <PlusIcon />
            </button>
            <button
              onClick={() => deleteResume(activeResumeId)}
              disabled={resumes.length <= 1}
              className="rounded-xl p-2 text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t('header.deleteCurrentResume')}
            >
              <TrashIcon />
            </button>
          </div>

          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${saveClass}`}>
            <span className={`h-2 w-2 rounded-full ${saveStatus === 'saving' ? 'animate-pulse bg-blue-500' : saveStatus === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {saveLabel}
            {saveStatus === 'error' && (
              <button onClick={onRetrySave} className="ms-1 underline underline-offset-2">
                {t('header.retrySave')}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <div className="flex rounded-2xl border border-border bg-background p-1">
            <button
              onClick={() => setLanguage('ar')}
              className={`rounded-xl px-4 py-2 text-sm font-black ${language === 'ar' ? 'bg-[#00B5A5] text-white' : 'text-muted-foreground hover:bg-accent'}`}
            >
              العربية
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`rounded-xl px-4 py-2 text-sm font-black ${language === 'en' ? 'bg-[#00B5A5] text-white' : 'text-muted-foreground hover:bg-accent'}`}
            >
              English
            </button>
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          <div className="flex items-center gap-3 border-s border-border ps-3">
            {userAvatar ? (
              <img src={userAvatar} alt={userFullName} referrerPolicy="no-referrer" className="h-9 w-9 rounded-full border border-border object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                {userInitials}
              </div>
            )}
            <div className="text-start">
              <p className="max-w-[140px] truncate text-xs font-black text-foreground" title={userFullName}>{userFullName}</p>
              <button onClick={signOut} className="text-[11px] font-black text-red-500 hover:text-red-600">
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
