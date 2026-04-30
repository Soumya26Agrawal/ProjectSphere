import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthUser, UserRole } from '../models/models';
import { ProjectContextService } from './project-context.service';
import { AnalyticsApiService } from './analytics-api.service';

const API_BASE = 'http://localhost:8081/api/v1';

interface BackendLoginResponse {
  token: string;
  message: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
}

const STORAGE_USER  = 'ps_auth_user';
const STORAGE_TOKEN = 'ps_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this._loadUser());
  private readonly projectCtx = inject(ProjectContextService);
  private readonly analyticsApi = inject(AnalyticsApiService);

  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => this._user() !== null);
  readonly userRole    = computed(() => this._user()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<BackendLoginResponse>(`${API_BASE}/auth/login`, { email, password })
      .pipe(
        map(res => {
          const user: AuthUser = {
            userId: res.userId,
            email:  res.email,
            name:   `${res.firstName ?? ''} ${res.lastName ?? ''}`.trim() || res.email,
            role:   this._mapRole(res.role),
            avatar: this._initials(res.firstName, res.lastName, res.email),
          };
          sessionStorage.setItem(STORAGE_TOKEN, res.token);
          sessionStorage.setItem(STORAGE_USER, JSON.stringify(user));
          this._user.set(user);
          return user;
        }),
      );
  }

  logout(): void {
    this._user.set(null);
    sessionStorage.removeItem(STORAGE_USER);
    sessionStorage.removeItem(STORAGE_TOKEN);
    this.projectCtx.clear();
    this.analyticsApi.invalidateProjectCaches();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(STORAGE_TOKEN);
  }

  getDashboardRoute(): string {
    switch (this.userRole()) {
      case 'admin':           return '/admin';
      case 'project_manager': return '/pm';
      case 'developer':       return '/dev';
      default:                return '/login';
    }
  }

  private _mapRole(role: BackendLoginResponse['role']): UserRole {
    switch (role) {
      case 'ADMIN':           return 'admin';
      case 'PROJECT_MANAGER': return 'project_manager';
      case 'DEVELOPER':       return 'developer';
    }
  }

  private _initials(first?: string, last?: string, email?: string): string {
    const f = (first ?? '').trim();
    const l = (last  ?? '').trim();
    if (f || l) return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase() || 'U';
    return (email ?? 'U').slice(0, 2).toUpperCase();
  }

  private _loadUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_USER);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
