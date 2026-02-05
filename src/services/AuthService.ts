import { User, UserRole } from '../models';
import { supabase } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'automation_idea_intake_user';

export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Try to restore user from localStorage on initialization
    this.restoreSession();
  }

  // Restore user session from localStorage or Supabase session
  private restoreSession(): void {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }

  // Use Supabase Auth for secure email/password login
  async login(email: string, password: string): Promise<User | null> {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Login error:', signInError.message);
      return null;
    }

    const authUser = signInData.user;
    if (!authUser) return null;

    const userMetadata = authUser.user_metadata || {};
    const appMetadata = (authUser as any).app_metadata || {};
    const mappedUser: User = {
      id: authUser.id,
      name: userMetadata.full_name || userMetadata.name || appMetadata.full_name || appMetadata.name || authUser.email || 'User',
      email: authUser.email ?? '',
      role: ((appMetadata.role || userMetadata.role) as UserRole) || 'Submitter',
      department: userMetadata.department || appMetadata.department || ''
    };

    this.currentUser = mappedUser;
    
    // Persist user to localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mappedUser));
    
    return mappedUser;
  }

  logout(): void {
    this.currentUser = null;
    
    // Clear localStorage
    localStorage.removeItem(AUTH_STORAGE_KEY);
    
    // Sign out from Supabase
    void supabase.auth.signOut();
  }

  getCurrentUser(): User | null {
    // If no current user in memory, try to restore from storage
    if (!this.currentUser) {
      this.restoreSession();
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.role === role;
  }

//supabaase
  async validateSession(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }
}