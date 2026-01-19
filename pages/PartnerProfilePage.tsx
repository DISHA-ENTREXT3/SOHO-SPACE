
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MapPinIcon, ClockIcon, BriefcaseIcon, StarIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, PaperClipIcon, TrophyIcon, GlobeAltIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon } from '../components/Icons';
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

    const getReputationColor = (band: ReputationBand) => {
        switch (band) {
            case ReputationBand.HIGH: return { text: 'text-green-300', bg: 'bg-green-500/20' };
            case ReputationBand.MEDIUM: return { text: 'text-yellow-300', bg: 'bg-yellow-500/20' };
            case ReputationBand.LOW: return { text: 'text-red-300', bg: 'bg-red-500/20' };
            default: return { text: 'text-gray-300', bg: 'bg-gray-500/20' };
        }
    }
    const reputationColors = getReputationColor(partner.reputationBand);
    
    // Application management for Founders
    const companyApplications = user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN ? getApplicationsForCompany(user.profileId) : [];
    const pendingApplication = companyApplications.find(a => a.partnerId === id && a.status === 'Pending');

    const handleAccept = async () => {
        if (pendingApplication) {
            await updateApplicationStatus(pendingApplication.id, ApplicationStatus.ACCEPTED);
            alert('Application Accepted! A new collaboration workspace has been created.');
        }
    };

    const handleReject = async () => {
        if (pendingApplication) {
            if (confirm('Are you sure you want to reject this application?')) {
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                {/* Left Sidebar */}
                <aside className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-6 text-center">
                        <Avatar src={partner.avatarUrl} name={partner.name} size="xl" className="h-32 w-32 rounded-full border-4 border-gray-800/60 shadow-md mx-auto -mt-20" />
                        <h1 className="text-2xl font-bold text-white mt-4">{partner.name}</h1>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-2 ${reputationColors.bg} ${reputationColors.text}`}>
                            <StarIcon className="h-4 w-4 mr-1.5" />
                            {partner.reputationBand} Reputation
                        </div>
                        
                        {/* Actions for Founder */}
                        {pendingApplication && (
                            <div className="mt-6 flex flex-col gap-2">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Action Required</p>
                                <button
                                    onClick={handleAccept}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-500/20 group"
                                >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Approve Partner
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-rose-500/20 hover:bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-bold transition-all"
                                >
                                    <XCircleIcon className="h-4 w-4" />
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-6">
                        <h3 className="font-bold text-lg text-white mb-3">Details</h3>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-center"><MapPinIcon className="h-5 w-5 mr-3 text-gray-400" /> {partner.location}</li>
                            <li className="flex items-center"><ClockIcon className="h-5 w-5 mr-3 text-gray-400" /> {partner.timeZone}</li>
                            <li className="flex items-center"><BriefcaseIcon className="h-5 w-5 mr-3 text-gray-400" />Prefers {partner.workModePreference}</li>
                        </ul>
                    </div>

                    {isOwner && (
                        <div className="space-y-4">
                            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-6">
                                <h3 className="font-bold text-lg text-white mb-4 text-center">Owner Workspace</h3>
                                <button
                                    onClick={handleGenerateAiCV}
                                    disabled={isAiLoading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 mb-4"
                                >
                                    <SparklesIcon className="h-5 w-5" />
                                    {isAiLoading ? 'Crafting CV...' : 'Generate AI Professional CV'}
                                </button>
                                
                                {aiError && (
                                    <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                                        <p className="text-indigo-400 text-xs font-medium leading-relaxed">{aiError}</p>
                                    </div>
                                )}

                                <div className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
                                    Powered by Gemini 1.5 Flash
                                </div>
                            </div>

                            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-6">
                                <h3 className="font-bold text-lg text-white mb-4">Manage CV</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 p-3 bg-gray-800/60 border border-white/10 rounded-md">
                                        <PaperClipIcon className="h-6 w-6 text-gray-400" />
                                        <span className={`flex-grow font-medium truncate ${partner.resumeUrl ? 'text-gray-200' : 'text-gray-400 italic'}`}>
                                            {isResumeUploading ? 'Uploading...' : resumeFileName}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => resumeInputRef.current?.click()}
                                            disabled={isResumeUploading}
                                            className="flex-grow px-3 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-white/10 hover:bg-white/20"
                                        >
                                            {isResumeUploading ? 'Syncing...' : (partner.resumeUrl ? 'Change' : 'Upload')}
                                        </button>
                                        {partner.resumeUrl && (
                                            <button onClick={handleRemoveResume} className="px-3 py-2 border border-red-400/50 rounded-md shadow-sm text-sm font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20">Remove</button>
                                        )}
                                    </div>
                                    <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} className="hidden" accept=".pdf,.doc,.docx" />
                                </div>
                            </div>
                        </div>
                    )}

                    {partner.resumeUrl && (user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN || isOwner) && (
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-6">
                            <h3 className="font-bold text-lg text-white mb-4">Professional Materials</h3>
                            <div className="space-y-3">
                                <a 
                                    href={partner.resumeUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-sm font-bold transition-all group"
                                >
                                    <PaperClipIcon className="h-5 w-5 mr-2" />
                                    Read CV Online
                                </a>
                                <a 
                                    href={partner.resumeUrl} 
                                    download 
                                    className="flex items-center justify-center w-full px-4 py-2 border border-white/10 rounded-xl text-xs font-medium text-gray-400 hover:bg-white/5 transition-all"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    )}

                    {(user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN) && partner.contact &&
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-6">
                            <h3 className="font-bold text-lg text-white mb-4">Connect</h3>
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-300">
                                    <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400 shrink-0" />
                                    <span className="truncate">{partner.contact.email}</span>
                                </div>
                                {partner.contact.linkedin && (
                                    <div className="flex items-center text-gray-300">
                                        <GlobeAltIcon className="h-5 w-5 mr-3 text-gray-400 shrink-0" />
                                        <a href={partner.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline truncate">
                                            LinkedIn Profile
                                        </a>
                                    </div>
                                )}
                                <div className="border-t border-white/10 pt-4 space-y-3">
                                    <a href={`mailto:${partner.contact.email}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                                        Send Personalized Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                </aside>

                {/* Right Content */}
                <main className="lg:col-span-2 flex flex-col gap-8">
                    {(user?.role === UserRole.FOUNDER || user?.role === UserRole.ADMIN) && (
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center">
                                    <SparklesIcon className="h-6 w-6 mr-2 text-yellow-400" />
                                    AI-Powered Analysis
                                </h2>
                                {!aiAnalysis && !isAiLoading && (
                                    <button 
                                        onClick={handleAiAnalysis}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        Run Intelligent Vetting
                                    </button>
                                )}
                            </div>

                            {isAiLoading ? (
                                <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 animate-pulse">
                                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400 font-medium">Analyzing professional vectors and reputation data...</p>
                                </div>
                            ) : aiError ? (
                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                    <p className="text-red-400 text-sm mb-4">{aiError}</p>
                                    <button onClick={handleAiAnalysis} className="text-white text-xs font-bold underline">Try again</button>
                                </div>
                            ) : aiAnalysis ? (
                                <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-xl prose prose-invert max-w-none">
                                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Elite Vetting Complete
                                    </div>
                                    <div className="text-gray-200 leading-relaxed">
                                        <LinkifiedText text={aiAnalysis} />
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-indigo-500/20 text-[10px] text-gray-500 italic">
                                        Analysis generated by Soho Space AI Engine. This serves as a preliminary vetting tool.
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-indigo-500/10 border border-indigo-400/20 p-6 rounded-xl text-center">
                                    <SparklesIcon className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
                                    <h3 className="text-white font-bold mb-1">Deep Professional Insights</h3>
                                    <p className="text-gray-400 text-sm mb-4">Analyze {partner.name}'s profile to uncover growth vectors, superpower summaries, and interview probing questions.</p>
                                    <div className="inline-block bg-gray-800 text-gray-400 text-[10px] font-bold py-1 px-3 rounded-full border border-white/5 uppercase tracking-widest">
                                        AI Vetting Credits Required: 1
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-white mb-3">About</h2>
                        <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                            <LinkifiedText text={partner.bio} />
                        </p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {(partner.skills || []).map(skill => (
                                <span key={skill} className="bg-indigo-400/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><TrophyIcon className="h-6 w-6 mr-2 text-gray-400" />Previously Managed Brands</h2>
                        {(partner.managedBrands || []).length > 0 ? (
                            <ul className="space-y-3">
                                {(partner.managedBrands || []).map((brand, i) => (
                                    <li key={i} className="flex items-center p-3 bg-gray-800/50 border border-gray-700 rounded-md">
                                        <span className="text-gray-200 font-semibold">{brand}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-400">No managed brands listed.</p>}
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Past Collaborations</h2>
                        {(partner.pastCollaborations || []).length > 0 ? (
                            <ul className="space-y-3">
                                {(partner.pastCollaborations || []).map((collab, i) => (
                                    <li key={i} className="flex items-center p-3 bg-gray-800/50 border border-gray-700 rounded-md">
                                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-indigo-400" />
                                        <span className="text-gray-300 font-medium">{collab}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-400">No collaboration history yet.</p>}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PartnerProfilePage;