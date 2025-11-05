import React, { useState } from 'react';
import { User } from '../types.ts';
import { TjmLogo } from './icons.tsx';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('Email address not found. Please use a provisioned account.');
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
                placeholder="Work or personal email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.25 0H0V11.25H11.25V0ZM24 0H12.75V11.25H24V0ZM11.25 12.75H0V24H11.25V12.75ZM24 12.75H12.75V24H24V12.75Z"/>
              </svg>
              Sign in with Microsoft
            </button>
          </div>
        </form>
         <div className="text-xs text-slate-500 text-center pt-4">
            <p className="font-semibold">Demo Accounts:</p>
            <p>itadmin@mar.com (IT Admin)</p>
            <p>admin@mar.com (Admin)</p>
            <p>nurse@mar.com (Nurse)</p>
            <p>pharmacy@mar.com (Pharmacy)</p>
          </div>
          <div className="flex justify-center pt-8">
            <TjmLogo className="h-10 text-slate-500" />
          </div>
      </div>
    </div>
  );
};

export default LoginScreen;