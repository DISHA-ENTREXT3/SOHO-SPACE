
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';
import { BuildingOffice2Icon, UserGroupIcon, RocketLaunchIcon, ShieldCheckIcon, SparklesIcon, CheckCircleIcon, ArrowRightIcon, EnvelopeIcon } from '../components/Icons';
import SEO from '../components/SEO';

// Lock icon for password
const LockClosedIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const LoginPage = () => {
    const { signup, loginWithEmail, user: currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we should start in signup mode
    const queryParams = new URLSearchParams(location.search);
    const initialMode = queryParams.get('mode') === 'signup';
    
    const [isSignUp, setIsSignUp] = useState(initialMode); 
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Google OAuth handler
    const handleGoogleLogin = async () => {
        setError('');
        
        if (!selectedRole) {
            setError('Please choose whether you are a Founder or a Partner before continuing with Google.');
            return;
        }

        // Save signup intent to handle redirect after OAuth
        if (isSignUp) {
            localStorage.setItem('pending_signup', 'true');
        } else {
            localStorage.removeItem('pending_signup');
        }

        setIsLoading(true);
        localStorage.setItem('pending_role', selectedRole);
        
        const { error } = await supabase.auth.signInWithOAuth({ 
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            setError('Google sign-in failed: ' + error.message);
            setIsLoading(false);
        }
    };

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            const wasSignUp = localStorage.getItem('pending_signup') === 'true' || isSignUp;
            
            if (currentUser.role === UserRole.ADMIN) {
                navigate('/admin');
            } else if (!currentUser.hasCompletedOnboarding && wasSignUp) {
                // Only clean up after we use it to decide the first redirect
                localStorage.removeItem('pending_signup');
                navigate('/onboarding');
            } else {
                localStorage.removeItem('pending_signup');
                navigate('/dashboard');
            }
        }
    }, [currentUser, navigate, isSignUp]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isSignUp) {
                if (!selectedRole) {
                    setError('Please select a role');
                    setIsLoading(false);
                    return;
                }
                if (!formData.name.trim()) {
                    setError('Please enter your name');
                    setIsLoading(false);
                    return;
                }
                if (!formData.email.trim()) {
                    setError('Please enter your email');
                    setIsLoading(false);
                    return;
                }
                if (formData.password.length < 6 || formData.password.length > 10) {
                    setError('Password must be between 6 and 10 characters');
                    setIsLoading(false);
                    return;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                
                await signup(formData.name, formData.email, formData.password, selectedRole);
            } else {
                if (!formData.email.trim() || !formData.password.trim()) {
                    setError('Please enter your email and password');
                    setIsLoading(false);
                    return;
                }
                
                if (formData.password.length > 10) {
                    setError('Password cannot exceed 10 characters');
                    setIsLoading(false);
                    return;
                }
                
                try {
                    const user = await loginWithEmail(formData.email, formData.password);
                    if (!user) {
                        setError('Account found but profile missing. Please contact support.');
                    }
                } catch (authErr: any) {
                    setError(authErr.message || 'Invalid email or password');
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
            <SEO 
                title={isSignUp ? 'Sign Up' : 'Login'}
                description="Join Soho Space to connect with elite growth partners and visionary founders. Sign up or login to start building category-defining products."
                keywords={['sign up', 'login', 'join soho space', 'growth marketplace']}
                type="website"
            />
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--bg-secondary)_0%,transparent_70%)] opacity-50" />
            </div>
            
            <div className="max-w-5xl w-full mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Branding */}
                    <div className="text-center lg:text-left hidden lg:block">
                        <div className="inline-flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-full px-4 py-2 mb-8">
                            <SparklesIcon className="h-4 w-4 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Join 500+ professionals</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <RocketLaunchIcon className="h-7 w-7 text-white" />
                            </div>
                        </div>
                        
                        <h1 className="text-6xl lg:text-7xl font-black text-[var(--text-primary)] leading-[1.1] mb-8 tracking-tighter">
                            {isSignUp ? 'Initiate' : 'Continue'}
                            <span className="block text-indigo-600">
                                Growth.
                            </span>
                        </h1>
                        
                        <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium opacity-80">
                            {isSignUp 
                                ? 'Join the hyper-growth ecosystem. Connect with elite partners and scale your architecture.'
                                : 'Resume your scaling operations. Access your secure collaboration hub.'
                            }
                        </p>
                        
                        {/* Value props */}
                        <div className="space-y-5">
                            {[
                                'Access elite growth vectors',
                                'Secure collaboration protocol',
                                'AI-powered precision matching'
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <CheckCircleIcon className="h-4 w-4 text-indigo-600 group-hover:text-white transition-all" />
                                    </div>
                                    <span className="text-[var(--text-secondary)] font-black text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-all">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right Side - Auth Form */}
                    <div className="max-w-md w-full mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-[2.5rem] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
                            {/* Role Selection */}
                            <div className="mb-10">
                                <label className="block text-[9px] font-black text-[var(--text-primary)] mb-5 uppercase tracking-[0.3em] text-center opacity-40">Select Operational Role</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedRole(UserRole.FOUNDER); setError(''); }}
                                        className={`p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                                            selectedRole === UserRole.FOUNDER
                                                ? 'border-indigo-600 bg-indigo-600/10 shadow-xl shadow-indigo-600/10'
                                                : 'border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-indigo-600/30'
                                        }`}
                                    >
                                        <BuildingOffice2Icon className={`h-6 w-6 mb-3 transition-colors ${selectedRole === UserRole.FOUNDER ? 'text-indigo-600' : 'text-[var(--text-muted)] group-hover:text-indigo-600'}`} />
                                        <div className={`font-black uppercase tracking-widest text-[10px] transition-colors ${selectedRole === UserRole.FOUNDER ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Founder</div>
                                        {selectedRole === UserRole.FOUNDER && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedRole(UserRole.PARTNER); setError(''); }}
                                        className={`p-5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                                            selectedRole === UserRole.PARTNER
                                                ? 'border-indigo-600 bg-indigo-600/10 shadow-xl shadow-indigo-600/10'
                                                : 'border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-indigo-600/30'
                                        }`}
                                    >
                                        <UserGroupIcon className={`h-6 w-6 mb-3 transition-colors ${selectedRole === UserRole.PARTNER ? 'text-indigo-600' : 'text-[var(--text-muted)] group-hover:text-indigo-600'}`} />
                                        <div className={`font-black uppercase tracking-widest text-[10px] transition-colors ${selectedRole === UserRole.PARTNER ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Partner</div>
                                        {selectedRole === UserRole.PARTNER && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Toggle */}
                            <div className="flex bg-[var(--bg-secondary)] rounded-2xl p-1.5 mb-10 border border-[var(--glass-border)]">
                                <button
                                    onClick={() => { setIsSignUp(false); setError(''); }}
                                    className={`flex-1 py-3 text-[9px] font-black rounded-xl transition-all uppercase tracking-[0.2em] ${
                                        !isSignUp 
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                            : 'text-[var(--text-muted)] hover:text-indigo-600'
                                    }`}
                                >
                                    Access
                                </button>
                                <button
                                    onClick={() => { setIsSignUp(true); setError(''); }}
                                    className={`flex-1 py-3 text-[9px] font-black rounded-xl transition-all uppercase tracking-[0.2em] ${
                                        isSignUp 
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                            : 'text-[var(--text-muted)] hover:text-indigo-600'
                                    }`}
                                >
                                    Initiate
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name (Signup only) */}
                                {isSignUp && (
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-4 opacity-40">Alias / Identity</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-4 opacity-40">Network Identifier</label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="address@nexus.io"
                                            className="w-full pl-14 pr-5 py-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-4 opacity-40">Access Key</label>
                                    <div className="relative">
                                        <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            maxLength={10}
                                            className="w-full pl-14 pr-5 py-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password (Signup only) */}
                                {isSignUp && (
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-4 opacity-40">Key Confirmation</label>
                                        <div className="relative">
                                            <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                maxLength={10}
                                                className="w-full pl-14 pr-5 py-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Error message */}
                                {error && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl transition-all shadow-2xl shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Sign in with Email
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                            
                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[var(--glass-border)]"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="bg-[var(--glass-bg)] px-4 text-[var(--text-muted)]">or</span>
                                </div>
                            </div>

                            {/* Google OAuth Button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] py-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-all border border-[var(--glass-border)] hover:border-indigo-500/30 active:scale-95 group"
                            >
                                <svg className="h-4 w-4 transition-transform group-hover:scale-110" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.61l6.85-6.85C35.64 2.36 30.23 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.98 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.38-1.13-7.02 0-10.4l-7.98-6.2C.9 15.1 0 19.41 0 24c0 4.59.9 8.9 2.69 12.31l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.23 0 11.64-2.06 15.53-5.61l-7.19-5.59c-2.01 1.35-4.58 2.15-8.34 2.15-6.38 0-11.87-4.48-13.33-10.6l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                                Sign in with Google
                            </button>
                        </div>
                        
                        {/* Trust badges */}
                        <div className="mt-10 flex items-center justify-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="h-4 w-4" />
                                <span>Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="h-4 w-4" />
                                <span>Zero-Fee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;