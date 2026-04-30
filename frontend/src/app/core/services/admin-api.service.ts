import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:8081/api/v1/admin';

/* ─────── Page shape (matches Spring's Page<T>) ─────── */
export interface Page<T> {
  content:       T[];
  number:        number;   // current page (0-based)
  size:          number;
  totalElements: number;
  totalPages:    number;
  first:         boolean;
  last:          boolean;
  numberOfElements: number;
  empty:         boolean;
}

/* ─────── Request / Response shapes ─────── */

export interface AdminStats {
  projectManagers:   number;
  teamMembers:       number;
  teams:             number;
  ongoingProjects:   number;
  completedProjects: number;
}

export interface AdminTeamMember {
  userId:     number;
  employeeId: number;
  firstName:  string;
  lastName:   string;
  email:      string;
  role:       BackendRole;
  isActive:   boolean;
}

export interface AdminTeam {
  teamId:          number;
  teamName:        string;
  projectId:       number | null;
  projectName:     string | null;
  projectStatus:   string | null;
  scrumMasterId:   number | null;
  scrumMasterName: string | null;
  members:         AdminTeamMember[];
  memberCount:     number;
}

export interface CreateTeamRequest {
  teamName:      string;
  projectId:     number;
  userIds:       number[];
  scrumMasterId: number | null;
}

export interface UpdateTeamRequest {
  teamName?:      string;
  projectId?:     number;
  userIds?:       number[];
  scrumMasterId?: number | null;
}

export interface TeamMember {
  userId:      number;
  employeeId:  number;
  firstName:   string;
  lastName:    string;
  email:       string;
  phoneNumber: number;
  role:        string;
  isActive:    boolean;
}

export interface ProjectManager {
  userId:      number;
  employeeId:  number;
  firstName:   string;
  lastName:    string;
  email:       string;
  phoneNumber: number;
  role:        string;
  isActive:    boolean;
  managedProjects: { projectId: number; projectName: string; status: string }[];
}

export type BackendRole = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
export type BackendProjectStatus = 'IN_PROGRESS' | 'COMPLETED';
export type BackendDomain =
  | 'BANKING' | 'HEALTHCARE' | 'RETAIL' | 'INSURANCE'
  | 'TECHNOLOGY' | 'EDUCATION' | 'GOVERNMENT' | 'MANUFACTURING';

export interface RegisterUserRequest {
  employeeId:  number;
  firstName:   string;
  lastName:    string;
  email:       string;
  password:    string;
  phoneNumber: number;
  role:        BackendRole;
  isActive:    boolean;
}

export interface RegisterUserResponse {
  employeeId: number;
  email:      string;
  role:       BackendRole;
  isActive:   boolean;
}

export interface CreateProjectRequest {
  projectName: string;
  description: string;
  status:      BackendProjectStatus;
  domain:      BackendDomain;
  managerId:   number | null;
}

export interface UpdateProjectRequest {
  projectName?: string;
  description?: string;
  status?:      BackendProjectStatus;
  domain?:      BackendDomain;
  managerId?:   number | null;
}

export interface AdminProject {
  projectId:    number;
  projectName:  string;
  description:  string | null;
  status:       BackendProjectStatus;
  domain:       BackendDomain;
  managerId:    number | null;
  managerName:  string | null;
  teamSize:     number;
  memberInitials: string[];
  createdAt:    string | null;
  completedAt:  string | null;
  durationDays: number | null;
}

export interface UpdateUserRequest {
  firstName?:   string;
  lastName?:    string;
  email?:       string;
  phoneNumber?: number;
  isActive?:    boolean;
}

/* ─────── Service ─────── */

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${API_BASE}/stats`);
  }

  getProjectManagers(page = 0, size = 12): Observable<Page<ProjectManager>> {
    return this.http.get<Page<ProjectManager>>(`${API_BASE}/getProjectManagers?page=${page}&size=${size}`);
  }

  getTeamMembers(page = 0, size = 12): Observable<Page<TeamMember>> {
    return this.http.get<Page<TeamMember>>(`${API_BASE}/teamMembers?page=${page}&size=${size}`);
  }

  registerUser(body: RegisterUserRequest): Observable<RegisterUserResponse> {
    return this.http.post<RegisterUserResponse>(`${API_BASE}/register`, body);
  }

  uploadUsersExcel(file: File): Observable<string> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${API_BASE}/upload`, form, { responseType: 'text' });
  }

  createProject(body: CreateProjectRequest): Observable<number> {
    return this.http.post<number>(`${API_BASE}/projects`, body);
  }

  listProjects(page = 0, size = 12): Observable<Page<AdminProject>> {
    return this.http.get<Page<AdminProject>>(`${API_BASE}/projects?page=${page}&size=${size}`);
  }

  getProject(id: number): Observable<AdminProject> {
    return this.http.get<AdminProject>(`${API_BASE}/projects/${id}`);
  }

  updateProject(id: number, body: UpdateProjectRequest): Observable<AdminProject> {
    return this.http.put<AdminProject>(`${API_BASE}/projects/${id}`, body);
  }

  /** Delete a project. Hits the public ProjectController endpoint, not the
   *  admin-scoped one, because that's where the existing DELETE lives. */
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8081/api/projects/${id}`);
  }

  getUser(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${API_BASE}/users/${id}`);
  }

  updateUser(id: number, body: UpdateUserRequest): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${API_BASE}/users/${id}`, body);
  }

  /* ─── Teams ─── */

  listTeams(page = 0, size = 12): Observable<Page<AdminTeam>> {
    return this.http.get<Page<AdminTeam>>(`${API_BASE}/teams?page=${page}&size=${size}`);
  }

  getTeam(id: number): Observable<AdminTeam> {
    return this.http.get<AdminTeam>(`${API_BASE}/teams/${id}`);
  }

  createTeam(body: CreateTeamRequest): Observable<AdminTeam> {
    return this.http.post<AdminTeam>(`${API_BASE}/teams`, body);
  }

  updateTeam(id: number, body: UpdateTeamRequest): Observable<AdminTeam> {
    return this.http.put<AdminTeam>(`${API_BASE}/teams/${id}`, body);
  }
}
