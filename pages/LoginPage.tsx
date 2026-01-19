
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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <SEO 
                title={isSignUp ? 'Sign Up' : 'Login'}
                description="Join Soho Space to connect with elite growth partners and visionary founders. Sign up or login to start building category-defining products."
                keywords={['sign up', 'login', 'join soho space', 'growth marketplace']}
                type="website"
            />
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
            </div>
            
            <div className="max-w-5xl w-full mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Branding */}
                    <div className="text-center lg:text-left hidden lg:block">
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
                            <SparklesIcon className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-medium text-gray-300">Join 500+ professionals</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <RocketLaunchIcon className="h-7 w-7 text-white" />
                            </div>
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                            {isSignUp ? 'Start Your' : 'Welcome Back to'}
                            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Growth Journey
                            </span>
                        </h1>
                        
                        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto lg:mx-0">
                            {isSignUp 
                                ? 'Create your account and connect with the best growth partners in the industry.'
                                : 'Log in to continue managing your partnerships and collaborations.'
                            }
                        </p>
                        
                        {/* Value props */}
                        <div className="space-y-4">
                            {[
                                'Access vetted growth experts',
                                'Built-in NDA & collaboration tools',
                                'AI-powered partner matching'
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <CheckCircleIcon className="h-4 w-4 text-green-400" />
                                    </div>
                                    <span className="text-gray-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right Side - Auth Form */}
                    <div className="max-w-md w-full mx-auto lg:mx-0">
                        <div className="bg-gray-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                            {/* Role Selection - Always Visible for Context */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-[0.2em] text-center">I am joining as a</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedRole(UserRole.FOUNDER); setError(''); }}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                                            selectedRole === UserRole.FOUNDER
                                                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                                : 'border-white/5 bg-gray-800/40 hover:border-white/10'
                                        }`}
                                    >
                                        <BuildingOffice2Icon className={`h-6 w-6 mb-2 transition-colors ${selectedRole === UserRole.FOUNDER ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                                        <div className={`font-bold text-sm transition-colors ${selectedRole === UserRole.FOUNDER ? 'text-white' : 'text-gray-400'}`}>Founder</div>
                                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight">Post Opportunities</div>
                                        {selectedRole === UserRole.FOUNDER && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedRole(UserRole.PARTNER); setError(''); }}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                                            selectedRole === UserRole.PARTNER
                                                ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_20px_rgba(20,184,166,0.2)]'
                                                : 'border-white/5 bg-gray-800/40 hover:border-white/10'
                                        }`}
                                    >
                                        <UserGroupIcon className={`h-6 w-6 mb-2 transition-colors ${selectedRole === UserRole.PARTNER ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                                        <div className={`font-bold text-sm transition-colors ${selectedRole === UserRole.PARTNER ? 'text-white' : 'text-gray-400'}`}>Partner</div>
                                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight">Apply for Projects</div>
                                        {selectedRole === UserRole.PARTNER && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Toggle */}
                            <div className="flex bg-gray-800/40 rounded-xl p-1 mb-8 border border-white/5">
                                <button
                                    onClick={() => { setIsSignUp(false); setError(''); }}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-widest ${
                                        !isSignUp 
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                                            : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => { setIsSignUp(true); setError(''); }}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-widest ${
                                        isSignUp 
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                                            : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name (Signup only) */}
                                {isSignUp && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 bg-gray-800/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="you@example.com"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <div className="relative">
                                        <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            maxLength={10}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password (Signup only) */}
                                {isSignUp && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                maxLength={10}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Error message */}
                                {error && (
                                    <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isSignUp ? 'Create Account' : 'Sign In'}
                                            <ArrowRightIcon className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                            
                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-gray-900/70 px-3 text-gray-500">or</span>
                                </div>
                            </div>

                            {/* Google OAuth Button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-white py-2.5 rounded-lg hover:bg-white/5 transition-all border border-white/10 mb-2"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.61l6.85-6.85C35.64 2.36 30.23 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.98 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.38-1.13-7.02 0-10.4l-7.98-6.2C.9 15.1 0 19.41 0 24c0 4.59.9 8.9 2.69 12.31l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.23 0 11.64-2.06 15.53-5.61l-7.19-5.59c-2.01 1.35-4.58 2.15-8.34 2.15-6.38 0-11.87-4.48-13.33-10.6l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                                Continue with Google
                            </button>
                        </div>
                        
                        {/* Trust badges */}
                        <div className="mt-6 flex items-center justify-center gap-6 text-gray-500 text-xs">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                                <span>Secure Login</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <SparklesIcon className="h-4 w-4 text-amber-500" />
                                <span>Free to Start</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;