
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { ChatMessage, UserRole, Collaboration } from '../types';
import { 
    PaperAirplaneIcon, MagnifyingGlassIcon, ArrowLeftIcon as ChevronLeftIcon, 
    ChatBubbleLeftRightIcon, BriefcaseIcon, ClockIcon, 
    DocumentTextIcon as DocumentIcon, CheckCircleIcon, InformationCircleIcon,
    ArrowPathIcon, UserIcon, BuildingOffice2Icon as BuildingOfficeIcon,
    PencilIcon, LightBulbIcon, MegaphoneIcon, XCircleIcon, ArrowDownTrayIcon,
    PaperClipIcon, DocumentPlusIcon, SparklesIcon, LinkIcon, PhotoIcon
} from '../components/Icons';
import Avatar from '../components/Avatar';
import BackButton from '../components/BackButton';
import { storageService } from '../services/storageService';

const CollaborationWorkspacePage = () => {
    const { id } = useParams<{ id: string }>(); 
    const { user } = useAuth();
    const { 
        getCompany, getPartner, collaborations, sendMessage, getMessages, 
        markMessagesAsRead, frameworks, refreshData, getCollaboration,
        addDecisionToCollaboration, updateCollaborationNotes, updateCollaborationMetrics,
        addFileToCollaboration, removeFileFromCollaboration, updateCollaborationFramework,
        addLinkToCollaboration, removeLinkFromCollaboration,
        isDataLoaded
    } = useAppContext();
    const navigate = useNavigate();
    
    // We might get companyId OR collabId. Let's find the collab.
    const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const isSendingRef = useRef(false);
    const [activeTab, setActiveTab] = useState<'CHAT' | 'FRAMEWORK' | 'FILES'>('CHAT');
    const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
    const [activePhase, setActivePhase] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [frameworkNotes, setFrameworkNotes] = useState('');
    const [frameworkMetrics, setFrameworkMetrics] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [fileSearch, setFileSearch] = useState('');
    const [fileFilter, setFileFilter] = useState<string>('all');
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const phaseFileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        if ((!user && id !== 'demo') || !id || !isDataLoaded) return;

        console.log('[Workspace] Initializing for ID:', id, 'as', user.role);

        const initWorkspace = async () => {
            try {
                let found = collaborations.find(c => c.id === id);
                if (!found) {
                    // Try fallback finding (if ID is profile ID)
                    if (user.role === UserRole.PARTNER) {
                        found = collaborations.find(c => c.companyId === id && c.partnerId === user.profileId);
                    } else {
                        found = collaborations.find(c => c.partnerId === id && c.companyId === user.profileId);
                    }
                }

                if (found) {
                    console.log('[Workspace] Collaboration found:', found.id);
                    setCollaboration(found);
                    if (!activePhase) {
                        const firstPhase = found.framework.phases[0];
                        setActivePhase(firstPhase);
                        setFrameworkNotes(found.notes[firstPhase] || '');
                        setFrameworkMetrics(found.metrics[firstPhase] || '');
                    }
                    await loadMessages(found.id);
                    setHasInitialLoaded(true);
                } else if (id === 'demo') {
                    // Inject mock demo collaboration
                    const mockDemo: Collaboration = {
                        id: 'demo',
                        companyId: 'company-1',
                        partnerId: 'partner-1',
                        status: 'active',
                        projectName: 'Growth Verification Project',
                        startDate: new Date(),
                        framework: {
                            id: 'f-1',
                            name: 'Growth Strategy',
                            phases: ['Foundation', 'Expansion', 'Optimization'],
                            metricsToTrack: ['Registrations', 'DAU'],
                            decisionOutcomes: ['Go', 'No-Go']
                        },
                        notes: {
                            'Foundation': 'This is the initial phase where we set up the core infrastructure.'
                        },
                        metrics: {
                            'Foundation': 'Target: 100 registrations'
                        },
                        files: [
                            {
                                id: 'file-1',
                                name: 'Brand_Guide.pdf',
                                url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                                type: 'file',
                                phase: 'Foundation',
                                uploadedAt: new Date()
                            },
                            {
                                id: 'file-2',
                                name: 'Logo_Draft.png',
                                url: 'https://picsum.photos/seed/soho/800/600',
                                type: 'image',
                                phase: 'Foundation',
                                uploadedAt: new Date()
                            }
                        ],
                        links: [
                            {
                                id: 'link-1',
                                title: 'Design Board',
                                url: 'https://figma.com',
                                phase: 'Foundation'
                            }
                        ],
                        decisionLog: []
                    };
                    setCollaboration(mockDemo);
                    if (!activePhase) {
                        setActivePhase('Foundation');
                        setFrameworkNotes(mockDemo.notes['Foundation']);
                        setFrameworkMetrics(mockDemo.metrics['Foundation']);
                    }
                    setHasInitialLoaded(true);
                } else {
                    console.warn('[Workspace] No collaboration found for ID:', id);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('[Workspace] Initialization error:', err);
                setIsLoading(false);
            }
        };

        initWorkspace();
    }, [id, collaborations, user, isDataLoaded, activePhase]);

    const loadMessages = async (collabId: string) => {
        if (isSendingRef.current) return;
        try {
            const msgs = await getMessages(collabId);
            // Only update if we have new data. If we have local optimistic messages, 
            // wait for the server to catch up before overwriting with an empty state.
            if (msgs && msgs.length > 0) {
                setMessages(msgs);
            } else if (msgs && msgs.length === 0 && !isSendingRef.current) {
                // Only clear if we are sure the conversation is empty
                setMessages([]);
            }
        } catch (error) {
            console.error('[Workspace] Load messages error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, phase?: string, type: 'image' | 'file' = 'file') => {
        if (e.target.files && e.target.files[0] && collaboration) {
            const file = e.target.files[0];
            try {
                setIsUploading(true);
                let url = '';
                
                if (type === 'image' && file.type.startsWith('image/')) {
                    url = await storageService.uploadImage(file, 'logos'); // reuse logos bucket or use a generic one
                } else {
                    url = await storageService.uploadDocument(file);
                }

                await addFileToCollaboration(collaboration.id, {
                    name: file.name,
                    url: url,
                    phase: phase,
                    type: type
                });
                // alert('File uploaded successfully');
            } catch (error) {
                console.error('File upload error:', error);
                alert('Failed to upload file.');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (phaseFileInputRef.current) phaseFileInputRef.current.value = '';
                if (imageInputRef.current) imageInputRef.current.value = '';
            }
        }
    };

    const handleRemoveFile = async (fileId: string) => {
        if (!collaboration) return;
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                await removeFileFromCollaboration(collaboration.id, fileId);
            } catch (error) {
                alert('Failed to delete file.');
            }
        }
    };

    const handleSaveFramework = async () => {
        if (!collaboration || !activePhase) return;
        try {
            setIsSaving(true);
            await updateCollaborationNotes(collaboration.id, activePhase, frameworkNotes);
            await updateCollaborationMetrics(collaboration.id, activePhase, frameworkMetrics);
            alert('Framework progress saved!');
        } catch (error) {
            alert('Failed to save progress.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhaseChange = (phase: string) => {
        if (!collaboration) return;
        setActivePhase(phase);
        setFrameworkNotes(collaboration.notes[phase] || '');
        setFrameworkMetrics(collaboration.metrics[phase] || '');
        setShowLinkInput(false);
        setNewLinkTitle('');
        setNewLinkUrl('');
    };

    const handleAddLink = async () => {
        if (!collaboration || !activePhase || !newLinkUrl.trim()) return;
        try {
            await addLinkToCollaboration(collaboration.id, {
                title: newLinkTitle.trim() || newLinkUrl.trim(),
                url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
                phase: activePhase
            });
            setNewLinkTitle('');
            setNewLinkUrl('');
            setShowLinkInput(false);
        } catch (error) {
            alert('Failed to add link.');
        }
    };

    const handleRemoveLink = async (linkId: string) => {
        if (!collaboration) return;
        if (window.confirm('Remove this link?')) {
            try {
                await removeLinkFromCollaboration(collaboration.id, linkId);
            } catch (error) {
                alert('Failed to remove link.');
            }
        }
    };

    // Auto-scroll messaging
    useEffect(() => {
        if (activeTab === 'CHAT' && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            // Immediate scroll for better UX during message sending
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, activeTab]);

    // Polling
    useEffect(() => {
        if (!collaboration || activeTab !== 'CHAT') return;
        
        const interval = setInterval(() => {
            loadMessages(collaboration.id);
        }, 4000);
        
        return () => clearInterval(interval);
    }, [collaboration, activeTab]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !collaboration || !user || isSending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setIsSending(true);
        isSendingRef.current = true;

        console.log('[Workspace] Sending message to collab:', collaboration.id);

        // Optimistic update
        const tempId = 'temp-' + Date.now();
        const tempMsg: ChatMessage = {
            id: tempId,
            collaborationId: collaboration.id,
            senderId: user.id,
            content,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        setMessages(prev => [...prev, tempMsg]);

        try {
            const sentMsg = await sendMessage(collaboration.id, user.id, content);
            console.log('[Workspace] Message sent successfully:', sentMsg.id);
            // Replace optimistic message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m));
        } catch (error) {
            console.error('[Workspace] Failed to send message:', error);
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setNewMessage(content); // Restore content
            alert('Failed to send message. Please check your connection.');
        } finally {
            setIsSending(false);
            isSendingRef.current = false;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center">
                    <ArrowPathIcon className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <p className="text-gray-400 font-medium tracking-wide">Initializing Portal...</p>
                </div>
            </div>
        );
    }

    if (!collaboration) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center mt-20">
                <div className="w-20 h-20 bg-gray-900 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <InformationCircleIcon className="w-10 h-10 text-gray-600" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Workspace Not Established</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">This collaboration channel hasn't been initialized. If you just accepted a partner, please wait a moment while we set up your secure workspace.</p>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary px-8">Return to Dashboard</button>
            </div>
        );
    }

    const company = getCompany(collaboration.companyId);
    const partner = getPartner(collaboration.partnerId);
    const otherUser = user?.role === UserRole.PARTNER ? company : partner;
    const isPartner = user?.role === UserRole.PARTNER;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="hidden sm:block h-8 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                         <Avatar 
                            src={isPartner ? company?.logoUrl : partner?.avatarUrl} 
                            name={otherUser?.name || 'Partner'} 
                            size="md" 
                         />
                         <div>
                            <h1 className="text-lg font-black text-white tracking-tight leading-none">
                                {otherUser?.name} <span className="text-indigo-500">Portal</span>
                            </h1>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {isPartner ? 'Company Workspace' : 'Partner Collaboration'}
                            </p>
                         </div>
                    </div>
                </div>

                <div className="flex items-center bg-gray-900/40 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setActiveTab('CHAT')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'CHAT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        Messaging
                    </button>
                    <button 
                        onClick={() => setActiveTab('FRAMEWORK')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'FRAMEWORK' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <BriefcaseIcon className="w-4 h-4" />
                        Framework
                    </button>
                    <button 
                        onClick={() => setActiveTab('FILES')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'FILES' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <DocumentIcon className="w-4 h-4" />
                        Documents
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
                {/* Main Content Area */}
                <div className="lg:col-span-3 flex flex-col glass-card border-white/5 bg-gray-950/20 overflow-hidden h-[600px]">
                    {activeTab === 'CHAT' ? (
                        <>
                            {/* Messages */}
                            <div 
                                ref={scrollContainerRef}
                                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                            >
                                {messages.length === 0 && hasInitialLoaded ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-700 mb-4" />
                                        <h4 className="text-lg font-bold text-gray-400">Establish the Connection</h4>
                                        <p className="text-sm text-gray-500 mt-2 max-w-xs">Introduce yourself and start aligning on your growth strategy. This is a private space for collaboration.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {messages.map((msg, idx) => {
                                            const isMe = msg.senderId === user?.id;
                                            const showDate = idx === 0 || new Date(messages[idx-1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
                                            
                                            return (
                                                <div key={msg.id}>
                                                    {showDate && (
                                                        <div className="text-center my-6">
                                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-white/2 px-4 py-1 rounded-full border border-white/5">
                                                                {new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                        <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                            <div className={`
                                                                p-4 rounded-2xl relative shadow-xl
                                                                ${isMe 
                                                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                                    : 'bg-gray-800/80 text-gray-100 border border-white/5 rounded-tl-none'}
                                                            `}>
                                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                            </div>
                                                            <span className="text-[9px] text-gray-500 mt-1.5 font-medium px-1 flex items-center gap-1">
                                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {isMe && (
                                                                    <CheckCircleIcon className={`w-3 h-3 ${msg.read ? 'text-indigo-400' : 'text-gray-600'}`} />
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/5 bg-gray-900/20">
                                <form onSubmit={handleSendMessage} className="relative flex items-end gap-3">
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                            placeholder="Message..."
                                            className="w-full bg-gray-800/60 border border-white/10 rounded-2xl py-3.5 px-5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none min-h-[56px] max-h-32 text-sm"
                                            rows={1}
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className={`
                                            btn p-3.5 rounded-2xl h-[56px] w-[56px] flex items-center justify-center shrink-0 transition-all
                                            ${newMessage.trim() && !isSending ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                                        `}
                                    >
                                        {isSending ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : activeTab === 'FRAMEWORK' ? (
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 border-b border-white/5 bg-gray-900/10 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <BriefcaseIcon className="w-6 h-6 text-indigo-400" />
                                    Execution Framework
                                </h2>
                                <button 
                                    onClick={handleSaveFramework}
                                    disabled={isSaving}
                                    className="btn btn-primary px-6 py-2 text-xs"
                                >
                                    {isSaving ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : <CheckCircleIcon className="w-4 h-4 mr-2" />}
                                    Save Progress
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {collaboration.framework.phases.map((phase, idx) => (
                                        <button 
                                            key={phase}
                                            onClick={() => handlePhaseChange(phase)}
                                            className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col gap-1 items-start text-left ${
                                                activePhase === phase 
                                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                                                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="text-[10px] opacity-60">Phase {idx+1}</span>
                                            {phase}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <PencilIcon className="w-4 h-4 text-indigo-400" />
                                            Progress Notes ({activePhase})
                                        </label>
                                        <textarea 
                                            className="form-textarea h-64 bg-gray-900/40 border-white/10 focus:border-indigo-500/50 transition-all resize-none"
                                            placeholder="Document current blockers, wins, and updates..."
                                            value={frameworkNotes}
                                            onChange={(e) => setFrameworkNotes(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                         <label className="text-sm font-bold text-white flex items-center gap-2">
                                            <LightBulbIcon className="w-4 h-4 text-amber-400" />
                                            Key Metrics & KPIs
                                        </label>
                                        <textarea 
                                            className="form-textarea h-64 bg-gray-900/40 border-white/10 focus:border-amber-500/50 transition-all resize-none"
                                            placeholder="Track growth metrics for this stage..."
                                            value={frameworkMetrics}
                                            onChange={(e) => setFrameworkMetrics(e.target.value)}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-4 pt-6 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-white flex items-center gap-2">
                                                <PaperClipIcon className="w-4 h-4 text-emerald-400" />
                                                Phase Assets & Links
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="file" 
                                                    ref={phaseFileInputRef} 
                                                    onChange={(e) => handleFileUpload(e, activePhase)} 
                                                    className="hidden" 
                                                />
                                                <input 
                                                    type="file" 
                                                    ref={imageInputRef} 
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, activePhase, 'image')} 
                                                    className="hidden" 
                                                />
                                                
                                                <button 
                                                    onClick={() => setShowLinkInput(!showLinkInput)}
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${showLinkInput ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'}`}
                                                >
                                                    <LinkIcon className="w-3 h-3" />
                                                    Add Link
                                                </button>
                                                <button 
                                                    onClick={() => imageInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                                >
                                                    {isUploading ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <PhotoIcon className="w-3 h-3" />}
                                                    Add Image
                                                </button>
                                                <button 
                                                    onClick={() => phaseFileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                                                >
                                                    {isUploading ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <DocumentPlusIcon className="w-3 h-3" />}
                                                    Add Doc
                                                </button>
                                            </div>
                                        </div>

                                        {showLinkInput && (
                                            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 animate-in slide-in-from-top-2 duration-200">
                                                <input 
                                                    type="text" 
                                                    placeholder="Link Title (e.g. Design Board)" 
                                                    value={newLinkTitle}
                                                    onChange={(e) => setNewLinkTitle(e.target.value)}
                                                    className="flex-1 bg-black/20 border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="URL (e.g. figma.com/...)" 
                                                    value={newLinkUrl}
                                                    onChange={(e) => setNewLinkUrl(e.target.value)}
                                                    className="flex-1 bg-black/20 border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                                                />
                                                <button 
                                                    onClick={handleAddLink}
                                                    disabled={!newLinkUrl.trim()}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase disabled:opacity-50"
                                                >
                                                    Connect Link
                                                </button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Links */}
                                            {collaboration.links?.filter(l => l.phase === activePhase).map(link => (
                                                 <div key={link.id} className="group relative bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-center justify-between">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                                            <LinkIcon className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-gray-200 truncate" title={link.title}>{link.title}</p>
                                                            <p className="text-[8px] text-indigo-400/60 font-black uppercase truncate">
                                                                {(() => {
                                                                    try {
                                                                        return new URL(link.url).hostname;
                                                                    } catch {
                                                                        return 'Link';
                                                                    }
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white">
                                                            <PaperAirplaneIcon className="w-3 h-3 -rotate-45" />
                                                        </a>
                                                        <button onClick={() => handleRemoveLink(link.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-gray-500 hover:text-rose-400">
                                                            <XCircleIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                 </div>
                                            ))}

                                            {/* Files */}
                                            {collaboration.files?.filter(f => f.phase === activePhase).map(file => (
                                                 <div key={file.id} className="group relative bg-gray-900/60 p-3 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {file.type === 'image' ? (
                                                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/5">
                                                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                                                <DocumentPlusIcon className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-gray-200 truncate" title={file.name}>{file.name}</p>
                                                            <p className="text-[8px] text-gray-500 font-bold uppercase">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white">
                                                            <ArrowDownTrayIcon className="w-3 h-3" />
                                                        </a>
                                                        <button onClick={() => handleRemoveFile(file.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-gray-500 hover:text-rose-400">
                                                            <XCircleIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                 </div>
                                            ))}
                                            
                                            {(!collaboration.links?.filter(l => l.phase === activePhase).length && !collaboration.files?.filter(f => f.phase === activePhase).length) && (
                                                <div className="sm:col-span-2 lg:col-span-3 py-8 text-center bg-white/2 rounded-xl border border-dashed border-white/10">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">No assets or links for this phase</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden">
                             <div className="p-6 border-b border-white/5 bg-gray-900/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <DocumentIcon className="w-6 h-6 text-indigo-400" />
                                        Document Repository
                                    </h2>
                                    <div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={(e) => handleFileUpload(e)} 
                                            className="hidden" 
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="btn btn-secondary px-6 py-2 text-xs"
                                        >
                                            {isUploading ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : <DocumentPlusIcon className="w-4 h-4 mr-2" />}
                                            Upload Document
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input 
                                            type="text"
                                            placeholder="Search documents..."
                                            value={fileSearch}
                                            onChange={(e) => setFileSearch(e.target.value)}
                                            className="w-full bg-gray-800/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    <select 
                                        value={fileFilter}
                                        onChange={(e) => setFileFilter(e.target.value)}
                                        className="bg-gray-800/40 border border-white/5 rounded-xl py-2 px-4 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                    >
                                        <option value="all">All Phases</option>
                                        <option value="general">General (No Phase)</option>
                                        {collaboration.framework.phases.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                                {collaboration.files && collaboration.files.length > 0 ? (() => {
                                    const filtered = collaboration.files.filter(f => {
                                        const matchesSearch = f.name.toLowerCase().includes(fileSearch.toLowerCase());
                                        const matchesFilter = fileFilter === 'all' 
                                            || (fileFilter === 'general' && !f.phase)
                                            || (f.phase === fileFilter);
                                        return matchesSearch && matchesFilter;
                                    });

                                    if (filtered.length === 0) {
                                        return (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                                                <MagnifyingGlassIcon className="w-16 h-16 text-gray-700 mb-4" />
                                                <h4 className="text-lg font-bold text-gray-400">No matches found</h4>
                                                <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {filtered.map(file => (
                                                <div key={file.id} className="group flex flex-col bg-gray-900/40 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all overflow-hidden">
                                                    <div className="relative aspect-video bg-gray-800 flex items-center justify-center overflow-hidden border-b border-white/5">
                                                        {file.type === 'image' ? (
                                                            <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 text-gray-600">
                                                                <DocumentPlusIcon className="w-12 h-12 opacity-20" />
                                                                <span className="text-[10px] uppercase font-black tracking-widest">{file.name.split('.').pop()}</span>
                                                            </div>
                                                        )}
                                                        
                                                        {file.phase && (
                                                            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-indigo-500/80 backdrop-blur-sm text-[8px] font-black text-white uppercase tracking-wider">
                                                                {file.phase}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-4 flex flex-col gap-1">
                                                        <p className="text-xs font-bold text-white truncate" title={file.name}>{file.name}</p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <a 
                                                                    href={file.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                                                >
                                                                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                                                </a>
                                                                <button 
                                                                    onClick={() => handleRemoveFile(file.id)}
                                                                    className="p-1.5 rounded-lg bg-rose-500/5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10"
                                                                >
                                                                    <XCircleIcon className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })() : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
                                        <SparklesIcon className="w-16 h-16 text-gray-700 mb-4" />
                                        <h4 className="text-lg font-bold text-gray-400">Your Secure Vault</h4>
                                        <p className="text-sm text-gray-500 mt-2 max-w-xs">Upload contracts, NDAs, and marketing assets. Only you and your partner can access these files.</p>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="btn btn-secondary mt-8"
                                        >
                                            Upload Your First File
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6 hidden lg:block overflow-y-auto pr-2">
                    <div className="glass-card p-6 border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                                <ClockIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase">Started On</p>
                                <p className="text-sm text-gray-200 font-bold">{new Date(collaboration.startDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400">
                                <CheckCircleIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase">Active Strategy</p>
                                <p className="text-sm text-gray-200 font-bold">{collaboration.framework.name}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Portal Participants</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar src={company?.logoUrl} name={company?.name || 'Company'} size="sm" />
                                        <span className="text-xs text-gray-300 font-medium truncate max-w-[100px]">{company?.name}</span>
                                    </div>
                                    <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase">Founder</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar src={partner?.avatarUrl} name={partner?.name || 'Partner'} size="sm" />
                                        <span className="text-xs text-gray-300 font-medium truncate max-w-[100px]">{partner?.name}</span>
                                    </div>
                                    <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-black uppercase">Partner</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-400 mb-1">
                            <InformationCircleIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase">Collaboration Tip</span>
                        </div>
                        <p className="text-[10px] text-amber-200/60 leading-relaxed italic">
                            Clear communication of KPIs in the messaging channel improves success rates by 40%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollaborationWorkspacePage;