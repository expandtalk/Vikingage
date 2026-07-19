import React from 'react';
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
        </div>
      </div>
    </footer>
  );
};
