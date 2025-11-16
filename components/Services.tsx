
import React from 'react';

const services = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'AI Solutions',
    description: 'I build custom AI-powered tools, including chatbots, data analysis models, and intelligent agents, to unlock new efficiencies and provide a competitive edge for your business.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Process Automation',
    description: 'I identify and automate your manual, repetitive tasks using robust workflow solutions. Free up your team\'s valuable time to focus on strategic growth, not tedious processes.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Custom App Development',
    description: 'From sleek mobile apps to powerful desktop software, I develop bespoke applications from the ground up, designed to perfectly match your workflow and deliver an exceptional user experience.'
  },
  {
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Website Design & Development',
    description: 'I craft beautiful, modern, and high-performance websites that not only look great but are also built to convert visitors into customers. Your website will be your most powerful digital asset.'
  },
];

// Fix: Replaced `JSX.Element` with `React.ReactNode` to resolve the 'Cannot find namespace JSX' error.
const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-secondary p-8 rounded-lg shadow-lg hover:shadow-accent/30 transform hover:-translate-y-2 transition-all duration-300 flex flex-col items-start">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-base">{description}</p>
    </div>
);


const Services: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Our Services</h2>
          <p className="mt-4 text-lg text-gray-400">Innovative solutions tailored for your success.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
