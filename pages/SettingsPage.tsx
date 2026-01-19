
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { DocumentPlusIcon, ArrowDownTrayIcon, ShieldCheckIcon, PaperClipIcon, PencilIcon, XCircleIcon, CameraIcon, DocumentTextIcon, CheckCircleIcon, SparklesIcon, LightBulbIcon, RocketLaunchIcon } from '../components/Icons';
import { useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { CompanyDocument, WorkMode } from '../types';
import BackButton from '../components/BackButton';
import { storageService } from '../services/storageService';
import Avatar from '../components/Avatar';

const FounderSettings = () => {
    const { user, refreshUser } = useAuth();
    const { getCompany, addDocumentToCompany, removeDocumentFromCompany, updateCompanyProfile, updateUserAvatar } = useAppContext();
    const company = user ? getCompany(user.profileId) : null;
    
    const [isUploading, setIsUploading] = useState(false);
    const [isLogoUploading, setIsLogoUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [docType, setDocType] = useState<'NDA' | 'Legal' | 'Requirement'>('NDA');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        partnerExpectations: '',
        collaborationLength: '',
        compensationPhilosophy: '',
    });

    // Synchronize formData when company data loads or changes
    React.useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || '',
                description: company.description || '',
                location: company.location || '',
                partnerExpectations: company.partnerExpectations || '',
                collaborationLength: company.collaborationLength || '',
                compensationPhilosophy: company.compensationPhilosophy || '',
            });
        }
    }, [company?.id, company?.name]); // Dependency on name ensures update if refreshing

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--glass-border)]">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest">Loading company profile...</p>
            </div>
        );
    }
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateCompanyProfile(company.id, formData);
        alert('Profile updated successfully!');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            try {
                setIsLogoUploading(true);
                const base64Url = await storageService.uploadImage(file, 'logos');
                await updateUserAvatar(user.id, base64Url);
                await refreshUser();
                alert('Logo updated successfully!');
            } catch (error) {
                console.error('Logo upload error:', error);
                alert('Failed to process image. Please try a smaller file (under 2MB).');
            } finally {
                setIsLogoUploading(false);
            }
        }
    };

    const handleAddDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (file && company) {
            try {
                setIsUploading(true);
                const url = await storageService.uploadDocument(file);
                await addDocumentToCompany(company.id, {
                    name: file.name,
                    type: docType,
                    url: url
                });
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } catch (error) {
                console.error('Document upload error:', error);
                alert('Document processing failed. Please try a smaller file.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const getDocIcon = (type: CompanyDocument['type']) => {
        switch(type) {
            case 'NDA': return <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />;
            case 'Legal': return <PaperClipIcon className="h-6 w-6 text-blue-600" />;
            case 'Requirement': return <DocumentPlusIcon className="h-6 w-6 text-gray-600" />;
        }
    }

    return (
        <div className="glass-card p-4 sm:p-8 space-y-10 border-[var(--glass-border)] bg-[var(--glass-bg)] rounded-3xl">
            {/* Header / Avatar Section */}
            <div className="flex flex-col items-center pb-8 border-b border-[var(--glass-border)]">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-[var(--bg-secondary)] border-2 border-indigo-500/30 shadow-2xl relative">
                        <Avatar 
                            src={user?.avatarUrl} 
                            name={company?.name || user?.name || 'Company'} 
                            className="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <CameraIcon className="w-8 h-8 text-white/70" />
                        </div>
                    </div>
                    <button 
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isLogoUploading}
                        className={`absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-xl hover:bg-indigo-500 transition-all hover:scale-110 active:scale-95 z-10 ${isLogoUploading ? 'opacity-50' : ''}`}
                    >
                        {isLogoUploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CameraIcon className="w-5 h-5" />
                        )}
                    </button>
                    <input 
                        type="file" 
                        ref={logoInputRef} 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                <h3 className="mt-6 text-xl font-black text-[var(--text-primary)] tracking-tight">Company Identity</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Manage your brand logo and visuals</p>
            </div>

            {/* Role Management Section */}
            <div className="border-t border-[var(--glass-border)] pt-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <RocketLaunchIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Open Roles & Positions</h2>
                    </div>
                </div>
                <p className="text-[var(--text-secondary)] mb-8 max-w-2xl text-sm leading-relaxed font-medium">Manage the positions you're currently hiring for. You can pause or close them to control application volume.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {company.positions && company.positions.length > 0 ? (
                        company.positions.map((pos) => (
                            <div key={pos.id} className="p-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--glass-border)] flex flex-col justify-between group transition-all hover:border-indigo-500/30">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)] mb-1">{pos.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${
                                                pos.status === 'Open' ? 'bg-emerald-500' :
                                                pos.status === 'Paused' ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} />
                                            <span className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest">{pos.status}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            const updatedPositions = company.positions.filter(p => p.id !== pos.id);
                                            await updateCompanyProfile(company.id, { positions: updatedPositions });
                                        }}
                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    >
                                        <XCircleIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--glass-border)]">
                                    <button 
                                        onClick={async () => {
                                            const updated = company.positions.map(p => p.id === pos.id ? { ...p, status: 'Open' } : p);
                                            await updateCompanyProfile(company.id, { positions: updated as any });
                                        }}
                                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${pos.status === 'Open' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-indigo-500 border border-transparent'}`}
                                    >
                                        Open
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const updated = company.positions.map(p => p.id === pos.id ? { ...p, status: 'Paused' } : p);
                                            await updateCompanyProfile(company.id, { positions: updated as any });
                                        }}
                                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${pos.status === 'Paused' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-indigo-500 border border-transparent'}`}
                                    >
                                        Pause
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const updated = company.positions.map(p => p.id === pos.id ? { ...p, status: 'Closed' } : p);
                                            await updateCompanyProfile(company.id, { positions: updated as any });
                                        }}
                                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${pos.status === 'Closed' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-indigo-500 border border-transparent'}`}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 border-2 border-dashed border-[var(--glass-border)] rounded-3xl flex flex-col items-center justify-center bg-[var(--bg-secondary)]">
                            <RocketLaunchIcon className="w-10 h-10 text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">No roles listed yet</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <input 
                        type="text" 
                        id="newPosTitle"
                        placeholder="e.g. Head of Growth" 
                        className="form-input flex-grow bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50"
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                const input = e.currentTarget as HTMLInputElement;
                                if (input.value) {
                                    const newPos = { id: uuidv4(), title: input.value, status: 'Open' };
                                    const updatedPositions = [...(company.positions || []), newPos];
                                    await updateCompanyProfile(company.id, { positions: updatedPositions as any });
                                    input.value = '';
                                }
                            }
                        }}
                    />
                    <button 
                        onClick={async () => {
                            const input = document.getElementById('newPosTitle') as HTMLInputElement;
                            if (input.value) {
                                const newPos = { id: uuidv4(), title: input.value, status: 'Open' };
                                const updatedPositions = [...(company.positions || []), newPos];
                                await updateCompanyProfile(company.id, { positions: updatedPositions as any });
                                input.value = '';
                            }
                        }}
                        className="btn btn-secondary px-6 shrink-0 font-bold text-xs uppercase tracking-widest"
                    >
                        Add Position
                    </button>
                </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-8 border-t border-[var(--glass-border)] pt-10">
                 <div className="flex items-center gap-3 mb-2">
                    <PencilIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Company Profile</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Company Name <span className="text-rose-500">*</span></label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} className="form-input w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g., Acme Corp" required />
                    </div>
                     <div className="form-group">
                        <label htmlFor="location" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Global Location</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleFormChange} placeholder="e.g., London, UK" className="form-input w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                 </div>

                 <div className="form-group">
                    <label htmlFor="description" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Company Bio & Vision <span className="text-rose-500">*</span></label>
                    <div className="mt-2 bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--glass-border)] focus-within:border-indigo-500/50 transition-all">
                        <ReactQuill 
                            theme="snow" 
                            value={formData.description} 
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            placeholder="Describe your mission, story, and vision with style..."
                            modules={{
                                toolbar: [
                                    [{ 'header': [1, 2, false] }],
                                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                    ['link', 'clean']
                                ],
                            }}
                            className="text-[var(--text-primary)]"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="partnerExpectations" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Ideal Partner Profile</label>
                    <textarea name="partnerExpectations" id="partnerExpectations" value={formData.partnerExpectations} onChange={handleFormChange} rows={4} className="form-textarea w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="Who are you looking for?"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="collaborationLength" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Commitment Duration</label>
                        <input type="text" name="collaborationLength" id="collaborationLength" value={formData.collaborationLength} onChange={handleFormChange} placeholder="e.g., 3-6 Months" className="form-input w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="compensationPhilosophy" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Compensation Approach</label>
                        <input type="text" name="compensationPhilosophy" id="compensationPhilosophy" value={formData.compensationPhilosophy} onChange={handleFormChange} placeholder="Equity / Revenue Share / Fixed" className="form-input w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                </div>

                  <div className="flex flex-col gap-4">
                    {!formData.name || !formData.description || (company.positions?.length === 0) ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                <LightBulbIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Incomplete Profile</h5>
                                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-medium">Your company won't appear in Discovery until you add a name, description, and at least one role.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Live in Discovery</h5>
                                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-medium">Your profile is complete and visible to partners.</p>
                            </div>
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary w-full sm:w-auto shadow-lg shadow-indigo-500/20 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        <CheckCircleIcon className="h-4 w-4" />
                        Save Profile Changes
                    </button>
                  </div>
            </form>

            <div className="border-t border-[var(--glass-border)] pt-10">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheckIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Trust & Security</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-8 max-w-2xl text-sm leading-relaxed font-medium">Manage legal documents and onboarding requirements. These files will be accessible to growth partners during the application phase.</p>

                <div className="space-y-4 mb-8">
                    {company.documents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {company.documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center border border-[var(--glass-border)]">
                                            {getDocIcon(doc.type)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--text-primary)] text-sm truncate max-w-[150px]">{doc.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{doc.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <a href={doc.url} download className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                        </a>
                                         <button onClick={async () => await removeDocumentFromCompany(company.id, doc.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition">
                                            <XCircleIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-[var(--glass-border)] rounded-3xl bg-[var(--bg-secondary)]">
                            <SparklesIcon className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                            <p className="text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px]">No documents uploaded yet</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleAddDocument} className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--glass-border)]">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] mb-6 uppercase tracking-widest">Upload New Document</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="form-group mb-0">
                            <label htmlFor="docFile" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Select File</label>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="docFile"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-xl text-[var(--text-muted)] text-sm hover:border-indigo-500/30 transition-all font-medium"
                                >
                                    <span className="truncate">{file ? file.name : 'Choose a PDF or Doc...'}</span>
                                    <PaperClipIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="form-group mb-0">
                            <label htmlFor="docType" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Document Category</label>
                            <select 
                                id="docType"
                                value={docType}
                                onChange={e => setDocType(e.target.value as any)}
                                className="form-select w-full bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50 font-medium"
                            >
                                <option value="NDA">NDA Agreement</option>
                                <option value="Legal">Legal Compliance</option>
                                <option value="Requirement">Job Requirement</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] py-4 shadow-lg shadow-indigo-600/10" disabled={!file || isUploading}>
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                                Syncing to Cloud...
                            </>
                        ) : (
                            <>
                                <DocumentPlusIcon className="h-4 w-4" />
                                Add To Vault
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const PartnerSettings = () => {
    const { user, refreshUser } = useAuth();
    const { getPartner, updatePartnerProfile, removeResumeFromPartner, updateUserAvatar } = useAppContext();
    
    if (!user || user.role !== 'PARTNER') return null;
    const partner = getPartner(user.profileId);
    
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [isResumeUploading, setIsResumeUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        workModePreference: WorkMode.REMOTE,
    });
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [managedBrands, setManagedBrands] = useState<string[]>([]);
    const [newBrand, setNewBrand] = useState('');
    const [resumeFileName, setResumeFileName] = useState('No CV uploaded');
    const resumeInputRef = useRef<HTMLInputElement>(null);

    // Synchronize formData when partner data loads or changes
    React.useEffect(() => {
        if (partner) {
            setFormData({
                name: partner.name || '',
                bio: partner.bio || '',
                location: partner.location || '',
                workModePreference: partner.workModePreference || WorkMode.REMOTE,
            });
            setSkills(partner.skills || []);
            setManagedBrands(partner.managedBrands || []);
            setResumeFileName((partner.resumeUrl && partner.resumeUrl.split('/').pop()) || 'No CV uploaded');
        }
    }, [partner?.id, partner?.name]);

    if (!partner) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--glass-border)]">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest">Loading partner profile...</p>
            </div>
        );
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && partner) {
            const file = e.target.files[0];
            try {
                setIsResumeUploading(true);
                const url = await storageService.uploadDocument(file);
                await updatePartnerProfile(partner.id, { resumeUrl: url });
                setResumeFileName(file.name);
            } catch (error) {
                alert('Failed to upload CV. Please try again.');
            } finally {
                setIsResumeUploading(false);
            }
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            try {
                setIsAvatarUploading(true);
                const publicUrl = await storageService.uploadImage(file, 'avatars');
                await updateUserAvatar(user.id, publicUrl);
                await refreshUser();
            } catch (error) {
                alert('Avatar upload failed. Using local preview.');
                const mockUrl = URL.createObjectURL(file);
                await updateUserAvatar(user.id, mockUrl);
                await refreshUser();
            } finally {
                setIsAvatarUploading(false);
            }
        }
    };
    
    const handleRemoveResume = async () => {
        await removeResumeFromPartner(partner.id);
        setResumeFileName('No CV uploaded');
        if(resumeInputRef.current) resumeInputRef.current.value = "";
    };

    const handleAddSkill = async () => {
        if (newSkill && !skills.includes(newSkill)) {
            const updatedSkills = [...skills, newSkill];
            setSkills(updatedSkills);
            await updatePartnerProfile(partner.id, { skills: updatedSkills });
            setNewSkill('');
        }
    };
    const handleRemoveSkill = async (skillToRemove: string) => {
        const updatedSkills = skills.filter(skill => skill !== skillToRemove);
        setSkills(updatedSkills);
        await updatePartnerProfile(partner.id, { skills: updatedSkills });
    };

    const handleAddBrand = async () => {
        if (newBrand && !managedBrands.includes(newBrand)) {
            const updatedBrands = [...managedBrands, newBrand];
            setManagedBrands(updatedBrands);
            await updatePartnerProfile(partner.id, { managedBrands: updatedBrands });
            setNewBrand('');
        }
    };
    const handleRemoveBrand = async (brandToRemove: string) => {
        const updatedBrands = managedBrands.filter(brand => brand !== brandToRemove);
        setManagedBrands(updatedBrands);
        await updatePartnerProfile(partner.id, { managedBrands: updatedBrands });
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updatePartnerProfile(partner.id, formData);
        alert('Profile updated successfully!');
    };

    return (
        <div className="glass-card p-4 sm:p-8 space-y-10 border-[var(--glass-border)] bg-[var(--glass-bg)] rounded-3xl">
            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center pb-8 border-b border-[var(--glass-border)]">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-[var(--bg-secondary)] border-2 border-indigo-500/30 shadow-2xl relative">
                        <Avatar 
                            src={user?.avatarUrl} 
                            name={user?.name || 'User'} 
                            className="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <CameraIcon className="w-8 h-8 text-white/70" />
                        </div>
                    </div>
                    <button 
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isAvatarUploading}
                        className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-500 transition-all hover:scale-110 active:scale-95 z-10"
                    >
                        {isAvatarUploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CameraIcon className="w-5 h-5" />
                        )}
                    </button>
                    <input 
                        type="file" 
                        ref={avatarInputRef} 
                        onChange={handleAvatarUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                <h3 className="mt-6 text-xl font-black text-[var(--text-primary)] tracking-tight">{formData.name || 'Your Professional Identity'}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Manage your photo and personal branding</p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                    <PencilIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Direct Info</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Full Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} className="form-input w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="Your name" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Location</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleFormChange} placeholder="e.g., San Francisco, USA" className="form-input w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="bio" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Professional Bio</label>
                    <textarea name="bio" id="bio" value={formData.bio} onChange={handleFormChange} rows={5} className="form-textarea w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" placeholder="Describe your background and expertise..."></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="workModePreference" className="form-label font-bold text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3 block">Collaboration Mode</label>
                    <select name="workModePreference" id="workModePreference" value={formData.workModePreference} onChange={handleFormChange} className="form-select w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50">
                        {Object.values(WorkMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-full sm:w-auto shadow-lg shadow-indigo-500/20 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Apply Profile Changes
                </button>
            </form>
            
            <div className="border-t border-[var(--glass-border)] pt-10">
                <h3 className="text-sm font-black text-[var(--text-primary)] mb-6 uppercase tracking-widest flex items-center gap-2">
                    <PaperClipIcon className="w-5 h-5 text-[var(--text-muted)]" />
                    Professional CV
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl group transition-all hover:border-indigo-500/30">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <DocumentTextIcon className="h-6 w-6"/>
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                        <span className={`block font-bold text-sm ${partner.resumeUrl ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] italic'}`}>
                            {resumeFileName}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">PDF, DOC (Max 5MB)</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {partner.resumeUrl ? (
                            <button onClick={handleRemoveResume} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-transparent w-full sm:w-auto transition-all">Delete CV</button>
                        ) : (
                            <button 
                                onClick={() => resumeInputRef.current?.click()} 
                                disabled={isResumeUploading}
                                className="btn btn-secondary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest w-full sm:w-auto transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                {isResumeUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>Choose File</>
                                )}
                            </button>
                        )}
                        <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} className="hidden" accept=".pdf,.doc,.docx"/>
                    </div>
                </div>
            </div>

            <div className="border-t border-[var(--glass-border)] pt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Skills Section */}
                <div>
                    <h3 className="text-[10px] font-black text-[var(--text-primary)] mb-6 uppercase tracking-widest flex items-center gap-2">
                        <LightBulbIcon className="w-5 h-5 text-amber-500" />
                        Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                        {skills.map(skill => (
                            <span key={skill} className="inline-flex items-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 group hover:bg-indigo-500/20 transition-all">
                                {skill}
                                <button onClick={() => handleRemoveSkill(skill)} className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><XCircleIcon className="h-4 w-4"/></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add Skill..." className="form-input w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500/50" onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()} />
                        <button onClick={handleAddSkill} className="btn btn-secondary px-6 group transition-all"><DocumentPlusIcon className="w-5 h-5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"/></button>
                    </div>
                </div>

                {/* Brands Section */}
                <div>
                    <h3 className="text-[10px] font-black text-[var(--text-primary)] mb-6 uppercase tracking-widest flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        Key Projects
                    </h3>
                     <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                        {managedBrands.map(brand => (
                            <span key={brand} className="inline-flex items-center bg-teal-500/10 text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-teal-500/20 group hover:bg-teal-500/20 transition-all">
                                {brand}
                                <button onClick={() => handleRemoveBrand(brand)} className="ml-2 text-teal-600 dark:text-teal-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><XCircleIcon className="h-4 w-4"/></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="Link or Brand..." className="form-input w-full bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-primary)] px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500/50" onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()} />
                        <button onClick={handleAddBrand} className="btn btn-secondary px-6 group transition-all"><DocumentPlusIcon className="w-5 h-5 group-hover:text-teal-600 dark:group-hover:text-teal-400"/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const { user } = useAuth();
    
    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-[var(--bg-primary)]">
                <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
                    <XCircleIcon className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-3xl font-black text-[var(--text-primary)] mb-3 tracking-tight">Access Denied</h2>
                <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto leading-relaxed">You must be logged in to manage your account settings.</p>
                <Link to="/login" className="btn btn-primary px-8 py-3.5 font-black uppercase tracking-widest text-[10px]">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[var(--bg-primary)] min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <BackButton />
                    <h1 className="text-5xl font-black text-[var(--text-primary)] mt-6 tracking-tighter">
                        {(user.role === 'FOUNDER' || user.role === 'ADMIN') ? 'Account ' : 'Professional '}
                        <span className="text-indigo-600 dark:text-indigo-400">Settings</span>
                    </h1>
                </div>
                <div className="hidden sm:block">
                    <div className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{user.role} PORTAL</span>
                    </div>
                </div>
            </div>
            
            <div className="relative">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                
                {(user.role === 'FOUNDER' || user.role === 'ADMIN') ? <FounderSettings /> : <PartnerSettings />}
            </div>
        </div>
    );
}

export default SettingsPage;