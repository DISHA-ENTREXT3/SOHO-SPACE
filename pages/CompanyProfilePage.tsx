
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, PositionStatus } from '../types';
import { MapPinIcon, ClockIcon, BanknotesIcon, LightBulbIcon, PaperClipIcon, ArrowDownTrayIcon, ShieldCheckIcon, CheckCircleIcon, RocketLaunchIcon } from '../components/Icons';
import NdaModal from '../components/NdaModal';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import SEO from '../components/SEO';

const CompanyProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { getCompany, createApplication, getApplicationsByPartner } = useAppContext();
  const { user } = useAuth();
  const [isNdaModalOpen, setNdaModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  if (!id) return <div>Company not found.</div>;
  const company = getCompany(id);
  
  if (!company) return <div>Company not found.</div>;

  const userIsPartner = user?.role === UserRole.PARTNER;
  const partnerApplications = userIsPartner ? getApplicationsByPartner(user.profileId) : [];
  const hasApplied = partnerApplications.some(app => app.companyId === company.id);
  
  const openPositions = (company.positions || []).filter(p => p.status === PositionStatus.OPEN);
  const hasNoOpenPositions = openPositions.length === 0 && (company.seeking || []).length === 0;
  const isPaused = (company.positions || []).every(p => p.status === PositionStatus.PAUSED) && (company.positions || []).length > 0;

  const handleApply = async () => {
    if (!user || user.role !== UserRole.PARTNER) return;

    if (company.ndaUrl) {
      setNdaModalOpen(true);
    } else {
      setIsApplying(true);
      await createApplication(company.id, user.profileId);
      setIsApplying(false);
    }
  };

  const handleNdaAccept = async () => {
    if (!user || user.role !== UserRole.PARTNER) return;
    setIsApplying(true);
    await createApplication(company.id, user.profileId);
    setIsApplying(false);
    setNdaModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <SEO 
            title={company.name}
            description={company.description ? company.description.substring(0, 160) : `Check out ${company.name} on Soho Space. They are looking for growth partners.`}
            image={company.logoUrl}
            keywords={['Startup', 'We are hiring', ...(company.seeking || [])]}
            type="profile"
            noindex={true}
        />
      <BackButton />
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 my-6 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-2 shadow-md flex-shrink-0">
                         <Avatar src={company.logoUrl} name={company.name} size="lg" className="h-full w-full rounded-lg object-contain" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full px-3 py-1 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Verified Company</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">{company.name}</h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                <MapPinIcon className="h-4 w-4 mr-2 text-indigo-600" />
                                {company.location}
                            </span>
                            <span className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                                <ClockIcon className="h-4 w-4 mr-2 text-indigo-600" />
                                {(company.workModes || []).join(' / ')}
                            </span>
                        </div>
                    </div>
                </div>
                <div 
                  className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-6 rich-text-content" 
                  dangerouslySetInnerHTML={{ __html: company.description }} 
                />
            </div>
            {userIsPartner && (
                <div className="lg:mt-0 flex-shrink-0">
                    <button 
                        onClick={handleApply}
                        disabled={hasApplied || isApplying || hasNoOpenPositions}
                        className={`w-full lg:w-auto font-bold text-sm py-4 px-8 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md ${
                            hasApplied 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-800' 
                                : hasNoOpenPositions 
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700 opacity-50'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 border-2 border-indigo-600'
                        }`}
                    >
                        {isApplying ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : hasApplied ? (
                            <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                            <RocketLaunchIcon className="h-5 w-5" />
                        )}
                        {hasApplied ? 'Applied' : hasNoOpenPositions ? 'No Open Roles' : isPaused ? 'Recruitment Paused' : 'Apply Now'}
                    </button>
                    {hasApplied && (
                        <p className="text-center mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Application Submitted</p>
                    )}
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
             <LightBulbIcon className="h-5 w-5 text-indigo-600"/>
             What We're Looking For
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{company.partnerExpectations}</p>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Typical Collaboration:</h3>
              <div className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-700 dark:text-indigo-400 text-sm font-bold">
                {company.collaborationLength}
              </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BanknotesIcon className="h-5 w-5 text-emerald-600"/>
            Compensation Philosophy
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{company.compensationPhilosophy}</p>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
             <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Equity & Revenue Share Compatible</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-8 shadow-md">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-600" />
             Open Positions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.positions && company.positions.length > 0 ? (
                company.positions.map(pos => (
                    <div key={pos.id} className="group/item p-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 transition-all">
                        <div className="flex justify-between items-start gap-3 mb-3">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{pos.title}</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
                                pos.status === PositionStatus.OPEN ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                pos.status === PositionStatus.PAUSED ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    pos.status === PositionStatus.OPEN ? 'bg-emerald-500' :
                                    pos.status === PositionStatus.PAUSED ? 'bg-amber-500' : 'bg-rose-500'
                                }`} />
                                {pos.status}
                            </span>
                        </div>
                    </div>
                ))
            ) : (
                (company.seeking || []).map(role => (
                    <div key={role} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-4 py-3 rounded-xl text-sm font-bold text-center">
                        {role}
                    </div>
                ))
            )}
        </div>
      </div>

      {userIsPartner && company.documents && company.documents.length > 0 && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[3rem] p-12">
          <h2 className="text-[10px] font-black text-[var(--text-primary)] mb-12 uppercase tracking-[0.3em] flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             Mission Materials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {company.documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-6 bg-[var(--bg-primary)] rounded-[2rem] border border-[var(--glass-border)] hover:border-indigo-600/40 transition-all group shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                    {doc.type === 'NDA' ? <ShieldCheckIcon className="h-6 w-6" /> : <PaperClipIcon className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-black text-[var(--text-primary)] text-sm uppercase tracking-tight">{doc.name}</p>
                    <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-2 opacity-40">{doc.type} DEPLOYMENT</p>
                  </div>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-4 text-[var(--text-muted)] hover:text-indigo-600 hover:bg-indigo-600/10 rounded-2xl transition-all shadow-lg hover:shadow-indigo-600/10">
                  <ArrowDownTrayIcon className="h-6 w-6" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {isNdaModalOpen && company.ndaUrl && (
        <NdaModal 
          ndaUrl={company.ndaUrl}
          onAccept={handleNdaAccept}
          onClose={() => setNdaModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CompanyProfilePage;