
import React, { useState, useRef, useEffect } from 'react';
import { 
    ChatBubbleLeftRightIcon, 
    XMarkIcon, 
    PaperAirplaneIcon,
    SparklesIcon
} from './Icons';
import { 
    BugAntIcon,
    LightBulbIcon,
    ChatBubbleBottomCenterTextIcon
} from './IconsAdditions';
import { useAuth } from '../context/AuthContext';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
}

const SupportChatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setTimeout(() => {
                addMessage("Our intelligence team typically responds within 24 hours.", 'bot');
            }, 300);
            
            // Pre-fill email if user is logged in
            if (user?.email) {
                setUserEmail(user.email);
            }
        }
    }, [isOpen]);

    const addMessage = (text: string, sender: 'bot' | 'user') => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedCategory || !userEmail || !inputValue.trim()) {
            return;
        }

        // Add user message to chat
        addMessage(inputValue, 'user');
        setIsSubmitting(true);

        try {
            const payload = {
                product: "Soho Space",
                category: selectedCategory.toLowerCase(),
                message: inputValue,
                user_email: userEmail,
                metadata: {
                    name: user?.name || 'Guest',
                    page: window.location.pathname
                }
            };

            const response = await fetch('/api/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit');
            }

            setTimeout(() => {
                addMessage("✓ Ticket submitted successfully! We'll get back to you soon.", 'bot');
            }, 500);

            // Reset form
            setInputValue('');
            setSelectedCategory(null);

        } catch (error) {
            console.error('Submission error:', error);
            setTimeout(() => {
                addMessage("⚠ Something went wrong. Please try again or email us at support@entrext.in", 'bot');
            }, 500);
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { id: 'support', label: 'Support', icon: ChatBubbleBottomCenterTextIcon },
        { id: 'bug', label: 'Report Bug', icon: BugAntIcon },
        { id: 'feature', label: 'Request Feature', icon: LightBulbIcon },
        { id: 'feedback', label: 'Feedback', icon: ChatBubbleLeftRightIcon }
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[90vw] max-w-[480px] glass-card flex flex-col overflow-hidden animate-fade-in-up border border-[var(--glass-border)] rounded-[var(--border-radius-xl)] shadow-[var(--shadow-xl)] bg-[var(--bg-secondary)]/95">
                    {/* Header */}
                    <div className="p-6 border-b border-[var(--glass-border)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[var(--gradient-primary)] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <SparklesIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[var(--text-primary)] font-bold text-lg leading-tight group-hover:text-indigo-400 transition-colors">
                                    Soho Space Concierge
                                </h3>
                                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.2em] font-black mt-1">
                                    Operational Support Protocol
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="p-6 bg-[var(--bg-primary)]/50 border-b border-[var(--glass-border)]">
                        <label className="block text-[10px] font-black text-[var(--text-muted)] mb-4 uppercase tracking-[0.3em]">Select Operation Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                            selectedCategory === cat.id
                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/20'
                                                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--glass-border)] hover:border-indigo-600/30 hover:text-[var(--text-primary)]'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-[var(--bg-primary)]/30 min-h-[180px] max-h-[250px] scrollbar-hide">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-tl-none border border-[var(--glass-border)]'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--glass-border)] space-y-6">
                        {/* Email Input */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                                Network Identifier (Email)
                            </label>
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="alias@nexus.io"
                                required
                                className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl px-5 py-3.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Message Input */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                                Transmission Content
                            </label>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Describe your growth request or technical anomaly..."
                                required
                                rows={3}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl px-5 py-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm resize-none leading-relaxed font-medium"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={!selectedCategory || !userEmail || !inputValue.trim() || isSubmitting}
                            className="w-full py-5 bg-[var(--gradient-primary)] text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(99,102,241,0.3)] active:scale-95 group"
                        >
                            <PaperAirplaneIcon className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            {isSubmitting ? 'Transmitting...' : 'Initiate Transmission'}
                        </button>

                        {/* Footer */}
                        <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/5">
                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Powered by</span>
                            <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                                <span className="text-[9px] font-black text-indigo-400">ENTREXT</span>
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30 font-black">SUPPORT</span>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                data-testid="support-toggle"
                className={`w-16 h-16 rounded-[1.5rem] shadow-[var(--shadow-xl)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 relative overflow-hidden group ${
                    isOpen 
                        ? 'bg-rose-500' 
                        : 'bg-indigo-600'
                }`}
            >
                {/* Ping Animation */}
                {!isOpen && (
                    <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full" />
                )}
                
                {isOpen ? (
                    <XMarkIcon className="h-7 w-7 text-white relative z-10" />
                ) : (
                    <div className="relative z-10">
                        <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border border-white/20"></span>
                        </span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default SupportChatbot;
