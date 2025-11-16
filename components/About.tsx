import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              {t.aboutTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              {t.aboutP1}
            </p>
            <p className="mt-4 text-lg text-gray-300">
              {t.aboutP2}
            </p>
            <p className="mt-4 text-lg text-gray-300">
              {t.aboutP3}
            </p>
          </div>
          <div className="mt-10 lg:mt-0">
            <img 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
              src="https://picsum.photos/600/400?random=1" 
              alt={t.aboutTitle}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
