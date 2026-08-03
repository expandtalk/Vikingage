import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  
  const text = {
    sv: 'Byggd för arkeologisk och lingvistisk forskning.',
    en: 'Built for archaeological and linguistic research.'
  };

  return (
    <footer className="bg-card/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-muted-foreground text-sm">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <a
              href="https://expandtalk.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Expandtalk
            </a>
            . {text[language] || text.en}
          </p>
          <p className="mt-2">
            <Link
              to="/vetenskapsmetodik"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {language === 'en' ? 'Scientific methodology' : 'Vetenskapsmetodik'}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
