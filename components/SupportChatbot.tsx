
import React, { useState, useRef, useEffect } from 'react';
import { 
    ChatBubbleLeftRightIcon, 
    XMarkIcon, 
    PaperAirplaneIcon
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
                <div className="mb-4 w-[90vw] max-w-[540px] bg-[#1a2332] border border-[#2d3b4e] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-[#1a2332] p-5 border-b border-[#2d3b4e]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-base">Soho Space Concierge</h3>
                                <p className="text-gray-400 text-xs italic">Our intelligence team typically responds within 24 hours.</p>
                            </div>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="p-5 bg-[#1a2332] border-b border-[#2d3b4e]">
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                            selectedCategory === cat.id
                                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                                                : 'bg-[#0f1621] text-gray-400 hover:bg-[#2d3b4e] border border-[#2d3b4e]'
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
                    <div className="flex-grow p-5 overflow-y-auto space-y-3 bg-[#0f1621] max-h-[250px]">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                                        msg.sender === 'user' 
                                            ? 'bg-cyan-500 text-white rounded-tr-none' 
                                            : 'bg-[#1a2332] text-gray-300 rounded-tl-none border border-[#2d3b4e]'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-5 bg-[#1a2332] border-t border-[#2d3b4e] space-y-3">
                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                Your Email
                            </label>
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-[#0f1621] border border-[#2d3b4e] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                            />
                        </div>

                        {/* Message Input */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                                How can we help?
                            </label>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Describe your issue or suggestion..."
                                required
                                rows={3}
                                className="w-full bg-[#0f1621] border border-[#2d3b4e] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={!selectedCategory || !userEmail || !inputValue.trim() || isSubmitting}
                            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
                        >
                            <PaperAirplaneIcon className="h-4 w-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>

                        {/* Footer */}
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <span className="text-xs text-gray-500">Powered by</span>
                            <span className="text-xs font-bold text-cyan-400">ENTREXT SUPPORT</span>
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">v2.0</span>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                data-testid="support-toggle"
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    isOpen 
                        ? 'bg-rose-500 hover:bg-rose-600' 
                        : 'bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500'
                }`}
            >
                {isOpen ? (
                    <XMarkIcon className="h-7 w-7 text-white" />
                ) : (
                    <div className="relative">
                        <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default SupportChatbot;
