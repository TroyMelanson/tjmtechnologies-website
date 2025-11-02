
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Demos from './components/Demos';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-primary min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Demos />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
