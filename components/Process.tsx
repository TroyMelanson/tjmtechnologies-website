import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const processIcons = {
  discovery: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  development: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  support: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const ProcessCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-secondary p-8 rounded-lg shadow-lg flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-base">{description}</p>
    </div>
);

const Process: React.FC = () => {
  const { t } = useLanguage();

  const processSteps = [
    {
      icon: processIcons.discovery,
      title: t.process1Title,
      description: t.process1Desc,
    },
    {
      icon: processIcons.development,
      title: t.process2Title,
      description: t.process2Desc,
    },
    {
      icon: processIcons.support,
      title: t.process3Title,
      description: t.process3Desc,
    },
  ];

  return (
    <section id="process" className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t.processTitle}</h2>
          <p className="mt-4 text-lg text-gray-400">{t.processSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
                <ProcessCard key={index} {...step} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
