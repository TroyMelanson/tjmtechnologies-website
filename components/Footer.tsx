import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-primary border-t border-secondary">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <p className="text-center text-sm text-gray-400">
            &copy; {currentYear} {t.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
