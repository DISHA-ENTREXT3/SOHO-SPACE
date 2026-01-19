
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { UserRole, WorkMode } from '../types';
import { useNavigate } from 'react-router-dom';
import { RocketLaunchIcon, BuildingOffice2Icon, UserGroupIcon, DocumentPlusIcon, SparklesIcon, CheckCircleIcon, LightBulbIcon, ChartBarIcon, DocumentTextIcon, ArrowDownTrayIcon, PaperClipIcon, CameraIcon, ShieldCheckIcon } from '../components/Icons';
import { storageService } from '../services/storageService';
import Avatar from '../components/Avatar';

// Custom input component with placeholder that clears on focus
const ClearableInput: React.FC<{
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    helpText?: string;
    label: string;
    required?: boolean;
}> = ({ type = 'text', value, onChange, placeholder, helpText, label, required }) => {
    const [showPlaceholder, setShowPlaceholder] = useState(!value);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocus = () => {
        setShowPlaceholder(false);
    };

    const handleBlur = () => {
        if (!value) {
            setShowPlaceholder(true);
        }
    };

    return (
        <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <input
                ref={inputRef}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={showPlaceholder ? placeholder : ''}
                required={required}
                className="w-full px-4 py-3 bg-gray-800/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
            />
            {helpText && <p className="text-xs text-gray-400 mt-2">{helpText}</p>}
        </div>
    );
};

// Custom textarea component with placeholder that clears on focus
const ClearableTextarea: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    helpText?: string;
    label: string;
    rows?: number;
    required?: boolean;
}> = ({ value, onChange, placeholder, helpText, label, rows = 4, required }) => {
    const [showPlaceholder, setShowPlaceholder] = useState(!value);

    const handleFocus = () => {
        setShowPlaceholder(false);
    };

    const handleBlur = () => {
        if (!value) {
            setShowPlaceholder(true);
        }
    };

    return (
        <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={showPlaceholder ? placeholder : ''}
                rows={rows}
                required={required}
                className="w-full px-4 py-3 bg-gray-800/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 resize-none"
            />
            {helpText && <p className="text-xs text-gray-400 mt-2">{helpText}</p>}
        </div>
    );
};

const OnboardingPage = () => {
    const { user, refreshUser } = useAuth();
    const { updateCompanyProfile, updatePartnerProfile, completeOnboarding, refreshData, updateUserAvatar } = useAppContext();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.hasCompletedOnboarding) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    if (!user || user.hasCompletedOnboarding) {
        return null;
    }

    const totalSteps = 5;

    const handleNext = async (data: any) => {
        const newFormData = { ...formData, ...data };
        setFormData(newFormData);

        if (step === totalSteps) {
            if (user.role === UserRole.FOUNDER || user.role === UserRole.ADMIN) {
                await updateCompanyProfile(user.profileId, newFormData);
            } else {
                await updatePartnerProfile(user.profileId, newFormData);
            }
            await completeOnboarding(user.id);
            await refreshUser();
            await refreshData();
            navigate('/dashboard');
        } else {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // Step indicators with icons
    const stepConfig = [
        { icon: RocketLaunchIcon, label: 'Welcome' },
        { icon: UserGroupIcon, label: 'Profile' },
        { icon: LightBulbIcon, label: (user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN) ? 'Needs' : 'Skills' },
        { icon: DocumentTextIcon, label: 'Documents' },
        { icon: CheckCircleIcon, label: 'Complete' }
    ];

    const ProgressBar = () => (
        <div className="mb-10">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-4">
                {stepConfig.map((s, index) => {
                    const StepIcon = s.icon;
                    const stepNum = index + 1;
                    const isActive = step === stepNum;
                    const isCompleted = step > stepNum;
                    
                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isCompleted ? 'bg-green-500' : isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-700'
                            }`}>
                                {isCompleted ? (
                                    <CheckCircleIcon className="h-5 w-5 text-white" />
                                ) : (
                                    <StepIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                )}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Progress Line */}
            <div className="w-full bg-gray-700/50 rounded-full h-1">
                <div 
                    className="h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                />
            </div>
        </div>
    );

    const renderStep = () => {
        switch (step) {
            case 1:
                return <WelcomeStep onNext={handleNext} />;
            case 2:
                return <ProfileInfoStep onNext={handleNext} />;
            case 3:
                return (user.role === UserRole.FOUNDER || user.role === UserRole.ADMIN) ? <FounderNeedsStep onNext={handleNext} /> : <PartnerSkillsStep onNext={handleNext} />;
            case 4:
                return <DocumentsStep onNext={handleNext} isFounder={user.role === UserRole.FOUNDER || user.role === UserRole.ADMIN} />;
            case 5:
                return <FinishStep onNext={handleNext} />;
            default:
                return <WelcomeStep onNext={handleNext} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            </div>
            
            <div className="max-w-xl w-full relative z-10">
                {/* Card */}
                <div className="bg-gray-900/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <ProgressBar />
                    <div className="animate-fade-in">
                        {renderStep()}
                    </div>
                    
                    {/* Navigation */}
                    <div className="mt-8 flex justify-between items-center">
                        {step > 1 ? (
                            <button 
                                onClick={handleBack} 
                                className="px-5 py-2.5 text-gray-300 hover:text-white font-medium rounded-lg hover:bg-white/5 transition-colors"
                            >
                                ← Back
                            </button>
                        ) : (
                            <div />
                        )}
                        
                        {/* Step counter */}
                        <span className="text-sm text-gray-500">
                            Step {step} of {totalSteps}
                        </span>
                    </div>
                </div>
                
                {/* Trust indicators */}
                <div className="mt-6 flex items-center justify-center gap-6 text-gray-500 text-sm">
                    <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>Secure & Private</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <SparklesIcon className="h-4 w-4 text-yellow-500" />
                        <span>Takes 2 minutes</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step Components

const WelcomeStep: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
    const { user } = useAuth();
    const isFounder = user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN;
    
    return (
        <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <RocketLaunchIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
                Welcome to Soho Space!
            </h1>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
                {isFounder 
                    ? "You're about to unlock access to elite growth partners ready to scale your vision."
                    : "Discover vetted opportunities and connect with innovative founders building the future."
                }
            </p>
            
            {/* Value propositions */}
            <div className="mt-8 space-y-3 text-left bg-white/5 rounded-xl p-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-gray-300">
                        {isFounder ? "Access pre-vetted growth experts" : "Find exciting high-growth startups"}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-gray-300">
                        {isFounder ? "Built-in NDA & collaboration tools" : "Build your reputation score"}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-gray-300">
                        {isFounder ? "AI-powered partner matching" : "Transparent project expectations"}
                    </span>
                </div>
            </div>
            
            <button 
                onClick={() => onNext({})} 
                className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 px-6 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
                Let's Get Started →
            </button>
        </div>
    );
};



const ProfileInfoStep: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
    const { user, refreshUser } = useAuth();
    const { getCompany, getPartner, updateUserAvatar } = useAppContext();
    const isFounder = user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN;
    const profile = isFounder ? getCompany(user!.profileId) : getPartner(user!.profileId);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(profile?.name || '');
    const [location, setLocation] = useState(profile?.location || '');
    const [description, setDescription] = useState((profile as any)?.description || (profile as any)?.bio || '');

    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            try {
                setIsUploading(true);
                const base64Url = await storageService.uploadImage(file, isFounder ? 'logos' : 'avatars');
                await updateUserAvatar(user.id, base64Url);
                await refreshUser();
            } catch (error) {
                console.error('Image upload error:', error);
                alert('Failed to process image. Please try a smaller file (under 2MB).');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = isFounder ? { name, location, description } : { name, location, bio: description };
        onNext(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mb-8">
                <div className="relative group mb-4">
                    <div className={`w-24 h-24 overflow-hidden bg-gray-800 border-2 border-white/10 shadow-inner ${isFounder ? 'rounded-2xl' : 'rounded-full'}`}>
                        <Avatar 
                            src={user?.avatarUrl} 
                            name={user?.name || 'User'} 
                            className="w-full h-full"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all scale-90 group-hover:scale-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CameraIcon className="w-4 h-4" />
                        )}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                    {isFounder ? 'Tell us about your company' : 'Create your profile'}
                </h2>
                <p className="text-gray-400 text-xs text-center max-w-xs">
                    {isFounder 
                        ? 'Upload a company logo and tell us about your vision.'
                        : 'Upload a professional photo and showcase your expertise.'
                    }
                </p>
            </div>
            
            <div className="space-y-5">
                <ClearableInput
                    label={isFounder ? 'Company Name' : 'Full Name'}
                    value={name}
                    onChange={setName}
                    placeholder={isFounder ? 'e.g., Acme Technologies' : 'e.g., John Smith'}
                    helpText={isFounder ? 'Your official company or brand name' : 'This is how you\'ll appear to founders'}
                    required
                />
                
                <ClearableInput
                    label="Location"
                    value={location}
                    onChange={setLocation}
                    placeholder="e.g., San Francisco, CA, USA"
                    helpText="Helps match you with location-compatible opportunities"
                    required
                />
                
                <ClearableTextarea
                    label={isFounder ? 'Company Description' : 'Professional Bio'}
                    value={description}
                    onChange={setDescription}
                    placeholder={isFounder 
                        ? 'Tell us about your company\'s mission, products, and what makes you unique. Include details about your target market, growth stage, and vision for the future...'
                        : 'Share your professional background, areas of expertise, and what drives you. Mention notable achievements, industries you\'ve worked in, and the type of projects you\'re passionate about...'
                    }
                    helpText={isFounder 
                        ? 'A compelling description attracts better-matched partners'
                        : 'A strong bio increases your visibility and match quality'
                    }
                    rows={5}
                    required
                />
            </div>
            
            <button 
                type="submit" 
                className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 px-6 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
                Continue →
            </button>
        </form>
    );
};

const FounderNeedsStep: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
    const [seeking, setSeeking] = useState('');
    const [expectations, setExpectations] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext({ seeking: seeking.split(',').map(s => s.trim()).filter(s => s), partnerExpectations: expectations });
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <LightBulbIcon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    What are you looking for?
                </h2>
                <p className="text-gray-400 text-sm">
                    Define the skills and qualities you need in a growth partner to achieve your goals.
                </p>
            </div>
            
            <div className="space-y-5">
                <ClearableInput
                    label="Skills & Expertise Needed"
                    value={seeking}
                    onChange={setSeeking}
                    placeholder="e.g., SaaS Growth, Performance Marketing, SEO, E-commerce Strategy"
                    helpText="Separate multiple skills with commas. Be specific to attract the right partners."
                    required
                />
                
                <ClearableTextarea
                    label="Partner Expectations"
                    value={expectations}
                    onChange={setExpectations}
                    placeholder="Describe your ideal partner: What experience level are you looking for? What kind of commitment (hours/week)? What communication style works best? What outcomes do you expect from the collaboration?..."
                    helpText="Clear expectations lead to better matches and successful partnerships"
                    rows={5}
                    required
                />
            </div>
            
            {/* Quick suggestion chips */}
            <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Popular skills:</p>
                <div className="flex flex-wrap gap-2">
                    {['SaaS Growth', 'Content Marketing', 'PPC', 'SEO', 'Product Launch'].map(skill => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => setSeeking(prev => prev ? `${prev}, ${skill}` : skill)}
                            className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-indigo-500/50 transition-colors"
                        >
                            + {skill}
                        </button>
                    ))}
                </div>
            </div>
            
            <button 
                type="submit" 
                className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 px-6 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
                Continue →
            </button>
        </form>
    );
};

const PartnerSkillsStep: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
    const [skills, setSkills] = useState('');
    const [workMode, setWorkMode] = useState<WorkMode>(WorkMode.REMOTE);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext({ skills: skills.split(',').map(s => s.trim()).filter(s => s), workModePreference: workMode });
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    Showcase Your Expertise
                </h2>
                <p className="text-gray-400 text-sm">
                    Highlight your top skills and preferences to get matched with the best opportunities.
                </p>
            </div>
            
            <div className="space-y-5">
                <ClearableInput
                    label="Your Top Skills"
                    value={skills}
                    onChange={setSkills}
                    placeholder="e.g., SEO Strategy, Content Marketing, PPC Management, Growth Hacking"
                    helpText="Separate skills with commas. Focus on your strongest areas."
                    required
                />
                
                {/* Quick skill suggestions */}
                <div>
                    <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                        {['SEO', 'PPC', 'Content Strategy', 'Email Marketing', 'Analytics'].map(skill => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => setSkills(prev => prev ? `${prev}, ${skill}` : skill)}
                                className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-indigo-500/50 transition-colors"
                            >
                                + {skill}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-300 mb-3">Work Mode Preference</label>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.values(WorkMode).map(mode => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setWorkMode(mode)}
                                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                    workMode === mode 
                                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                                        : 'bg-gray-800/50 border-white/10 text-gray-400 hover:border-white/20'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">This helps match you with companies that support your preferred work style.</p>
                </div>
            </div>
            
            <button 
                type="submit" 
                className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 px-6 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
                Continue →
            </button>
        </form>
    );
};

// Document Upload Component
const DocumentUpload: React.FC<{
    label: string;
    description: string;
    accept: string;
    icon: React.ReactNode;
    fileName: string | null;
    onFileSelect: (file: File | null) => void;
}> = ({ label, description, accept, icon, fileName, onFileSelect }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer hover:border-indigo-500/50 ${
                fileName ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/5'
            }`}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                className="hidden"
            />
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    fileName ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm">{label}</h4>
                    <p className="text-xs text-gray-400 mt-1">{description}</p>
                    {fileName ? (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                            <PaperClipIcon className="h-4 w-4" />
                            <span className="truncate">{fileName}</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileSelect(null);
                                }}
                                className="ml-2 text-gray-400 hover:text-rose-400 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>Drag & drop or click to upload</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DocumentsStep: React.FC<{ onNext: (data: any) => void; isFounder: boolean }> = ({ onNext, isFounder }) => {
    const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
        nda: null,
        pitchDeck: null,
        legalDoc: null,
        resume: null,
        portfolio: null,
        certification: null,
    });

    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (key: string) => (file: File | null) => {
        setDocuments(prev => ({ ...prev, [key]: file }));
    };

    const handleSubmit = async () => {
        const documentUrls: { [key: string]: string } = {};
        const filesToUpload = Object.entries(documents).filter(([_, file]) => file !== null) as [string, File][];
        
        if (filesToUpload.length > 0) {
            setIsUploading(true);
            try {
                for (const [key, file] of filesToUpload) {
                    const url = await storageService.uploadDocument(file);
                    documentUrls[`${key}Url`] = url;
                    documentUrls[`${key}FileName`] = file.name;
                }
            } catch (error) {
                console.error('File processing error:', error);
                alert('Some files failed to process. Please try smaller files.');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }
        
        onNext(documentUrls);
    };

    const founderDocs = [
        {
            key: 'nda',
            label: 'Non-Disclosure Agreement (Optional)',
            description: 'Upload your standard NDA that partners will review before accessing sensitive information.',
            accept: '.pdf,.doc,.docx',
            icon: <DocumentTextIcon className="h-6 w-6" />,
        },
        {
            key: 'pitchDeck',
            label: 'Pitch Deck (Optional)',
            description: 'Share your vision with a pitch deck to attract the right partners.',
            accept: '.pdf,.ppt,.pptx',
            icon: <DocumentPlusIcon className="h-6 w-6" />,
        },
        {
            key: 'legalDoc',
            label: 'Company Documents (Optional)',
            description: 'Any legal or compliance documents you want partners to review.',
            accept: '.pdf,.doc,.docx',
            icon: <DocumentTextIcon className="h-6 w-6" />,
        },
    ];

    const partnerDocs = [
        {
            key: 'resume',
            label: 'Resume / CV (Recommended)',
            description: 'Your professional resume highlighting your experience and achievements.',
            accept: '.pdf,.doc,.docx',
            icon: <DocumentTextIcon className="h-6 w-6" />,
        },
        {
            key: 'portfolio',
            label: 'Portfolio / Case Studies (Optional)',
            description: 'Showcase your past work and success stories with clients.',
            accept: '.pdf,.ppt,.pptx,.zip',
            icon: <DocumentPlusIcon className="h-6 w-6" />,
        },
        {
            key: 'certification',
            label: 'Certifications (Optional)',
            description: 'Industry certifications or credentials that validate your expertise.',
            accept: '.pdf,.jpg,.png',
            icon: <CheckCircleIcon className="h-6 w-6" />,
        },
    ];

    const docsList = isFounder ? founderDocs : partnerDocs;

    return (
        <div>
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    {isFounder ? 'Company Documents' : 'Your Documents'}
                </h2>
                <p className="text-gray-400 text-sm">
                    {isFounder 
                        ? 'Upload documents to streamline the onboarding process with partners. All uploads are optional.'
                        : 'Upload your professional documents to stand out and build trust with companies.'
                    }
                </p>
            </div>

            <div className="space-y-4">
                {docsList.map((doc) => (
                    <DocumentUpload
                        key={doc.key}
                        label={doc.label}
                        description={doc.description}
                        accept={doc.accept}
                        icon={doc.icon}
                        fileName={(documents[doc.key] as any)?.name || null}
                        onFileSelect={handleFileSelect(doc.key)}
                    />
                ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-400">
                        <span className="text-white font-medium">Safe & Secure:</span> Your documents are encrypted and only shared with potential {isFounder ? 'partners' : 'companies'} after mutual agreement.
                    </div>
                </div>
            </div>

            <button 
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 px-6 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
                {isUploading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading to Cloud...
                    </>
                ) : (
                    <>Continue →</>
                )}
            </button>

            <button 
                type="button"
                onClick={() => onNext({})}
                className="mt-3 w-full text-gray-400 hover:text-white font-medium py-2 transition-colors text-sm"
            >
                Skip for now
            </button>
        </div>
    );
};

const FinishStep: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
    const { user } = useAuth();
    const isFounder = user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN;
    
    return (
        <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <CheckCircleIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
                You're All Set! 🎉
            </h1>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Your profile is ready. You can always update your information later in Settings.
            </p>
            
            {/* What's next */}
            <div className="bg-white/5 rounded-xl p-5 text-left mb-8">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">What's next?</h3>
                <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold flex-shrink-0 mt-0.5">1</span>
                        <span className="text-gray-400 text-sm">
                            {isFounder 
                                ? 'Browse vetted growth partners and review their profiles' 
                                : 'Explore opportunities from innovative companies'}
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold flex-shrink-0 mt-0.5">2</span>
                        <span className="text-gray-400 text-sm">
                            {isFounder 
                                ? 'Use AI-powered matching to find the best fit' 
                                : 'Apply to projects that match your expertise'}
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold flex-shrink-0 mt-0.5">3</span>
                        <span className="text-gray-400 text-sm">
                            {isFounder 
                                ? 'Start collaborating with built-in tools and frameworks' 
                                : 'Build your reputation through successful collaborations'}
                        </span>
                    </li>
                </ul>
            </div>
            
            <button 
                onClick={() => onNext({})} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-green-500/25"
            >
                Go to Dashboard →
            </button>
        </div>
    );
};


export default OnboardingPage;
