import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import {
  AnalyticsApiService, ProjectDTO, ProjectTeam, TeamMember,
} from '../../core/services/analytics-api.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css',
})
export class TeamComponent implements OnInit {
  loading = true;
  empty = false;
  project: ProjectDTO | null = null;
  team: ProjectTeam | null = null;

  constructor(
    public ui: UiService,
    private auth: AuthService,
    private analyticsApi: AnalyticsApiService,
    private projectCtx: ProjectContextService,
  ) {}

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) {
      this.loading = false;
      this.empty = true;
      return;
    }
    const selected = this.projectCtx.selectedProjectId();
    const projectId$ = selected != null
      ? of([selected])
      : this.analyticsApi.getProjectIdsForUser(userId);

    projectId$.pipe(
      switchMap(ids => {
        if (ids.length === 0) {
          return of({ project: null as ProjectDTO | null, team: null as ProjectTeam | null });
        }
        const projectId = ids[0];
        return forkJoin({
          project: this.analyticsApi.getProject(projectId),
          team:    this.analyticsApi.getTeamForProject(projectId),
        });
      }),
    ).subscribe(({ project, team }) => {
      this.project = project;
      this.team = team;
      this.loading = false;
      this.empty = !project || !team;
    });
  }

  /** Members minus the scrum master (rendered separately as "Team Leaders"). */
  get engineers(): TeamMember[] {
    const members = this.team?.members || [];
    const smId = this.team?.scrumMasterId;
    return members.filter(m => m.userId !== smId);
  }

  get scrumMaster(): TeamMember | undefined {
    return this.team?.members?.find(m => m.userId === this.team?.scrumMasterId);
  }

  fullName(m?: TeamMember | null): string {
    if (!m) return '—';
    return `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || `User ${m.userId}`;
  }

  initials(m?: TeamMember | null): string {
    if (!m) return '?';
    const fn = (m.firstName || '').trim();
    const ln = (m.lastName || '').trim();
    const a = fn[0] || (m.email || '?')[0];
    const b = ln[0] || (m.email || '??')[1] || '';
    return `${a}${b}`.toUpperCase();
  }
}
