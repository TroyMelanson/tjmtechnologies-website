import React, { useState } from 'react';

const demos = [
<<<<<<< HEAD
  {
    id: 1,
    title: 'Care Home Suite',
    imageUrl: 'https://picsum.photos/500/300?random=20',
    link: 'https://happy-ground-0b886bc10.3.azurestaticapps.net/',
    client: 'Long-Term Care Home Operator',
    challenge: 'Managing staff schedules, tracking expenses, monitoring finances, and handling resident information was a manual, time-consuming, and error-prone process, leading to administrative overhead and less time for resident care.',
    solution: 'A comprehensive business management application featuring modules for employee scheduling, financial dashboards, salary calculation, and resident management. It provides a centralized platform to streamline all administrative tasks.',
    result: 'The suite saves hundreds of administrative hours, reduces scheduling conflicts, provides real-time financial insights for better decision-making, and improves overall operational efficiency, allowing staff to focus more on providing quality care.'
  },
  {
    id: 2,
    title: 'Digital-MAR',
    imageUrl: 'https://picsum.photos/500/300?random=21',
    link: 'https://digitalmar.tjmtechnologies.ca/',
    client: 'Care Facility & Partner Pharmacy',
    challenge: 'Paper-based Medication Administration Records (MAR) were inefficient, prone to errors, and created communication delays between the care home and the pharmacy, posing risks to resident safety and compliance.',
    solution: 'A secure, cloud-based electronic medication record system built on Azure. It enables real-time, two-way communication, allowing staff to record administrations electronically and pharmacists to manage prescriptions instantly.',
    result: 'Drastically reduced medication errors, improved resident safety, and created a seamless, real-time workflow between the care home and pharmacy, saving time and improving accuracy for both parties.'
  },
=======
  { id: 1, title: 'Care Home Suite', imageUrl: 'https://picsum.photos/500/300?random=20', link: 'https://happy-ground-0b886bc10.3.azurestaticapps.net/' },
  { id: 2, title: 'Digital-MAR', imageUrl: 'https://picsum.photos/500/300?random=21', link: 'https://digitalmar.tjmtechnologies.ca/' },
>>>>>>> 1b85027000d2920be8fa6c5c5eab1d4ea1d7cb37
];

const CaseStudyDetail: React.FC<{title: string, content: string}> = ({ title, content }) => (
    <div>
        <h4 className="font-semibold text-accent mb-1">{title}</h4>
        <p className="text-gray-400">{content}</p>
    </div>
);

// Fix: Changed interface to a type to allow extending a complex type `typeof demos[0]`.
type DemoCaseStudyProps = typeof demos[0] & {
    isReversed?: boolean;
    onViewDemo: (link: string) => void;
};

const DemoCaseStudy: React.FC<DemoCaseStudyProps> = ({ isReversed = false, onViewDemo, ...demo }) => (
    <div className="bg-secondary rounded-lg shadow-lg overflow-hidden lg:grid lg:grid-cols-2 lg:items-center">
        <div className={isReversed ? 'lg:order-first' : 'lg:order-last'}>
            <img src={demo.imageUrl} alt={demo.title} className="w-full h-64 lg:h-full object-cover" />
        </div>
        <div className="p-8 space-y-6">
            <h3 className="text-2xl font-bold text-white">{demo.title}</h3>
            <CaseStudyDetail title="Client" content={demo.client} />
            <CaseStudyDetail title="Challenge" content={demo.challenge} />
            <CaseStudyDetail title="Solution" content={demo.solution} />
            <CaseStudyDetail title="Result" content={demo.result} />
            <button
              onClick={() => onViewDemo(demo.link)}
              className="inline-block mt-4 bg-accent text-white font-bold py-2 px-6 rounded-md hover:bg-blue-500 transition-colors duration-300"
            >
                View Live Demo
            </button>
        </div>
    </div>
);

const Demos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetLink, setTargetLink] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const correctPassword = 'ProjectTechnologies';

  const handleViewDemoClick = (link: string) => {
    setTargetLink(link);
    setPassword('');
    setError('');
    setIsModalOpen(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      window.open(targetLink, '_blank', 'noopener,noreferrer');
      setIsModalOpen(false);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <section id="demos" className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Project Showcase</h2>
          <p className="mt-4 text-lg text-gray-400">A showcase of my capabilities and recent work.</p>
        </div>

        <div className="space-y-16">
          {demos.map((demo, index) => (
            <DemoCaseStudy
              key={demo.id}
              {...demo}
              isReversed={index % 2 !== 0}
              onViewDemo={handleViewDemoClick}
            />
          ))}
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" role="dialog" aria-modal="true">
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-sm m-4 p-8 relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                <h3 className="text-xl font-bold text-white mb-4">Password Required</h3>
                <p className="text-gray-400 mb-6">Please enter the password to view the live demo.</p>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="demo-password" className="sr-only">Password</label>
                        <input
                            id="demo-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            autoFocus
                            className="w-full bg-primary border border-gray-600 rounded-md shadow-sm p-3 text-white focus:ring-accent focus:border-accent"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-accent text-white font-bold py-3 px-8 rounded-md hover:bg-blue-500 transition-transform transform hover:scale-105 duration-300"
                        >
                            Access Demo
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </section>
  );
};

export default Demos;
