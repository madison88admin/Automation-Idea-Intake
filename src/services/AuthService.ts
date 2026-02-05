import { User, UserRole } from '../models';
import { supabase } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'automation_idea_intake_user';

export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Try to restore user from localStorage on initialization
    this.restoreSession();
  }

  // Maps a Supabase auth user to our app's User type
  private mapSupabaseUser(authUser: any): User {
    const userMetadata = authUser?.user_metadata || {};
    const appMetadata = (authUser as any)?.app_metadata || {};
    return {
      id: authUser.id,
      name:
        userMetadata.full_name ||
        userMetadata.name ||
        appMetadata.full_name ||
        appMetadata.name ||
        authUser.email ||
        'User',
      email: authUser.email ?? '',
      role: ((appMetadata.role || userMetadata.role) as UserRole) || 'Submitter',
      department: userMetadata.department || appMetadata.department || '',
    };
  }

  // Restore user session from localStorage
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

  // Initialize by restoring from localStorage, then Supabase session if needed
  async init(): Promise<User | null> {
    if (!this.currentUser) {
      this.restoreSession();
    }

    if (!this.currentUser) {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;
      if (authUser) {
        const mapped = this.mapSupabaseUser(authUser);
        this.currentUser = mapped;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mapped));
      }
    }

    return this.currentUser;
  }

  // Subscribe to Supabase auth state changes and keep local user in sync
  onAuthStateChange(handler: (user: User | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const authUser = session?.user;
        if (authUser) {
          const mapped = this.mapSupabaseUser(authUser);
          this.currentUser = mapped;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mapped));
          handler(mapped);
          return;
        }
      }
      if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
        handler(null);
      }
    });

    // Return unsubscribe
    return () => {
      try {
        data.subscription.unsubscribe();
      } catch {
        // ignore
      }
    };
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

    const mappedUser = this.mapSupabaseUser(authUser);

    this.currentUser = mappedUser;

    // Persist user to localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mappedUser));

    return mappedUser;
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } finally {
      this.currentUser = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
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

  // Check if session is still valid with Supabase
  async validateSession(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }
}