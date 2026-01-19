
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
    <div className="relative bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 overflow-hidden group hover:border-white/20 transition-all duration-300">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {change && (
                    <p className={`text-xs mt-2 font-medium ${
                        changeType === 'positive' ? 'text-emerald-400' : 
                        changeType === 'negative' ? 'text-rose-400' : 'text-gray-400'
                    }`}>
                        {change}
                    </p>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                {icon}
            </div>
        </div>
    </div>
);

// Partner Card Component with enhanced styling
const PartnerCard: React.FC<{ partner: PartnerProfile, onUpvote: () => void, currentUserId?: string }> = ({ partner, onUpvote, currentUserId }) => {
    const isUpvoted = currentUserId && partner?.upvotedBy?.includes(currentUserId);
    const skills = partner?.skills || [];
    
    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-lg hover:border-white/20 hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className="relative">
                        <Avatar src={partner.avatarUrl} name={partner.name} size="lg" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <CheckCircleIcon className="h-3 w-3 text-white"/>
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{partner.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPinIcon className="h-3.5 w-3.5 text-gray-500" />
                            <span className="text-sm text-gray-400">{partner.location}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${getReputationColor(partner.reputationBand)}`}>
                        <StarIcon className="h-3 w-3 mr-1"/>
                        {partner.reputationBand}
                    </div>
                    {/* Upvote Button */}
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onUpvote();
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all duration-200 ${
                            isUpvoted 
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                        }`}
                    >
                        <ChevronUpIcon className="h-4 w-4" />
                        <span className="text-xs font-bold">{partner.upvotes || 0}</span>
                    </button>
                </div>
            </div>
            
            <p className="text-gray-400 mt-4 text-sm flex-grow line-clamp-2">
                {partner.bio}
            </p>
            
            <div className="mt-5 pt-4 border-t border-white/10">
                <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-indigo-500/15 text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-indigo-500/20">
                            {skill}
                        </span>
                    ))}
                    {skills.length > 3 && (
                        <span className="text-gray-500 text-xs py-1">+{skills.length - 3} more</span>
                    )}
                </div>
            </div>
            
            <Link 
                to={`/partner/${partner.id}`} 
                className="block text-center mt-5 bg-white/5 border border-white/10 text-white font-semibold py-2.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200"
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
        toggleUpvoteCompany, toggleUpvotePartner
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
                <Link to={opportunityLink} className="block bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-lg hover:border-white/20 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center">
                            <Avatar src={company.logoUrl} name={company.name} size="lg" className="rounded-xl" />
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{company.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPinIcon className="h-3.5 w-3.5 text-gray-500" />
                                    <span className="text-sm text-gray-400">{company.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-1.5 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter mb-0.5">Match Score</span>
                                <div className={`text-xs font-black ${isPro ? 'text-indigo-400' : 'text-gray-600 blur-[2px]'}`}>
                                    {matchScore}%
                                </div>
                            </div>
                            <button 
                                onClick={handleSave}
                                className={`p-2 rounded-lg border transition-all duration-200 ${
                                    isSaved 
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                }`}
                            >
                                <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-gray-400 mt-4 text-sm line-clamp-2">
                        {company.description?.replace(/<[^>]*>?/gm, '')}
                    </p>
                    
                    <div className="mt-5 flex flex-wrap gap-2">
                        {(company.seeking || []).slice(0, 2).map(role => (
                            <span key={role} className="bg-emerald-400/10 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-400/20">
                                {role}
                            </span>
                        ))}
                    </div>
                    
                    <div className="mt-5 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 rounded-xl group-hover:from-indigo-500 group-hover:to-purple-500 transition-all">
                        View Opportunity →
                    </div>
                </Link>
            );
        };

        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Welcome Banner */}
                <div className="mb-8 p-6 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/10 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Welcome back, {partnerProfile?.name?.split(' ')[0] || 'Partner'}! 👋
                            </h1>
                            <p className="text-gray-400 mb-6">
                                Discover new opportunities and track your applications.
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <Link 
                                    to={`/partner/${user.profileId}`}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition-all duration-300"
                                >
                                    <UserIcon className="h-4 w-4" />
                                    My Public Profile
                                </Link>
                            </div>
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
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-lg sticky top-24">
                            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <MagnifyingGlassIcon className="h-5 w-5 text-indigo-400" />
                                Filter Opportunities
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Role / Skill</label>
                                    <input 
                                        type="text" 
                                        name="seeking" 
                                        value={filters.seeking} 
                                        onChange={handleFilterChange} 
                                        className="w-full bg-gray-800/60 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                                        placeholder="e.g. SaaS Growth"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                                    <input 
                                        type="text" 
                                        name="location" 
                                        value={filters.location} 
                                        onChange={handleFilterChange} 
                                        className="w-full bg-gray-800/60 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                                        placeholder="e.g. New York"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Work Mode</label>
                                    <select 
                                        name="workMode" 
                                        value={filters.workMode} 
                                        onChange={handleFilterChange} 
                                        className="w-full bg-gray-800/60 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    >
                                        <option value="">All Modes</option>
                                        {Object.values(WorkMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                    </select>
                                </div>
                                
                                <button 
                                    onClick={() => setFilters({ location: '', workMode: '', seeking: '' })}
                                    className="w-full text-sm text-gray-400 hover:text-white py-2 transition-colors"
                                >
                                    Clear all filters
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
                                        Applied Positions
                                    </h2>
                                    <span className="text-sm text-gray-400">
                                        Tracking {appliedApplications.length} {appliedApplications.length === 1 ? 'application' : 'applications'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {appliedApplications.map(app => {
                                        const company = getCompany(app.companyId);
                                        if (!company) return null;
                                        return (
                                            <div key={app.id} className="bg-gray-900/50 backdrop-blur-sm border border-emerald-500/10 p-6 rounded-xl shadow-lg flex flex-col group">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center">
                                                        <Avatar src={company.logoUrl} name={company.name} size="lg" className="rounded-xl" />
                                                        <div className="ml-4">
                                                            <h3 className="text-lg font-bold text-white">{company.name}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <ClockIcon className="h-3.5 w-3.5 text-gray-500" />
                                                                <span className="text-xs text-gray-400">Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                        app.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                        app.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                    }`}>
                                                        {app.status}
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex gap-3">
                                                    <Link to={`/company/${company.id}`} className="flex-1 text-center bg-white/5 border border-white/10 text-white font-semibold py-2 rounded-lg hover:bg-white/10 transition-all text-xs">
                                                        View Profile
                                                    </Link>
                                                    {app.status === 'Accepted' && (
                                                        <Link to={`/workspace/${company.id}`} className="flex-1 text-center bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition-all text-xs">
                                                            Go to Workspace
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
                <div className="mb-8 p-6 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/10 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Welcome back, {founderProfile?.name?.split(' ')[0] || 'Founder'}! 🚀
                            </h1>
                            <p className="text-gray-400 mb-6">
                                Find the perfect growth partners to scale your vision.
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <Link 
                                    to={`/company/${user.profileId}`}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition-all duration-300"
                                >
                                    <UserIcon className="h-4 w-4" />
                                    My Company Profile
                                </Link>
                            </div>
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
                                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-800/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <Avatar src={partner.avatarUrl} name={partner.name} size="lg" />
                                                <div>
                                                    <Link to={`/partner/${partner.id}`} className="font-semibold text-white hover:text-indigo-400 transition-colors">
                                                        {partner.name}
                                                    </Link>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getReputationColor(partner.reputationBand)}`}>
                                                            {partner.reputationBand}
                                                        </span>
                                                        <span className={`text-xs font-medium ${
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
                                                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors" 
                                                        title="Accept Application"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => updateApplicationStatus(app.id, ApplicationStatus.REJECTED)} 
                                                        className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors" 
                                                        title="Reject Application"
                                                    >
                                                        <XCircleIcon className="h-5 w-5"/>
                                                    </button>
                                                </div>
                                            )}
                                            {app.status === 'Accepted' && (
                                                <Link 
                                                    to={`/workspace/${partner.id}`}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-lg text-xs font-bold border border-indigo-500/20 transition-all"
                                                >
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                    Go to Workspace
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

                {/* Find Partners Section */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Find Growth Partners</h2>
                                <p className="text-sm text-gray-400">Browse {partners.length} vetted professionals</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAiFind} 
                            title="Find best matches with AI" 
                            className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20"
                        >
                            <SparklesIcon className="h-4 w-4" />
                            Find with AI
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Skills</label>
                            <input 
                                type="text" 
                                name="skills" 
                                value={partnerFilters.skills} 
                                onChange={handlePartnerFilterChange} 
                                className="w-full bg-gray-800/60 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                                placeholder="e.g., SEO, PPC"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Reputation</label>
                            <select 
                                name="reputation" 
                                value={partnerFilters.reputation} 
                                onChange={handlePartnerFilterChange} 
                                className="w-full bg-gray-800/60 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            >
                                <option value="">Any reputation</option>
                                {Object.values(ReputationBand).map(band => <option key={band} value={band}>{band}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                            <input 
                                type="text" 
                                name="location" 
                                value={partnerFilters.location} 
                                onChange={handlePartnerFilterChange} 
                                className="w-full bg-gray-800/60 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" 
                                placeholder="e.g., London"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Work Mode</label>
                            <select 
                                name="workMode" 
                                value={partnerFilters.workMode} 
                                onChange={handlePartnerFilterChange} 
                                className="w-full bg-gray-800/60 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            >
                                <option value="">Any mode</option>
                                {Object.values(WorkMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                            </select>
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