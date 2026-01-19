
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { UserRole, WorkMode, PartnerProfile, ReputationBand, CompanyProfile, ApplicationStatus, PositionStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { 
    MapPinIcon, PresentationChartLineIcon, CheckCircleIcon, XCircleIcon, 
    MagnifyingGlassIcon, StarIcon, BookmarkIcon, SparklesIcon, 
    UserGroupIcon, ChartBarIcon, RocketLaunchIcon, ClockIcon,
    DocumentCheckIcon, ArrowTrendingUpIcon, BriefcaseIcon, FireIcon,
    ChevronUpIcon, UserIcon, ChatBubbleLeftRightIcon
} from '../components/Icons';
import Avatar from '../components/Avatar';
import ProcessGuide from '../components/ProcessGuide';

const getReputationColor = (band: ReputationBand) => {
    switch (band) {
        case ReputationBand.HIGH: return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
        case ReputationBand.MEDIUM: return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
        case ReputationBand.LOW: return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
        default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
};

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    gradient?: string;
}> = ({ icon, label, value, change, changeType = 'neutral', gradient = 'from-indigo-500 to-purple-600' }) => (
    <div className="relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden group hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
                    {change && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            changeType === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 
                            changeType === 'negative' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-gray-500'
                        }`}>
                            {change}
                        </span>
                    )}
                </div>
            </div>
            <div className={`relative w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center border border-white/5 shadow-inner`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 blur-lg group-hover:opacity-40 transition-opacity`} />
                <div className="relative z-10 scale-110">
                    {icon}
                </div>
            </div>
        </div>
    </div>
);

// Partner Card Component with enhanced styling
const PartnerCard: React.FC<{ partner: PartnerProfile, onUpvote: () => void, currentUserId?: string }> = ({ partner, onUpvote, currentUserId }) => {
    const isUpvoted = currentUserId && partner?.upvotedBy?.includes(currentUserId);
    const skills = partner?.skills || [];
    
    return (
        <div className="group relative bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <Avatar src={partner.avatarUrl} name={partner.name} size="lg" className="h-full w-full rounded-2xl shadow-2xl" />
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{partner.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium truncate">{partner.location}</span>
                    </div>
                </div>
                <button 
                    onClick={(e) => { e.preventDefault(); onUpvote(); }}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl border transition-all duration-300 ${isUpvoted ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                >
                    <ChevronUpIcon className={`h-4 w-4 ${isUpvoted ? 'animate-bounce' : ''}`} />
                    <span className="text-[10px] font-black">{partner.upvotes || 0}</span>
                </button>
            </div>
            
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors">
                {partner.bio || "No biography available yet."}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8">
                {skills.slice(0, 3).map(skill => (
                    <span key={skill} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {skill}
                    </span>
                ))}
            </div>
            
            <Link 
                to={`/partner/${partner.id}`} 
                className="w-full text-center mt-auto py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300"
            >
                View Profile
            </Link>
        </div>
    );
};


const DashboardPage = () => {
    const { user } = useAuth();
    const { 
        applications, updateApplicationStatus, getPartner, partners, 
        toggleSaveOpportunity, companies, getCompany, getApplicationsForCompany,
        toggleUpvoteCompany, toggleUpvotePartner, updatePositionStatus
    } = useAppContext();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Partner Dashboard
    const PartnerDashboard = () => {
        const [filters, setFilters] = useState({
            location: '',
            workMode: '',
            seeking: '',
        });
        const partnerProfile = partners.find(p => p.id === user.profileId);
        const savedCount = partnerProfile?.savedOpportunities?.length || 0;
        const appliedCount = applications.filter(a => a.partnerId === user.profileId).length;
        const acceptedCount = applications.filter(a => a.partnerId === user.profileId && a.status === 'Accepted').length;

        const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setFilters({ ...filters, [e.target.name]: e.target.value });
        };

        const appliedApplications = applications.filter(a => a.partnerId === user.profileId);
        const appliedCompanyIds = new Set(appliedApplications.map(a => a.companyId));

        const filteredCompanies = companies.filter(company => {
            const hasRequiredInfo = company.name && company.description && (company.positions?.some(p => p.status === PositionStatus.OPEN) || company.seeking?.length > 0);
            if (!hasRequiredInfo) return false;

            const isApplied = appliedCompanyIds.has(company.id);
            if (isApplied) return false;

            const seeking = company.seeking || [];
            const location = company.location || '';
            const workModes = company.workModes || [];

            return (
                (filters.location === '' || location.toLowerCase().includes(filters.location.toLowerCase())) &&
                (filters.workMode === '' || workModes.includes(filters.workMode as WorkMode)) &&
                (filters.seeking === '' || seeking.some(s => s.toLowerCase().includes(filters.seeking.toLowerCase())))
            );
        }).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

        const CompanyCard: React.FC<{ company: CompanyProfile }> = ({ company }) => {
            const opportunityLink = `/company/${company.id}`;
            const isSaved = partnerProfile?.savedOpportunities?.includes(company.id) || false;
            const handleSave = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (user?.profileId) {
                    toggleSaveOpportunity(user.profileId, company.id);
                }
            };

            const matchScore = (company.id.charCodeAt(company.id.length - 1) % 30) + 65;
            const isPro = user?.isPremium || false; 

            return (
                <div className="group relative bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 overflow-hidden flex flex-col h-full">
                    <Link to={opportunityLink} className="relative h-28 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 flex items-center justify-center p-6 grayscale group-hover:grayscale-0 transition-all">
                        <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" />
                        <div className="relative z-10 w-16 h-16">
                            <Avatar src={company.logoUrl} name={company.name} size="lg" className="rounded-2xl shadow-2xl transition-transform group-hover:scale-110" />
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                            <button 
                                onClick={handleSave}
                                className={`p-2 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                                    isSaved 
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' 
                                        : 'bg-black/40 border-white/10 text-gray-400 hover:bg-black/60 hover:text-white'
                                }`}
                            >
                                <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </Link>
                    
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{company.name}</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                                    <MapPinIcon className="h-3 w-3" />
                                    <span className="text-[10px] font-bold tracking-wider">{company.location}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg px-2 py-1 border border-white/5 text-right">
                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">Match</p>
                                <p className={`text-xs font-black ${isPro ? 'text-emerald-400' : 'text-gray-700 blur-[3px]'}`}>{matchScore}%</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-6">
                            {company.description?.replace(/<[^>]*>?/gm, '')}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-8 mt-auto">
                            {(company.seeking || []).slice(0, 2).map(role => (
                                <span key={role} className="text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-lg border border-purple-500/20">
                                    {role}
                                </span>
                            ))}
                        </div>
                        
                        <Link 
                            to={opportunityLink} 
                            className="block w-full text-center py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-500 transition-all duration-300"
                        >
                            Explore →
                        </Link>
                    </div>
                </div>
            );
        };

        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Welcome Banner */}
                <div className="mb-8 p-10 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                                Welcome back,<br />
                                <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                                    {partnerProfile?.name?.split(' ')[0] || 'Partner'}! 👋
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-8">
                                Your growth journey continues. Explore new opportunities or track your active submissions.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to={`/partner/${user.profileId}`}
                                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/25 flex items-center gap-3"
                                >
                                    <UserIcon className="h-4 w-4" />
                                    Public Profile
                                </Link>
                                <button className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                                    Account Settings
                                </button>
                            </div>
                        </div>
                        <div className="hidden lg:block w-32 h-32 rounded-3xl bg-indigo-500/10 border border-white/10 p-2 rotate-3 hover:rotate-0 transition-transform duration-500">
                             <Avatar src={partnerProfile?.avatarUrl} name={partnerProfile?.name || ''} size="lg" className="h-full w-full rounded-2xl" />
                        </div>
                    </div>
                </div>

                {/* Platform Flow Guide */}
                <div className="mb-8">
                    <ProcessGuide currentStep={2} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<BriefcaseIcon className="h-6 w-6 text-white" />}
                        label="Available Opportunities"
                        value={companies.length}
                        change="Updated today"
                        gradient="from-indigo-500 to-purple-600"
                    />
                    <StatCard
                        icon={<BookmarkIcon className="h-6 w-6 text-white" />}
                        label="Saved Opportunities"
                        value={savedCount}
                        gradient="from-amber-500 to-orange-600"
                    />
                    <StatCard
                        icon={<DocumentCheckIcon className="h-6 w-6 text-white" />}
                        label="Applications Sent"
                        value={appliedCount}
                        gradient="from-teal-500 to-cyan-600"
                    />
                    <StatCard
                        icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
                        label="Accepted"
                        value={acceptedCount}
                        change={acceptedCount > 0 ? 'Great progress!' : 'Keep applying'}
                        changeType={acceptedCount > 0 ? 'positive' : 'neutral'}
                        gradient="from-emerald-500 to-green-600"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl shadow-2xl sticky top-24">
                            <h2 className="text-xs font-black text-white mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                                <MagnifyingGlassIcon className="h-4 w-4 text-indigo-400" />
                                Refine Search
                            </h2>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Role / Skill</label>
                                    <div className="relative group">
                                        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input 
                                            type="text" 
                                            name="seeking" 
                                            value={filters.seeking} 
                                            onChange={handleFilterChange} 
                                            className="w-full bg-gray-800/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all font-medium" 
                                            placeholder="Growth lead..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Location</label>
                                    <div className="relative group">
                                        <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input 
                                            type="text" 
                                            name="location" 
                                            value={filters.location} 
                                            onChange={handleFilterChange} 
                                            className="w-full bg-gray-800/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all font-medium" 
                                            placeholder="Remote, NYC..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Work Mode</label>
                                    <div className="relative">
                                        <select 
                                            name="workMode" 
                                            value={filters.workMode} 
                                            onChange={handleFilterChange} 
                                            className="w-full bg-gray-800/40 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium cursor-pointer"
                                        >
                                            <option value="">Any Mode</option>
                                            {Object.values(WorkMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                        </select>
                                        <ChevronUpIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none rotate-180" />
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => setFilters({ location: '', workMode: '', seeking: '' })}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-indigo-400 py-4 border-t border-white/5 transition-colors mt-4"
                                >
                                    Reset Selection
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Opportunities Grid */}
                    <section className="lg:col-span-3 space-y-12">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <MagnifyingGlassIcon className="h-6 w-6 text-indigo-400" />
                                    Explore Opportunities
                                </h2>
                                <span className="text-sm text-gray-400">
                                    {filteredCompanies.length} {filteredCompanies.length === 1 ? 'opportunity' : 'opportunities'} found
                                </span>
                            </div>
                            
                            {filteredCompanies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredCompanies.map(c => <CompanyCard key={c.id} company={c}/>)}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-white/5">
                                    <SparklesIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-400 mb-2">No new opportunities found</h3>
                                    <p className="text-gray-500 text-sm">You have explored all current opportunities or they are incomplete.</p>
                                </div>
                            )}
                        </div>

                        {/* Applied Positions Section */}
                        {appliedApplications.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        <DocumentCheckIcon className="h-6 w-6 text-emerald-400" />
                                        Your Submissions
                                    </h2>
                                    <span className="text-sm text-gray-400">
                                        Tracking {appliedApplications.length} active {appliedApplications.length === 1 ? 'application' : 'applications'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {appliedApplications.map(app => {
                                        const company = getCompany(app.companyId);
                                        if (!company) return null;
                                        return (
                                            <div key={app.id} className="group bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 flex flex-col">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-800/50 p-2 border border-white/5">
                                                            <Avatar src={company.logoUrl} name={company.name} size="md" className="h-full w-full rounded-lg" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{company.name}</h3>
                                                            <p className="text-[10px] font-bold text-gray-500 mt-0.5">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                                                        app.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            app.status === 'Accepted' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                            app.status === 'Rejected' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                                            'bg-amber-500 animate-pulse'
                                                        }`} />
                                                        {app.status}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Link to={`/company/${company.id}`} className="py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 text-center hover:bg-white/10 hover:text-white transition-all">
                                                        Details
                                                    </Link>
                                                    {app.status === 'Accepted' && (
                                                        <Link to={`/workspace/${company.id}`} className="py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all">
                                                            Workspace
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        );
    };

    // Founder Dashboard
    const FounderDashboard = () => {
        const [partnerFilters, setPartnerFilters] = useState({ skills: '', reputation: '', location: '', workMode: '' });
        const founderProfile = getCompany(user.profileId);
        const companyApplications = getApplicationsForCompany(user.profileId);
        const pendingCount = companyApplications.filter(a => a.status === 'Pending').length;
        const acceptedCount = companyApplications.filter(a => a.status === 'Accepted').length;

        const handlePartnerFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setPartnerFilters({ ...partnerFilters, [e.target.name]: e.target.value });
        };
        


        const filteredPartners = partners.filter(partner => {
            const skills = partner.skills || [];
            const location = partner.location || '';
            const skillsMatch = partnerFilters.skills === '' || 
                skills.some(skill => skill.toLowerCase().includes(partnerFilters.skills.toLowerCase()));
            const reputationMatch = partnerFilters.reputation === '' ||
                partner.reputationBand === partnerFilters.reputation;
            const locationMatch = partnerFilters.location === '' ||
                location.toLowerCase().includes(partnerFilters.location.toLowerCase());
            const workModeMatch = partnerFilters.workMode === '' ||
                partner.workModePreference === partnerFilters.workMode;
            
            return skillsMatch && reputationMatch && locationMatch && workModeMatch;
        }).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)); // Ranking Algorithm: Upvotes promote top talent
        
        const handleAiFind = () => {
            alert("AI Partner Matching is Coming Soon! We're currently fine-tuning our models for Soho Space.");
        };

        // Onboarding checklist logic
        const checklistItems = [
            { label: 'Create your account', completed: true, description: 'Your account is active and ready' },
            { label: 'Complete company profile', completed: !!founderProfile?.description, description: 'Add details about your company' },
            { label: 'Upload required documents', completed: (founderProfile?.documents?.length || 0) > 0, description: 'NDA, legal docs, etc.' },
            { label: 'Review first application', completed: companyApplications.length > 0, description: 'Start connecting with partners' },
        ];
        const completedChecklist = checklistItems.filter(item => item.completed).length;
        const checklistProgress = (completedChecklist / checklistItems.length) * 100;

        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Welcome Banner */}
                <div className="mb-8 p-10 bg-gradient-to-br from-purple-900/40 via-indigo-900/20 to-transparent rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-purple-500/20 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                                Welcome, Founder.<br />
                                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                    {founderProfile?.name?.split(' ')[0] || 'Sir'}! 🚀
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-8">
                                Manage your recruitment flow and connect with world-class growth partners.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to={`/company/${user.profileId}`}
                                    className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-purple-500/25 flex items-center gap-3"
                                >
                                    <BriefcaseIcon className="h-4 w-4" />
                                    Company Profile
                                </Link>
                                <button className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                                    Analytics
                                </button>
                            </div>
                        </div>
                        <div className="hidden lg:block w-32 h-32 rounded-3xl bg-purple-500/10 border border-white/10 p-2 -rotate-3 hover:rotate-0 transition-transform duration-500">
                             <Avatar src={founderProfile?.logoUrl} name={founderProfile?.name || ''} size="lg" className="h-full w-full rounded-2xl shadow-xl" />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<UserGroupIcon className="h-6 w-6 text-white" />}
                        label="Growth Partners"
                        value={partners.length}
                        change="Active professionals"
                        gradient="from-indigo-500 to-purple-600"
                    />
                    <StatCard
                        icon={<FireIcon className="h-6 w-6 text-white" />}
                        label="Applications"
                        value={companyApplications.length}
                        change={`${pendingCount} pending review`}
                        changeType="positive"
                        gradient="from-amber-500 to-orange-600"
                    />
                    <StatCard
                        icon={<DocumentCheckIcon className="h-6 w-6 text-white" />}
                        label="Pending"
                        value={pendingCount}
                        gradient="from-teal-500 to-cyan-600"
                    />
                    <StatCard
                        icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
                        label="Active Partnerships"
                        value={acceptedCount}
                        gradient="from-emerald-500 to-green-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Founder Onboarding Checklist */}
                    <div className="lg:col-span-1 bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <RocketLaunchIcon className="h-5 w-5 text-indigo-400" />
                                Getting Started
                            </h2>
                            <span className="text-sm font-semibold text-indigo-400">{completedChecklist}/{checklistItems.length}</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-700/50 rounded-full h-2 mb-5">
                            <div 
                                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${checklistProgress}%` }}
                            />
                        </div>
                        
                        <ul className="space-y-3">
                            {checklistItems.map((item, index) => (
                                <li key={index} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${item.completed ? 'bg-white/5' : 'hover:bg-white/5'}`}>
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                                        item.completed ? 'bg-emerald-500' : 'bg-gray-700'
                                    }`}>
                                        {item.completed && <CheckCircleIcon className="h-3 w-3 text-white" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${item.completed ? 'text-white' : 'text-gray-400'}`}>
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Applications Received */}
                    <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <FireIcon className="h-5 w-5 text-orange-400" />
                                Recent Applications
                            </h2>
                            <span className="text-sm text-gray-400">{companyApplications.length} total</span>
                        </div>
                        
                        {companyApplications.length > 0 ? (
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {companyApplications.slice(0, 5).map(app => {
                                    const partner = getPartner(app.partnerId);
                                    return partner ? (
                                        <div key={app.id} className="group flex items-center justify-between p-4 bg-gray-800/30 border border-white/5 rounded-2xl hover:bg-gray-800/50 hover:border-white/10 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar src={partner.avatarUrl} name={partner.name} size="lg" className="rounded-xl" />
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                                                        app.status === 'Accepted' ? 'bg-emerald-500' :
                                                        app.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <Link to={`/partner/${partner.id}`} className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight uppercase">
                                                        {partner.name}
                                                    </Link>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-gray-500">{partner.reputationBand} Partner</span>
                                                        <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                            app.status === 'Accepted' ? 'text-emerald-400' :
                                                            app.status === 'Rejected' ? 'text-rose-400' : 'text-amber-400'
                                                        }`}>
                                                            {app.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {app.status === 'Pending' && (
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => updateApplicationStatus(app.id, ApplicationStatus.ACCEPTED)} 
                                                        className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-lg shadow-emerald-500/10" 
                                                        title="Accept"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => updateApplicationStatus(app.id, ApplicationStatus.REJECTED)} 
                                                        className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-lg shadow-rose-500/10" 
                                                        title="Reject"
                                                    >
                                                        <XCircleIcon className="h-5 w-5"/>
                                                    </button>
                                                </div>
                                            )}
                                            {app.status === 'Accepted' && (
                                                <Link 
                                                    to={`/workspace/${partner.id}`}
                                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all border border-indigo-500/20"
                                                >
                                                    Workspace
                                                </Link>
                                            )}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <DocumentCheckIcon className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">No applications received yet.</p>
                                <p className="text-gray-500 text-xs mt-1">Applications from partners will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manage My Listings */}
                <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl shadow-2xl mb-12">
                     <h2 className="text-xs font-black text-white mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                        <ChartBarIcon className="h-4 w-4 text-purple-400" />
                        Manage My Active Listings
                    </h2>
                    {founderProfile?.positions && founderProfile.positions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {founderProfile.positions.map(pos => (
                                <div key={pos.id} className="p-6 bg-gray-800/30 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
                                     <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${
                                        pos.status === PositionStatus.OPEN ? 'from-emerald-500/20' :
                                        pos.status === PositionStatus.PAUSED ? 'from-amber-500/20' : 'from-rose-500/20'
                                    } blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-purple-400 transition-colors">{pos.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-purple-400/60 bg-purple-400/5 px-2 py-0.5 rounded-md border border-purple-400/10">
                                                {companyApplications.length} Applicants
                                            </span>
                                            <div className={`w-2 h-2 rounded-full ${
                                                pos.status === PositionStatus.OPEN ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                pos.status === PositionStatus.PAUSED ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                                                      'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                            }`} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Status:</span>
                                        <div className="flex-grow relative">
                                            <select 
                                                value={pos.status}
                                                onChange={(e) => updatePositionStatus(user.profileId, pos.id, e.target.value as PositionStatus)}
                                                className="w-full bg-gray-900/60 border border-white/10 rounded-xl py-2 pl-3 pr-8 text-[10px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none cursor-pointer"
                                            >
                                                {Object.values(PositionStatus).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                            <ChevronUpIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <BriefcaseIcon className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                            <p className="text-sm font-bold text-gray-500">No active positions found.</p>
                            <Link to={`/company/${user.profileId}`} className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mt-4 inline-block hover:underline">Add First Role</Link>
                        </div>
                    )}
                </div>

                {/* Find Partners Section */}
                <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-12">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <MagnifyingGlassIcon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Vetted Growth Partners</h2>
                                <p className="text-sm text-gray-500">Discover top {partners.length} professionals</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAiFind} 
                            className="relative group/ai flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/ai:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-3">
                                <SparklesIcon className="h-4 w-4 animate-pulse" />
                                Find with AI
                            </span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Expertise</label>
                            <input 
                                type="text" 
                                name="skills" 
                                value={partnerFilters.skills} 
                                onChange={handlePartnerFilterChange} 
                                className="w-full bg-gray-800/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium" 
                                placeholder="SEO, Meta Ads..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Experience</label>
                            <div className="relative">
                                <select 
                                    name="reputation" 
                                    value={partnerFilters.reputation} 
                                    onChange={handlePartnerFilterChange} 
                                    className="w-full bg-gray-800/40 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium cursor-pointer"
                                >
                                    <option value="">Any Level</option>
                                    {Object.values(ReputationBand).map(band => <option key={band} value={band}>{band}</option>)}
                                </select>
                                <ChevronUpIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none rotate-180" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Territory</label>
                            <input 
                                type="text" 
                                name="location" 
                                value={partnerFilters.location} 
                                onChange={handlePartnerFilterChange} 
                                className="w-full bg-gray-800/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium" 
                                placeholder="London, Berlin..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Availability</label>
                            <div className="relative">
                                <select 
                                    name="workMode" 
                                    value={partnerFilters.workMode} 
                                    onChange={handlePartnerFilterChange} 
                                    className="w-full bg-gray-800/40 border border-white/5 rounded-xl py-3 pl-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium cursor-pointer"
                                >
                                    <option value="">Any Mode</option>
                                    {Object.values(WorkMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                </select>
                                <ChevronUpIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none rotate-180" />
                            </div>
                        </div>
                    </div>

                    {/* Partners Grid */}
                    {filteredPartners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPartners.map(partner => (
                                <PartnerCard 
                                    key={partner.id} 
                                    partner={partner} 
                                    onUpvote={() => toggleUpvotePartner(partner.id, user.id)}
                                    currentUserId={user.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-white/5">
                            <UserGroupIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-400 mb-2">No partners found</h3>
                            <p className="text-gray-500 text-sm">Try adjusting your filters to see more results.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return user.role === UserRole.PARTNER ? <PartnerDashboard /> : <FounderDashboard />;
};

export default DashboardPage;