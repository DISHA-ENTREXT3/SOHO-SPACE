
import React, { useState } from 'react';
import { 
    ChatBubbleLeftRightIcon, 
    MegaphoneIcon, 
    LightBulbIcon, 
    XCircleIcon, 
    ArrowRightIcon, 
    CalendarIcon,
    UserCircleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon
} from '../components/Icons';
import SEO from '../components/SEO';
import { supportClient } from '../services/supportClient';

interface FeedbackSubmission {
    name: string;
    date: string;
    category: string;
    content: string;
}

// Sub-component for individual feedback items
const FeedbackItem = ({ name, date, category, content }: FeedbackSubmission) => {
    const getCategoryStyles = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'complaint': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'bug': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'idea': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
        }
    };

    return (
        <div className="bg-gray-900/40 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-white font-semibold">{name}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {date}
                        </p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryStyles(category)}`}>
                    {category}
                </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed italic">
                "{content}"
            </p>
        </div>
    );
};

const FeedbackPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: 'Feedback',
        details: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([
        {
            name: 'Alex Rivera',
            date: 'Jan 10, 2026 • 2:30 PM',
            category: 'Idea',
            content: 'It would be great if we could have a direct messaging feature between founders and partners before the official workspace is created.'
        },
        {
            name: 'Sarah Chen',
            date: 'Jan 09, 2026 • 11:15 AM',
            category: 'Feedback',
            content: 'The onboarding process was incredibly smooth. Love the AI matching accuracy!'
        },
        {
            name: 'James Wilson',
            date: 'Jan 08, 2026 • 4:45 PM',
            category: 'Bug',
            content: 'Found a small display glitch in the analytics dashboard when switching between monthly and weekly views on mobile.'
        }
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.email) {
            setError('Email is required');
            return;
        }
        
        if (!formData.details) {
            setError('Please provide some details');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Submit to support client
            await supportClient.submitTicket({
                product: "Soho Space",
                category: formData.category.toLowerCase() as "feedback" | "bug" | "feature" | "support",
                user_email: formData.email,
                message: formData.details,
                metadata: {
                    name: formData.name,
                    phone: formData.phone,
                    page: window.location.pathname
                }
            });

            // Add to local submissions for UI
            const newSubmission = {
                name: formData.name || 'Anonymous',
                date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                category: formData.category,
                content: formData.details
            };
            setSubmissions([newSubmission, ...submissions]);
            
            // Reset form and show success
            setFormData({ name: '', email: '', phone: '', category: 'Feedback', details: '' });
            setSuccess(true);
            
            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error('Support ticket submission error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-gray-100 pb-20">
            <SEO 
                title="Feedback"
                description="Share your feedback, raise complaints, or suggest improvements for Soho Space. We're committed to building the best growth partnership platform."
                keywords={['feedback', 'customer support', 'complaints', 'suggestions']}
                type="website"
            />
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px]" />
                </div>
                
                <div className="relative max-w-4xl mx-auto text-center">
                    <span className="text-rose-500 font-bold text-xs uppercase tracking-widest mb-4 inline-block">
                        Customer Forum
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                        Complaints & Feedback
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Raise a complaint, share feedback, or drop an idea. We’ll route it to the right team and follow up immediately.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="px-4 relative z-10">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name" 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Email <span className="text-rose-400">*</span></label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com" 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone (Optional)</label>
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 000-0000" 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                    <select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                    >
                                        <option value="Feedback" className="bg-gray-900">Feedback</option>
                                        <option value="Complaint" className="bg-gray-900">Complaint</option>
                                        <option value="Idea" className="bg-gray-900">Idea</option>
                                        <option value="Bug" className="bg-gray-900">Bug</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Share details</label>
                                    <textarea 
                                        name="details"
                                        required
                                        value={formData.details}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="How can we help you?" 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                                    <ExclamationCircleIcon className="h-5 w-5 text-rose-400 flex-shrink-0" />
                                    <p className="text-rose-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                                    <p className="text-emerald-400 text-sm">Feedback submitted successfully! We'll get back to you soon.</p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl hover:from-rose-400 hover:to-rose-500 transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Feedback
                                            <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Submissions Section */}
            <section className="mt-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-px flex-grow bg-white/10"></div>
                        <h2 className="text-2xl font-bold text-white whitespace-nowrap px-4">Latest Submissions</h2>
                        <div className="h-px flex-grow bg-white/10"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        {submissions.map((item, index) => (
                            <FeedbackItem 
                                key={index}
                                {...item}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FeedbackPage;
