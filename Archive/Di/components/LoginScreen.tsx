import React, { useState } from 'react';
import { User } from '../types.ts';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email);
    // In a real app, password would be checked against a backend service.
    if (user && password === 'password') { // Using a generic password for demo
      setError('');
      onLogin(user);
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-sky-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl">
        <div>
          <h1 className="text-3xl font-bold text-center text-slate-800">Digital MAR</h1>
          <p className="mt-2 text-center text-sm text-slate-600">Medication Administration Record</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <div className="space-y-4">
            <div>
               <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-300 bg-slate-50 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow duration-300 shadow-sm focus:shadow-md"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password"className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-300 bg-slate-50 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm transition-shadow duration-300 shadow-sm focus:shadow-md"
                placeholder="Password (use 'password')"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Sign in
            </button>
          </div>
        </form>
         <div className="text-xs text-slate-500 text-center pt-4">
            <p className="font-semibold">Demo Accounts:</p>
            <p>itadmin@mar.com (IT Admin)</p>
            <p>admin@mar.com (Admin)</p>
            <p>nurse@mar.com (Nurse)</p>
            <p>pharmacy@mar.com (Pharmacy)</p>
            <p>Password for all is: `password`</p>
          </div>
          <p className="text-center text-xs text-slate-500 pt-8">A TJM Technologies Product</p>
      </div>
    </div>
  );
};

export default LoginScreen;