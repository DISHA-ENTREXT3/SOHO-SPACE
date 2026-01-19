
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MapPinIcon, ClockIcon, BriefcaseIcon, StarIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, PaperClipIcon, TrophyIcon, GlobeAltIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon, RocketLaunchIcon } from '../components/Icons';
import { ReputationBand, WorkMode, UserRole, ApplicationStatus } from '../types';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import SEO from '../components/SEO';

const LinkifiedText: React.FC<{ text: string }> = ({ text }) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const parts = text.split(urlRegex);

    return (
        <>
            {parts.map((part, index) => {
                if (part && part.match(urlRegex)) {
                    return (
                        <a href={part} key={index} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </>
    );
};

const PartnerProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getPartner, updatePartnerProfile, removeResumeFromPartner, getApplicationsForCompany, updateApplicationStatus } = useAppContext();
    const { user } = useAuth();

    const partner = id ? getPartner(id) : undefined;

    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string>('');
    const [resumeFileName, setResumeFileName] = useState((partner?.resumeUrl && partner.resumeUrl.split('/').pop()) || 'No CV uploaded');
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const [isResumeUploading, setIsResumeUploading] = useState(false);

    if (!id || !partner) return <div>Partner not found.</div>;

    const isOwner = user?.role === UserRole.PARTNER && user.profileId === id;

    const getReputationColor = (band: ReputationBand) => {
        switch (band) {
            case ReputationBand.HIGH: return { text: 'text-emerald-600', bg: 'bg-emerald-500/10' };
            case ReputationBand.MEDIUM: return { text: 'text-amber-600', bg: 'bg-amber-500/10' };
            case ReputationBand.LOW: return { text: 'text-rose-600', bg: 'bg-rose-500/10' };
            default: return { text: 'text-[var(--text-muted)]', bg: 'bg-[var(--bg-secondary)]' };
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                setIsResumeUploading(true);
                const url = await storageService.uploadDocument(file);
                await updatePartnerProfile(partner.id, { resumeUrl: url });
                setResumeFileName(file.name);
            } catch (error) {
                console.error('Resume upload failed:', error);
                alert('Failed to upload CV. Please try again.');
            } finally {
                setIsResumeUploading(false);
            }
        }
    };

    const handleRemoveResume = () => {
        removeResumeFromPartner(partner.id);
        setResumeFileName('No CV uploaded');
        if (resumeInputRef.current) resumeInputRef.current.value = "";
    };

    const handleAiAnalysis = async () => {
        if (!partner) return;
        setIsAiLoading(true);
        setAiError('');
        setAiAnalysis('');
        try {
            const analysis = await aiService.analyzePartner(partner);
            setAiAnalysis(analysis);
        } catch (error: any) {
            console.error("AI Analysis Error:", error);
            setAiError(error.message || 'Failed to generate AI analysis.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleGenerateAiCV = async () => {
        if (!partner) return;
        setIsAiLoading(true);
        setAiError('');
        try {
            const cv = await aiService.generatePartnerCV(partner);
            // Create a blob from the CV markdown and trigger download
            const blob = new Blob([cv], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${partner.name.replace(/\s+/g, '_')}_AI_CV.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("AI CV Generated! You can now edit this markdown file or convert it to PDF.");
        } catch (error: any) {
            console.error("AI CV Error:", error);
            setAiError(error.message || 'Failed to generate AI CV.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const reputationColors = getReputationColor(partner.reputationBand);
    
    // Application management for Founders
    const companyApplications = user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN ? getApplicationsForCompany(user.profileId) : [];
    const pendingApplication = companyApplications.find(a => a.partnerId === id && a.status === 'Pending');

    const handleAccept = async () => {
        if (pendingApplication) {
            await updateApplicationStatus(pendingApplication.id, ApplicationStatus.ACCEPTED);
            alert('Protocol Accepted. Secure collaboration vector established.');
        }
    };

    const handleReject = async () => {
        if (pendingApplication) {
            if (confirm('Verify rejection of this growth protocol?')) {
                await updateApplicationStatus(pendingApplication.id, ApplicationStatus.REJECTED);
            }
        }
    };

    const mailtoSubject = `Collaboration Inquiry via Soho Space`;
    const mailtoBody = `Hi ${partner.name},%0D%0A%0D%0AI came across your profile on Soho Space and was impressed by your experience. I'm the founder of [Your Company Name] and we're currently working on [Your Product Name], a platform for [brief product description].%0D%0A%0D%0AWe are looking for a growth partner with your skills to help us achieve [specific goal]. I'd love to discuss a potential collaboration.%0D%0A%0D%0ABest,%0D%0A${user?.name}`;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <SEO 
                title={partner.name}
                description={partner.bio ? partner.bio.substring(0, 160) : `Hire ${partner.name}, a vetted growth partner on Soho Space.`}
                image={partner.avatarUrl}
                keywords={partner.skills || ['Growth Partner', 'Startup Consultant']}
                type="profile"
                noindex={true}
            />
            <BackButton />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Left Sidebar */}
                <aside className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center shadow-md">
                        <div className="relative inline-block mb-4">
                            <Avatar src={partner.avatarUrl} name={partner.name} size="xl" className="h-24 w-24 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md" />
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                                <StarIcon className="h-4 w-4 fill-current" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{partner.name}</h1>
                        <div className="flex items-center justify-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${reputationColors.bg} ${reputationColors.text}`}>
                                {partner.reputationBand} RANK
                            </span>
                        </div>
                        
                        {/* Actions for Founder */}
                        {pendingApplication && (
                            <div className="mt-6 flex flex-col gap-2">
                                <p className="text-xs font-bold text-indigo-600 mb-1">Action Required</p>
                                <button
                                    onClick={handleAccept}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md"
                                >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Approve Partner
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold transition-all"
                                >
                                    <XCircleIcon className="h-4 w-4" />
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Details</h3>
                        <ul className="space-y-3">
                            {[
                                { icon: <MapPinIcon className="h-4 w-4" />, label: "Location", value: partner.location },
                                { icon: <ClockIcon className="h-4 w-4" />, label: "Timezone", value: partner.timeZone },
                                { icon: <BriefcaseIcon className="h-4 w-4" />, label: "Work Mode", value: partner.workModePreference }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item.label}</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {isOwner && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-center">Owner Workspace</h3>
                                <button
                                    onClick={handleGenerateAiCV}
                                    disabled={isAiLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md mb-4"
                                >
                                    <SparklesIcon className="h-4 w-4" />
                                    {isAiLoading ? 'Generating...' : 'Generate AI CV'}
                                </button>
                                
                                {aiError && (
                                    <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-center">
                                        <p className="text-rose-600 dark:text-rose-400 text-xs font-semibold">{aiError}</p>
                                    </div>
                                )}

                                <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                                    Powered by Gemini 1.5 Pro
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Manage CV</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                            <PaperClipIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className={`flex-grow font-semibold text-xs truncate ${partner.resumeUrl ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                            {isResumeUploading ? 'Uploading...' : resumeFileName}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => resumeInputRef.current?.click()}
                                            disabled={isResumeUploading}
                                            className="flex-grow px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                        >
                                            {isResumeUploading ? 'Uploading...' : (partner.resumeUrl ? 'Change' : 'Upload')}
                                        </button>
                                        {partner.resumeUrl && (
                                            <button onClick={handleRemoveResume} className="px-4 py-2.5 bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all">Remove</button>
                                        )}
                                    </div>
                                    <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} className="hidden" accept=".pdf,.doc,.docx" />
                                </div>
                            </div>
                        </div>
                    )}

                    {partner.resumeUrl && (user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN || isOwner) && (
                        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Documents</h3>
                            <div className="space-y-3">
                                <a 
                                    href={partner.resumeUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center justify-center w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-600 rounded-xl text-sm font-bold transition-all"
                                >
                                    <PaperClipIcon className="h-4 w-4 mr-2" />
                                    View CV
                                </a>
                                <a 
                                    href={partner.resumeUrl} 
                                    download 
                                    className="flex items-center justify-center w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                    Download
                                </a>
                            </div>
                        </div>
                    )}

                    {(user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN) && partner.contact &&
                        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Contact</h3>
                            <div className="space-y-3">
                                <div className="flex items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <EnvelopeIcon className="h-4 w-4 mr-3 text-indigo-600 shrink-0" />
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{partner.contact.email}</span>
                                </div>
                                {partner.contact.linkedin && (
                                    <a href={partner.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all">
                                        <GlobeAltIcon className="h-4 w-4 mr-3 text-indigo-600 shrink-0" />
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate">
                                            LinkedIn Profile
                                        </span>
                                    </a>
                                )}
                                <div className="pt-3">
                                    <a href={`mailto:${partner.contact.email}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all">
                                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                                        Send Message
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                </aside>

                {/* Right Content */}
                <main className="lg:col-span-2 flex flex-col gap-6">
                    {(user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN) && (
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/30 p-6 rounded-2xl shadow-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <SparklesIcon className="h-5 w-5 text-indigo-600" />
                                    AI Partner Analysis
                                </h2>
                                {!aiAnalysis && !isAiLoading && (
                                    <button 
                                        onClick={handleAiAnalysis}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md"
                                    >
                                        Analyze Profile
                                    </button>
                                )}
                            </div>

                            {isAiLoading ? (
                                <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                                    <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Analyzing partner profile...</p>
                                </div>
                            ) : aiError ? (
                                <div className="p-6 bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-center">
                                    <p className="text-rose-600 dark:text-rose-400 text-sm font-bold mb-3">{aiError}</p>
                                    <button onClick={handleAiAnalysis} className="text-indigo-600 dark:text-indigo-400 text-sm font-bold underline hover:no-underline">Try Again</button>
                                </div>
                            ) : aiAnalysis ? (
                                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-xl">
                                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 w-fit px-3 py-1.5 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Analysis Complete
                                    </div>
                                    <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        <LinkifiedText text={aiAnalysis} />
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        Powered by Gemini AI
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 p-8 rounded-xl text-center">
                                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <SparklesIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-gray-900 dark:text-white text-base font-bold mb-2">AI-Powered Partner Insights</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">Get detailed analysis of this partner's skills, experience, and potential fit for your company.</p>
                                    <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold py-2 px-4 rounded-lg">
                                        <RocketLaunchIcon className="w-4 h-4" />
                                        Ready to Analyze
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-12 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600/20 to-transparent" />
                        <h2 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-10 opacity-40">Identity Memo</h2>
                        <p className="text-[var(--text-primary)] leading-[1.8] whitespace-pre-line text-lg font-medium selection:bg-indigo-500/30">
                            <LinkifiedText text={partner.bio} />
                        </p>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-12">
                        <h2 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-10 opacity-40">Primary Expertise</h2>
                        <div className="flex flex-wrap gap-4">
                            {(partner.skills || []).map(skill => (
                                <span key={skill} className="bg-[var(--bg-primary)] text-indigo-600 border border-indigo-600/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/5 hover:border-indigo-600 transition-all cursor-default">{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-12">
                        <h2 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-10 opacity-40 flex items-center">
                            <TrophyIcon className="h-5 w-5 mr-3 text-indigo-600" />
                            Managed Assets
                        </h2>
                        {(partner.managedBrands || []).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(partner.managedBrands || []).map((brand, i) => (
                                    <div key={i} className="flex items-center p-5 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl hover:border-indigo-600/30 transition-all group/asset">
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 mr-4 group-hover/asset:scale-150 transition-all" />
                                        <span className="text-[var(--text-primary)] font-black text-xs tracking-[0.1em] uppercase">{brand}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest italic opacity-40">No assets registered in the mandate.</p>}
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-12">
                        <h2 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-10 opacity-40 flex items-center gap-3">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600" />
                            Network History
                        </h2>
                        {(partner.pastCollaborations || []).length > 0 ? (
                            <ul className="space-y-4">
                                {(partner.pastCollaborations || []).map((collab, i) => (
                                    <li key={i} className="flex items-start gap-4 p-6 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl hover:border-indigo-600/30 transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0">
                                            <SparklesIcon className="h-4 w-4" />
                                        </div>
                                        <span className="text-[var(--text-secondary)] font-medium text-sm leading-relaxed">{collab}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest italic opacity-40">No collaboration logs found.</p>}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PartnerProfilePage;