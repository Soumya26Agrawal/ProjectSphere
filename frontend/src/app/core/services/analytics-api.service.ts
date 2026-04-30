import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

const SPRINT_BASE   = 'http://localhost:8081/api/v1/sprint';
const TEAMS_BASE    = 'http://localhost:8081/api/project-teams';
const PROJECTS_BASE = 'http://localhost:8081/api/projects';
const TICKET_BASE   = 'http://localhost:8081/api/v1/ticket';
const COMMENT_BASE  = 'http://localhost:8081/api/comments';
const HISTORY_BASE  = 'http://localhost:8081/api/ticketHistory';

export interface BackendUser {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface BackendTicket {
  ticketId: number;
  title?: string;
  type?: string;
  status?: string;          // TO_DO | IN_PROGRESS | REVIEW | COMPLETED
  storyPoints?: number;
  assignee?: BackendUser | null;
}

export interface BackendSprint {
  sprintId: number;
  sprintName: string;
  startDate?: string;       // ISO date
  endDate?: string;
  status?: string;          // PLANNED | ACTIVE | COMPLETED
  tickets?: BackendTicket[];
}

export interface ProjectDTO {
  projectId: number;
  projectName: string;
  description?: string;
  status?: string;
  domain?: string;
  managerId?: number;
  managerName?: string;
  teamSize?: number;
  memberInitials?: string[];
  createdAt?: string;
  completedAt?: string | null;
  durationDays?: number;
}

export interface TeamMember {
  userId: number;
  employeeId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface ProjectTeam {
  teamId: number;
  teamName?: string;
  projectId?: number;
  projectName?: string;
  projectStatus?: string;
  scrumMasterId?: number;
  scrumMasterName?: string;
  members?: TeamMember[];
  memberCount?: number;
}

export interface SprintBurndown {
  sprintId: number;
  sprintName: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  committed: number;
  days: string[];                       // ISO dates
  ideal: number[];
  actual: number[];
  perUserActual: Record<string, number[]>;
  perUserCommitted: Record<string, number>;
  usedFallback: boolean;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  /** Session-long cache for the "projects this user belongs to" lookup.
   *  Login fills it for devs; /dev's dashboard reuses it instead of refetching.
   *  Invalidated on logout (auth.service) and on project create/delete. */
  private projectsForUserCache = new Map<number, Observable<ProjectDTO[]>>();
  /** Same idea for the lighter "just the project IDs" call. */
  private projectIdsForUserCache = new Map<number, Observable<number[]>>();

  constructor(private http: HttpClient) {}

  /** Wipes every cached project lookup. Call on logout, or after a project
   *  is created/deleted/edited so the next read sees fresh data. */
  invalidateProjectCaches(): void {
    this.projectsForUserCache.clear();
    this.projectIdsForUserCache.clear();
  }

  /** Fetch every sprint with its tickets. Returns [] on any error. */
  getAllSprints(): Observable<BackendSprint[]> {
    return this.http.get<BackendSprint[]>(SPRINT_BASE).pipe(
      map(list => Array.isArray(list) ? list : []),
      catchError(() => of([] as BackendSprint[])),
    );
  }

  /** Sprints scoped to a single project. */
  getSprintsByProject(projectId: number): Observable<BackendSprint[]> {
    return this.http.get<BackendSprint[]>(`${SPRINT_BASE}/project/${projectId}`).pipe(
      map(list => Array.isArray(list) ? list : []),
      catchError(() => of([] as BackendSprint[])),
    );
  }

  /** Day-by-day burndown for a single sprint, walked from TicketHistory. */
  getSprintBurndown(sprintId: number): Observable<SprintBurndown | null> {
    return this.http.get<SprintBurndown>(`${SPRINT_BASE}/${sprintId}/burndown`).pipe(
      catchError(() => of(null)),
    );
  }

  /** Project IDs the given user belongs to via project teams.
   *  Cached per-user for the session — call `invalidateProjectCaches()` after
   *  any project create/delete (or on logout) to clear it. */
  getProjectIdsForUser(userId: number): Observable<number[]> {
    const hit = this.projectIdsForUserCache.get(userId);
    if (hit) return hit;
    const fresh$ = this.http.get<{ projectId: number }[]>(`${TEAMS_BASE}/user/${userId}`).pipe(
      map(list => Array.isArray(list) ? list.map(t => t.projectId).filter(id => id != null) : []),
      catchError(() => of([] as number[])),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.projectIdsForUserCache.set(userId, fresh$);
    return fresh$;
  }

  /** Project metadata (name, description, manager, etc.). */
  getProject(projectId: number): Observable<ProjectDTO | null> {
    return this.http.get<ProjectDTO>(`${PROJECTS_BASE}/dto/${projectId}`).pipe(
      catchError(() => of(null)),
    );
  }

  /** Resolve the user → all projects (full DTOs), one HTTP call per project.
   *  Cached per-user for the session. Same invalidation rules as
   *  `getProjectIdsForUser`. */
  getProjectsForUser(userId: number): Observable<ProjectDTO[]> {
    const hit = this.projectsForUserCache.get(userId);
    if (hit) return hit;
    const fresh$ = this.getProjectIdsForUser(userId).pipe(
      switchMap(ids => ids.length === 0
        ? of([] as ProjectDTO[])
        : forkJoin(ids.map(id => this.getProject(id))).pipe(
            map(list => list.filter((p): p is ProjectDTO => !!p)),
          )),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.projectsForUserCache.set(userId, fresh$);
    return fresh$;
  }

  /** Team for a project — includes scrum master name + members list. */
  getTeamForProject(projectId: number): Observable<ProjectTeam | null> {
    return this.http.get<ProjectTeam>(`${TEAMS_BASE}/project/${projectId}`).pipe(
      catchError(() => of(null)),
    );
  }

  /** PATCH a ticket's status. Backend writes a TicketHistory row. */
  updateTicketStatus(ticketId: number, status: string): Observable<unknown> {
    return this.http.patch(`${TICKET_BASE}/${ticketId}/status?status=${status}`, {});
  }

  /** All tickets for a project — sprint-bound, backlog, and epics. Returns [] on error. */
  getTicketsByProject(projectId: number): Observable<BackendTicket[]> {
    return this.http.get<BackendTicket[]>(`${TICKET_BASE}/project/${projectId}`).pipe(
      map(list => Array.isArray(list) ? list : []),
      catchError(() => of([] as BackendTicket[])),
    );
  }

  /** PATCH any subset of ticket fields. Backend writes one TicketHistory row per change. */
  updateTicket(ticketId: number, body: {
    title?: string;
    description?: string;
    status?: string;
    type?: string;
    storyPoints?: number | null;
    sprint?: number | null;
    assignee?: number | null;
    parent?: number | null;
  }): Observable<unknown> {
    return this.http.patch(`${TICKET_BASE}/${ticketId}`, body);
  }

  /** Comments on a single ticket. */
  getCommentsByTicket(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${COMMENT_BASE}/ticket/${ticketId}`).pipe(
      map(list => Array.isArray(list) ? list : []),
      catchError(() => of([] as any[])),
    );
  }

  /** Post a new comment. Backend Comment expects { ticket: {...}, user: {...}, commentBody }.
   *  Sent as `text` so Angular doesn't fail on a malformed JSON response (the
   *  saved Comment entity can have lazy-init issues serializing back through
   *  ticket + user). The actual saved row is verified by re-fetching the list. */
  postComment(ticketId: number, userId: number, body: string): Observable<string> {
    return this.http.post(COMMENT_BASE, {
      ticket:      { ticketId },
      user:        { userId },
      commentBody: body,
    }, { responseType: 'text' });
  }

  /** Audit-trail rows for a single ticket, newest first (matches backend repo order). */
  getTicketHistory(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${HISTORY_BASE}/ticket/${ticketId}`).pipe(
      map(list => Array.isArray(list) ? list : []),
      catchError(() => of([] as any[])),
    );
  }

  /** Create a ticket via POST /api/v1/ticket. Body matches backend TicketRequestDTO. */
  createTicket(body: {
    project: number;
    sprint: number | null;
    parent?: number | null;
    type: string;
    status: string;
    storyPoints?: number;
    title: string;
    description?: string;
    assignee?: number | null;
  }): Observable<unknown> {
    return this.http.post(TICKET_BASE, body);
  }

  /** Build a friendly display name for a user. Falls back to "Unassigned". */
  static userLabel(u?: BackendUser | null): string {
    if (!u) return 'Unassigned';
    const fn = (u.firstName || '').trim();
    const ln = (u.lastName || '').trim();
    const full = `${fn} ${ln}`.trim();
    return full || u.email || `User ${u.userId}`;
  }
}
