import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RocketLaunchIcon, ShieldCheckIcon, UserGroupIcon, LightBulbIcon, ArrowRightIcon, SparklesIcon, CheckCircleIcon, StarIcon, ChartBarIcon, TwitterIcon, LinkedInIcon, InstagramIcon, DiscordIcon, GlobeAltIcon, SubstackIcon, ChevronDownIcon, PlusIcon, MinusIcon } from '../components/Icons';
import ProcessGuide from '../components/ProcessGuide';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

import SEO from '../components/SEO';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to dashboard if logged in, unless explicitly asking for landing
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (user && !params.get('landing')) {
            if (user.role === UserRole.ADMIN) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate, location]);
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);
    const [email, setEmail] = React.useState<string>('');

    // Removed automatic redirect for logged in users to allow accessing landing page sections (How it works, Features)
    
    // Fix: Restoration of missing data arrays for rendering
    const features = [
        {
            icon: <UserGroupIcon className="h-7 w-7 text-white" />,
            title: 'Elite Talent Curation',
            description: 'Connect with a prestigious network of growth partners and launch experts meticulously vetted for excellence.',
            gradient: 'from-indigo-500 via-indigo-600 to-purple-700',
            role: 'Founder'
        },
        {
            icon: <RocketLaunchIcon className="h-7 w-7 text-white" />,
            title: 'High-Potential Initiatives',
            description: 'Apply to work with innovative companies and category-defining products that align with your growth expertise.',
            gradient: 'from-teal-500 via-emerald-500 to-cyan-600',
            role: 'Partner'
        },
        {
            icon: <SparklesIcon className="h-7 w-7 text-white" />,
            title: 'Outcome-Aligned Model',
            description: 'Experience growth as a craft with equity participation, revenue sharing, and performance-linked compensation models.',
            gradient: 'from-amber-400 via-orange-500 to-rose-600',
            role: 'Both'
        },
        {
            icon: <ShieldCheckIcon className="h-7 w-7 text-white" />,
            title: 'Sovereign Collaboration',
            description: 'Operate within a high-trust environment featuring automated NDAs, decision logs, and execution frameworks.',
            gradient: 'from-blue-500 via-blue-600 to-indigo-700',
            role: 'Both'
        },
        {
            icon: <ChartBarIcon className="h-7 w-7 text-white" />,
            title: 'Reputation Dynamics',
            description: 'Build your professional legacy through verified performance scores and qualitative partner feedback loops.',
            gradient: 'from-pink-500 via-rose-500 to-purple-600',
            role: 'Partner'
        },
        {
            icon: <LightBulbIcon className="h-7 w-7 text-white" />,
            title: 'The Growth Framework',
            description: 'Leverage proprietary playbooks and structured execution modules designed for rapid, sustainable scale.',
            gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
            role: 'Both'
        }
    ];

    const stats = [
        { value: '500+', label: 'Active Partners', suffix: '' },
        { value: '150+', label: 'Companies', suffix: '' },
        { value: '92%', label: 'Success Rate', suffix: '' },
        { value: '$2M+', label: 'Revenue Generated', suffix: '' },
    ];


    return (
        <div className="bg-transparent text-[var(--text-primary)] overflow-hidden">
            <SEO 
                title="Home"
                description="Connect with elite vetted growth partners and ambitious founders. The #1 marketplace for equity-based collaboration and startup scaling."
                type="website"
            />
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-16">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
                </div>
                
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-[var(--glass-border)] rounded-full px-4 py-2 mb-8">
                        <SparklesIcon className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium text-gray-300">The #1 Marketplace for Growth Partnerships</span>
                    </div>
                    
                    {/* Main Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
                        <span className="text-[var(--text-primary)]">Unlock Your</span>
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Growth Potential
                        </span>
                    </h1>
                    
                    <p className="mt-8 max-w-4xl mx-auto text-xl text-gray-400 leading-relaxed">
                        <span className="text-[var(--text-primary)] font-bold block mb-2">The Growth Atelier</span>
                        Soho Space - a space to connect visionary founders with Equity or Commission based growth partners to build, launch, and scale the future. Join 500+ professionals already growing together.
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Link 
                            to={user ? "/dashboard" : "/login?mode=signup"} 
                            className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-[var(--text-primary)] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                        >
                            {user ? "Go to Dashboard" : "I'm a Founder"}
                            <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            to={user ? "/dashboard" : "/login?mode=signup"} 
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-[var(--text-primary)] bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                        >
                            {user ? "View Opportunities" : "I'm a Growth Partner"}
                        </Link>
                    </div>
                    
                    {/* Community & Socials */}
                    <div className="mt-12 flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                            Stay in the loop & Join our Community
                        </p>
                        
                        {/* Email Subscription Widget */}
                        <div className="flex w-full max-w-sm items-center gap-2 p-1.5 bg-white/5 border border-[var(--glass-border)] rounded-full mb-2">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-transparent px-4 py-2 text-sm text-[var(--text-primary)] placeholder-gray-500 focus:outline-none"
                            />
                            <button 
                                onClick={() => {
                                    const substackUrl = email 
                                        ? `https://entrextlabs.substack.com/subscribe?email=${encodeURIComponent(email)}`
                                        : 'https://entrextlabs.substack.com/subscribe';
                                    window.open(substackUrl, '_blank');
                                }}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                Subscribe
                            </button>
                        </div>

                        <div className="flex items-center gap-6">
                            <a href="https://discord.com/invite/ZZx3cBrx2" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-full bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300" title="Discord">
                                <DiscordIcon className="h-5 w-5 text-gray-400 group-hover:text-[var(--text-primary)]" />
                            </a>
                            <a href="https://substack.com/@entrextlabs?utm_campaign=profile&utm_medium=profile-page" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-full bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300" title="Substack">
                                <SubstackIcon className="h-5 w-5 text-gray-400 group-hover:text-[var(--text-primary)]" />
                            </a>
                            <a href="https://www.linkedin.com/company/entrext/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-full bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300" title="LinkedIn">
                                <LinkedInIcon className="h-5 w-5 text-gray-400 group-hover:text-[var(--text-primary)]" />
                            </a>
                            <a href="https://www.instagram.com/entrext.labs/" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-full bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300" title="Instagram">
                                <InstagramIcon className="h-5 w-5 text-gray-400 group-hover:text-[var(--text-primary)]" />
                            </a>
                            <a href="https://linktr.ee/entrext.pro" target="_blank" rel="noopener noreferrer" className="group p-3 rounded-full bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300" title="All Links">
                                <GlobeAltIcon className="h-5 w-5 text-gray-400 group-hover:text-[var(--text-primary)]" />
                            </a>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            <span>Free to get started</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
                            <span>Built-in NDA protection</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-amber-500" />
                            <span>AI-powered matching</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="py-20 bg-transparent relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group">
                                <p className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {stat.value}
                                </p>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 relative overflow-hidden bg-white/[0.01]">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            Operational Flow
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter">
                            How Soho Space <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Scales</span> Your Vision
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-sm font-medium leading-relaxed">
                            A seamless, end-to-end framework designed for elite growth partners and ambitious founders to collaborate with maximum efficiency.
                        </p>
                    </div>
                    
                    <ProcessGuide currentStep={1} />
                </div>
            </section>


            {/* Features Section */}
            <section id="features" className="py-32 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24 pb-12 border-b border-white/5">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                                <SparklesIcon className="w-4 h-4" />
                                Key Capabilities
                            </div>
                            <h2 className="text-5xl sm:text-7xl font-black text-[var(--text-primary)] tracking-tighter leading-[0.9]">
                                Built for <br />
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Scale.</span>
                            </h2>
                        </div>
                        
                        <div className="lg:max-w-md relative">
                            <div className="absolute -left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
                            <p className="text-gray-400 text-lg font-medium leading-[1.8]">
                                Soho Space operates on an <span className="text-[var(--text-primary)]">outcome-aligned collaboration model.</span> 
                                Engagements may involve equity participation, revenue sharing, or performance-linked compensation, 
                                formalized through mutual agreements.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                                <div className="w-8 h-px bg-indigo-500/50" />
                                Designed for Growth
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                id={feature.title === 'Elite Talent Curation' ? 'founders' : feature.title === 'High-Potential Initiatives' ? 'partners' : undefined}
                                className="group relative bg-[#111827]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 hover:bg-[#111827]/60 hover:border-white/20 transition-all duration-500 overflow-hidden"
                            >
                                {/* Hover Glow Effect */}
                                <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                                
                                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-2xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                    <div className="absolute inset-0 rounded-2xl bg-white/10 group-hover:bg-transparent transition-colors" />
                                    <div className="relative z-10">
                                        {feature.icon}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4 group-hover:text-indigo-400 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                
                                <p className="text-gray-500 leading-relaxed font-medium mb-8 group-hover:text-gray-300 transition-colors duration-300">
                                    {feature.description}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    <span 
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/5"
                                    >
                                        {feature.role}
                                    </span>
                                    <div className="w-8 h-px bg-white/10 group-hover:w-12 group-hover:bg-indigo-500/50 transition-all duration-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Testimonials */}
            <section id="testimonials" className="py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-16">
                        <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
                        <h2 className="mt-3 text-4xl font-bold text-[var(--text-primary)]">
                            Trusted by the Ambitious
                        </h2>
                        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                            See what founders and partners are saying about their collaborations on Soho Space.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                quote: "Soho Space connected us with a growth partner who was instrumental in our launch. We went from MVP to our first 1,000 users in three months.",
                                author: "Alice Chen",
                                role: "Founder, Innovate Inc.",
                                rating: 5
                            },
                            {
                                quote: "As a growth consultant, finding quality projects is key. Soho Space filters out the noise and connects me with serious founders who have a clear vision.",
                                author: "Bob Martinez",
                                role: "Growth & Launch Partner",
                                rating: 4
                            },
                            {
                                quote: "Finding a partner with deep expertise in sustainable e-commerce was a game-changer. Their PLG strategies doubled our user retention in just one quarter.",
                                author: "Diana Patel",
                                role: "CEO, NextGen Solutions",
                                rating: 5
                            },
                            {
                                quote: "Soho Space stands out for the quality of its listings. I found a project perfectly aligned with my passion for sustainable tech. The built-in frameworks are excellent.",
                                author: "Charlie Howard",
                                role: "Product-Led Growth Expert",
                                rating: 4
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-[var(--glass-border)] rounded-2xl p-8">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <StarIcon key={i} className="h-5 w-5 text-amber-400 fill-current" />
                                    ))}
                                </div>
                                <blockquote className="text-lg text-gray-300 leading-relaxed">
                                    "{testimonial.quote}"
                                </blockquote>
                                <div className="mt-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[var(--text-primary)] font-bold">
                                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[var(--text-primary)]">{testimonial.author}</div>
                                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Final CTA - The Next Chapter Module */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">


                    <div className="relative group p-0.5 rounded-[3rem] overflow-hidden">
                        {/* Animated Border/Glow Wrapper */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 animate-shimmer opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="relative bg-[#0d121f] rounded-[2.95rem] overflow-hidden p-8 sm:p-16 md:p-24">
                            {/* Decorative Mesh Background */}
                            <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
                            <div className="absolute -top-1/2 -right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                            <div className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 bg-white/5 backdrop-blur-xl border border-[var(--glass-border)] rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                    <RocketLaunchIcon className="w-10 h-10 text-[var(--text-primary)] animate-bounce" />
                                </div>
                                
                                <h2 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-8 tracking-tighter leading-[1.1] max-w-3xl">
                                    Ready to initiate your <span className="text-indigo-400">next growth chapter?</span>
                                </h2>
                                
                                <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-xl mx-auto font-medium leading-relaxed">
                                    Join the elite network where products find builders, and growth partners find their defining missions.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <Link 
                                        to={user ? "/dashboard" : "/login"} 
                                        className="group/btn relative inline-flex items-center justify-center px-10 py-5 text-lg font-black text-[var(--text-primary)] overflow-hidden rounded-2xl transition-all duration-300 transform active:scale-95"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 group-hover/btn:scale-110" />
                                        <span className="relative z-10 flex items-center gap-3">
                                            {user ? "GO TO DASHBOARD" : "GET STARTED FOR FREE"}
                                            <ArrowRightIcon className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                        </span>
                                    </Link>
                                    
                                    <div className="flex -space-x-4 opacity-60 hover:opacity-100 transition-opacity">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                {['JD', 'SM', 'RK', 'LH'][i-1]}
                                            </div>
                                        ))}
                                        <div className="w-12 h-12 rounded-full border-2 border-gray-900 bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                                            +500
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-[var(--text-primary)]">99%</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Vetting Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-[var(--text-primary)]">24/7</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Legal Support</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-[var(--text-primary)]">0%</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Platform Fees</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-[var(--text-primary)]">Elite</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Community Only</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section (AEO Layer) */}
            <section className="py-24 relative overflow-hidden bg-white/[0.02]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">AEO & Clarity Layer</span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                            Common Queries
                        </h2>
                        <p className="mt-4 text-gray-400">
                            Direct answers about the shared growth workspace model.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                question: "What is Soho Space?",
                                answer: "Soho Space is a shared growth workspace (The Growth Atelier) that connects visionary startup founders with elite growth partners. Unlike traditional marketplaces, it focuses on outcome-based collaborations including equity, revenue share, and performance-linked compensation."
                            },
                            {
                                question: "Who is Soho Space for?",
                                answer: "It is designed for early-to-growth stage startup founders, fractional CMOs, growth engineers, and product marketers who prefer high-trust, aligned partnerships over transactional freelance work."
                            },
                            {
                                question: "How is it different from a marketplace?",
                                answer: "Soho Space is an operating system for growth, not a gig board. We replace hourly billing with aligned incentives (Equity/Commission) and provide execution frameworks (NDAs, Decision Logs) to manage the partnership transparently."
                            },
                            {
                                question: "How do Partners get paid?",
                                answer: "Compensation is outcome-led. Engagements are typically structured as Equity Participation (vesting), Revenue Share (commission-based), or Performance Retainers, formalized via our platform's smart agreements."
                            },
                            {
                                question: "What serves as proof of quality?",
                                answer: "We strictly vet talent using our 'Reputation Dynamics' engine, which verifies past performance, portfolio impact, and qualitative feedback, ensuring a high-density network of elite professionals."
                            },
                            {
                                question: "Is there a free version?",
                                answer: "Yes. The 'The Growth Free' plan allows for professional profile creation and public discovery. The 'Founder/Partner Pro' plan unlocks AI vetting, advanced matching, and verified badges."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white/5 border border-[var(--glass-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
                                <button
                                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                                >
                                    <span className="text-[var(--text-primary)] font-medium text-lg">{faq.question}</span>
                                    {openFaqIndex === index ? (
                                        <MinusIcon className="h-5 w-5 text-indigo-400" />
                                    ) : (
                                        <PlusIcon className="h-5 w-5 text-gray-500" />
                                    )}
                                </button>
                                <div 
                                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                                        openFaqIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="text-gray-400 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
