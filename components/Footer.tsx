import React from 'react';
import { useTranslation } from '../i18n';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    return (
        <footer className="w-full text-center py-4 mt-8 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('footer.credit')}
            </p>
        </footer>
    );
};

export default Footer;
