import React, { useState, useEffect, useRef } from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { Resume } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useLanguage, useTranslation } from '../i18n';
import { Logo } from './Logo';

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
}

const Header: React.FC<HeaderProps> = ({ 
    theme, setTheme, resumes, activeResumeId, setActiveResumeId, addResume, deleteResume, renameResume, currentResumeName, user, signOut
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(currentResumeName);
  const [currentTime, setCurrentTime] = useState(new Date());
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInputValue(e.target.value);
  };

  const handleNameBlur = () => {
    if (nameInputValue.trim() && nameInputValue !== currentResumeName) {
      renameResume(activeResumeId, nameInputValue);
    } else {
      setNameInputValue(currentResumeName);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      nameInputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setNameInputValue(currentResumeName);
      setIsEditingName(false);
    }
  };
  
  const handleDelete = () => {
    deleteResume(activeResumeId);
  }

  const userAvatar = user?.user_metadata?.avatar_url;
  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userFullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
          <Logo showText={true} size="sm" />
          <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
            <select
              value={activeResumeId}
              onChange={(e) => setActiveResumeId(e.target.value)}
              className="bg-transparent text-sm font-medium text-foreground rounded-md focus:ring-2 focus:ring-ring border-none outline-none max-w-40"
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
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                className="w-32 text-sm p-1 bg-background rounded-md ring-1 ring-ring"
              />
            ) : (
              <button 
                onClick={() => setIsEditingName(true)}
                className="text-sm font-semibold p-1.5 hover:bg-accent hover:text-accent-foreground rounded-md truncate max-w-32"
                title={t('header.renameResume')}
              >
                {currentResumeName}
              </button>
            )}
             <button
                onClick={addResume}
                className="p-1.5 text-muted-foreground hover:bg-accent rounded-md"
                aria-label={t('header.addNewResume')}
                title={t('header.addNewResume')}
              >
               <PlusIcon />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-red-500 hover:bg-destructive/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('header.deleteCurrentResume')}
                title={t('header.deleteCurrentResume')}
                disabled={resumes.length <= 1}
              >
                <TrashIcon />
              </button>
          </div>
        </div>
        
        {/* Actions & User profile section */}
        <div className="flex items-center gap-3 md:gap-5 flex-wrap justify-center md:justify-end">
          <div className="hidden lg:flex items-center text-sm font-mono text-muted-foreground mr-1" suppressHydrationWarning>
            {currentTime.toLocaleTimeString('en-US')}
          </div>
          
          <button
            onClick={toggleLanguage}
            className="p-2 w-10 h-10 flex items-center justify-center font-bold text-sm rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Toggle language"
          >
            {language === 'en' ? 'ع' : 'EN'}
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {/* User badge and Logout action */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-border rtl:pl-0 rtl:pr-3 rtl:border-l-0 rtl:border-r">
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt={userFullName} 
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold font-mono">
                {userInitials}
              </div>
            )}
            
            <div className="flex flex-col text-start">
              <span className="text-xs font-semibold text-foreground truncate max-w-[100px]" title={userFullName}>
                {userFullName}
              </span>
              <button
                onClick={signOut}
                className="text-[10px] text-red-500 hover:text-red-400 font-bold transition-colors uppercase tracking-wider text-left rtl:text-right font-mono"
              >
                {language === 'ar' ? 'خروج' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;