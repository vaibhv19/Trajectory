import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Loader2, Mail, Lock, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const paramEmail = params.get('email');
    const name = params.get('name');
    const userId = params.get('userId');

    if (token && paramEmail && name && userId) {
      setAuth({
        token,
        email: paramEmail,
        fullName: name,
        userId,
      });
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, setAuth]);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.auth.login({ email, password });
        setAuth(response);
        navigate('/dashboard');
      } else {
        const response = await api.auth.register({ email, password, fullName });
        setAuth(response);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    // Redirect to OAuth login
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white mb-2">
            Trajectory 🚀
          </h2>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Welcome back! Manage your career pipeline' : 'Get started with your career operating system'}
          </p>
        </div>

        {/* Form panel */}
        <div className="glass-card p-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                isLogin ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                !isLogin ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-primary/20 mt-6"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center py-2.5 border border-slate-800 rounded-xl bg-slate-950 hover:bg-slate-900 text-sm font-medium text-white transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.72 14.9.96 12 .96c-4.49 0-8.34 2.58-10.22 6.36l3.78 2.93c.9-2.7 3.42-4.21 6.44-4.21z"
                />
                <path
                  fill="#4285F4"
                  d="M23.52 12.28c0-.79-.07-1.54-.19-2.28H12v4.51h6.47c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.98 3.39-4.89 3.39-8.07z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.56 14.93c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.78 7.44C.79 9.42.24 11.64.24 14s.55 4.58 1.54 6.56l3.78-2.63z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.04c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.02 0-5.54-1.96-6.45-4.66L1.17 16.3c1.88 3.82 5.73 6.74 10.83 6.74z"
                />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center py-2.5 border border-slate-800 rounded-xl bg-slate-950 hover:bg-slate-900 text-sm font-medium text-white transition-colors"
            >
              <svg className="h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
