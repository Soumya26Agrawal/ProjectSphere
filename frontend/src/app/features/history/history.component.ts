import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { AnalyticsApiService, BackendSprint, BackendTicket } from '../../core/services/analytics-api.service';
import { HistoryItem } from '../../core/models/models';
import { switchMap, catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
  search = '';
  filterSprint = '';
  filterEpic = '';
  filterStatus = '';
  dateFrom = '';
  dateTo = '';

  /** Real history rows derived from completed sprints / completed tickets in
   *  the backend. Empty until the API responds. No mock fallback. */
  rows: HistoryItem[] = [];
  loading = true;

  constructor(
    public ds: DataService,
    public ui: UiService,
    private auth: AuthService,
    private projectCtx: ProjectContextService,
    private analyticsApi: AnalyticsApiService,
  ) {}

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId;
    const selected = this.projectCtx.selectedProjectId();

    const sprints$ = selected != null
      ? this.analyticsApi.getSprintsByProject(selected)
      : userId
        ? this.analyticsApi.getProjectIdsForUser(userId).pipe(
            switchMap(ids => ids.length > 0
              ? this.analyticsApi.getSprintsByProject(ids[0])
              : of([] as BackendSprint[])),
          )
        : of([] as BackendSprint[]);

    sprints$
      .pipe(
        timeout(8_000),
        catchError(() => of([] as BackendSprint[])),
      )
      .subscribe(sprints => {
        this.rows = this.flattenHistory(sprints || []);
        this.loading = false;
      });
  }

  private flattenHistory(sprints: BackendSprint[]): HistoryItem[] {
    const out: HistoryItem[] = [];
    for (const sp of sprints) {
      const tickets = sp.tickets || [];
      for (const t of tickets) {
        if (!this.isTerminal(t.status)) continue;
        out.push({
          id: 'PS-' + t.ticketId,
          title: t.title || '(no title)',
          sprint: sp.sprintName,
          epic: '—',
          ass: AnalyticsApiService.userLabel((t as any).assignee),
          status: this.normalizeStatus(t.status),
          start: sp.startDate || '',
          end: sp.endDate || '',
        });
      }
    }
    return out;
  }

  private isTerminal(status?: string): boolean {
    const s = (status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'CANCELLED';
  }

  private normalizeStatus(status?: string): 'COMPLETED' | 'CANCELLED' {
    return (status || '').toUpperCase() === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED';
  }

  get filtered(): HistoryItem[] {
    const s = this.search.toLowerCase();
    return this.rows.filter(h =>
      (!s || h.title.toLowerCase().includes(s) || h.id.toLowerCase().includes(s)) &&
      (!this.filterSprint || h.sprint === this.filterSprint) &&
      (!this.filterEpic   || h.epic   === this.filterEpic) &&
      (!this.filterStatus || h.status === this.filterStatus) &&
      (!this.dateFrom     || h.start  >= this.dateFrom) &&
      (!this.dateTo       || h.end    <= this.dateTo)
    );
  }

  duration(start: string, end: string): string {
    if (!start || !end) return '—';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (!isFinite(ms)) return '—';
    return Math.max(0, Math.ceil(ms / 86400000)) + 'd';
  }
}
