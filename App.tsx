import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Demos from './components/Demos';
import Contact from './components/Contact';
import Footer from './components/Footer';

import DigitalMAR from './apps/digital-mar/DigitalMAR';
import CareHomeSuite from './apps/carehome-suite/CareHomeSuite';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-primary min-h-screen">
        <Header />

        <nav style={{ textAlign: 'center', margin: '10px' }}>
          <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
          <Link to="/digital-mar" style={{ marginRight: '10px' }}>Digital MAR</Link>
          <Link to="/carehome-suite">CareHome Suite</Link>
        </nav>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Services />
                  <About />
                  <Demos />
                  <Contact />
                </>
              }
            />
            <Route path="/digital-mar" element={<DigitalMAR />} />
            <Route path="/carehome-suite" element={<CareHomeSuite />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;