
export enum UserRole {
  FOUNDER = 'FOUNDER',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN',
}

export enum WorkMode {
  REMOTE = 'Remote',
  IN_OFFICE = 'In-office',
  HYBRID = 'Hybrid',
}

export enum ProductStage {
  IDEA = 'Idea',
  MVP = 'MVP',
  LIVE = 'Live',
}

export enum ApplicationStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
}

export enum ReputationBand {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export enum SubscriptionPlan {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE',
}



export enum PositionStatus {
  OPEN = 'Open',
  PAUSED = 'Paused',
  CLOSED = 'Closed',
}

export interface Position {
  id: string;
  title: string;
  status: PositionStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileId: string;
  avatarUrl: string;
  hasCompletedOnboarding: boolean;
  isPremium?: boolean;
  hasAiAccess?: boolean;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface CompanyDocument {
    id: string;
    name: string;
    type: 'NDA' | 'Legal' | 'Requirement';
    url: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  completedCollaborations: number;
  partnerRetentionRate: number; // as percentage
  seeking: string[]; // Deprecated, use positions
  positions: Position[];
  documents: CompanyDocument[];
  location: string;
  workModes: WorkMode[];
  partnerExpectations: string;
  collaborationLength: string;
  compensationPhilosophy: string;
  ndaUrl: string;
  requiredDocumentIds: string[];
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
}

export interface PartnerProfile {
  id:string;
  name: string;
  avatarUrl: string;
  location: string;
  timeZone: string;
  workModePreference: WorkMode;
  skills: string[];
  reputationScore: number;
  reputationBand: ReputationBand;
  pastCollaborations: string[]; // Company names
  bio: string;
  resumeUrl: string;
  contact: {
    email: string;
    linkedin?: string;
    instagram?: string;
  };
  managedBrands: string[];
  savedOpportunities: string[]; // Stores company IDs
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
}

export interface Framework {
  id: string;
  name: string;
  phases: string[];
  metricsToTrack: string[];
  decisionOutcomes: string[];
}

export interface Application {
  id: string;
  companyId: string;
  partnerId: string;
  status: ApplicationStatus;
  ndaAcceptedAt: Date | null;
  appliedAt: Date;
}

export interface Decision {
  id: string;
  timestamp: Date;
  decision: string;
  notes: string;
  phase: string;
}

export interface CollaborationFile {
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
    phase?: string; // Optional: associate file with a specific framework phase
    type?: 'image' | 'file';
}

export interface Collaboration {
  id: string;
  companyId: string;
  partnerId: string;
  framework: Framework;
  notes: Record<string, string>; // phase -> note
  metrics: Record<string, string>; // phase -> metrics note
  files: CollaborationFile[];
  links: { id: string, title: string, url: string, phase?: string }[];
  decisionLog: Decision[];
  startDate: Date;
  status?: 'active' | 'completed' | 'paused';
  projectName?: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    link: string;
    read: boolean;
    timestamp: Date;
}

export interface ChatMessage {
    id: string;
    collaborationId: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
}