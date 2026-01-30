
import React from 'react';
import { Link } from 'react-router-dom';
import { RocketLaunchIcon, GlobeAltIcon, DiscordIcon, LinkedInIcon, InstagramIcon, SubstackIcon } from './Icons';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = React.useState<string>('');
    
    const footerLinks = {
        platform: [
            { name: 'How It Works', href: '/?scroll=how-it-works', type: 'internal' },
            { name: 'Pricing', href: '/pricing', type: 'internal' },
            { name: 'For Founders', href: '/?scroll=founders', type: 'internal' },
            { name: 'For Partners', href: '/?scroll=partners', type: 'internal' },
        ],
        company: [
            { name: 'About Us', href: 'https://www.entrext.in', type: 'external' },
            { name: 'Careers', href: '#', type: 'internal' },
            { name: 'Blog', href: '/blog', type: 'internal' },
            { name: 'Contact', href: 'mailto:business@entrext.in', type: 'email' },
        ],
        legal: [
            { name: 'Privacy Policy', href: '#', type: 'internal' },
            { name: 'Terms of Service', href: '#', type: 'internal' },
            { name: 'Cookie Policy', href: '#', type: 'internal' },
        ],
    };

    return (
        <footer className="bg-gray-900/50 border-t border-white/10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 p-1">
                                <img src="/logo.png" alt="Soho Space Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                Soho <span className="text-indigo-400">Space</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                            <span className="text-white font-semibold">The Growth Atelier</span> - A belief that growth is a craft, designed through alignment, execution, and shared ownership.
                        </p>
                        
                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a href="https://discord.com/invite/ZZx3cBrx2" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Discord">
                                <DiscordIcon className="h-5 w-5" />
                            </a>
                            <a href="https://substack.com/@entrextlabs?utm_campaign=profile&utm_medium=profile-page" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Substack">
                                <SubstackIcon className="h-5 w-5" />
                            </a>
                            <a href="https://www.linkedin.com/company/entrext/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="LinkedIn">
                                <LinkedInIcon className="h-5 w-5" />
                            </a>
                            <a href="https://www.instagram.com/entrext.labs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Instagram">
                                <InstagramIcon className="h-5 w-5" />
                            </a>
                            <a href="https://linktr.ee/entrext.pro" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Linktree">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Platform</h3>
                        <ul className="space-y-3">
                            {footerLinks.platform.map((link) => (
                                <li key={link.name}>
                                    {link.type === 'external' ? (
                                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    ) : link.type === 'email' ? (
                                        <a href={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link to={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    {link.type === 'external' ? (
                                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    ) : link.type === 'email' ? (
                                        <a href={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link to={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    {link.type === 'external' ? (
                                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    ) : link.type === 'email' ? (
                                        <a href={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link to={link.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-white font-semibold mb-1">Stay in the loop</h3>
                            <p className="text-gray-400 text-sm">Join our newsletter to get the latest updates and growth tips.</p>
                        </div>
                        <div className="flex w-full md:w-auto max-w-sm items-center gap-2 p-1.5 bg-white/5 border border-[var(--glass-border)] rounded-full">
                            <input 
                                type="email" 
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                            />
                            <button 
                                onClick={() => {
                                    const substackUrl = email 
                                        ? `https://entrextlabs.substack.com/subscribe?email=${encodeURIComponent(email)}`
                                        : 'https://entrextlabs.substack.com/subscribe';
                                    window.open(substackUrl, '_blank');
                                }}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} Soho Space. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <GlobeAltIcon className="h-4 w-4" />
                            <span>English (US)</span>
                        </div>
                        <span>|</span>
                        <span>Made with ❤️ for entrepreneurs</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
