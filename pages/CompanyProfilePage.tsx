
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { MapPinIcon, ClockIcon, BanknotesIcon, LightBulbIcon, PaperClipIcon, ArrowDownTrayIcon, ShieldCheckIcon } from '../components/Icons';
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
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8 my-4">
        <div className="flex flex-col sm:flex-row items-start justify-between">
            <div>
                <div className="flex items-center mb-4">
                    <Avatar src={company.logoUrl} name={company.name} size="xl" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">{company.name}</h1>
                        <div className="flex items-center mt-2 text-gray-300 space-x-6">
                            <span className="flex items-center"><MapPinIcon className="h-5 w-5 mr-2" />{company.location}</span>
                            <span className="flex items-center"><ClockIcon className="h-5 w-5 mr-2" />{(company.workModes || []).join(' / ')}</span>
                        </div>
                    </div>
                </div>
                <div 
                  className="text-lg text-gray-200 leading-relaxed mt-4 rich-text-content" 
                  dangerouslySetInnerHTML={{ __html: company.description }} 
                />
            </div>
            {userIsPartner && (
                <div className="mt-6 sm:mt-0 sm:ml-6 flex-shrink-0">
                    <button 
                        onClick={handleApply}
                        disabled={hasApplied || isApplying}
                        className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isApplying && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {hasApplied ? 'Application Submitted' : 'Apply to Collaborate'}
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><LightBulbIcon className="h-6 w-6 mr-3 text-indigo-400"/>What We're Looking For</h2>
          <p className="text-gray-300">{company.partnerExpectations}</p>
          <div className="mt-4">
              <h3 className="font-semibold text-gray-400">Typical Collaboration:</h3>
              <p className="text-gray-200">{company.collaborationLength}</p>
          </div>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><BanknotesIcon className="h-6 w-6 mr-3 text-green-400"/>Compensation Philosophy</h2>
          <p className="text-gray-300">{company.compensationPhilosophy}</p>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Seeking Growth Partners For:</h2>
        <div className="flex flex-wrap gap-3">
            {(company.seeking || []).map(role => (
                <span key={role} className="bg-teal-400/20 text-teal-300 px-3 py-1.5 rounded-full text-md font-medium">{role}</span>
            ))}
        </div>
      </div>

      {userIsPartner && company.documents && company.documents.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Evaluation Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {company.documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {doc.type === 'NDA' ? <ShieldCheckIcon className="h-6 w-6" /> : <PaperClipIcon className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{doc.type}</p>
                  </div>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg transition">
                  <ArrowDownTrayIcon className="h-5 w-5" />
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