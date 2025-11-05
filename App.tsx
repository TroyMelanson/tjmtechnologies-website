import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Demos from './components/Demos';
import Contact from './components/Contact';
import Footer from './components/Footer';

// App pages
import DigitalMAR from './apps/digital-mar/DigitalMAR';
import CareHomeSuite from './apps/carehome-suite/CareHomeSuite';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-primary min-h-screen flex flex-col">
        {/* Header (with navigation links for both sections + app routes) */}
        <Header />

        {/* Main content area */}
        <main className="flex-grow">
          <Routes>
            {/* Home page with in-page sections */}
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

            {/* App-specific routes */}
            <Route path="/apps/digital-mar" element={<DigitalMAR />} />
            <Route path="/apps/carehome-suite" element={<CareHomeSuite />} />
          </Routes>
        </main>

        {/* Shared footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
