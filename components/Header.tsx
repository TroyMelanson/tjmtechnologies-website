import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavLink: React.FC<{ 
  href: string; 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; 
  isRoute?: boolean;
}> = ({ href, children, onClick, isRoute }) => {
  if (isRoute) {
    // Use React Router <Link> for app routes
    return (
      <Link
        to={href}
        className="px-3 py-2 text-gray-300 rounded-md text-sm font-medium hover:text-white hover:bg-secondary transition-colors"
      >
        {children}
      </Link>
    );
  }

  // Otherwise, use normal anchor scrolling behavior
  return (
    <a
      href={href}
      onClick={onClick}
      className="px-3 py-2 text-gray-300 rounded-md text-sm font-medium hover:text-white hover:bg-secondary transition-colors"
    >
      {children}
    </a>
  );
};

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // 👇 Add both internal sections and app routes here
  const navLinks = [
    { href: '#services', label: 'Services', isRoute: false },
    { href: '#about', label: 'About', isRoute: false },
    { href: '#demos', label: 'Demos', isRoute: false },
    { href: '#contact', label: 'Contact', isRoute: false },
    { href: '/apps/digital-mar', label: 'Digital MAR', isRoute: true },
    { href: '/apps/carehome-suite', label: 'CareHome Suite', isRoute: true },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }

    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <header className="bg-primary/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white text-xl font-bold">
              TJM <span className="text-accent">Technologies</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.href} 
                  href={link.href} 
                  onClick={link.isRoute ? undefined : handleLinkClick}
                  isRoute={link.isRoute}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-secondary inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink 
                key={link.href} 
                href={link.href} 
                onClick={link.isRoute ? undefined : handleLinkClick}
                isRoute={link.isRoute}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
