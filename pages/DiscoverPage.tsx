
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
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -ml-20 -mb-20" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-8 animate-pulse">
                                <SparklesIcon className="h-4 w-4 text-indigo-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Growth Protocol Active</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] mb-8 tracking-tighter leading-[1.1]">
                                Engineering <br />
                                <span className="text-indigo-600">The Future</span> of Work.
                            </h1>
                            
                            {/* Search Bar */}
                            <div className="relative group max-w-xl">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search ecosystem..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl py-5 pl-14 pr-6 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg">⌘ K</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-auto">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] p-8 rounded-3xl min-w-[200px] hover:border-indigo-500/30 transition-all group">
                                    <div className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">{s.value}</div>
                                    <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Network Feed (Stories) */}
                    <div className="flex items-center gap-8 overflow-x-auto pb-8 no-scrollbar">
                        <div className="flex-shrink-0 flex items-center gap-4 py-2 pr-8 border-r border-[var(--glass-border)]">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] whitespace-nowrap">Live Network Feed</span>
                        </div>
                        {stories.map((s, i) => (
                            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer">
                                <div className="w-14 h-14 rounded-2xl border border-[var(--glass-border)] p-1 group-hover:border-indigo-600 transition-all group-hover:-translate-y-1">
                                    <img src={s.avatar} alt={s.name} className="w-full h-full rounded-[10px] bg-[var(--bg-secondary)]" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-indigo-600 transition-all opacity-40 group-hover:opacity-100">{s.name}</span>
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
                            <UserGroupIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Top growth partners <span className="text-indigo-600 dark:text-indigo-400">sectorwise</span></h2>
                        </div>
                        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--glass-border)] overflow-x-auto no-scrollbar">
                            {partnerCategories.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setPartnerFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        partnerFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-indigo-500'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPartners.length > 0 ? filteredPartners.map((partner, i) => (
                            <Link to={`/partner/${partner.id}`} key={i} className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] p-8 flex gap-8 hover:border-indigo-600 transition-all group rounded-[2.5rem] shadow-2xl hover:shadow-indigo-600/10">
                                <div className="w-24 h-24 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] p-1 group-hover:scale-105 transition-all shadow-xl flex-shrink-0 overflow-hidden">
                                    <Avatar src={partner.avatarUrl} name={partner.name} size="lg" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-none">{(partner as any).name}</h3>
                                        <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                                            <StarIcon className="w-3 h-3 text-amber-500 fill-current" />
                                            <span className="text-[10px] font-black text-amber-500 tracking-widest">{(partner as any).reputationScore || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-600/10 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-600/10">
                                            {(partner as any).location}
                                        </span>
                                        {(partner as any).skills?.slice(0, 3).map((skill: string) => (
                                            <span key={skill} className="text-[9px] font-black uppercase tracking-[0.2em] bg-[var(--bg-secondary)] text-[var(--text-muted)] px-3 py-1.5 rounded-xl border border-[var(--glass-border)] opacity-60 group-hover:opacity-100 transition-all">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-[var(--glass-border)] mt-auto">
                                        <div className="flex items-center gap-3">
                                             <div className="flex -space-x-2">
                                                 {[1,2,3].map(x => (
                                                     <div key={x} className="w-6 h-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center justify-center text-[8px] font-black">
                                                         {x}
                                                     </div>
                                                 ))}
                                             </div>
                                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-40">Managed Vectors</span>
                                        </div>
                                        <div className="text-indigo-600 group-hover:translate-x-2 transition-transform">
                                            <ArrowRightIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-full py-20 text-center glass-card rounded-3xl bg-[var(--bg-secondary)] border-dashed border-2 border-[var(--glass-border)]">
                                <SparklesIcon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">No partners found in this sector yet.</p>
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
                            <RocketLaunchIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Top performing <span className="text-purple-600 dark:text-purple-400">companies & brands</span></h2>
                        </div>
                        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--glass-border)] overflow-x-auto no-scrollbar">
                            {companyCategories.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setCompanyFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        companyFilter === f ? 'bg-purple-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-purple-500'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredCompanies.length > 0 ? filteredCompanies.map((company, i) => (
                            <div key={i} className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] group hover:border-indigo-600 transition-all rounded-[2.5rem] shadow-2xl hover:shadow-indigo-600/10 flex flex-col overflow-hidden">
                                <Link to={`/company/${company.id}`} className="h-40 bg-[var(--bg-secondary)] relative flex items-center justify-center p-8 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10 w-20 h-20 rounded-3xl bg-[var(--bg-primary)] border border-[var(--glass-border)] shadow-2xl flex items-center justify-center p-1 overflow-hidden group-hover:scale-110 transition-transform">
                                        <Avatar src={company.logoUrl} name={company.name} size="lg" className="h-full w-full object-contain" />
                                    </div>
                                </Link>
                                <div className="p-8 flex-grow flex flex-col">
                                    <Link to={`/company/${company.id}`}>
                                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none">{company.name}</h3>
                                    </Link>
                                    <p className="text-[11px] font-medium text-[var(--text-secondary)] mb-6 line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-all">{company.description?.replace(/<[^>]*>?/gm, '')}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {company.seeking?.slice(0, 2).map(role => (
                                            <span key={role} className="text-[8px] font-black uppercase tracking-[0.2em] bg-indigo-600/10 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-600/10">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-6 border-t border-[var(--glass-border)] mt-auto">
                                        <div className="flex items-center gap-2">
                                             <FireIcon className="w-4 h-4 text-rose-500" />
                                             <span className="text-[9px] font-black text-[var(--text-muted)] tracking-widest uppercase">{company.upvotes || 0} Upvoted</span>
                                        </div>
                                        <button 
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                user && await toggleUpvoteCompany(company.id, user.id);
                                            }}
                                            className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.3em] hover:text-indigo-500 transition-colors"
                                        >
                                            Boost
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center glass-card rounded-3xl bg-[var(--bg-secondary)] border-dashed border-2 border-[var(--glass-border)]">
                                <RocketLaunchIcon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">No companies found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DiscoverPage;
