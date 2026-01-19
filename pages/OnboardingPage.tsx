
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

    const handleFocus = () => setShowPlaceholder(false);
    const handleBlur = () => { if (!value) setShowPlaceholder(true); };

    return (
        <div className="form-group">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">{label}</label>
            <input
                ref={inputRef}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={showPlaceholder ? placeholder : ''}
                required={required}
                className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            />
            {helpText && <p className="text-[9px] text-[var(--text-muted)] mt-2 font-bold uppercase tracking-wider opacity-60">{helpText}</p>}
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

    const handleFocus = () => setShowPlaceholder(false);
    const handleBlur = () => { if (!value) setShowPlaceholder(true); };

    return (
        <div className="form-group">
            <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-3">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={showPlaceholder ? placeholder : ''}
                rows={rows}
                required={required}
                className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium resize-none leading-relaxed"
            />
            {helpText && <p className="text-[9px] text-[var(--text-muted)] mt-2 font-bold uppercase tracking-wider opacity-60">{helpText}</p>}
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
        <div className="mb-12">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 px-2">
                {stepConfig.map((s, index) => {
                    const StepIcon = s.icon;
                    const stepNum = index + 1;
                    const isActive = step === stepNum;
                    const isCompleted = step > stepNum;
                    
                    return (
                        <div key={index} className="flex flex-col items-center group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 transform ${
                                isCompleted ? 'bg-emerald-500 scale-90' : isActive ? 'bg-indigo-600 scale-110 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500/10' : 'bg-[var(--bg-secondary)] border border-[var(--glass-border)] opacity-60'
                            }`}>
                                {isCompleted ? (
                                    <CheckCircleIcon className="h-6 w-6 text-white" />
                                ) : (
                                    <StepIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                                )}
                            </div>
                            <span className={`text-[9px] mt-3 font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-50'}`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Progress Line */}
            <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1 relative border border-[var(--glass-border)] overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-700 ease-out"
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
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            </div>
            
            <div className="max-w-xl w-full relative z-10 px-4">
                {/* Brand Logo */}
                <div className="flex justify-center mb-8">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                             <RocketLaunchIcon className="w-6 h-6 text-white" />
                         </div>
                         <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tighter uppercase">Soho<span className="text-indigo-600">Space</span></h2>
                     </div>
                </div>

                {/* Card */}
                <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
                    <ProgressBar />
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                        {renderStep()}
                    </div>
                    
                    {/* Navigation */}
                    <div className="mt-10 pt-10 border-t border-[var(--glass-border)] flex justify-between items-center transition-all">
                        {step > 1 ? (
                            <button 
                                onClick={handleBack} 
                                className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:bg-[var(--bg-card-hover)] transition-all flex items-center gap-2"
                            >
                                <span className="opacity-50">←</span> Prev Sequence
                            </button>
                        ) : (
                            <div />
                        )}
                        
                        {/* Step counter */}
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                {[...Array(totalSteps)].map((_, i) => (
                                    <div key={i} className={`w-1 h-1 rounded-full ${i + 1 === step ? 'bg-indigo-500 w-3' : 'bg-[var(--text-muted)] opacity-30'} transition-all`} />
                                ))}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-50">
                                Phase 0{step}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Trust indicators */}
                <div className="mt-10 flex items-center justify-center gap-10 text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                    <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4" />
                        <span>Encrypted Protocol</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4" />
                        <span>Instant Access</span>
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
        <div className="text-center py-4">
            <div className="w-24 h-24 mx-auto mb-10 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/30 relative">
                 <div className="absolute inset-0 bg-white/10 rounded-3xl animate-pulse" />
                 <RocketLaunchIcon className="h-10 w-10 text-white relative z-10" />
            </div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tight">
                Initiate Your Journey
            </h1>
            <p className="text-[var(--text-secondary)] mb-10 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-80">
                {isFounder 
                    ? "Welcome to the elite corridor. Access pre-vetted growth talent ready to scale your vision to the next dimension."
                    : "Connect with high-growth startups and innovative founders building the next generation of digital infrastructure."
                }
            </p>
            
            {/* Value propositions */}
            <div className="space-y-4 mb-10">
                {[
                    isFounder ? "Access elite growth vectors" : "Exclusive high-growth mandates",
                    isFounder ? "Built-in strategic alignment" : "Reputation-based scaling",
                    isFounder ? "AI-powered precision matching" : "Direct founder access"
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl p-4 hover:border-indigo-500/30 transition-all group">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-all">
                            {text}
                        </span>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={() => onNext({})} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] py-5 px-8 rounded-2xl transition-all shadow-2xl shadow-indigo-600/25 active:scale-95"
            >
                Start Protocol →
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
            <div className="flex flex-col items-center mb-10">
                <div className="relative group mb-6">
                    <div className={`w-28 h-28 overflow-hidden bg-[var(--bg-secondary)] border-2 border-[var(--glass-border)] shadow-2xl relative ${isFounder ? 'rounded-3xl' : 'rounded-full'}`}>
                        <Avatar 
                            src={user?.avatarUrl} 
                            name={user?.name || 'User'} 
                            className="w-full h-full"
                        />
                         <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-500 transition-all transform hover:scale-110 active:scale-90 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CameraIcon className="w-5 h-5" />
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
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                    {isFounder ? 'Identity & Vision' : 'Professional Identity'}
                </h2>
                <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.2em] text-center max-w-[280px] opacity-60">
                    {isFounder 
                        ? 'Establish your brand presence to attract top-tier growth executors.'
                        : 'Your profile serves as your digital fingerprint in the Soho ecosystem.'
                    }
                </p>
            </div>
            
            <div className="space-y-6">
                <ClearableInput
                    label={isFounder ? 'Company Name' : 'Full Name'}
                    value={name}
                    onChange={setName}
                    placeholder={isFounder ? 'e.g., Nexus Growth Lab' : 'e.g., Alex Rivera'}
                    required
                />
                
                <ClearableInput
                    label="Operations Hub"
                    value={location}
                    onChange={setLocation}
                    placeholder="e.g., Remote / Singapore"
                    required
                />
                
                <ClearableTextarea
                    label={isFounder ? 'Mission Statement & Background' : 'Strategic Overview'}
                    value={description}
                    onChange={setDescription}
                    placeholder={isFounder 
                        ? 'Synthesize your company\'s core mission, trajectory, and unique growth vectors...'
                        : 'Project your professional baseline, execution frameworks, and growth philosophy...'
                    }
                    rows={5}
                    required
                />
            </div>
            
            <button 
                type="submit" 
                className="mt-10 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] py-5 px-8 rounded-2xl transition-all shadow-2xl shadow-indigo-600/25 active:scale-95"
            >
                Confirm Identity →
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
            <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                    <LightBulbIcon className="h-8 w-8 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                    Strategic Requirements
                </h2>
                <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed opacity-70">
                    Define the execution vectors and professional DNA required to accelerate your vision.
                </p>
            </div>
            
            <div className="space-y-6">
                <ClearableInput
                    label="Growth Vectors Needed"
                    value={seeking}
                    onChange={setSeeking}
                    placeholder="e.g., Performance Marketing, SEO Architecture, SaaS Ops"
                    required
                />
                
                <ClearableTextarea
                    label="Operational Expectations"
                    value={expectations}
                    onChange={setExpectations}
                    placeholder="Describe the engagement model, expected outcomes, and the baseline expertise required for this mandate..."
                    rows={5}
                    required
                />
            </div>
            
            {/* Quick suggestion chips */}
            <div className="mt-6">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 opacity-50">Core mandates:</p>
                <div className="flex flex-wrap gap-2">
                    {['SaaS Growth', 'Content Scaling', 'Paid Media', 'SEO Architecture', 'Product GTM'].map(skill => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => setSeeking(prev => prev ? `${prev}, ${skill}` : skill)}
                            className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:border-indigo-500/30 transition-all font-medium"
                        >
                            + {skill}
                        </button>
                    ))}
                </div>
            </div>
            
            <button 
                type="submit" 
                className="mt-10 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] py-5 px-8 rounded-2xl transition-all shadow-2xl shadow-indigo-600/25 active:scale-95"
            >
                Lock Mandate →
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
            <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                    <ChartBarIcon className="h-8 w-8 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                    Expertise Matrix
                </h2>
                <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed opacity-70">
                    Map your professional superpowers to the growth mandates of top-tier partners.
                </p>
            </div>
            
            <div className="space-y-6">
                <ClearableInput
                    label="Core Superpowers"
                    value={skills}
                    onChange={setSkills}
                    placeholder="e.g., SEO Architecture, Paid Acquisition, Content Ops"
                    required
                />
                
                {/* Quick skill suggestions */}
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 opacity-50">Popular vectors:</p>
                    <div className="flex flex-wrap gap-2">
                        {['SEO', 'PPC', 'Strategy', 'Email Ops', 'Retention'].map(skill => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => setSkills(prev => prev ? `${prev}, ${skill}` : skill)}
                                className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl text-[var(--text-muted)] hover:text-indigo-500 hover:border-indigo-500/30 transition-all"
                            >
                                + {skill}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="form-group">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-4">Engagement Preference</label>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.values(WorkMode).map(mode => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setWorkMode(mode)}
                                className={`px-4 py-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${
                                    workMode === mode 
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/25' 
                                        : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-muted)] hover:border-indigo-500/30 hover:text-indigo-500'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <button 
                type="submit" 
                className="mt-10 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] py-5 px-8 rounded-2xl transition-all shadow-2xl shadow-indigo-600/25 active:scale-95"
            >
                Finalize Matrix →
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
        if (file) onFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative border-2 border-dashed rounded-[1.5rem] p-6 transition-all duration-300 cursor-pointer group ${
                fileName ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-indigo-500/30 hover:bg-[var(--bg-primary)]'
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
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                    fileName ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-[var(--text-primary)] text-xs uppercase tracking-tight">{label}</h4>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1 opacity-60 line-clamp-1">{description}</p>
                    {fileName ? (
                        <div className="mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                            <PaperClipIcon className="h-3 w-3" />
                            <span className="truncate">{fileName}</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileSelect(null);
                                }}
                                className="ml-2 text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="mt-3 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-40">
                            <ArrowDownTrayIcon className="h-3 w-3" />
                            <span>Vault Transfer Mode</span>
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
            <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                    <DocumentTextIcon className="h-8 w-8 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                    {isFounder ? 'Asset Repository' : 'Professional Vault'}
                </h2>
                <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed opacity-70">
                    {isFounder 
                        ? 'Upload strategic assets to streamline the vetting and collaboration process. All items are secured.'
                        : 'Upload your professional credentials to build instant trust with high-growth partners.'
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

            <div className="mt-8 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <ShieldCheckIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] leading-relaxed opacity-60">
                        <span className="text-[var(--text-primary)] opacity-100">End-to-End Encryption:</span> Assets are only decrypted for authorized {isFounder ? 'partners' : 'companies'} after mutual handshake.
                    </div>
                </div>
            </div>

            <button 
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className="mt-10 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] py-5 px-8 rounded-2xl transition-all shadow-2xl shadow-indigo-600/25 active:scale-95 flex items-center justify-center gap-3"
            >
                {isUploading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Encrypting & Syncing...
                    </>
                ) : (
                    <>Synchronize Vault →</>
                )}
            </button>

            <button 
                type="button"
                onClick={() => onNext({})}
                className="mt-6 w-full text-[var(--text-muted)] hover:text-indigo-600 font-black uppercase tracking-[0.3em] py-2 transition-all text-[9px] opacity-40 hover:opacity-100"
            >
                Skip Phase
            </button>
        </div>
    );
};

const FinishStep: React.FC<{ onNext: (data: any) => void }> = ({ onNext }) => {
    const { user } = useAuth();
    const isFounder = user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN;
    
    return (
        <div className="text-center py-4">
            <div className="w-24 h-24 mx-auto mb-10 rounded-3xl bg-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tight">
                System Activated
            </h1>
            <p className="text-[var(--text-secondary)] mb-10 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-80">
                Your professional profile has been successfully integrated into the Soho Space network.
            </p>
            
            {/* What's next */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[1.5rem] p-8 text-left mb-10">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-6 opacity-40">Next Operations</h3>
                <ul className="space-y-6">
                    {[
                        isFounder ? 'Review elite partner profiles' : 'Analyze active growth mandates',
                        isFounder ? 'Initialize AI matching sequence' : 'Submit engagement applications',
                        isFounder ? 'Establish secure collaboration workspaces' : 'Accelerate partner reputation score'
                    ].map((text, i) => (
                        <li key={i} className="flex items-start gap-5 group">
                            <span className="w-6 h-6 rounded-lg bg-indigo-600/10 flex items-center justify-center text-[9px] text-indigo-600 font-black flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i + 1}</span>
                            <span className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-tight leading-relaxed opacity-80 group-hover:opacity-100 transition-all">
                                {text}
                            </span>
                        </li>
                    )) }
                </ul>
            </div>
            
            <button 
                onClick={() => onNext({})} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] py-5 px-8 rounded-2xl transition-all shadow-2xl shadow-emerald-600/25 active:scale-95"
            >
                Enter Ecosystem →
            </button>
        </div>
    );
};


export default OnboardingPage;
