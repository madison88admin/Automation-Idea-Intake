import { User, UserRole } from '../models';

export class AuthService {
  private currentUser: User | null = null;

  login(email: string, password: string): User | null {
    const demoUsers: Record<string, User> = {
      'lester@company.com': {
        id: 'user_admin',
        name: 'Lester Jay Mendoza',
        email: 'lester@company.com',
        role: 'Admin',
        department: 'IT'
      },
    };

    if (password === 'password123' && demoUsers[email]) {
      this.currentUser = demoUsers[email];
      return this.currentUser;
    }

    return null;
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }
}