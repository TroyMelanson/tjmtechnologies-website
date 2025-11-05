import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Core layout components
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
        {/* Header (shared across all pages) */}
        <Header />

        {/* Optional top navigation for app links */}
        <nav className="text-center my-4 space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
          <Link to="/digital-mar" className="text-gray-300 hover:text-white">Digital MAR</Link>
          <Link to="/carehome-suite" className="text-gray-300 hover:text-white">CareHome Suite</Link>
        </nav>

        {/* Main content area */}
        <main className="flex-grow">
          <Routes>
            {/* Home page (main sections) */}
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

            {/* App pages */}
            <Route path="/digital-mar" element={<DigitalMAR />} />
            <Route path="/carehome-suite" element={<CareHomeSuite />} />
          </Routes>
        </main>

        {/* Shared footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;

