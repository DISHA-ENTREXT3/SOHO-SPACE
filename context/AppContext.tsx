
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { 
    Application, ApplicationStatus, Collaboration, CompanyProfile, Decision, Framework, 
    PartnerProfile, Notification, CompanyDocument, UserRole, User, ChatMessage,
    CollaborationFile 
} from '../types';
import { db, initializeDatabase } from '../services/database';
import { v4 as uuidv4 } from 'uuid';



interface AppContextType {
  users: User[];
  companies: CompanyProfile[];
  partners: PartnerProfile[];
  frameworks: Framework[];
  applications: Application[];
  collaborations: Collaboration[];
  notifications: Notification[];
  isDataLoaded: boolean;
  getCompany: (id: string) => CompanyProfile | undefined;
  getPartner: (id: string) => PartnerProfile | undefined;
  getFramework: (id: string) => Framework | undefined;
  getCollaboration: (id: string) => Collaboration | undefined;
  getApplicationsForCompany: (companyId: string) => Application[];
  getApplicationsByPartner: (partnerId: string) => Application[];
  createApplication: (companyId: string, partnerId: string) => void;
  updateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  addDecisionToCollaboration: (collabId: string, decision: Omit<Decision, 'id' | 'timestamp'>) => void;
  updateCollaborationNotes: (collabId: string, phase: string, notes: string) => void;
  updateCollaborationMetrics: (collabId: string, phase: string, metrics: string) => void;
  toggleSaveOpportunity: (partnerId: string, companyId: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  addDocumentToCompany: (companyId: string, document: Omit<CompanyDocument, 'id'>) => void;
  updatePartnerProfile: (partnerId: string, data: Partial<Omit<PartnerProfile, 'id'>>) => void;
  updateCompanyProfile: (companyId: string, data: Partial<Omit<CompanyProfile, 'id'>>) => void;
  removeFileFromCollaboration: (collabId: string, fileId: string) => void;
  addFileToCollaboration: (collabId: string, file: Omit<CollaborationFile, 'id' | 'uploadedAt'>) => void;
  updateCollaborationFramework: (collabId: string, framework: Framework) => void;
  addLinkToCollaboration: (collabId: string, link: { title: string, url: string, phase?: string }) => void;
  removeLinkFromCollaboration: (collabId: string, linkId: string) => void;
  removeDocumentFromCompany: (companyId: string, documentId: string) => void;
  removeResumeFromPartner: (partnerId: string) => void;

  deleteCompany: (companyId: string) => void;
  deletePartner: (partnerId: string) => void;
  completeOnboarding: (userId: string) => void;
  toggleUpvoteCompany: (companyId: string, userId: string) => void;
  toggleUpvotePartner: (partnerId: string, userId: string) => void;
  updateUserAvatar: (userId: string, avatarUrl: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<{success: boolean, message: string}>;
  refreshData: () => void;
  sendMessage: (collabId: string, senderId: string, content: string) => Promise<ChatMessage>;
  getMessages: (collabId: string) => Promise<ChatMessage[]>;
  markMessagesAsRead: (collabId: string, userId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize database on mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Load data from database
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);


  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Function to refresh all data from database
  const refreshData = useCallback(async () => {
    try {
      const [u, c, p, f, a, coll, n] = await Promise.all([
        db.users.getAll(),
        db.companies.getAll(),
        db.partners.getAll(),
        db.frameworks.getAll(),
        db.applications.getAll(),
        db.collaborations.getAll(),
        db.notifications.getAll()
      ]);
      
      setUsers(u);
      setCompanies(c || []);
      setPartners(p || []);
      setFrameworks(f || []);
      setApplications(a || []);
      setCollaborations(coll || []);
      setNotifications(n || []);
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsDataLoaded(true);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getCompany = (id: string) => companies.find(c => c.id === id);
  const getPartner = (id: string) => partners.find(p => p.id === id);
  const getFramework = (id: string) => frameworks.find(f => f.id === id);
  const getCollaboration = (id: string) => collaborations.find(c => c.id === id);

  const getApplicationsForCompany = (companyId: string) => applications.filter(a => a.companyId === companyId);
  const getApplicationsByPartner = (partnerId: string) => applications.filter(a => a.partnerId === partnerId);
  
  const createApplication = async (companyId: string, partnerId: string) => {
    const existingApp = applications.find(a => a.companyId === companyId && a.partnerId === partnerId);
    if (existingApp) return;
    
    await db.applications.create(companyId, partnerId);
    
    const company = companies.find(c => c.id === companyId);
    const partner = partners.find(p => p.id === partnerId);
    if (company && partner) {
      const companyUserId = users.find(u => u.profileId === companyId)?.id;
      if (companyUserId) {
        await db.notifications.create(
          companyUserId,
          `${partner.name} has applied to ${company.name}!`,
          `/company/${companyId}`
        );
      }
    }
    
    await refreshData();
  };

  const updateApplicationStatus = async (appId: string, status: ApplicationStatus) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    await db.applications.update(appId, { status });
    
    if (status === ApplicationStatus.ACCEPTED) {
      const framework = frameworks[0];
      if (framework) {
        await db.collaborations.create(app.companyId, app.partnerId, framework);
      }
      
      const company = companies.find(c => c.id === app.companyId);
      const partnerUserId = users.find(u => u.profileId === app.partnerId)?.id;
      if (partnerUserId && company) {
        await db.notifications.create(
          partnerUserId,
          `Your application to ${company.name} was accepted!`,
          `/workspace/${app.companyId}`
        );
      }
    } else if (status === ApplicationStatus.REJECTED) {
      const company = companies.find(c => c.id === app.companyId);
      const partnerUserId = users.find(u => u.profileId === app.partnerId)?.id;
      if (partnerUserId && company) {
        await db.notifications.create(
          partnerUserId,
          `Your application to ${company.name} was not successful at this time.`,
          '/dashboard'
        );
      }
    }
    
    await refreshData();
  };

  const addDecisionToCollaboration = async (collabId: string, decisionData: Omit<Decision, 'id'|'timestamp'>) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;
    
    const newDecision: Decision = {
      ...decisionData,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    await db.collaborations.update(collabId, {
      decisionLog: [...collab.decisionLog, newDecision]
    });
    
    await refreshData();
  };
  
  const updateCollaborationNotes = async (collabId: string, phase: string, notes: string) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;
    
    await db.collaborations.update(collabId, {
      notes: { ...collab.notes, [phase]: notes }
    });
    
    await refreshData();
  };
  
  const updateCollaborationMetrics = async (collabId: string, phase: string, metrics: string) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;
    
    await db.collaborations.update(collabId, {
      metrics: { ...collab.metrics, [phase]: metrics }
    });
    
    await refreshData();
  };

  const addFileToCollaboration = async (collabId: string, file: Omit<CollaborationFile, 'id' | 'uploadedAt'>) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;
    
    const newFile: CollaborationFile = {
      ...file,
      id: uuidv4(),
      uploadedAt: new Date()
    };
    
    await db.collaborations.update(collabId, {
      files: [...(collab.files || []), newFile]
    });
    
    await refreshData();
  };
  
  const removeFileFromCollaboration = async (collabId: string, fileId: string) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;
    
    await db.collaborations.update(collabId, {
      files: (collab.files || []).filter(f => f.id !== fileId)
    });
    
    await refreshData();
  };

  const updateCollaborationFramework = async (collabId: string, framework: Framework) => {
    await db.collaborations.update(collabId, { framework });
    await refreshData();
  };
  
  const addLinkToCollaboration = async (collabId: string, link: { title: string, url: string, phase?: string }) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;
    
    const newLink = { ...link, id: uuidv4() };
    await db.collaborations.update(collabId, {
      links: [...(collab.links || []), newLink]
    });
    await refreshData();
  };
  
  const removeLinkFromCollaboration = async (collabId: string, linkId: string) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;
    
    await db.collaborations.update(collabId, {
      links: (collab.links || []).filter(l => l.id !== linkId)
    });
    await refreshData();
  };

  const toggleSaveOpportunity = async (partnerId: string, companyId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;
    
    const saved = new Set(partner.savedOpportunities);
    if (saved.has(companyId)) {
      saved.delete(companyId);
    } else {
      saved.add(companyId);
    }
    
    await db.partners.update(partnerId, {
      savedOpportunities: Array.from(saved) as string[]
    });
    
    await refreshData();
  };

  const getNotificationsForUser = (userId: string) => 
    notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const markNotificationAsRead = async (notificationId: string) => {
    await db.notifications.markRead(notificationId);
    await refreshData();
  };

  const addDocumentToCompany = async (companyId: string, document: Omit<CompanyDocument, 'id'>) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;
    
    const newDoc = { ...document, id: uuidv4() };
    await db.companies.update(companyId, {
      documents: [...company.documents, newDoc]
    });
    
    await refreshData();
  };
  
  const removeDocumentFromCompany = async (companyId: string, documentId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;
    
    await db.companies.update(companyId, {
      documents: company.documents.filter(d => d.id !== documentId)
    });
    
    await refreshData();
  };

  const removeResumeFromPartner = async (partnerId: string) => {
    await db.partners.update(partnerId, { resumeUrl: '' });
    await refreshData();
  };

  const updatePartnerProfile = async (partnerId: string, data: Partial<Omit<PartnerProfile, 'id'>>) => {
    // Optimistic update
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, ...data } : p));
    await db.partners.update(partnerId, data);
    // Silent refresh in background
    refreshData();
  };
  
  const updateCompanyProfile = async (companyId: string, data: Partial<Omit<CompanyProfile, 'id'>>) => {
    // Optimistic update
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ...data } : c));
    await db.companies.update(companyId, data);
    // Silent refresh in background
    refreshData();
  };



  const deleteCompany = async (companyId: string) => {
    await db.companies.delete(companyId);
    await refreshData();
  };

  const deletePartner = async (partnerId: string) => {
    await db.partners.delete(partnerId);
    await refreshData();
  };



  const toggleUpvoteCompany = async (companyId: string, userId: string) => {
    await db.companies.toggleUpvote(companyId, userId);
    await refreshData();
  };

  const toggleUpvotePartner = async (partnerId: string, userId: string) => {
    await db.partners.toggleUpvote(partnerId, userId);
    await refreshData();
  };

  const completeOnboarding = async (userId: string) => {
    await db.users.update(userId, { hasCompletedOnboarding: true });
    await refreshData();
  };

  const updateUserAvatar = async (userId: string, avatarUrl: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // 1. Optimistic UI update for immediate feedback
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatarUrl } : u));
    
    if (user.profileId) {
      if (user.role === UserRole.FOUNDER || user.role === UserRole.ADMIN) {
        setCompanies(prev => prev.map(c => c.id === user.profileId ? { ...c, logoUrl: avatarUrl } : c));
      } else if (user.role === UserRole.PARTNER) {
        setPartners(prev => prev.map(p => p.id === user.profileId ? { ...p, avatarUrl } : p));
      }
    }

    // 2. Perform database updates in parallel
    try {
      const updates: Promise<any>[] = [db.users.update(userId, { avatarUrl })];
      
      if (user.profileId) {
        if (user.role === UserRole.FOUNDER || user.role === UserRole.ADMIN) {
          updates.push(db.companies.update(user.profileId, { logoUrl: avatarUrl }));
        } else if (user.role === UserRole.PARTNER) {
          updates.push(db.partners.update(user.profileId, { avatarUrl }));
        }
      }
      
      await Promise.all(updates);
      // Background refresh to ensure consistency
      refreshData();
    } catch (error) {
      console.error('[App] Failed to update avatar in DB:', error);
      // Rollback could be implemented here
    }
  };

  const sendMessage = async (collabId: string, senderId: string, content: string) => {
    return await db.messages.send(collabId, senderId, content);
  };

  const getMessages = async (collabId: string) => {
    return await db.messages.getByCollaboration(collabId);
  };

  const markMessagesAsRead = async (collabId: string, userId: string) => {
    await db.messages.markRead(collabId, userId);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return { success: false, message: 'User not found' };
    
    // Check admin limit if promoting to admin
    if (newRole === UserRole.ADMIN) {
      const currentAdmins = users.filter(u => u.role === UserRole.ADMIN);
      if (currentAdmins.length >= 5) {
        return { success: false, message: 'Maximum limit of 5 admins reached. Please demote an existing admin first.' };
      }
    }
    
    try {
      await db.users.update(userId, { role: newRole });
      await refreshData();
      return { success: true, message: `User role updated to ${newRole}` };
    } catch (error: any) {
      return { success: false, message: 'Error updating role: ' + error.message };
    }
  };

  const value = {
    users, companies, partners, frameworks, applications, collaborations, notifications,
    isDataLoaded,
    getCompany, getPartner, getFramework, getCollaboration,
    getApplicationsForCompany, getApplicationsByPartner, createApplication,
    updateApplicationStatus, addDecisionToCollaboration,
    updateCollaborationNotes, updateCollaborationMetrics,
    toggleSaveOpportunity, getNotificationsForUser, markNotificationAsRead,
    addDocumentToCompany, updatePartnerProfile, updateCompanyProfile,
    removeDocumentFromCompany, removeResumeFromPartner,
    deleteCompany, deletePartner, completeOnboarding,
    toggleUpvoteCompany, toggleUpvotePartner,
    updateUserAvatar,
    updateUserRole,
    refreshData,
    addFileToCollaboration, removeFileFromCollaboration, updateCollaborationFramework,
    addLinkToCollaboration, removeLinkFromCollaboration,
    sendMessage,
    getMessages,
    markMessagesAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};