
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SparklesIcon, CheckCircleIcon, RocketLaunchIcon, ShieldCheckIcon, UserGroupIcon, MagnifyingGlassIcon, ChartBarIcon, DocumentTextIcon } from '../components/Icons';
import BackButton from '../components/BackButton';
import SEO from '../components/SEO';

const PricingPage = () => {
    const { user } = useAuth();
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Founder/Partner Pro",
            price: isYearly ? "249" : "29",
            period: isYearly ? "/year" : "/month",
            description: "Unlock the full potential of AI-powered scaling and elite professional vetting.",
            features: [
                { icon: <SparklesIcon className="w-5 h-5 text-indigo-400" />, label: "Unlimited AI Vetting Analysis" },
                { icon: <DocumentTextIcon className="w-5 h-5 text-indigo-400" />, label: "AI Professional CV Generation" },
                { icon: <ChartBarIcon className="w-5 h-5 text-indigo-400" />, label: "Real-time AI Match Scores" },
                { icon: <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />, label: "Verified Member Badge" },
                { icon: <RocketLaunchIcon className="w-5 h-5 text-indigo-400" />, label: "Priority Profile Visibility" },
                { icon: <MagnifyingGlassIcon className="w-5 h-5 text-indigo-400" />, label: "Advanced Search Filters" },
            ],
            buttonText: "Coming Soon",
            highlight: true,
            badge: "Most Popular",
            comingSoon: true
        },
        {
            name: "The Growth Free",
            price: "0",
            period: "/forever",
            description: "Build your professional identity and start searching for growth opportunities.",
            features: [
                { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, label: "Professional Profile Creation" },
                { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, label: "Public Search & Discovery" },
                { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, label: "Apply to Collaborations" },
                { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, label: "Basic Dashboard Analytics" },
                { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, label: "Community Access" },
                { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, label: "Limited Contact Requests" },
            ],
            buttonText: user ? "Current Plan" : "Claim Your Spot",
            highlight: false,
            comingSoon: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0c10] py-20 px-4 relative overflow-hidden">
            <SEO 
                title="Pro Pricing & Plans"
                description="Flexible pricing for high-growth founders and elite partners. Choose from free access or professional AI-powered tools."
                type="website"
                keywords={['Growth Partner Pricing', 'Startup Hiring Costs', 'Vetting AI Service']}
            />
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-8">
                    <BackButton />
                </div>

                <div className="text-center mb-16">
                    <h2 className="text-indigo-400 font-black tracking-widest text-sm uppercase mb-3">Our Pricing</h2>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Power up your <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Growth</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                        Whether you're a founder scaling a vision or a partner delivering expertise, 
                        we have a plan to accelerate your journey.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-bold ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                        <button 
                            onClick={() => setIsYearly(!isYearly)}
                            className="w-14 h-8 bg-white/10 rounded-full p-1 relative transition-all duration-300 hover:bg-white/15"
                        >
                            <div className={`w-6 h-6 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40 transition-all duration-300 ${isYearly ? 'translate-x-6 bg-purple-500 shadow-purple-500/40' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm font-bold ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                            Yearly <span className="text-emerald-400 text-[10px] ml-1 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">Best Value</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div 
                            key={plan.name}
                            className={`relative p-8 rounded-3xl border transition-all duration-500 overflow-hidden group ${
                                plan.highlight 
                                    ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-indigo-500/30 shadow-2xl shadow-indigo-500/10 scale-105 z-20' 
                                    : 'bg-gray-900/30 border-white/5 hover:border-white/10'
                            }`}
                        >
                            {plan.badge && (
                                <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg animate-pulse">
                                    {plan.badge}
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-5xl font-black text-white tracking-tight">${plan.price}</span>
                                    <span className="text-gray-500 font-medium">{plan.period}</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-4 leading-relaxed line-clamp-2">
                                    {plan.description}
                                </p>
                            </div>

                            {/* Plan Features */}
                            <div className="space-y-4 mb-10">
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            {feature.icon}
                                        </div>
                                        <span className="text-gray-300 text-sm font-medium">{feature.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Plan Button */}
                            {plan.comingSoon ? (
                                <button
                                    disabled
                                    className="w-full py-4 rounded-2xl font-black text-center transition-all duration-300 flex items-center justify-center gap-2 bg-white/5 text-gray-400 cursor-not-allowed border border-white/5"
                                >
                                    {plan.buttonText}
                                </button>
                            ) : (
                                <Link 
                                    to={user ? "/settings" : "/login?mode=signup"}
                                    className={`w-full py-4 rounded-2xl font-black text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                                        plan.highlight
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    {plan.buttonText}
                                    {plan.highlight && <RocketLaunchIcon className="w-5 h-5" />}
                                </Link>
                            )}

                            {/* Background decoration in cards */}
                            {plan.highlight && (
                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-indigo-500/30 transition-all" />
                            )}
                        </div>
                    ))}
                </div>

                {/* FAQ section or footer note */}
                <div className="mt-20 text-center">
                    <p className="text-gray-500 text-sm">
                        All plans include 256-bit SSL encryption, 24/7 technical support, and community forum access. 
                        <br className="hidden md:block" />
                        Cancel or upgrade your subscription anytime from your profile settings.
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 mt-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                         <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-6 h-6" />
                            <span className="font-bold text-white uppercase text-xs tracking-widest">Enterprise Secure</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <UserGroupIcon className="w-6 h-6" />
                            <span className="font-bold text-white uppercase text-xs tracking-widest">500+ Active Partners</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
