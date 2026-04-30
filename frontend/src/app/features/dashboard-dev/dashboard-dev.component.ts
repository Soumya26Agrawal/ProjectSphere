import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { AnalyticsApiService, ProjectDTO } from '../../core/services/analytics-api.service';
import { TopnavComponent } from '../../layout/topnav/topnav.component';

@Component({
  selector: 'app-dashboard-dev',
  standalone: true,
  imports: [CommonModule, TopnavComponent],
  templateUrl: './dashboard-dev.component.html',
  styleUrls: ['../admin/admin-theme.css', './dashboard-dev.component.css'],
})
export class DashboardDevComponent implements OnInit {
  readonly user = this.auth.currentUser;

  loading = true;
  empty = false;
  /** All projects the logged-in user belongs to. */
  projects: ProjectDTO[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private api: AnalyticsApiService,
    private projectCtx: ProjectContextService,
  ) {}

  ngOnInit(): void {
    const userId = this.user()?.userId;
    if (!userId) {
      this.loading = false;
      this.empty = true;
      return;
    }
    // Hits the shared shareReplay cache in AnalyticsApiService — if login
    // already fetched this list, we get it instantly with no HTTP call.
    this.api.getProjectsForUser(userId).subscribe(list => {
      this.projects = list || [];
      // Keep the global ID store in sync with whatever we just rendered.
      this.projectCtx.setUserProjectIds(this.projects.map(p => p.projectId));
      this.loading = false;
      this.empty = this.projects.length === 0;
    });
  }

  /** Active project — the IN_PROGRESS one. By rule, only one per user. */
  get activeProject(): ProjectDTO | null {
    return this.projects.find(p => (p.status || '').toUpperCase() === 'IN_PROGRESS') || null;
  }

  /** Past projects — anything that isn't IN_PROGRESS (typically COMPLETED). */
  get pastProjects(): ProjectDTO[] {
    return this.projects.filter(p => (p.status || '').toUpperCase() !== 'IN_PROGRESS');
  }

  /** Set the project context and navigate to /board. */
  enter(p: ProjectDTO): void {
    this.projectCtx.set(p.projectId);
    this.router.navigate(['/board']);
  }

  shortDate(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  durationLabel(days?: number): string {
    if (days == null) return '—';
    const months = Math.round(days / 30);
    if (months >= 12) return `${(months / 12).toFixed(1)} years`;
    if (months >= 1) return `${months} month${months > 1 ? 's' : ''}`;
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  logout(): void { this.auth.logout(); }
}
