import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ContactInfoItem: React.FC<{ icon: React.ReactNode; title: string; content: string; href?: string }> = ({ icon, title, content, href }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {href ? (
        <a href={href} className="text-gray-300 hover:text-accent transition-colors">{content}</a>
      ) : (
        <p className="text-gray-300">{content}</p>
      )}
    </div>
  </div>
);


const Contact: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t.contactTitle}</h2>
          <p className="mt-4 text-lg text-gray-400">{t.contactSubtitle}</p>
        </div>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-x-8">
          <ContactInfoItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            title={t.contactEmail}
            content="troy.melanson@tjmtechnologies.ca"
            href="mailto:troy.melanson@tjmtechnologies.ca"
          />
          <ContactInfoItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
            title={t.contactPhone}
            content="819-609-3231"
            href="tel:819-609-3231"
          />
           <div className="md:col-span-2 flex justify-center">
            <ContactInfoItem
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                title={t.contactLocation}
                content="Bathurst, NB, Canada"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
