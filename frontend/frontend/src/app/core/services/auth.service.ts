import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, UserRole } from '../models/models';

/** Demo credentials — replace with real API calls in production. */
const DEMO_USERS: Array<AuthUser & { password: string }> = [
  { email: 'admin@logicminds.dev', password: 'admin123', name: 'Rajesh Kumar',  role: 'admin',           avatar: 'RK' },
  { email: 'pm@logicminds.dev',    password: 'pm123',    name: 'Priya Sharma',  role: 'project_manager', avatar: 'PS' },
  { email: 'dev@logicminds.dev',   password: 'dev123',   name: 'Arjun Kumar',   role: 'developer',       avatar: 'AK' },
];

const STORAGE_KEY = 'ps_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this._loadUser());

  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => this._user() !== null);
  readonly userRole    = computed(() => this._user()?.role ?? null);

  constructor(private router: Router) {}

  login(email: string, password: string): AuthUser | null {
    const match = DEMO_USERS.find(
      u => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!match) return null;
    const { password: _pw, ...user } = match;
    this._user.set(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  /**
   * Registers a new user in the in-memory user list.
   * Returns 'ok' on success, 'duplicate' if email already exists.
   */
  register(name: string, email: string, password: string, role: UserRole): 'ok' | 'duplicate' {
    const norm = email.trim().toLowerCase();
    if (DEMO_USERS.some(u => u.email === norm)) return 'duplicate';

    const parts  = name.trim().split(/\s+/);
    const avatar = parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();

    DEMO_USERS.push({ email: norm, password, name: name.trim(), role, avatar });
    return 'ok';
  }

  logout(): void {
    this._user.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  getDashboardRoute(): string {
    switch (this.userRole()) {
      case 'admin':           return '/admin';
      case 'project_manager': return '/pm';
      case 'developer':       return '/dev';
      default:                return '/login';
    }
  }

  private _loadUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
