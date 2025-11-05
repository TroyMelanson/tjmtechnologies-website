import React, { useState, FormEvent } from 'react';

const DEMO_PASSWORD = 'ProjectTechnologies'; // Simple hardcoded password

const demos = [
  { id: 1, title: 'Care Home Suite', imageUrl: 'https://picsum.photos/500/300?random=20', link: './Apps/carehome-suite/' },
  { id: 2, title: 'Digital-MAR', imageUrl: 'https://picsum.photos/500/300?random=21', link: './Apps/Digital-MAR/' },
];

const DemoCard: React.FC<{ title: string; imageUrl: string; link: string }> = ({ title, imageUrl, link }) => (
    <a href={link} target="_blank" rel="noopener noreferrer" className="group block bg-secondary rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:-translate-y-2">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        <div className="p-4">
            <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{title}</h3>
        </div>
    </a>
);

const Demos: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === DEMO_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <section id="demos" className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Project Demos</h2>
          <p className="mt-4 text-lg text-gray-400">A showcase of our capabilities. Access is restricted.</p>
        </div>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-secondary p-8 rounded-lg shadow-lg">
            <form onSubmit={handleLogin}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Enter Password to View Demos</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-primary border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="************"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              <button type="submit" className="w-full mt-4 bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors duration-300">
                Access Demos
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {demos.map(demo => (
              <DemoCard key={demo.id} {...demo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Demos;