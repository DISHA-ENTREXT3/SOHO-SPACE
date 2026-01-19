/**
 * Soho Space Database Service - Supabase Implementation
 *
 * Data persists in Supabase.
 */

import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseClient";
import {
  User,
  UserRole,
  CompanyProfile,
  PartnerProfile,
  Framework,
  Application,
  Collaboration,
  ApplicationStatus,
  ReputationBand,
  Notification,
  WorkMode,
  SubscriptionPlan,
  PositionStatus,
  ChatMessage,
} from "../types";


// ==================== HELPER FUNCTIONS ====================


const toSnake = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnake(obj[key]);
  }
  return result;
};

const toCamel = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/([-_][a-z])/g, group =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
    result[camelKey] = toCamel(obj[key]);
  }
  return result;
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Check Supabase connection correctly by querying the companies table
    const { count, error } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true });
    
    if (error) {
      console.warn("[DB] Supabase connection check:", error.message);
    } else {
      console.log("[DB] Supabase connected successfully, companies count:", count);
    }
  } catch (error) {
    console.error("[DB] Initialization error:", error);
  }
};

// ==================== USER OPERATIONS (Supabase) ====================

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return (data || []).map(toCamel) as User[];
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw error;
  return toCamel(data) as User | null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
  if (error && error.code !== "PGRST116") throw error;
  return toCamel(data) as User | null;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const newUser: any = {
    createdAt: new Date().toISOString(),
    ...userData,
  };
  const { data, error } = await supabase
    .from("users")
    .insert([toSnake(newUser)])
    .select()
    .single();
  if (error) throw error;
  return toCamel(data) as User;
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .update(toSnake(updates))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toCamel(data) as User | null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
  return true;
};

// ==================== COMPANY OPERATIONS (Supabase) ====================

export const getCompanies = async (): Promise<CompanyProfile[]> => {
  const { data, error } = await supabase.from("companies").select("*");
  if (error) throw error;
  const companies = (data || []).map(toCamel) as CompanyProfile[];
  return companies.map(c => ({
    ...c,
    positions: c.positions || (c.seeking || []).map(title => ({ id: uuidv4(), title: title as unknown as string, status: PositionStatus.OPEN }))
  }));
};

export const getCompanyById = async (
  id: string
): Promise<CompanyProfile | null> => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;
  const company = toCamel(data) as CompanyProfile;
  return {
    ...company,
    positions: company.positions || (company.seeking || []).map(title => ({ id: uuidv4(), title: title as unknown as string, status: PositionStatus.OPEN }))
  };
};

export const createCompany = async (
  companyData: Partial<CompanyProfile>
): Promise<CompanyProfile> => {
  const newCompany: any = {
    id: companyData.id || uuidv4(),
    name: companyData.name || "",
    logoUrl: companyData.logoUrl || "",
    description: companyData.description || "",
    location: companyData.location || "",
    seeking: companyData.seeking || [],
    positions: companyData.positions || (companyData.seeking || []).map(title => ({ id: uuidv4(), title, status: PositionStatus.OPEN })),
    partnerExpectations: companyData.partnerExpectations || "",
    collaborationLength: companyData.collaborationLength || "",
    compensationPhilosophy: companyData.compensationPhilosophy || "",
    upvotes: 0,
    upvotedBy: [],
    ndaUrl: companyData.ndaUrl || "",
    requiredDocumentIds: [],
    completedCollaborations: 0,
    partnerRetentionRate: 0,
    workModes: companyData.workModes || [WorkMode.REMOTE],
    createdAt: new Date().toISOString(),
    documents: companyData.documents || [],
    ...companyData,
  };
  const { data, error } = await supabase
    .from("companies")
    .insert([toSnake(newCompany)])
    .select()
    .single();
  if (error) throw error;
  return toCamel(data) as CompanyProfile;
};

export const updateCompany = async (
  id: string,
  updates: Partial<CompanyProfile>
): Promise<CompanyProfile | null> => {
  const { data, error } = await supabase
    .from("companies")
    .update(toSnake(updates))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return (toCamel(data) as CompanyProfile) || null;
};

export const deleteCompany = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
  return true;
};

// ==================== PARTNER OPERATIONS (Supabase) ====================

export const getPartners = async (): Promise<PartnerProfile[]> => {
  const { data, error } = await supabase.from("partners").select("*");
  if (error) throw error;
  return (data || []).map(toCamel) as PartnerProfile[];
};

export const getPartnerById = async (
  id: string
): Promise<PartnerProfile | null> => {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (toCamel(data) as PartnerProfile) || null;
};

export const createPartner = async (
  partnerData: Partial<PartnerProfile>
): Promise<PartnerProfile> => {
  const newPartner: any = {
    id: partnerData.id || uuidv4(),
    name: partnerData.name || "",
    avatarUrl: partnerData.avatarUrl || "",
    bio: partnerData.bio || "",
    skills: partnerData.skills || [],
    location: partnerData.location || "",
    reputationScore: 50,
    reputationBand: ReputationBand.MEDIUM,
    pastCollaborations: [],
    managedBrands: [],
    savedOpportunities: [],
    upvotes: 0,
    upvotedBy: [],
    createdAt: new Date().toISOString(),
    contact: { email: "" },
    timeZone: "",
    workModePreference: WorkMode.REMOTE,
    resumeUrl: "",
    ...partnerData,
  };
  const { data, error } = await supabase
    .from("partners")
    .insert([toSnake(newPartner)])
    .select()
    .single();
  if (error) throw error;
  return toCamel(data) as PartnerProfile;
};

export const updatePartner = async (
  id: string,
  updates: Partial<PartnerProfile>
): Promise<PartnerProfile | null> => {
  const { data, error } = await supabase
    .from("partners")
    .update(toSnake(updates))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return (toCamel(data) as PartnerProfile) || null;
};

export const deletePartner = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) throw error;
  return true;
};

// ==================== APPLICATIONS (Supabase) ====================

export const getApplications = async (): Promise<Application[]> => {
  const { data, error } = await supabase.from("applications").select("*");
  if (error) throw error;
  return (data || []).map(toCamel) as Application[];
};

export const createApplication = async (
  companyId: string,
  partnerId: string
): Promise<Application> => {
  const newApp: any = {
    id: uuidv4(),
    companyId,
    partnerId,
    status: ApplicationStatus.PENDING,
    appliedAt: new Date().toISOString(),
    ndaAcceptedAt: null,
  };
  const { data, error } = await supabase
    .from("applications")
    .insert([toSnake(newApp)])
    .select()
    .single();
  if (error) throw error;
  return toCamel(data) as Application;
};

export const updateApplication = async (
  id: string,
  updates: Partial<Application>
): Promise<Application | null> => {
  const { data, error } = await supabase
    .from("applications")
    .update(toSnake(updates))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toCamel(data) as Application | null;
};

// ==================== NOTIFICATIONS (Supabase) ====================

export const getNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase.from("notifications").select("*");
  if (error) throw error;
  return (data || []).map(toCamel) as Notification[];
};

export const createNotification = async (
  userId: string,
  message: string,
  link: string
): Promise<Notification> => {
  const newNotif: any = {
    id: uuidv4(),
    userId,
    message,
    link,
    read: false,
    timestamp: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("notifications")
    .insert([toSnake(newNotif)])
    .select()
    .single();
  if (error) throw error;
  return toCamel(data) as Notification;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
};

// ==================== FRAMEWORKS (Supabase) ====================
export const getFrameworks = async (): Promise<Framework[]> => {
  const { data, error } = await supabase.from("frameworks").select("*");
  if (error) throw error;
  return (data || []).map(toCamel) as Framework[];
};

// ==================== COLLABORATIONS (Supabase) ====================
export const getCollaborations = async (): Promise<Collaboration[]> => {
  const { data, error } = await supabase.from("collaborations").select("*");
  if (error) throw error;
  return (data || []).map(d => {
    const c = toCamel(d) as Collaboration;
    return {
      ...c,
      notes: c.notes || {},
      metrics: c.metrics || {},
      decisionLog: c.decisionLog || [],
      files: c.files || [],
      links: c.links || []
    };
  }) as Collaboration[];
};

// ==================== UPVOTES ====================

export const toggleUpvoteCompany = async (
  companyId: string,
  userId: string
): Promise<boolean> => {
  const company = await getCompanyById(companyId);
  if (!company) return false;

  let isUpvoting = false;
  let upvotedBy = company.upvotedBy || [];
  let upvotes = company.upvotes || 0;

  if (upvotedBy.includes(userId)) {
    upvotedBy = upvotedBy.filter((id) => id !== userId);
    upvotes = Math.max(0, upvotes - 1);
  } else {
    upvotedBy.push(userId);
    upvotes += 1;
    isUpvoting = true;
  }
  await updateCompany(companyId, { upvotedBy, upvotes });
  return isUpvoting;
};

export const toggleUpvotePartner = async (
  partnerId: string,
  userId: string
): Promise<boolean> => {
  const partner = await getPartnerById(partnerId);
  if (!partner) return false;

  let isUpvoting = false;
  let upvotedBy = partner.upvotedBy || [];
  let upvotes = partner.upvotes || 0;

  if (upvotedBy.includes(userId)) {
    upvotedBy = upvotedBy.filter((id) => id !== userId);
    upvotes = Math.max(0, upvotes - 1);
  } else {
    upvotedBy.push(userId);
    upvotes += 1;
    isUpvoting = true;
  }
  await updatePartner(partnerId, { upvotedBy, upvotes });
  return isUpvoting;
};

// ==================== SUBSCRIPTION LOGIC ====================

export const getExpirationDate = (plan: SubscriptionPlan): string => {
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return expiry.toISOString();
};


// ==================== DB EXPORT ====================

export const db = {
  users: {
    getAll: getUsers,
    getById: getUserById,
    getByEmail: getUserByEmail,
    create: createUser,
    update: updateUser,
    delete: deleteUser,
  },
  companies: {
    getAll: getCompanies,
    getById: getCompanyById,
    create: createCompany,
    update: updateCompany,
    delete: deleteCompany,
    toggleUpvote: toggleUpvoteCompany,
  },
  partners: {
    getAll: getPartners,
    getById: getPartnerById,
    create: createPartner,
    update: updatePartner,
    delete: deletePartner,
    toggleUpvote: toggleUpvotePartner,
  },
  applications: {
    getAll: getApplications,
    create: createApplication,
    update: updateApplication,
  },
  notifications: {
    getAll: getNotifications,
    create: createNotification,
    markRead: markNotificationRead,
  },
  frameworks: {
    getAll: getFrameworks,
  },
  session: {
    getCurrent: () => null, // Deprecated: Use useAuth() or supabase.auth.getSession()
    setCurrent: () => {},   // Deprecated: Auth handled by Supabase
  },
  collaborations: {
    getAll: getCollaborations,
    create: async (
      companyId: string,
      partnerId: string,
      framework: Framework
    ): Promise<Collaboration | null> => {
      const newCollab: any = {
        id: uuidv4(),
        companyId,
        partnerId,
        framework,
        notes: {},
        metrics: {},
        files: [],
        links: [],
        decisionLog: [],
        startDate: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("collaborations")
        .insert([toSnake(newCollab)])
        .select()
        .single();
      if (error) throw error;
      return toCamel(data) as Collaboration;
    },
    update: async (
      id: string,
      updates: Partial<Collaboration>
    ): Promise<Collaboration | null> => {
      const { data, error } = await supabase
        .from("collaborations")
        .update(toSnake(updates))
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return toCamel(data) as Collaboration;
    },
  },
  messages: {
    getByCollaboration: async (collabId: string): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("collaboration_id", collabId)
        .order("timestamp", { ascending: true });
      if (error) throw error;
      return (data || []).map(toCamel) as ChatMessage[];
    },
    send: async (
      collabId: string,
      senderId: string,
      content: string
    ): Promise<ChatMessage> => {
      const newMessage: any = {
        id: uuidv4(),
        collaborationId: collabId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
        read: false,
      };
      const { data, error } = await supabase
        .from("messages")
        .insert([toSnake(newMessage)])
        .select()
        .single();
      if (error) {
        console.error("[DB] Error sending message:", error);
        throw error;
      }
      return toCamel(data) as ChatMessage;
    },
    markRead: async (collabId: string, userId: string): Promise<void> => {
      // Mark all messages in this collab NOT sent by this user as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("collaboration_id", collabId)
        .neq("sender_id", userId);
    },
  },
};

export default db;
