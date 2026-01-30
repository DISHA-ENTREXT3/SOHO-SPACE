
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogs } from '../data/blogsData';
import SEO from '../components/SEO';
import { ArrowRightIcon, MagnifyingGlassIcon } from '../components/Icons';

const BlogsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Extract all unique tags
    const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)));

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = selectedTag ? blog.tags.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    });

    return (
        <div className="min-h-screen bg-transparent text-gray-100 pb-20">
            <SEO 
                title="Blog"
                description="Insights, stories, and growth strategies from the Soho Space team and community."
                keywords={['blog', 'growth', 'startups', 'business', 'technology']}
                type="website"
            />
            
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-4 inline-block">
                        The Growth Journal
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                        Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Stories</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
                        Explore the latest trends, strategies, and stories from the world of business, technology, and entrepreneurship.
                    </p>

                    {/* Search and Filter */}
                    <div className="max-w-xl mx-auto relative mb-8">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        <button 
                            onClick={() => setSelectedTag(null)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!selectedTag ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            All
                        </button>
                        {allTags.map(tag => (
                            <button 
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tag === selectedTag ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="px-4 max-w-7xl mx-auto">
                {filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map(blog => (
                            <Link 
                                key={blog.id} 
                                to={`/blog/${blog.id}`}
                                className="group flex flex-col bg-gray-900/40 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-gray-900/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10 opacity-60" />
                                    <img 
                                        src={blog.images[0]} 
                                        alt={blog.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        {blog.tags.slice(0, 1).map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                        <span>{blog.date}</span>
                                        <span>•</span>
                                        <span>{blog.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-indigo-400 transition-colors">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                                        <span className="text-xs text-gray-400 font-medium">By {blog.author}</span>
                                        <span className="flex items-center text-indigo-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                            Read Article <ArrowRightIcon className="ml-1 h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No articles found matching your criteria.</p>
                        <button 
                            onClick={() => { setSearchTerm(''); setSelectedTag(null); }}
                            className="mt-4 text-indigo-400 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default BlogsPage;
