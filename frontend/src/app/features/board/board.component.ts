import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import {
  AnalyticsApiService, BackendSprint, BackendTicket,
} from '../../core/services/analytics-api.service';
import { Ticket } from '../../core/models/models';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  searchTerm = '';
  filterType = '';
  filterPri = '';
  filterEpic = '';
  selectedAssignee: string | null = null;
  dragId: number | null = null;
  dragOverCol: string | null = null;

  /** Tickets for the active sprint, mapped from the backend response. */
  liveTickets: Ticket[] = [];
  liveLoading = true;
  liveEmpty = false;
  /** Active sprint name + window for the page header. */
  activeSprintName: string | null = null;
  activeSprintWindow: string | null = null;

  constructor(
    public ds: DataService,
    public ui: UiService,
    private auth: AuthService,
    private analyticsApi: AnalyticsApiService,
    private projectCtx: ProjectContextService,
  ) {}

  ngOnInit(): void {
    this.loadActiveSprint();
    // Refresh the board whenever a new ticket is created via the dialog.
    // takeUntil(destroy$) ensures the subscription is cleaned up when this
    // component is unmounted, preventing leaks across navigations.
    this.ui.ticketCreated$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadActiveSprint());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActiveSprint(): void {
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

    this.liveLoading = true;
    sprints$.subscribe(sprints => {
      this.liveLoading = false;
      const active = (sprints || []).find(s => (s.status || '').toUpperCase() === 'ACTIVE');
      if (!active) {
        this.liveTickets = [];
        this.liveEmpty = true;
        this.activeSprintName = null;
        this.activeSprintWindow = null;
        return;
      }
      this.activeSprintName = active.sprintName;
      this.activeSprintWindow = this.formatWindow(active.startDate, active.endDate);
      this.liveTickets = (active.tickets || []).map(t => this.mapTicket(t, active.sprintName));
      this.liveEmpty = this.liveTickets.length === 0;
    });
  }

  /** Tickets shown on the kanban — strictly the backend response, never mock data. */
  private get source(): Ticket[] {
    return this.liveTickets;
  }

  get assignees() {
    const names = [...new Set(this.source.filter(t => t.ass).map(t => t.ass!))];
    return names.slice(0, 5).map(n => ({ name: n, initials: this.ds.ini(n) }));
  }

  toggleAssignee(name: string): void {
    this.selectedAssignee = this.selectedAssignee === name ? null : name;
  }

  getColTickets(colId: string): Ticket[] {
    return this.source.filter(t =>
      t.status === colId &&
      (!this.searchTerm || t.sum.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.filterType || t.type === this.filterType) &&
      (!this.filterPri || t.pri === this.filterPri) &&
      (!this.filterEpic || t.epic === this.filterEpic) &&
      (!this.selectedAssignee || t.ass === this.selectedAssignee)
    );
  }

  onDragStart(e: DragEvent, id: number): void {
    this.dragId = id;
    e.dataTransfer!.effectAllowed = 'move';
  }

  onDragEnd(): void {
    this.dragId = null;
    this.dragOverCol = null;
  }

  onDragOver(e: DragEvent, colId: string): void {
    e.preventDefault();
    this.dragOverCol = colId;
  }

  onDragLeave(colId: string): void {
    if (this.dragOverCol === colId) this.dragOverCol = null;
  }

  onDrop(e: DragEvent, colId: string): void {
    e.preventDefault();
    this.dragOverCol = null;
    if (this.dragId === null) return;

    const t = this.source.find(x => x.id === this.dragId);
    const id = this.dragId;
    this.dragId = null;
    if (!t || t.status === colId) return;

    // Optimistically update the card position, PATCH the backend, revert on failure.
    const previous = t.status;
    t.status = colId as any;
    this.analyticsApi.updateTicketStatus(id, colId).subscribe({
      next: () => this.ui.toast('Moved to ' + this.ds.sl(colId) + ' ✓'),
      error: () => {
        t.status = previous;
        this.ui.toast('Failed to save status — reverted');
      },
    });
  }

  private mapTicket(t: BackendTicket, sprintName: string): Ticket {
    const ass = AnalyticsApiService.userLabel((t as any).assignee);
    const rep = AnalyticsApiService.userLabel((t as any).reporter);
    return {
      id: t.ticketId,
      type: (t.type as any) || 'TASK',
      sum: t.title || '(no title)',
      desc: (t as any).description,
      ass: ass === 'Unassigned' ? undefined : ass,
      rep: rep === 'Unassigned' ? undefined : rep,
      pri: 'MEDIUM',
      status: (t.status as any) || 'TO_DO',
      pts: t.storyPoints,
      epic: undefined,
      parentId: null,
      labels: '',
      sprint: sprintName,
      comments: [],
    };
  }

  private formatWindow(startISO?: string, endISO?: string): string {
    const s = startISO ? new Date(startISO) : null;
    const e = endISO ? new Date(endISO) : null;
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (s && e) return `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}`;
    return '';
  }
}
