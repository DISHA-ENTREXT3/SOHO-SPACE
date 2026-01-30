
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogs } from '../data/blogsData';
import SEO from '../components/SEO';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, TwitterIcon, LinkedInIcon, ChevronDownIcon, ChevronUpIcon } from '../components/Icons';

const BlogDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const blog = blogs.find(b => b.id === id);
    const [openFaq, setOpenFaq] = React.useState<number | null>(null);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

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
                    <div className="flex gap-4">
                        <button className="text-gray-400 hover:text-[#1DA1F2] transition-colors">
                            <TwitterIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-[#0A66C2] transition-colors">
                            <LinkedInIcon className="h-5 w-5" />
                        </button>
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
