
import React, { useState, useRef, useEffect } from 'react';
import { 
    ChatBubbleLeftRightIcon, 
    XMarkIcon, 
    PaperAirplaneIcon, 
    UserIcon, 
    EnvelopeIcon, 
    TagIcon 
} from './Icons';
import { useAuth } from '../context/AuthContext';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    type?: 'text' | 'options';
    options?: string[];
}

interface SupportForm {
    name: string;
    email: string;
    category: string;
    message: string;
}

const SupportChatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [step, setStep] = useState<'init' | 'name' | 'email' | 'category' | 'message' | 'submitting' | 'done'>('init');
    const [formData, setFormData] = useState<SupportForm>({
        name: '',
        email: '',
        category: '',
        message: ''
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Initialize chat when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            startChat();
        }
    }, [isOpen]);

    const addMessage = (text: string, sender: 'bot' | 'user', type: 'text' | 'options' = 'text', options?: string[]) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date(),
            type,
            options
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const startChat = () => {
        // Delay slightly for natural feel
        setTimeout(() => {
            addMessage("Hi! I'm the Soho Support Bot. How can I help you today?", 'bot');
            
            if (user) {
                setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
                setTimeout(() => {
                    addMessage(`I see you're logged in as ${user.name}.`, 'bot');
                    askCategory();
                }, 800);
            } else {
                setTimeout(() => {
                    addMessage("First, what's your name?", 'bot');
                    setStep('name');
                }, 800);
            }
        }, 500);
    };

    const askEmail = () => {
        setTimeout(() => {
            addMessage("Great! What's your email address so we can get back to you?", 'bot');
            setStep('email');
        }, 500);
    };

    const askCategory = () => {
        setTimeout(() => {
            addMessage("What kind of request is this?", 'bot', 'options', ['Feedback', 'Bug', 'Feature', 'Support']);
            setStep('category');
        }, 500);
    };

    const askMessage = () => {
        setTimeout(() => {
            addMessage("Please describe your issue or feedback in detail.", 'bot');
            setStep('message');
        }, 500);
    };

    const handleInputSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() && step !== 'category') return;

        // User message
        if (inputValue) {
            addMessage(inputValue, 'user');
            setInputValue('');
        }

        processStep(inputValue);
    };

    const handleOptionClick = (option: string) => {
        addMessage(option, 'user');
        setFormData(prev => ({ ...prev, category: option }));
        processStep(option);
    };

    const processStep = (value: string) => {
        switch (step) {
            case 'name':
                setFormData(prev => ({ ...prev, name: value }));
                askEmail();
                break;
            case 'email':
                // Basic email validation
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    setTimeout(() => addMessage("That doesn't look like a valid email. Please try again.", 'bot'), 500);
                    return;
                }
                setFormData(prev => ({ ...prev, email: value }));
                askCategory();
                break;
            case 'category':
                // Already handled by option click mostly, but if typed
                setFormData(prev => ({ ...prev, category: value })); // Normalize later
                askMessage();
                break;
            case 'message':
                setFormData(prev => ({ ...prev, message: value }));
                submitTicket(value);
                break;
        }
    };

    const submitTicket = async (finalMessage: string) => {
        setStep('submitting');
        addMessage("Sending your ticket...", 'bot');

        try {
            const payload = {
                product: "Soho Space",
                category: formData.category.toLowerCase() || 'support',
                message: finalMessage,
                user_email: formData.email,
                metadata: {
                    name: formData.name,
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

            addMessage("Success! We've received your ticket and will get back to you soon.", 'bot');
            setStep('done');

        } catch (error) {
            console.error('Submission error:', error);
            addMessage("Oops! Something went wrong submitting your ticket. Please try again later.", 'bot');
            setStep('done'); // Or retry logic
        }
    };

    const resetChat = () => {
        setMessages([]);
        setStep('init');
        setFormData({ name: '', email: '', category: '', message: '' });
        startChat();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Soho Support</h3>
                                <p className="text-indigo-200 text-xs">Always here to help</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#111]">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                        msg.sender === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-white/10 text-gray-200 rounded-tl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        
                        {/* Options Display */}
                        {messages.length > 0 && messages[messages.length - 1].type === 'options' && step === 'category' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {messages[messages.length - 1].options?.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionClick(option)}
                                        className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#0A0A0A] border-t border-white/10">
                        {step === 'done' ? (
                            <button 
                                onClick={resetChat}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
                            >
                                Start New Conversation
                            </button>
                        ) : step === 'category' ? (
                             <p className="text-center text-xs text-gray-500">Select an option above</p>
                        ) : (
                            <form onSubmit={handleInputSubmit} className="relative">
                                <input
                                    type={step === 'email' ? 'email' : 'text'}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                    autoFocus
                                />
                                <button 
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <PaperAirplaneIcon className="h-4 w-4" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                    isOpen 
                        ? 'bg-rose-500 hover:bg-rose-600 rotate-90' 
                        : 'bg-indigo-600 hover:bg-indigo-500'
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
