import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  return (
    <section id="home" className="relative h-[calc(100vh-64px)] flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')" }}></div>
      <div className="absolute inset-0 bg-primary opacity-80"></div>
      <div className="relative z-10 p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight animate-fade-in-down">
          {t.heroTitle}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 animate-fade-in-up">
          {t.heroSubtitle}
        </p>
        <a
          href="#contact"
          onClick={handleScroll}
          className="bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-blue-500 transition-transform transform hover:scale-105 duration-300 inline-block animate-bounce-in"
        >
          {t.heroButton}
        </a>
      </div>
    </section>
  );
};

export default Hero;
