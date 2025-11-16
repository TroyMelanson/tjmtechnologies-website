import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              About TJM Technologies
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              TJM Technologies is a forward-thinking Canadian software company focused on building secure, modern, and intuitive digital solutions. With a strong background in complex system design, government-level project execution, and user-centric interface development, we aim to create technology that solves real problems with clarity and impact.
            </p>
            <p className="mt-4 text-lg text-gray-300">
              Our mission is to empower organizations by blending practical innovation with reliable engineering. We are committed to developing tools and platforms that streamline operations, support informed decision-making, and elevate the overall digital experience.
            </p>
            <p className="mt-4 text-lg text-gray-300">
              Based in Bathurst, NB, TJM Technologies is actively growing its suite of products and partnerships as we work toward bringing powerful, accessible technology to businesses and institutions across Canada and beyond.
            </p>
          </div>
          <div className="mt-10 lg:mt-0">
            <img 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
              src="https://picsum.photos/600/400?random=1" 
              alt="About TJM Technologies"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;