
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogs } from '../data/blogsData';
import SEO from '../components/SEO';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, TwitterIcon, LinkedInIcon, ChevronDownIcon, ChevronUpIcon, LinkIcon } from '../components/Icons';

const BlogDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const blog = blogs.find(b => b.id === id);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);


    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Close share menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showShareMenu && !target.closest('.share-menu-container')) {
                setShowShareMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showShareMenu]);

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
                <p className="text-gray-400 mb-8">The article you are looking for does not exist or has been moved.</p>
                <Link to="/blogs" className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-semibold hover:bg-indigo-500 transition-colors">
                    Back to Blog
                </Link>
            </div>
        );
    }

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const currentUrl = window.location.href;
    const shareTitle = blog?.title || '';
    const shareText = blog?.excerpt || '';

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
    };

    const shareOnWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`, '_blank');
    };

    const shareViaEmail = () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + currentUrl)}`;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-gray-100 pb-20">
            <SEO 
                title={blog.title}
                description={blog.excerpt}
                keywords={blog.tags}
                type="article"
                image={blog.images[0]}
            />
            
            {/* Header / Nav */}
            <div className="sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--glass-border)]">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back
                    </button>
                    
                    {/* Share Button with Dropdown */}
                    <div className="relative share-menu-container">
                        <button 
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all font-medium text-sm"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                        </button>

                        {/* Share Dropdown Menu */}
                        {showShareMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#1a2332] border border-[#2d3b4e] rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                                <div className="p-2 space-y-1">
                                    {/* Copy Link */}
                                    <button
                                        onClick={copyToClipboard}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg transition-all group"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                        <span className="flex-1 text-sm font-medium">
                                            {copySuccess ? 'Link Copied!' : 'Copy Link'}
                                        </span>
                                        {copySuccess && (
                                            <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>

                                    <div className="h-px bg-[#2d3b4e] my-1"></div>

                                    {/* Twitter */}
                                    <button
                                        onClick={shareOnTwitter}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] rounded-lg transition-all"
                                    >
                                        <TwitterIcon className="h-4 w-4" />
                                        <span className="text-sm font-medium">Share on Twitter</span>
                                    </button>

                                    {/* LinkedIn */}
                                    <button
                                        onClick={shareOnLinkedIn}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] rounded-lg transition-all"
                                    >
                                        <LinkedInIcon className="h-4 w-4" />
                                        <span className="text-sm font-medium">Share on LinkedIn</span>
                                    </button>

                                    {/* Facebook */}
                                    <button
                                        onClick={shareOnFacebook}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-[#1877F2]/10 hover:text-[#1877F2] rounded-lg transition-all"
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        <span className="text-sm font-medium">Share on Facebook</span>
                                    </button>

                                    {/* WhatsApp */}
                                    <button
                                        onClick={shareOnWhatsApp}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-[#25D366]/10 hover:text-[#25D366] rounded-lg transition-all"
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                        <span className="text-sm font-medium">Share on WhatsApp</span>
                                    </button>

                                    {/* Email */}
                                    <button
                                        onClick={shareViaEmail}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-300 hover:bg-gray-500/10 hover:text-gray-200 rounded-lg transition-all"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm font-medium">Share via Email</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 pt-10">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-medium border border-indigo-500/20">
                        {blog.tags[0]}
                    </span>
                    <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1.5" />
                        {blog.date}
                    </span>
                    <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1.5" />
                        {blog.readTime}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                    {blog.title}
                </h1>

                {/* Featured Image */}
                <div className="rounded-2xl overflow-hidden mb-10 border border-white/10 shadow-2xl">
                    <img 
                        src={blog.images[0]} 
                        alt={blog.title} 
                        className="w-full h-auto object-cover max-h-[500px]"
                    />
                </div>

                {/* Content */}
                <div 
                    className="prose prose-invert prose-lg max-w-none text-gray-300 mb-12"
                    dangerouslySetInnerHTML={{ __html: blog.content }} 
                />

                {/* Second Image */}
                <div className="my-12 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                    <img 
                        src={blog.images[1]} 
                        alt="Related visual" 
                        className="w-full h-auto object-cover max-h-[400px]"
                    />
                    <p className="p-3 bg-gray-900/50 text-center text-gray-500 text-sm italic">
                        Visualizing the impact of {blog.title}
                    </p>
                </div>

                {/* Author Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-16 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {blog.author.charAt(0)}
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-0.5">Written by</p>
                        <h4 className="text-white font-bold text-lg">{blog.author}</h4>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 text-sm">?</span>
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {blog.faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className="border border-white/10 rounded-xl bg-white/5 overflow-hidden transition-all duration-300 hover:border-white/20"
                            >
                                <button 
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                >
                                    <span className="font-medium text-white">{faq.question}</span>
                                    {openFaq === index ? (
                                        <ChevronUpIcon className="h-5 w-5 text-indigo-400" />
                                    ) : (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                    )}
                                </button>
                                <div 
                                    className={`px-5 text-gray-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    {faq.answer}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogDetailPage;
