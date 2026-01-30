
import React, { useState, useRef, useEffect } from 'react';
import { 
    ChatBubbleLeftIcon, 
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
                addMessage("Intelligence team is online. How can we optimize your growth?", 'bot');
            }, 300);
            
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

            if (!response.ok) throw new Error(data.error || 'Failed to submit');

            setTimeout(() => {
                addMessage("Transmission received. We'll synchronize shortly.", 'bot');
            }, 500);

            setInputValue('');
            setSelectedCategory(null);

        } catch (error) {
            console.error('Submission error:', error);
            setTimeout(() => {
                addMessage("⚠ Transmission failure. Retry or email support@entrext.in", 'bot');
            }, 500);
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { id: 'support', label: 'Support', icon: ChatBubbleBottomCenterTextIcon },
        { id: 'bug', label: 'Bug', icon: BugAntIcon },
        { id: 'feature', label: 'Feature', icon: LightBulbIcon },
        { id: 'feedback', label: 'Feedback', icon: ChatBubbleLeftIcon }
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[90vw] max-w-[380px] pointer-events-auto animate-fade-in-up">
                    <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden">
                        {/* Header - Minimalist */}
                        <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-indigo-600/10 to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                <div>
                                    <h3 className="text-white text-sm font-black uppercase tracking-widest">Growth Concierge</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">Protocol Active</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-500 hover:text-white"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Category Grid - Compact */}
                        <div className="p-4 bg-white/[0.02]">
                            <div className="grid grid-cols-4 gap-2">
                                {categories.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(cat.id)}
                                            className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all border ${
                                                isActive
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-105'
                                                    : 'bg-white/5 text-gray-400 border-transparent hover:border-white/10 hover:text-white'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="p-6 overflow-y-auto space-y-4 max-h-[220px] min-h-[120px] scrollbar-hide">
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                            msg.sender === 'user' 
                                                ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                                                : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area - Sleeker */}
                        <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-white/[0.02] border-t border-white/5">
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="Identifier (Email)"
                                required
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-[10px] font-black uppercase tracking-widest"
                            />
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Transmission requirements..."
                                required
                                rows={2}
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-xs resize-none leading-relaxed font-medium"
                            />
                            <button 
                                type="submit"
                                disabled={!selectedCategory || !userEmail || !inputValue.trim() || isSubmitting}
                                className="w-full py-3 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-indigo-600/20"
                            >
                                <PaperAirplaneIcon className="h-3 w-3" />
                                {isSubmitting ? 'Transmitting...' : 'Initiate Sync'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Circular Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                data-testid="support-toggle"
                className={`w-14 h-14 rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.4)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 pointer-events-auto relative group ${
                    isOpen 
                        ? 'bg-white/10 backdrop-blur-md border border-white/20' 
                        : 'bg-[#00f2fe] hover:bg-[#00d2de]'
                }`}
            >
                {isOpen ? (
                    <XMarkIcon className="h-6 w-6 text-white" />
                ) : (
                    <div className="relative">
                        <ChatBubbleLeftIcon className="h-6 w-6 text-black" strokeWidth={2.5} />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600 border border-white/20"></span>
                        </span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default SupportChatbot;
