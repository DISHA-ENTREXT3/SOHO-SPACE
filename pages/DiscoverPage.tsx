
import React, { useState } from 'react';
import { 
    MagnifyingGlassIcon, 
    FireIcon, 
    SparklesIcon, 
    UserGroupIcon, 
    ArrowRightIcon, 
    StarIcon, 
    GlobeAltIcon,
    TagIcon,
    RocketLaunchIcon,
    ChevronRightIcon
} from '../components/Icons';
import { PartnerProfile, CompanyProfile, ReputationBand, PositionStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import SEO from '../components/SEO';

import { Link } from 'react-router-dom';
const DiscoverPage = () => {
    const { partners, companies, toggleUpvoteCompany, getApplicationsByPartner } = useAppContext();
    const { user } = useAuth();
    const [partnerFilter, setPartnerFilter] = useState('All');
    const [companyFilter, setCompanyFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    const partnerCategories = ['All', 'Growth', 'SaaS', 'Web3', 'AI', 'Ecommerce', 'Marketing'];
    const companyCategories = ['All', 'SaaS', 'Consumer', 'Fintech', 'Marketplace', 'Healthtech', 'B2B'];

    const stats = [
        { label: 'Growth Partners', value: partners.length > 0 ? `${partners.length}+` : '850+', sublabel: 'Active collaborators' },
        { label: 'Trusted Brands', value: companies.length > 0 ? `${companies.length}+` : '120+', sublabel: 'Hiring performance leads' },
        { label: 'Success Rate', value: '94%', sublabel: 'Engagement satisfaction' },
    ];

    const stories = [
        { name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        { name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { name: 'James', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
        { name: 'Maria', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
        { name: 'Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen' },
        { name: 'Elena', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    ];

    // Get live data
    const livePartners = partners.length > 0 ? partners : [];
    
    // Filter companies:
    // 1. Must have name & description
    // 2. Must have at least one open position or seeking tag
    // 3. User must not have applied yet
    // 4. Match company filter
    // 5. Match search query
    const appliedByMe = user?.profileId ? getApplicationsByPartner(user.profileId).map(a => a.companyId) : [];
    
    const filteredCompanies = companies.filter(company => {
        // 1. Verification of required info
        if (!company.name || !company.description) return false;
        
        // 2. Verification of open positions
        const hasOpenTarget = company.positions?.some(p => p.status === PositionStatus.OPEN) || (company.seeking && company.seeking.length > 0);
        if (!hasOpenTarget) return false;
        
        // 3. Remove applied
        if (appliedByMe.includes(company.id)) return false;
        
        // 4. Search Filter
        const matchesSearch = !searchQuery || 
            company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.seeking?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (!matchesSearch) return false;

        // 5. Category Filter
        if (companyFilter !== 'All') {
            const cat = companyFilter.toLowerCase();
            const inDescription = company.description.toLowerCase().includes(cat);
            const inSeeking = company.seeking?.some(s => s.toLowerCase().includes(cat));
            if (!inDescription && !inSeeking) return false;
        }
        
        return true;
    });

    const filteredPartners = partners.filter(p => {
        const matchesSearch = !searchQuery || 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
            
        if (!matchesSearch) return false;

        if (partnerFilter !== 'All') {
            const matchesCategory = p.skills?.some(s => s.toLowerCase().includes(partnerFilter.toLowerCase())) || 
                                   p.location?.toLowerCase().includes(partnerFilter.toLowerCase());
            if (!matchesCategory) return false;
        }
        
        return true;
    });

    return (
        <div className="min-h-screen bg-transparent text-gray-100 pb-20 overflow-x-hidden">
            <SEO 
                title="Discover"
                description="Discover top growth partners and companies looking for collaboration. Browse vetted professionals and high-potential startups on Soho Space."
                keywords={['discover growth partners', 'find startups', 'vetted professionals', 'collaboration opportunities']}
                type="website"
            />
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] -ml-20 -mb-20" />
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                                Fuel for visionary <br />
                                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    growth partnerships.
                                </span>
                            </h1>
                            
                            {/* Search Bar */}
                            <div className="relative mb-8 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, skills, industries or roles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                            {stats.map((s, i) => (
                                <div key={i} className="glass-card !bg-white/5 p-6 min-w-[160px]">
                                    <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                                    <div className="text-sm font-semibold text-gray-300 mb-1">{s.label}</div>
                                    <div className="text-xs text-gray-500">{s.sublabel}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stories */}
                    <div className="flex items-center gap-4 overflow-x-auto pb-8 no-scrollbar">
                        <button className="flex-shrink-0 flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-500/50 flex items-center justify-center p-0.5 group-hover:border-indigo-500 transition-colors">
                                <div className="w-full h-full rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-400">Featured</span>
                        </button>
                        {stories.map((s, i) => (
                            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 p-0.5 hover:border-indigo-500 transition-all cursor-pointer">
                                    <img src={s.avatar} alt={s.name} className="w-full h-full rounded-full bg-gray-800" />
                                </div>
                                <span className="text-xs font-medium text-gray-400">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top performing growth partners sectorwise */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <UserGroupIcon className="w-6 h-6 text-indigo-400" />
                            <h2 className="text-2xl font-bold text-white">Top growth partners <span className="text-indigo-400">sectorwise</span></h2>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                            {partnerCategories.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setPartnerFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        partnerFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredPartners.length > 0 ? filteredPartners.map((partner, i) => (
                            <Link to={`/partner/${partner.id}`} key={i} className="glass-card p-6 flex gap-6 hover:border-indigo-500/50 hover:bg-white/10 hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all group">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 group-hover:scale-110 transition-transform flex-shrink-0">
                                    <Avatar src={partner.avatarUrl} name={partner.name} size="lg" className="h-full w-full rounded-2xl" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{(partner as any).name}</h3>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <StarIcon className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-bold">{(partner as any).reputationScore}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                            {(partner as any).location}
                                        </span>
                                        {(partner as any).skills?.slice(0, 2).map((skill: string) => (
                                            <span key={skill} className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter line-clamp-1">Projects: {partner.managedBrands?.join(', ') || 'Independent'}</p>
                                        <div className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-20 text-center glass-card">
                                <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No partners found in this sector yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Top performing companies/brands to work with */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
                        <div className="flex items-center gap-3">
                            <RocketLaunchIcon className="w-6 h-6 text-purple-400" />
                            <h2 className="text-2xl font-bold text-white">Top performing <span className="text-purple-400">companies & brands</span></h2>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                            {companyCategories.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setCompanyFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        companyFilter === f ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredCompanies.length > 0 ? filteredCompanies.map((company, i) => (
                            <div key={i} className="glass-card group hover:border-purple-500/50 hover:shadow-purple-500/10 hover:-translate-y-2 transition-all overflow-hidden flex flex-col">
                                <Link to={`/company/${company.id}`} className="h-32 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 relative flex items-center justify-center p-6 grayscale group-hover:grayscale-0 transition-all">
                                    <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" />
                                    <div className="relative z-10 h-16 w-16">
                                        <Avatar src={company.logoUrl} name={company.name} size="lg" className="rounded-xl shadow-2xl transition-transform group-hover:scale-110" />
                                    </div>
                                </Link>
                                <div className="p-6 flex-grow flex flex-col">
                                    <Link to={`/company/${company.id}`} className="block">
                                        <h3 className="font-bold text-lg text-white mb-2 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{company.name}</h3>
                                    </Link>
                                    <p className="text-xs text-gray-400 mb-6 line-clamp-2 leading-relaxed">{company.description?.replace(/<[^>]*>?/gm, '')}</p>
                                    
                                    <div className="flex flex-wrap gap-1.5 mb-6">
                                        {company.seeking?.slice(0, 3).map(role => (
                                            <span key={role} className="text-[9px] font-bold bg-white/5 text-gray-400 px-2 py-0.5 rounded-md border border-white/5">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <FireIcon className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold">{company.upvotes || 0} UPVOTES</span>
                                        </div>
                                        <button 
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                user && await toggleUpvoteCompany(company.id, user.id);
                                            }}
                                            className="text-purple-400 text-xs font-black hover:underline"
                                        >
                                            UPVOTE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center glass-card">
                                <RocketLaunchIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No companies found in this category matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DiscoverPage;
