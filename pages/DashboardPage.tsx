
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
    ChevronUpIcon, UserIcon, ChatBubbleLeftRightIcon, ChevronDownIcon
} from '../components/Icons';
import Avatar from '../components/Avatar';
import ProcessGuide from '../components/ProcessGuide';

const getReputationColor = (band: ReputationBand) => {
    switch (band) {
        case ReputationBand.HIGH: return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case ReputationBand.MEDIUM: return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
        case ReputationBand.LOW: return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
        default: return 'text-[var(--text-muted)] bg-[var(--bg-secondary)] border-[var(--glass-border)]';
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
}> = ({ icon, label, value, change, changeType = 'neutral', gradient = 'from-indigo-600 to-purple-600' }) => (
    <div className="relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 overflow-hidden group hover:border-indigo-500 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                {icon}
            </div>
            {change && (
                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                    changeType === 'positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                    changeType === 'negative' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                    {change}
                </span>
            )}
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

// Partner Card Component with enhanced styling
const PartnerCard: React.FC<{ partner: PartnerProfile, onUpvote: () => void, currentUserId?: string }> = ({ partner, onUpvote, currentUserId }) => {
    const isUpvoted = currentUserId && partner?.upvotedBy?.includes(currentUserId);
    const skills = partner?.skills || [];
    
    return (
        <div className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-2xl hover:border-indigo-500 transition-all duration-300 flex flex-col hover:shadow-xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                    <Avatar src={partner.avatarUrl} name={partner.name} size="lg" className="h-full w-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{partner.name}</h3>
                        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
                             <StarIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 fill-current" />
                             <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{partner.reputationScore || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="h-4 w-4" />
                        <span className="text-sm font-medium truncate">{partner.location}</span>
                    </div>
                </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-6">
                {partner.bio || "No biography available yet."}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
                {skills.slice(0, 3).map(skill => (
                    <span key={skill} className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        {skill}
                    </span>
                ))}
            </div>
            
            <div className="flex items-center gap-3 mt-auto">
                <Link 
                    to={`/partner/${partner.id}`} 
                    className="flex-grow text-center py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                    View Profile
                </Link>
                <button 
                    onClick={(e) => { e.preventDefault(); onUpvote(); }}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${isUpvoted ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-rose-500 hover:text-rose-500'}`}
                >
                    <FireIcon className={`h-5 w-5 ${isUpvoted ? 'animate-pulse' : ''}`} />
                </button>
            </div>
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
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
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
                <div className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-indigo-500 transition-all duration-300 overflow-hidden flex flex-col h-full hover:shadow-xl">
                    <Link to={opportunityLink} className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center p-6 overflow-hidden">
                        <div className="relative z-10 w-16 h-16 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center p-1 overflow-hidden">
                            <Avatar src={company.logoUrl} name={company.name} size="lg" className="h-full w-full object-contain" />
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                            <button 
                                onClick={handleSave}
                                className={`p-2.5 rounded-xl border-2 transition-all duration-300 ${
                                    isSaved 
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-md' 
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-amber-500 hover:text-amber-500'
                                }`}
                            >
                                <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </Link>
                    
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{company.name}</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1">
                                    <MapPinIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{company.location}</span>
                                </div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 text-center">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Match</p>
                                <p className={`text-sm font-bold ${isPro ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 blur-sm'}`}>{matchScore}%</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-2 leading-relaxed">
                            {company.description?.replace(/<[^>]*>?/gm, '')}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                            {(company.seeking || []).slice(0, 2).map(role => (
                                <span key={role} className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                    {role}
                                </span>
                            ))}
                        </div>
                        
                        <Link 
                            to={opportunityLink} 
                            className="block w-full text-center py-3 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                        >
                            View Details →
                        </Link>
                    </div>
                </div>
            );
        };

        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Welcome Banner */}
                <div className="mb-12 p-12 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="flex-grow">
                             <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-8">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Session Initialized</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] mb-6 tracking-tighter leading-none">
                                Welcome back,<br />
                                <span className="text-indigo-600 italic">
                                    {partnerProfile?.name?.split(' ')[0] || 'Partner'}.
                                </span>
                            </h1>
                            <p className="text-[var(--text-secondary)] text-xl font-medium max-w-xl leading-relaxed mb-10 opacity-70">
                                Your growth protocols are active. Synthesize new opportunities and accelerate your performance.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to={`/partner/${user.profileId}`}
                                    className="px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-indigo-600/25 hover:bg-indigo-500 hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                                >
                                    <UserIcon className="h-4 w-4" />
                                    Public ID Profile
                                </Link>
                                <button className="px-10 py-5 bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-[var(--bg-secondary)] hover:border-indigo-600/30">
                                    System Console
                                </button>
                            </div>
                        </div>
                        <div className="hidden lg:block w-48 h-48 rounded-[2rem] bg-[var(--bg-primary)] border border-[var(--glass-border)] p-2 rotate-6 hover:rotate-0 transition-all duration-700 shadow-2xl flex-shrink-0 group-hover:scale-110">
                             <Avatar src={partnerProfile?.avatarUrl} name={partnerProfile?.name || ''} size="lg" className="h-full w-full rounded-[1.5rem] object-cover" />
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
                        <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-8 rounded-2xl shadow-2xl sticky top-24">
                            <h2 className="text-xs font-black text-[var(--text-primary)] mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                                <MagnifyingGlassIcon className="h-4 w-4 text-indigo-500" />
                                Refine Search
                            </h2>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Role / Skill</label>
                                    <div className="relative group">
                                        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                                        <input 
                                            type="text" 
                                            name="seeking" 
                                            value={filters.seeking} 
                                            onChange={handleFilterChange} 
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all font-medium" 
                                            placeholder="Growth lead..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Location</label>
                                    <div className="relative group">
                                        <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" />
                                        <input 
                                            type="text" 
                                            name="location" 
                                            value={filters.location} 
                                            onChange={handleFilterChange} 
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all font-medium" 
                                            placeholder="Remote, NYC..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Work Mode</label>
                                    <div className="relative">
                                        <select 
                                            name="workMode" 
                                            value={filters.workMode} 
                                            onChange={handleFilterChange} 
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="">All Modes</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="On-site">On-site</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setFilters({ seeking: '', location: '', workMode: '' })}
                                    className="w-full py-3 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:bg-indigo-500/5 rounded-xl transition-all border border-indigo-500/10"
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
                                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-3 tracking-tight">
                                    <MagnifyingGlassIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    Explore Opportunities
                                </h2>
                                <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    {filteredCompanies.length} {filteredCompanies.length === 1 ? 'opportunity' : 'opportunities'} found
                                </span>
                            </div>
                            
                            {filteredCompanies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredCompanies.map(c => <CompanyCard key={c.id} company={c}/>)}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--glass-border)]">
                                    <SparklesIcon className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">No new opportunities found</h3>
                                    <p className="text-[var(--text-muted)] text-xs mt-1 font-medium italic">You have explored all current opportunities or they are incomplete.</p>
                                </div>
                            )}
                        </div>

                        {/* Applied Positions Section */}
                        {appliedApplications.length > 0 && (
                            <div className="pt-12 border-t border-[var(--glass-border)]">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-3 tracking-tight">
                                        <DocumentCheckIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                        Your Submissions
                                    </h2>
                                    <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
                                        Tracking {appliedApplications.length} active {appliedApplications.length === 1 ? 'submission' : 'submissions'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {appliedApplications.map(app => {
                                        const company = getCompany(app.companyId);
                                        if (!company) return null;
                                        return (
                                            <div key={app.id} className="group bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-6 rounded-3xl hover:border-emerald-500/30 transition-all duration-500 flex flex-col">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] p-2 border border-[var(--glass-border)]">
                                                            <Avatar src={company.logoUrl} name={company.name} size="md" className="h-full w-full rounded-lg" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{company.name}</h3>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1 opacity-70">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                                                        app.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                                        app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                                                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            app.status === 'Accepted' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                            app.status === 'Rejected' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                                            'bg-amber-500 animate-pulse'
                                                        }`} />
                                                        {app.status}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-[var(--glass-border)]">
                                                    <Link to={`/company/${company.id}`} className="py-2.5 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center hover:bg-[var(--bg-secondary-hover)] hover:text-[var(--text-primary)] transition-all">
                                                        View Details
                                                    </Link>
                                                    {app.status === 'Accepted' && (
                                                        <Link to={`/workspace/${company.id}`} className="py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all">
                                                            Enter Space
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
                <div className="mb-12 p-12 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="flex-grow">
                             <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-8">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Commander Access Active</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] mb-6 tracking-tighter leading-none">
                                Welcome back,<br />
                                <span className="text-indigo-600 italic">
                                    {founderProfile?.name?.split(' ')[0] || 'Founder'}.
                                </span>
                            </h1>
                            <p className="text-[var(--text-secondary)] text-xl font-medium max-w-xl leading-relaxed mb-10 opacity-70">
                                Your vision is scaling. Engage with vetted performance leads and accelerate your growth mandate.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to={`/company/${user.profileId}`}
                                    className="px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-indigo-600/25 hover:bg-indigo-500 hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                                >
                                    <BriefcaseIcon className="h-4 w-4" />
                                    Company Vector
                                </Link>
                                <Link
                                    to="/settings"
                                    className="px-10 py-5 bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-[var(--bg-secondary)] hover:border-indigo-600/30"
                                >
                                    Control Panel
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:block w-48 h-48 rounded-[2rem] bg-[var(--bg-primary)] border border-[var(--glass-border)] p-2 -rotate-6 hover:rotate-0 transition-all duration-700 shadow-2xl flex-shrink-0 group-hover:scale-110">
                             <Avatar src={founderProfile?.logoUrl} name={founderProfile?.name || ''} size="lg" className="h-full w-full rounded-[1.5rem] object-contain p-4" />
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
                    <div className="lg:col-span-1 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] p-10 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-[0.2em]">
                                <RocketLaunchIcon className="h-4 w-4 text-indigo-600" />
                                Growth Sync
                            </h2>
                            <span className="text-[10px] font-black text-indigo-600">{completedChecklist}/{checklistItems.length}</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5 mb-10">
                            <div 
                                className="h-1.5 rounded-full bg-indigo-600 transition-all duration-700 shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                                style={{ width: `${checklistProgress}%` }}
                            />
                        </div>
                        
                        <ul className="space-y-6">
                            {checklistItems.map((item, index) => (
                                <li key={index} className={`flex items-start gap-4 transition-all ${item.completed ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 ${
                                        item.completed ? 'bg-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--glass-border)]'
                                    }`}>
                                        {item.completed ? <CheckCircleIcon className="h-3 w-3 text-white" /> : <div className="w-1 h-1 bg-[var(--text-muted)] rounded-full" />}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-tight text-[var(--text-primary)]">
                                            {item.label}
                                        </p>
                                        <p className="text-[9px] font-bold text-[var(--text-muted)] mt-1.5 leading-relaxed uppercase tracking-widest opacity-60">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Applications Received */}
                    <div className="lg:col-span-2 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] p-10 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-[10px] font-black text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-[0.2em]">
                                <FireIcon className="h-4 w-4 text-indigo-600" />
                                Deployment Requests
                            </h2>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{companyApplications.length} Submissions</span>
                        </div>
                        
                        {companyApplications.length > 0 ? (
                            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                                {companyApplications.slice(0, 5).map(app => {
                                    const partner = getPartner(app.partnerId);
                                    return partner ? (
                                        <div key={app.id} className="group flex items-center justify-between p-6 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[2rem] hover:border-indigo-600 transition-all duration-300">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                     <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--glass-border)] p-0.5 shadow-xl group-hover:scale-105 transition-all">
                                                        <Avatar src={partner.avatarUrl} name={partner.name} size="lg" className="h-full w-full rounded-[14px] object-cover" />
                                                     </div>
                                                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-[var(--bg-secondary)] ${
                                                        app.status === 'Accepted' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                        app.status === 'Rejected' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                                    }`} />
                                                </div>
                                                <div className="min-w-0">
                                                    <Link to={`/partner/${partner.id}`} className="text-[13px] font-black text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors tracking-tight uppercase block">
                                                        {partner.name}
                                                    </Link>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">{partner.reputationBand} Protocol</span>
                                                        <span className="w-1 h-1 bg-[var(--glass-border)] rounded-full" />
                                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${
                                                            app.status === 'Accepted' ? 'text-emerald-500' :
                                                            app.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'
                                                        }`}>
                                                            {app.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {app.status === 'Pending' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => updateApplicationStatus(app.id, ApplicationStatus.ACCEPTED)} 
                                                            className="p-3.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10" 
                                                            title="Accept Protocol"
                                                        >
                                                            <CheckCircleIcon className="h-5 w-5"/>
                                                        </button>
                                                        <button 
                                                            onClick={() => updateApplicationStatus(app.id, ApplicationStatus.REJECTED)} 
                                                            className="p-3.5 bg-rose-500/10 text-rose-500 border border-rose-500/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/10" 
                                                            title="Decline Protocol"
                                                        >
                                                            <XCircleIcon className="h-5 w-5"/>
                                                        </button>
                                                    </>
                                                ) : app.status === 'Accepted' ? (
                                                    <Link 
                                                        to={`/workspace/${partner.id}`}
                                                        className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
                                                    >
                                                        Secure Workspace
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-[var(--bg-secondary)] rounded-[2rem] border border-dashed border-[var(--glass-border)]">
                                <DocumentCheckIcon className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-6 opacity-30" />
                                <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.3em]">No deployment requests</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manage My Listings */}
                <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-10 rounded-3xl shadow-2xl mb-12">
                     <h2 className="text-sm font-black text-[var(--text-primary)] mb-10 flex items-center gap-3 uppercase tracking-widest">
                        <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Active Listings
                    </h2>
                    {founderProfile?.positions && founderProfile.positions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {founderProfile.positions.map(pos => (
                                <div key={pos.id} className="p-8 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-3xl hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
                                     <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${
                                        pos.status === PositionStatus.OPEN ? 'from-emerald-500/10' :
                                        pos.status === PositionStatus.PAUSED ? 'from-amber-500/10' : 'from-rose-500/10'
                                    } blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.1em] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{pos.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                                {companyApplications.length}
                                            </span>
                                            <div className={`w-2 h-2 rounded-full ${
                                                pos.status === PositionStatus.OPEN ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                pos.status === PositionStatus.PAUSED ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                                                       'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                            }`} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-auto relative z-10">
                                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Status</span>
                                        <div className="flex-grow relative">
                                            <select 
                                                value={pos.status}
                                                onChange={(e) => updatePositionStatus(user.profileId, pos.id, e.target.value as PositionStatus)}
                                                className="w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-xl py-2.5 pl-4 pr-10 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none cursor-pointer"
                                            >
                                                {Object.values(PositionStatus).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--glass-border)]">
                            <BriefcaseIcon className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">No active positions yet</p>
                            <Link to={`/company/${user.profileId}`} className="px-8 py-3 bg-purple-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all">Add First Listing</Link>
                        </div>
                    )}
                </div>

                {/* Find Partners Section */}
                <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-12 relative z-10">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                                <MagnifyingGlassIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">Growth Network</h2>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1.5 opacity-60">Discover top {partners.length}+ professionals</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative z-10">
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Expertise</label>
                            <input 
                                type="text" 
                                name="skills" 
                                value={partnerFilters.skills} 
                                onChange={handlePartnerFilterChange} 
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl py-3.5 px-5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium" 
                                placeholder="SEO, Meta Ads..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Experience</label>
                            <div className="relative">
                                <select 
                                    name="reputation" 
                                    value={partnerFilters.reputation} 
                                    onChange={handlePartnerFilterChange} 
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl py-3.5 pl-5 pr-12 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="">Any Level</option>
                                    {Object.values(ReputationBand).map(band => <option key={band} value={band}>{band}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Territory</label>
                            <input 
                                type="text" 
                                name="location" 
                                value={partnerFilters.location} 
                                onChange={handlePartnerFilterChange} 
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl py-3.5 px-5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium" 
                                placeholder="London, Berlin..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Availability</label>
                            <div className="relative">
                                <select 
                                    name="workMode" 
                                    value={partnerFilters.workMode} 
                                    onChange={handlePartnerFilterChange} 
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl py-3.5 pl-5 pr-12 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="">Any Mode</option>
                                    {Object.values(WorkMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Partners Grid */}
                    {filteredPartners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
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
                        <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--glass-border)]">
                            <UserGroupIcon className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">No partners found</h3>
                            <p className="text-[var(--text-muted)] text-xs mt-1 font-medium italic">Try adjusting your filters to see more results.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return user.role === UserRole.PARTNER ? <PartnerDashboard /> : <FounderDashboard />;
};

export default DashboardPage;