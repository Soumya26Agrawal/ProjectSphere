import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UiService } from '../../core/services/ui.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { AnalyticsApiService, BackendSprint } from '../../core/services/analytics-api.service';

interface TlTicket {
  ticketId: number;
  title: string;
  status: string;
  type: string;
  assignee: string;
  color: string;
  leftPct: string;
  widthPct: string;
  startDate: Date;
  endDate: Date;
}

interface TlSprint {
  sprintId: number;
  name: string;
  status: string;
  color: string;
  expanded: boolean;
  leftPct: string;
  widthPct: string;
  tickets: TlTicket[];
  startDate: Date;
  endDate: Date;
}

type ViewMode = 'week' | 'month' | 'quarter';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css',
})
export class TimelineComponent implements OnInit {
  viewMode: ViewMode = 'month';
  headerCols: { label: string; pct: number }[] = [];

  windowStart = new Date();
  windowEnd   = new Date();
  private windowMs = 1;

  todayPct      = '0%';
  showTodayLine = false;

  tlSprints: TlSprint[] = [];
  allAssignees: string[] = [];
  readonly allStatuses = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

  searchQuery    = '';
  filterAssignee = '';
  filterStatus   = '';

  loading = true;
  error   = '';

  tooltip: { visible: boolean; lines: string[]; x: number; y: number } =
    { visible: false, lines: [], x: 0, y: 0 };

  private readonly SPRINT_COLORS = [
    '#0052CC', '#6554C0', '#008DA6', '#36B37E', '#FF991F', '#E04400',
  ];
  private readonly TYPE_COLORS: Record<string, string> = {
    EPIC: '#6554C0', USER_STORY: '#0052CC', TASK: '#36B37E',
    SUB_TASK: '#00B8D9', DEFECT: '#FF5630',
  };

  constructor(
    public ui: UiService,
    private ctx: ProjectContextService,
    private api: AnalyticsApiService,
  ) {}

  ngOnInit(): void { this.loadData(); }

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  loadData(): void {
    this.loading = true;
    this.error   = '';
    const projectId = this.ctx.selectedProjectId();
    const fetch$ = projectId
      ? this.api.getSprintsByProject(projectId)
      : this.api.getAllSprints();
    fetch$.subscribe({
      next:  (s: BackendSprint[]) => { this.buildTimeline(s); this.loading = false; },
      error: () => { this.error = 'Failed to load timeline data.'; this.loading = false; },
    });
  }

  private buildTimeline(sprints: BackendSprint[]): void {
    if (!sprints.length) { this.tlSprints = []; return; }

    const validDates = sprints.flatMap(s => [
      s.startDate ? new Date(s.startDate) : null,
      s.endDate   ? new Date(s.endDate)   : null,
    ]).filter((d): d is Date => !!d && !isNaN(d.getTime()));

    if (!validDates.length) {
      const y = new Date().getFullYear();
      this.windowStart = new Date(y, 0, 1);
      this.windowEnd   = new Date(y, 11, 31);
    } else {
      const minMs = Math.min(...validDates.map(d => d.getTime()));
      const maxMs = Math.max(...validDates.map(d => d.getTime()));
      const min = new Date(minMs);
      const max = new Date(maxMs);
      this.windowStart = new Date(min.getFullYear(), min.getMonth() - 1, 1);
      this.windowEnd   = new Date(max.getFullYear(), max.getMonth() + 2, 1);
    }
    this.windowMs = Math.max(1, this.windowEnd.getTime() - this.windowStart.getTime());

    this.rebuildHeader();

    const todayMs = Date.now() - this.windowStart.getTime();
    this.showTodayLine = todayMs >= 0 && todayMs <= this.windowMs;
    this.todayPct = (todayMs / this.windowMs * 100).toFixed(2) + '%';

    const assigneeSet = new Set<string>();

    this.tlSprints = sprints.map((s, i) => {
      const startD = s.startDate ? new Date(s.startDate) : this.windowStart;
      const endD   = s.endDate   ? new Date(s.endDate)   : this.windowEnd;
      const color  = this.SPRINT_COLORS[i % this.SPRINT_COLORS.length];

      const tickets: TlTicket[] = (s.tickets ?? []).map(t => {
        const assignee = AnalyticsApiService.userLabel(t.assignee);
        if (assignee !== 'Unassigned') assigneeSet.add(assignee);
        return {
          ticketId:  t.ticketId,
          title:     t.title ?? `Ticket #${t.ticketId}`,
          status:    t.status ?? '',
          type:      t.type   ?? '',
          assignee,
          color:     this.TYPE_COLORS[t.type ?? ''] ?? '#0052CC',
          leftPct:   this.datePct(startD),
          widthPct:  this.durationPct(startD, endD),
          startDate: startD,
          endDate:   endD,
        };
      });

      return {
        sprintId:  s.sprintId,
        name:      s.sprintName,
        status:    s.status ?? 'PLANNED',
        color,
        expanded:  true,
        leftPct:   this.datePct(startD),
        widthPct:  this.durationPct(startD, endD),
        startDate: startD,
        endDate:   endD,
        tickets,
      };
    });

    this.allAssignees = Array.from(assigneeSet).sort();
  }

  private rebuildHeader(): void {
    this.headerCols = [];

    if (this.viewMode === 'week') {
      let cur = new Date(this.windowStart);
      while (cur < this.windowEnd) {
        const next = new Date(cur);
        next.setDate(next.getDate() + 7);
        const colEnd = next < this.windowEnd ? next : this.windowEnd;
        this.headerCols.push({
          label: `${cur.getDate()} ${cur.toLocaleString('en-US', { month: 'short' })}`,
          pct:   (colEnd.getTime() - cur.getTime()) / this.windowMs * 100,
        });
        cur = next;
      }
    } else if (this.viewMode === 'quarter') {
      let cur = new Date(
        this.windowStart.getFullYear(),
        Math.floor(this.windowStart.getMonth() / 3) * 3,
        1,
      );
      if (cur.getTime() < this.windowStart.getTime()) cur = new Date(this.windowStart);
      while (cur < this.windowEnd) {
        const qMonth = Math.floor(cur.getMonth() / 3) * 3;
        const next   = new Date(cur.getFullYear(), qMonth + 3, 1);
        const colEnd = next < this.windowEnd ? next : this.windowEnd;
        this.headerCols.push({
          label: `Q${Math.floor(cur.getMonth() / 3) + 1} ${cur.getFullYear()}`,
          pct:   (colEnd.getTime() - cur.getTime()) / this.windowMs * 100,
        });
        cur = next;
      }
    } else {
      let cur = new Date(this.windowStart);
      while (cur < this.windowEnd) {
        const next   = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        const colEnd = next < this.windowEnd ? next : this.windowEnd;
        this.headerCols.push({
          label: cur.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          pct:   (colEnd.getTime() - cur.getTime()) / this.windowMs * 100,
        });
        cur = next;
      }
    }
  }

  private datePct(d: Date): string {
    const ratio = (d.getTime() - this.windowStart.getTime()) / this.windowMs;
    return (Math.max(0, ratio) * 100).toFixed(2) + '%';
  }

  private durationPct(s: Date, e: Date): string {
    const ratio = (e.getTime() - s.getTime()) / this.windowMs;
    return (Math.max(0.5, ratio * 100)).toFixed(2) + '%';
  }

  private fmtDate(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  showSprintTooltip(event: MouseEvent, sp: TlSprint): void {
    this.tooltip = {
      visible: true,
      lines: [
        sp.name,
        `${this.fmtDate(sp.startDate)}  →  ${this.fmtDate(sp.endDate)}`,
        sp.status,
      ],
      x: event.clientX + 14,
      y: event.clientY - 14,
    };
  }

  showTicketTooltip(event: MouseEvent, tk: TlTicket): void {
    this.tooltip = {
      visible: true,
      lines: [
        tk.title,
        `${this.fmtDate(tk.startDate)}  →  ${this.fmtDate(tk.endDate)}`,
        `${tk.assignee}  ·  ${this.ticketStatusLabel(tk.status)}`,
      ],
      x: event.clientX + 14,
      y: event.clientY - 14,
    };
  }

  moveTooltip(event: MouseEvent): void {
    this.tooltip.x = event.clientX + 14;
    this.tooltip.y = event.clientY - 14;
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  setView(mode: ViewMode): void {
    this.viewMode = mode;
    this.rebuildHeader();
  }

  toggleSprint(sp: TlSprint): void {
    const orig = this.tlSprints.find(s => s.sprintId === sp.sprintId);
    if (orig) orig.expanded = !orig.expanded;
  }

  scrollToToday(): void {
    const el = document.querySelector('.tl-today-line') as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  get filteredSprints(): TlSprint[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.tlSprints
      .map(sp => ({
        ...sp,
        tickets: sp.tickets.filter(t =>
          (!q || t.title.toLowerCase().includes(q)) &&
          (!this.filterAssignee || t.assignee === this.filterAssignee) &&
          (!this.filterStatus   || t.status   === this.filterStatus)
        ),
      }))
      .filter(sp => !q || sp.name.toLowerCase().includes(q) || sp.tickets.length > 0);
  }

  sprintStatusClass(status: string): string {
    if (status === 'ACTIVE')    return 'badge-active';
    if (status === 'COMPLETED') return 'badge-done';
    return 'badge-planned';
  }

  ticketStatusLabel(s: string): string {
    return s.replace(/_/g, ' ');
  }
}
