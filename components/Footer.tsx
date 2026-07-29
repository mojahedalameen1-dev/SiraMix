import React from 'react';
import { useTranslation } from '../i18n';
import { Logo } from './Logo';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    return (
        <footer className="mt-8 w-full border-t border-[#67c7a5]/20 bg-[#12231e] px-4 py-6 text-center text-[#f7f4ec]">
          <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-3 sm:flex-row">
            <Logo size="sm" className="[&_span]:!text-[#f7f4ec]" />
            <p className="text-xs font-bold text-[#f7f4ec]/60">
                {t('footer.credit')}
            </p>
            <span className="h-1.5 w-12 rounded-full bg-gradient-to-r from-[#67c7a5] to-[#ff6b4a]" />
          </div>
        </footer>
    );
};

export default Footer;
