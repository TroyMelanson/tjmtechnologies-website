
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
              With over 18 years of dedicated experience, we bring a wealth of knowledge from leading complex projects within government sectors and refining user interfaces for optimal performance.
            </p>
            <p className="mt-4 text-lg text-gray-300">
              Our mission is to empower businesses by integrating cutting-edge technology with practical, results-driven strategies. We believe in building strong partnerships to deliver solutions that not only meet but exceed expectations. Based in Bathurst, NB, we're proud to serve clients locally and beyond.
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
