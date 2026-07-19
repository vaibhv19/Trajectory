import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Loader2, Mail, Lock, User, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken') || '';
    const paramEmail = params.get('email');
    const name = params.get('name');
    const userId = params.get('userId');

    if (token && paramEmail && name && userId) {
      setAuth({
        token,
        refreshToken,
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
    window.location.href =
    `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Left Column: Branding and Features Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-card border-r border-border/40 relative overflow-hidden shrink-0">
        {/* Modern Dot-Grid & Gradient Glow Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(51,65,85,0.15)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-[-20%] left-[-20%] w-[90%] h-[80%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[60%] rounded-full bg-teal-500/5 dark:bg-teal-500/5 blur-[110px] pointer-events-none" />

        {/* Branding Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display font-extrabold text-primary tracking-tight uppercase">Trajectory</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-[4px]">
            v1.0.0
          </span>
        </div>

        {/* Core Tagline and Features list */}
        <div className="my-auto space-y-8 max-w-lg z-10">
          <div className="space-y-4">
            <h1 className="text-3xl xl:text-4xl font-display font-extrabold tracking-tight text-foreground leading-[1.15]">
              The ultimate command center for your career search.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              Trajectory is a unified operating system built for developers, designers, and builders to streamline their applications, track outreach networks, manage resumes, and unlock company placement intelligence.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
              Core Capabilities
            </h3>
            <div className="grid grid-cols-1 gap-3.5">
              {[
                {
                  title: "Application Funnel Tracking",
                  desc: "Visualize status progression, follow-ups, and interview stages with zero clutter.",
                },
                {
                  title: "Outreach & Network CRM",
                  desc: "Log conversations, follow-up reminders, and referral details for cold outreach.",
                },
                {
                  title: "Targeted Resume Versioning",
                  desc: "Organize tailored resume versions linked directly to target career profiles.",
                },
                {
                  title: "Company Placement Intelligence",
                  desc: "Access historical CTC ranges, CGPA cutoffs, and common interview topics.",
                },
              ].map((feature, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/25">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-[10px] text-muted-foreground/85 mt-0.5 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono z-10 border-t border-border/30 pt-4">
          <span>&copy; 2026 Trajectory Operating System</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 relative overflow-hidden bg-background">
        {/* Ambient mobile dot overlay */}
        <div className="absolute inset-0 lg:hidden bg-[radial-gradient(rgba(148,163,184,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(51,65,85,0.12)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden pb-8 border-b border-border/20">
          <span className="text-lg font-display font-extrabold text-primary tracking-tight uppercase">Trajectory</span>
          <span className="text-[9px] font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-[4px]">
            v1.0.0
          </span>
        </div>

        {/* Centered Form Wrapper */}
        <div className="my-auto w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right duration-500 z-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold tracking-tight text-foreground uppercase">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              {isLogin ? 'Welcome back to your workspace.' : 'Create an account to begin your career trajectory.'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Custom Tabs */}
            <div className="flex border-b border-border/40">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 pb-2.5 text-center text-xs uppercase tracking-wider font-mono border-b-2 transition-all ${
                  isLogin 
                    ? 'border-primary text-foreground font-bold' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 pb-2.5 text-center text-xs uppercase tracking-wider font-mono border-b-2 transition-all ${
                  !isLogin 
                    ? 'border-primary text-foreground font-bold' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-[4px] bg-destructive/10 border border-destructive/20 text-destructive text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 pointer-events-none">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-[4px] text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-[4px] text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-[4px] text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-[4px] bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6 shadow-sm shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center py-2.5 border border-border rounded-[4px] bg-card hover:bg-muted/70 text-xs font-semibold text-foreground transition-all"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                type="button"
                onClick={() => handleOAuth('github')}
                className="flex items-center justify-center py-2.5 border border-border rounded-[4px] bg-card hover:bg-muted/70 text-xs font-semibold text-foreground transition-all"
              >
                <svg className="h-4 w-4 mr-2 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Screen Footer */}
        <div className="text-center text-[10px] text-muted-foreground font-mono pt-8">
          <span>&copy; 2026 Trajectory. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};
