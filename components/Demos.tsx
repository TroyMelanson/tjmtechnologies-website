import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Demo {
    id: number;
    title: string;
    imageUrl: string;
    link: string;
    client: string;
    challenge: string;
    solution: string;
    result: string;
}

const CaseStudyDetail: React.FC<{title: string, content: string}> = ({ title, content }) => (
    <div>
        <h4 className="font-semibold text-accent mb-1">{title}</h4>
        <p className="text-gray-400">{content}</p>
    </div>
);

type DemoCaseStudyProps = Demo & {
    isReversed?: boolean;
    onViewDemo: (link: string) => void;
};

const DemoCaseStudy: React.FC<DemoCaseStudyProps> = ({ isReversed = false, onViewDemo, ...demo }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-secondary rounded-lg shadow-lg overflow-hidden lg:grid lg:grid-cols-2 lg:items-center">
            <div className={isReversed ? 'lg:order-first' : 'lg:order-last'}>
                <img src={demo.imageUrl} alt={demo.title} className="w-full h-64 lg:h-full object-cover" />
            </div>
            <div className="p-8 space-y-6">
                <h3 className="text-2xl font-bold text-white">{demo.title}</h3>
                <CaseStudyDetail title={t.demoClient} content={demo.client} />
                <CaseStudyDetail title={t.demoChallenge} content={demo.challenge} />
                <CaseStudyDetail title={t.demoSolution} content={demo.solution} />
                <CaseStudyDetail title={t.demoResult} content={demo.result} />
                <button
                  onClick={() => onViewDemo(demo.link)}
                  className="inline-block mt-4 bg-accent text-white font-bold py-2 px-6 rounded-md hover:bg-blue-500 transition-colors duration-300"
                >
                    {t.demoViewButton}
                </button>
            </div>
        </div>
    );
};

const Demos: React.FC = () => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetLink, setTargetLink] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const correctPassword = 'ProjectTechnologies';

  const demos: Demo[] = [
    {
      id: 1,
      title: t.demo1Title,
      imageUrl: 'https://picsum.photos/500/300?random=20',
      link: 'https://happy-ground-0b886bc10.3.azurestaticapps.net/',
      client: t.demo1Client,
      challenge: t.demo1Challenge,
      solution: t.demo1Solution,
      result: t.demo1Result,
    },
    {
      id: 2,
      title: t.demo2Title,
      imageUrl: 'https://picsum.photos/500/300?random=21',
      link: 'https://digitalmar.tjmtechnologies.ca/',
      client: t.demo2Client,
      challenge: t.demo2Challenge,
      solution: t.demo2Solution,
      result: t.demo2Result,
    },
  ];

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
      setError(t.demoModalError);
      setPassword('');
    }
  };

  return (
    <section id="demos" className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t.demosTitle}</h2>
          <p className="mt-4 text-lg text-gray-400">{t.demosSubtitle}</p>
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
                <h3 className="text-xl font-bold text-white mb-4">{t.demoModalTitle}</h3>
                <p className="text-gray-400 mb-6">{t.demoModalSubtitle}</p>
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
                            placeholder={t.demoModalPlaceholder}
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
                            {t.demoModalButton}
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