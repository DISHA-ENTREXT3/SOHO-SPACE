
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                {/* Left Sidebar */}
                <aside className="lg:col-span-1 flex flex-col gap-8">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-600/10 to-transparent" />
                        <div className="relative z-10">
                            <div className="relative inline-block mb-6">
                                <Avatar src={partner.avatarUrl} name={partner.name} size="xl" className="h-32 w-32 rounded-[2rem] border-4 border-[var(--bg-primary)] shadow-2xl" />
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                    <StarIcon className="h-5 w-5 fill-current" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{partner.name}</h1>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-current/20 ${reputationColors.bg} ${reputationColors.text}`}>
                                    {partner.reputationBand} RANK
                                </span>
                            </div>
                        </div>
                        
                        {/* Actions for Founder */}
                        {pendingApplication && (
                            <div className="mt-10 flex flex-col gap-3 relative z-10">
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Protocol Pending</p>
                                <button
                                    onClick={handleAccept}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/25 group"
                                >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Establish Link
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    <XCircleIcon className="h-4 w-4" />
                                    Reject Protocol
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-8">
                        <h3 className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8 opacity-40">Operational Intel</h3>
                        <ul className="space-y-6">
                            {[
                                { icon: <MapPinIcon className="h-5 w-5" />, label: "Territory", value: partner.location },
                                { icon: <ClockIcon className="h-5 w-5" />, label: "Cycle", value: partner.timeZone },
                                { icon: <BriefcaseIcon className="h-5 w-5" />, label: "Mode", value: partner.workModePreference }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60 mb-0.5">{item.label}</p>
                                        <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">{item.value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {isOwner && (
                        <div className="space-y-8">
                            <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-indigo-600/20 transition-all duration-700" />
                                <h3 className="text-[9px] font-black text-[var(--text-primary)] mb-8 text-center uppercase tracking-[0.3em] opacity-40 relative z-10">Commander Matrix</h3>
                                <button
                                    onClick={handleGenerateAiCV}
                                    disabled={isAiLoading}
                                    className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all shadow-2xl shadow-indigo-600/25 mb-8 relative z-10 hover:-translate-y-1 active:scale-95"
                                >
                                    <SparklesIcon className="h-4 w-4 animate-pulse" />
                                    {isAiLoading ? 'Synthesizing...' : 'Generate AI CV'}
                                </button>
                                
                                {aiError && (
                                    <div className="mb-8 p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center relative z-10">
                                        <p className="text-rose-500 text-[10px] font-bold leading-relaxed uppercase tracking-tighter">{aiError}</p>
                                    </div>
                                )}

                                <div className="text-[8px] text-center text-[var(--text-muted)] font-black uppercase tracking-[0.4em] opacity-30 relative z-10">
                                    Gemini 1.5 Pro • Active
                                </div>
                            </div>

                            <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-8">
                                <h3 className="text-[9px] font-black text-[var(--text-primary)] mb-8 uppercase tracking-[0.3em] opacity-40">Vault Submittals</h3>
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-5 p-5 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl group/input">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0 group-hover/input:bg-indigo-600 group-hover/input:text-white transition-all">
                                            <PaperClipIcon className="h-5 w-5" />
                                        </div>
                                        <span className={`flex-grow font-black text-[10px] uppercase tracking-widest truncate ${partner.resumeUrl ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-50'}`}>
                                            {isResumeUploading ? 'Transmitting...' : resumeFileName}
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => resumeInputRef.current?.click()}
                                            disabled={isResumeUploading}
                                            className="flex-grow px-6 py-4 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:border-indigo-600/30 transition-all"
                                        >
                                            {isResumeUploading ? 'Syncing...' : (partner.resumeUrl ? 'Refine' : 'Upload')}
                                        </button>
                                        {partner.resumeUrl && (
                                            <button onClick={handleRemoveResume} className="px-6 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all">Eraser</button>
                                        )}
                                    </div>
                                    <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} className="hidden" accept=".pdf,.doc,.docx" />
                                </div>
                            </div>
                        </div>
                    )}

                    {partner.resumeUrl && (user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN || isOwner) && (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-8">
                            <h3 className="text-[9px] font-black text-[var(--text-primary)] mb-8 uppercase tracking-[0.3em] opacity-40">Briefings</h3>
                            <div className="space-y-4">
                                <a 
                                    href={partner.resumeUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center justify-center w-full px-6 py-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-600/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
                                >
                                    <PaperClipIcon className="h-4 w-4 mr-3" />
                                    Launch CV Viewer
                                </a>
                                <a 
                                    href={partner.resumeUrl} 
                                    download 
                                    className="flex items-center justify-center w-full px-6 py-4 border border-[var(--glass-border)] rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:bg-[var(--bg-primary)] transition-all"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                                    Download Matrix
                                </a>
                            </div>
                        </div>
                    )}

                    {(user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN) && partner.contact &&
                        <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden group">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-[9px] font-black text-[var(--text-primary)] mb-8 uppercase tracking-[0.3em] opacity-40">Comms Vector</h3>
                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center bg-[var(--bg-primary)] p-5 rounded-2xl border border-[var(--glass-border)] group/card hover:border-indigo-600/30 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 mr-5 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all">
                                        <EnvelopeIcon className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-tight text-[var(--text-secondary)] truncate">{partner.contact.email}</span>
                                </div>
                                {partner.contact.linkedin && (
                                    <a href={partner.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center bg-[var(--bg-primary)] p-5 rounded-2xl border border-[var(--glass-border)] group/card hover:border-indigo-600/30 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 mr-5 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all">
                                            <GlobeAltIcon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:underline truncate">
                                            Handshake Profile
                                        </span>
                                    </a>
                                )}
                                <div className="pt-6">
                                    <a href={`mailto:${partner.contact.email}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-indigo-600/25 transition-all hover:-translate-y-1 active:scale-95">
                                        <EnvelopeIcon className="h-5 w-5 mr-3" />
                                        Personal Inquiry
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                </aside>

                {/* Right Content */}
                <main className="lg:col-span-2 flex flex-col gap-8">
                    {(user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN) && (
                        <div className="bg-indigo-600/5 border border-indigo-500/10 p-12 rounded-[3rem] relative overflow-hidden group shadow-2xl">
                             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
                            
                            <div className="flex items-center justify-between mb-12 relative z-10">
                                <h2 className="text-[10px] font-black text-[var(--text-primary)] flex items-center gap-4 uppercase tracking-[0.3em]">
                                    <SparklesIcon className="h-6 w-6 text-indigo-600 animate-bounce" />
                                    AI Perception Probe
                                </h2>
                                {!aiAnalysis && !isAiLoading && (
                                    <button 
                                        onClick={handleAiAnalysis}
                                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-600/25 hover:-translate-y-1 active:scale-95"
                                    >
                                        Initiate Scan
                                    </button>
                                )}
                            </div>

                            {isAiLoading ? (
                                <div className="p-20 text-center bg-[var(--bg-primary)] rounded-[2rem] border border-[var(--glass-border)] animate-in zoom-in-95 duration-500 relative z-10 shadow-inner">
                                    <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-8 shadow-2xl shadow-indigo-600/20" />
                                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Deciphering identity markers...</p>
                                </div>
                            ) : aiError ? (
                                <div className="p-10 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] text-center relative z-10">
                                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{aiError}</p>
                                    <button onClick={handleAiAnalysis} className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.3em] underline underline-offset-8 decoration-2 hover:text-indigo-500">Restart Sequence</button>
                                </div>
                            ) : aiAnalysis ? (
                                <div className="bg-[var(--bg-primary)] border border-[var(--glass-border)] p-10 rounded-[2rem] relative z-10 shadow-2xl">
                                    <div className="flex items-center gap-4 mb-10 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] bg-emerald-500/10 w-fit px-5 py-2 rounded-full border border-emerald-500/20">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Synthesis Complete
                                    </div>
                                    <div className="text-[var(--text-secondary)] text-base leading-relaxed whitespace-pre-wrap font-medium selection:bg-indigo-500/30">
                                        <LinkifiedText text={aiAnalysis} />
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-[var(--glass-border)] text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] opacity-30">
                                        Soho Neural Engine • Verified Profile Data
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[var(--bg-primary)] border border-[var(--glass-border)] p-12 rounded-[2.5rem] text-center relative z-10 shadow-2xl">
                                    <div className="w-24 h-24 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                                        <SparklesIcon className="h-10 w-10 text-indigo-600/40" />
                                    </div>
                                    <h3 className="text-[var(--text-primary)] text-lg font-black uppercase tracking-[0.1em] mb-4">Deep Professional Audit</h3>
                                    <p className="text-[var(--text-muted)] text-sm mb-10 max-w-sm mx-auto font-medium opacity-60 leading-relaxed uppercase tracking-tight italic">Unlock core growth vectors, cognitive superpower summaries, and precision vetting trajectories.</p>
                                    <div className="inline-flex items-center gap-3 bg-[var(--bg-secondary)] text-indigo-600 text-[9px] font-black py-3 px-8 rounded-2xl border border-indigo-600/10 uppercase tracking-[0.3em] shadow-lg shadow-indigo-600/5">
                                        <RocketLaunchIcon className="w-4 h-4" />
                                        Protocol Credit Ready
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