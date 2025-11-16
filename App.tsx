import React, { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Process from './components/Process';
import Demos from './components/Demos';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = t.appTitle;
    document.documentElement.lang = language;
  }, [t, language]);

  return (
    <div className="bg-primary min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Process />
        <Demos />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
