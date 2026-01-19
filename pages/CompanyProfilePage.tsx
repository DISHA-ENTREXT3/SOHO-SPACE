
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
      <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[3rem] p-12 my-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 relative z-10">
            <div className="flex-grow">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-[var(--bg-primary)] border border-[var(--glass-border)] p-2 shadow-2xl group-hover:scale-105 transition-all duration-700 flex-shrink-0">
                         <Avatar src={company.logoUrl} name={company.name} size="lg" className="h-full w-full rounded-[2rem] object-contain p-4" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Verified Growth Mandate</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-none mb-6">{company.name}</h1>
                        <div className="flex flex-wrap items-center gap-6">
                            <span className="flex items-center text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                <MapPinIcon className="h-5 w-5 mr-3 text-indigo-600" />
                                {company.location}
                            </span>
                            <span className="flex items-center text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                <ClockIcon className="h-5 w-5 mr-3 text-indigo-600" />
                                {(company.workModes || []).join(' / ')}
                            </span>
                        </div>
                    </div>
                </div>
                <div 
                  className="text-lg md:text-xl text-[var(--text-secondary)] font-medium leading-[1.8] mt-12 rich-text-content max-w-4xl selection:bg-indigo-600/20" 
                  dangerouslySetInnerHTML={{ __html: company.description }} 
                />
            </div>
            {userIsPartner && (
                <div className="lg:mt-0 flex-shrink-0">
                    <button 
                        onClick={handleApply}
                        disabled={hasApplied || isApplying || hasNoOpenPositions}
                        className={`w-full lg:w-auto font-black uppercase tracking-[0.2em] text-[11px] py-6 px-12 rounded-[1.5rem] transition-all disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-2xl hover:-translate-y-1 active:scale-95 ${
                            hasApplied 
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default' 
                                : hasNoOpenPositions 
                                    ? 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--glass-border)] opacity-50'
                                    : 'bg-indigo-600 text-white shadow-indigo-600/25'
                        }`}
                    >
                        {isApplying ? (
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : hasApplied ? (
                            <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                            <RocketLaunchIcon className="h-5 w-5" />
                        )}
                        {hasApplied ? 'PROTOCOL ACTIVE' : hasNoOpenPositions ? 'NO OPEN ROLES' : isPaused ? 'RECRUITMENT PAUSED' : 'INITIATE DEPLOYMENT'}
                    </button>
                    {hasApplied && (
                        <p className="text-center mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 opacity-60">Sequence Initiated</p>
                    )}
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-10 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-32 bg-gradient-to-b from-indigo-600 to-transparent opacity-40" />
          <h2 className="text-[10px] font-black text-[var(--text-primary)] mb-8 flex items-center gap-4 uppercase tracking-[0.3em]">
             <LightBulbIcon className="h-6 w-6 text-indigo-600"/>
             Growth Expectations
          </h2>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed font-medium selection:bg-indigo-600/20">{company.partnerExpectations}</p>
          <div className="mt-10 pt-10 border-t border-[var(--glass-border)]">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4 opacity-40">Collaboration Cycle:</h3>
              <div className="px-6 py-3 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] w-fit">
                {company.collaborationLength}
              </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[2.5rem] p-10 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-32 bg-gradient-to-b from-emerald-600 to-transparent opacity-40" />
          <h2 className="text-[10px] font-black text-[var(--text-primary)] mb-8 flex items-center gap-4 uppercase tracking-[0.3em]">
            <BanknotesIcon className="h-6 w-6 text-emerald-500"/>
            Value Logic
          </h2>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed font-medium selection:bg-emerald-600/20">{company.compensationPhilosophy}</p>
          <div className="mt-10 pt-10 border-t border-[var(--glass-border)] opacity-30">
             <div className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Equity & Revenue Share Compatible</div>
          </div>
        </div>
      </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] shadow-2xl rounded-[3rem] p-12 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600/30 to-transparent" />
        <h2 className="text-[10px] font-black text-[var(--text-primary)] mb-12 uppercase tracking-[0.3em] flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-indigo-600" />
             Active Growth Vectors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {company.positions && company.positions.length > 0 ? (
                company.positions.map(pos => (
                    <div key={pos.id} className="group/item flex flex-col p-8 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-[2rem] hover:border-indigo-600/40 transition-all shadow-xl hover:-translate-y-1">
                        <div className="flex justify-between items-start gap-4 mb-8">
                            <h3 className="font-black text-[var(--text-primary)] text-sm uppercase tracking-tight leading-tight group-hover/item:text-indigo-600 transition-colors">{pos.title}</h3>
                            <span className={`text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2 border ${
                                pos.status === PositionStatus.OPEN ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                pos.status === PositionStatus.PAUSED ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    pos.status === PositionStatus.OPEN ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                    pos.status === PositionStatus.PAUSED ? 'bg-amber-500' : 'bg-rose-500'
                                }`} />
                                {pos.status}
                            </span>
                        </div>
                         <div className="mt-auto pt-6 border-t border-[var(--glass-border)] opacity-20 group-hover/item:opacity-40 transition-opacity">
                            <div className="text-[7px] font-black uppercase tracking-[0.4em]">Mandate Active • 2026 Serial v.1.0</div>
                         </div>
                    </div>
                ))
            ) : (
                (company.seeking || []).map(role => (
                    <div key={role} className="bg-[var(--bg-primary)] text-indigo-600 border border-indigo-600/10 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:border-indigo-600 transition-all text-center">
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