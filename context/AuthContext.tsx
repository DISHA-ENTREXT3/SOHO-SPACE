
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole, WorkMode } from '../types';
import { db, initializeDatabase } from '../services/database';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<User | null>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check Supabase session
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      // Non-blocking initialization
      initializeDatabase().catch(err => console.error('[Auth] DB Init Error:', err));
      
      try {
        // Get current Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('[Auth] Session retrieval error:', sessionError.message);
        }
        
        if (session?.user) {
        // Fetch profile from our users table
        const freshUser = await db.users.getById(session.user.id);
        if (freshUser) {
          setUser(freshUser);
        }
      }
      
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            let freshUser = await db.users.getById(session.user.id);
            
            if (!freshUser) {
              console.log('[Auth] New OAuth user detected, creating profile...');
              // Check if user selected a role before redirect
              // Determine role: prioritize localStorage (set during OAuth click), then auth metadata
              const pendingRole = (localStorage.getItem('pending_role') || session.user.user_metadata?.role) as UserRole || UserRole.PARTNER;
              const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'New User';
              const email = session.user.email || '';
              const avatarUrl = session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  
              // Create profile based on role
              let profileId = '';
              if (pendingRole === UserRole.FOUNDER || pendingRole === UserRole.ADMIN) {
                const company = await db.companies.create({
                  name: '',
                  description: '',
                  location: '',
                  logoUrl: avatarUrl,
                });
                profileId = company.id;
              } else {
                const partner = await db.partners.create({
                  name,
                  avatarUrl,
                  contact: { email },
                });
                profileId = partner.id;
              }
  
              // Create user record
              freshUser = await db.users.create({
                id: session.user.id,
                email,
                name,
                avatarUrl,
                role: pendingRole,
                profileId,
                hasCompletedOnboarding: false
              });
              
              localStorage.removeItem('pending_role');
              console.log('[Auth] Profile created for OAuth user');
            }
            
            setUser(freshUser);
          } else {
            setUser(null);
          }
        });
  
        setIsLoading(false);
        return () => subscription.unsubscribe();
      } catch (err) {
        console.error('[Auth] Fatal initialization error:', err);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const freshUser = await db.users.getById(session.user.id);
      if (freshUser) {
        setUser(freshUser);
      }
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<User | null> => {
    console.log('[Auth] Signup initiated for:', { name, email, role });
    
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role }
      }
    });

    if (authError) throw authError;
    if (!authData.user) return null;

    const userId = authData.user.id;

    // 2. Create the corresponding profile based on role
    let profileId: string = '';
    
    if (role === UserRole.FOUNDER || role === UserRole.ADMIN) {
      const company = await db.companies.create({
        name: '',
        description: '',
        location: '',
        seeking: [],
        workModes: [WorkMode.REMOTE],
        documents: [],
      });
      profileId = company.id;
    } else if (role === UserRole.PARTNER) {
      const partner = await db.partners.create({
        name: '',
        bio: '',
        location: '',
        skills: [],
        workModePreference: WorkMode.REMOTE,
        contact: { email },
      });
      profileId = partner.id;
    }

    // 3. Create the user record in our public.users table
    const newUser = await db.users.create({
      id: userId,
      name,
      email,
      role,
      profileId,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`,
      hasCompletedOnboarding: false,
    });

    setUser(newUser);
    return newUser;
  };

  const loginWithEmail = async (email: string, password?: string): Promise<User | null> => {


    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) return null;

    const freshUser = await db.users.getById(data.user.id);
    if (freshUser) {
        setUser(freshUser);
        return freshUser;
    }
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithEmail, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};