import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminProject, AdminTeam, CreateProjectRequest, CreateTeamRequest,
  Page, TeamMember, UpdateProjectRequest, UpdateTeamRequest,
} from './admin-api.service';

const PROJECTS_BASE = 'http://localhost:8081/api/projects';
const TEAMS_BASE    = 'http://localhost:8081/api/project-teams';

export interface PmStats {
  myProjects:        number;
  ongoingProjects:   number;
  completedProjects: number;
  teamMembers:       number;
}

@Injectable({ providedIn: 'root' })
export class PmApiService {
  constructor(private http: HttpClient) {}

  /* ─── Projects scoped to this PM ─── */

  getStats(managerId: number): Observable<PmStats> {
    return this.http.get<PmStats>(`${PROJECTS_BASE}/stats/by-manager/${managerId}`);
  }

  listMyProjects(managerId: number, page = 0, size = 12): Observable<Page<AdminProject>> {
    return this.http.get<Page<AdminProject>>(
      `${PROJECTS_BASE}/by-manager/${managerId}?page=${page}&size=${size}`,
    );
  }

  getProject(id: number): Observable<AdminProject> {
    return this.http.get<AdminProject>(`${PROJECTS_BASE}/dto/${id}`);
  }

  createProject(body: CreateProjectRequest): Observable<AdminProject> {
    return this.http.post<AdminProject>(`${PROJECTS_BASE}/dto`, body);
  }

  updateProject(id: number, body: UpdateProjectRequest): Observable<AdminProject> {
    return this.http.put<AdminProject>(`${PROJECTS_BASE}/dto/${id}`, body);
  }

  /* ─── Teams (shared; every authenticated user can use these) ─── */

  listTeams(): Observable<AdminTeam[]> {
    return this.http.get<AdminTeam[]>(`${TEAMS_BASE}`);
  }

  getTeam(id: number): Observable<AdminTeam> {
    return this.http.get<AdminTeam>(`${TEAMS_BASE}/${id}`);
  }

  createTeam(body: CreateTeamRequest): Observable<AdminTeam> {
    return this.http.post<AdminTeam>(`${TEAMS_BASE}`, body);
  }

  updateTeam(id: number, body: UpdateTeamRequest): Observable<AdminTeam> {
    return this.http.put<AdminTeam>(`${TEAMS_BASE}/${id}`, body);
  }

  /* ─── Developers (used by team creation member picker) ─── */

  listDevelopers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${PROJECTS_BASE}/developers`);
  }
}
