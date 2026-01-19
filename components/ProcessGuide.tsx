
import React from 'react';
import { 
    UserGroupIcon, MagnifyingGlassIcon, DocumentPlusIcon, 
    ShieldCheckIcon, PresentationChartLineIcon, RocketLaunchIcon,
    ChevronRightIcon
} from './Icons';

interface StepProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isLast?: boolean;
    isActive?: boolean;
}

const Step: React.FC<StepProps> = ({ icon, title, description, isLast, isActive }) => (
    <div className="flex-1 flex flex-col items-center group relative">
        <div className="relative">
            {/* Connection Line & Arrow */}
            {!isLast && (
                <div className="absolute top-1/2 left-full w-full h-[2px] -translate-y-1/2 hidden md:block z-0">
                    {/* Animated Line */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-indigo-500/50 bg-[length:200%_100%] animate-shimmer opacity-30" />
                    
                    {/* Dashed Line Overlay */}
                    <div className="absolute inset-0 border-t-2 border-dashed border-white/10" />

                    {/* Central Arrowhead */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                        <svg className="w-4 h-4 text-indigo-500/60 -ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </div>
                </div>
            )}
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10 ${
                isActive 
                    ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-110' 
                    : 'bg-gray-800/80 backdrop-blur-md border border-white/10 group-hover:border-indigo-500/50 group-hover:bg-gray-800'
            }`}>
                <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'} transition-colors duration-300`}>
                    {icon}
                </div>
            </div>

            {/* Step Number Badge */}
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-20 transition-all ${
                isActive ? 'bg-white text-indigo-600' : 'bg-gray-700 text-gray-400 group-hover:bg-indigo-500 group-hover:text-white'
            }`}>
                {/* Step ID will be passed or calculated, for now let's just make it a dot or placeholder */}
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
        </div>
        
        <div className="mt-6 text-center">
            <h3 className={`font-bold text-sm uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {title}
            </h3>
            <p className="text-[10px] uppercase font-bold text-gray-500 mt-2 max-w-[140px] leading-tight tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
                {description}
            </p>
        </div>
        
        {/* Mobile Arrow */}
        {!isLast && (
            <div className="mt-6 md:hidden text-gray-700 animate-bounce">
                <svg className="w-6 h-6 text-indigo-500/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
            </div>
        )}
    </div>
);

const ProcessGuide: React.FC<{ currentStep?: number }> = ({ currentStep = 1 }) => {
    const steps = [
        {
            icon: <UserGroupIcon className="h-7 w-7" />,
            title: "Onboarding",
            description: "Build your elite profile & verify"
        },
        {
            icon: <MagnifyingGlassIcon className="h-7 w-7" />,
            title: "Discovery",
            description: "Browse high-signal opportunities"
        },
        {
            icon: <DocumentPlusIcon className="h-7 w-7" />,
            title: "Application",
            description: "Pitch value & align expectations"
        },
        {
            icon: <ShieldCheckIcon className="h-7 w-7" />,
            title: "NDA & Legal",
            description: "Secure, instant legal protection"
        },
        {
            icon: <PresentationChartLineIcon className="h-7 w-7" />,
            title: "Workspace",
            description: "Collaborate via proven frameworks"
        },
        {
            icon: <RocketLaunchIcon className="h-7 w-7" />,
            title: "Growth",
            description: "Achieve outcomes & build reputation"
        }
    ];

    return (
        <div className="w-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/5 to-purple-600/5 pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 lg:gap-8">
                    {steps.map((step, index) => (
                        <Step 
                            key={index}
                            icon={step.icon}
                            title={step.title}
                            description={step.description}
                            isLast={index === steps.length - 1}
                            isActive={index + 1 === currentStep}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProcessGuide;
