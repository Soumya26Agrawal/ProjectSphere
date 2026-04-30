import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import {
  AnalyticsApiService, BackendSprint, BackendTicket,
  ProjectDTO, ProjectTeam, SprintBurndown,
} from '../../core/services/analytics-api.service';

declare const Chart: any;

const USER_COLORS = [
  '#0052CC', '#36B37E', '#FF5630', '#6554C0', '#FF991F',
  '#00B8D9', '#FFAB00', '#5243AA', '#008DA6', '#A5275F',
];

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  /* Chart canvases */
  @ViewChild('cVelocity')   cVelocity!: ElementRef;
  @ViewChild('cCompletion') cCompletion!: ElementRef;
  @ViewChild('cDevBurn')    cDevBurn!: ElementRef;
  @ViewChild('cWorkload')   cWorkload!: ElementRef;
  @ViewChild('cThroughput') cThroughput!: ElementRef;
  @ViewChild('cIssueType')  cIssueType!: ElementRef;
  @ViewChild('cPriority')   cPriority!: ElementRef;
  @ViewChild('cEpic')       cEpic!: ElementRef;

  private chartsBuilt = false;

  /* Backend state */
  backendProject: ProjectDTO | null = null;
  backendTeam: ProjectTeam | null = null;
  backendSprints: BackendSprint[] = [];
  /** All tickets for this project — sprint-bound, backlog, and epics. */
  backendProjectTickets: BackendTicket[] = [];
  activeBurndown: SprintBurndown | null = null;
  burndownLoading = true;
  burndownEmpty = false;

  /* Empty-state flags shown over canvases */
  priorityEmpty = false;
  epicEmpty = false;

  /** Filter for the Epic Progress chart — story count, points, or percentage. */
  epicMode: 'count' | 'points' | 'percent' = 'count';
  /** Held so we can destroy + rebuild the epic chart when the filter changes. */
  private epicChart: any = null;
  /** Every Chart.js instance built by this component. Destroyed on ngOnDestroy
   *  so navigating away doesn't leak resize listeners + canvas refs (which was
   *  causing /board to hang after a round-trip through /analytics). */
  private allChartInstances: any[] = [];

  constructor(
    private auth: AuthService,
    private analyticsApi: AnalyticsApiService,
    private projectCtx: ProjectContextService,
  ) {}

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) {
      this.burndownLoading = false;
      this.burndownEmpty = true;
      return;
    }
    const selected = this.projectCtx.selectedProjectId();
    const projectId$ = selected != null
      ? of([selected])
      : this.analyticsApi.getProjectIdsForUser(userId);

    projectId$.pipe(
      switchMap(ids => {
        if (ids.length === 0) {
          return of({
            project: null as ProjectDTO | null,
            sprints: [] as BackendSprint[],
            team: null as ProjectTeam | null,
            projectTickets: [] as BackendTicket[],
          });
        }
        const projectId = ids[0];
        return forkJoin({
          project:        this.analyticsApi.getProject(projectId),
          sprints:        this.analyticsApi.getSprintsByProject(projectId),
          team:           this.analyticsApi.getTeamForProject(projectId),
          projectTickets: this.analyticsApi.getTicketsByProject(projectId),
        });
      }),
    ).subscribe(({ project, sprints, team, projectTickets }) => {
      this.backendProject = project;
      this.backendSprints = sprints || [];
      this.backendTeam    = team;
      this.backendProjectTickets = projectTickets || [];
      this.burndownEmpty  = this.backendSprints.length === 0;

      const active = this.activeSprintInfo;
      if (active) {
        this.analyticsApi.getSprintBurndown(active.sprintId).subscribe(bd => {
          this.activeBurndown = bd;
          this.burndownLoading = false;
          setTimeout(() => this.buildAllCharts(), 50);
        });
      } else {
        this.burndownLoading = false;
        setTimeout(() => this.buildAllCharts(), 50);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     Hero / KPI getters — backend-derived, used by the template.
     ══════════════════════════════════════════════════════════════ */

  get project() {
    const p = this.backendProject;
    return {
      name:         p?.projectName || '—',
      description:  p?.description || '',
      domain:       p?.domain || '—',
      manager:      p?.managerName || '—',
      scrumMaster:  this.backendTeam?.scrumMasterName || '—',
      startDate:    this.formatDate(p?.createdAt),
      activeSprint: this.activeSprintInfo?.sprintName || '—',
    };
  }

  /** Sprint-bound + project-scoped (epics, backlog) tickets, deduplicated by ticketId.
   *  Sprint-bound tickets win on collision because they carry the inline parent
   *  EPIC (via @JsonIdentityInfo), which the project-scoped fetch may not. */
  private get allTickets(): BackendTicket[] {
    const byId = new Map<number, BackendTicket>();
    for (const t of this.backendProjectTickets) byId.set(t.ticketId, t);
    for (const s of this.backendSprints) {
      for (const t of (s.tickets || [])) byId.set(t.ticketId, t);
    }
    return Array.from(byId.values());
  }

  get totalTickets(): number { return this.allTickets.length; }
  get totalStories(): number { return this.allTickets.filter(t => t.type === 'USER_STORY').length; }
  get totalEpics():   number { return this.allTickets.filter(t => t.type === 'EPIC').length; }
  get totalTasks():   number { return this.allTickets.filter(t => t.type === 'TASK').length; }
  get doneCount():    number { return this.allTickets.filter(t => t.status === 'COMPLETED').length; }
  get inProgCount():  number { return this.allTickets.filter(t => t.status === 'IN_PROGRESS').length; }
  /** Backlog = project tickets not in any sprint (Ticket.sprint is @JsonIgnore'd,
   *  so we infer backlog membership by subtracting in-sprint ticket ids). */
  get backlogCount(): number {
    const inSprint = new Set<number>();
    for (const s of this.backendSprints) {
      for (const t of (s.tickets || [])) inSprint.add(t.ticketId);
    }
    return this.backendProjectTickets
      .filter(t => !inSprint.has(t.ticketId) && t.type !== 'EPIC')
      .length;
  }

  get projectCompletion(): number {
    return this.totalTickets ? Math.round(this.doneCount / this.totalTickets * 100) : 0;
  }
  get sprintCompletion(): number {
    const tix = this.activeSprintInfo?.tickets || [];
    if (!tix.length) return 0;
    return Math.round(tix.filter(t => t.status === 'COMPLETED').length / tix.length * 100);
  }

  get committedPoints(): number {
    const tix = this.activeSprintInfo?.tickets || [];
    return tix.reduce((s, t) => s + (t.storyPoints || 0), 0);
  }
  get deliveredPoints(): number {
    const tix = this.activeSprintInfo?.tickets || [];
    return tix.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + (t.storyPoints || 0), 0);
  }
  get velocity(): number {
    const completedSprints = this.backendSprints.filter(s => (s.status || '').toUpperCase() === 'COMPLETED');
    if (!completedSprints.length) return 0;
    const sum = completedSprints.reduce((acc, s) =>
      acc + (s.tickets || []).filter(t => t.status === 'COMPLETED')
                              .reduce((a, t) => a + (t.storyPoints || 0), 0), 0);
    return Math.round(sum / completedSprints.length);
  }

  private static readonly DEFECT_OPEN_STATUSES = ['NEW','OPEN','REOPENED','IN_PROGRESS','RETEST'];
  private get defectTickets(): BackendTicket[] {
    return this.allTickets.filter(t => t.type === 'DEFECT');
  }
  get totalDefects(): number { return this.defectTickets.length; }
  get openDefects():  number {
    return this.defectTickets.filter(t => {
      const ds = ((t as any).defect?.status || '').toUpperCase();
      return AnalyticsComponent.DEFECT_OPEN_STATUSES.includes(ds);
    }).length;
  }
  get solvedDefects(): number { return this.totalDefects - this.openDefects; }
  get criticalDefects(): number {
    return this.defectTickets.filter(t => ((t as any).defect?.severity || '').toUpperCase() === 'CRITICAL').length;
  }
  get defectResolutionPct(): number {
    return this.totalDefects ? Math.round(this.solvedDefects / this.totalDefects * 100) : 0;
  }

  get activeSprintInfo(): BackendSprint | undefined {
    return this.backendSprints.find(s => (s.status || '').toUpperCase() === 'ACTIVE');
  }
  get daysRemaining(): number {
    const end = this.activeSprintInfo?.endDate;
    if (!end) return 0;
    return Math.max(0, Math.ceil((Date.parse(end) - Date.now()) / 86400000));
  }
  get teamSize(): number {
    return this.backendTeam?.memberCount ?? this.backendTeam?.members?.length ?? 0;
  }

  private formatDate(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /* ══════════════════════════════════════════════════════════════
     Chart builders — 8 charts.
     ══════════════════════════════════════════════════════════════ */

  ngOnDestroy(): void {
    // Tear down every Chart.js instance so we don't leak canvas refs and
    // resize listeners across navigations.
    for (const c of this.allChartInstances) {
      try { c.destroy(); } catch { /* already destroyed */ }
    }
    this.allChartInstances = [];
    this.epicChart = null;
  }

  /** Wraps a `new Chart(...)` call so the instance is tracked for cleanup. */
  private track(chart: any): any {
    this.allChartInstances.push(chart);
    return chart;
  }

  private buildAllCharts(): void {
    if (this.chartsBuilt) return;
    if (typeof Chart === 'undefined') return;
    if (this.burndownLoading || this.burndownEmpty) return;
    if (!this.cVelocity) return;
    this.chartsBuilt = true;

    const sprints = this.sortedSprints();
    const developers = this.collectDevelopers(sprints);

    this.buildVelocity(sprints);
    this.buildCompletionRate(sprints);
    this.buildDevBurndown();
    this.buildWorkloadDistribution(sprints, developers);
    this.buildThroughput(sprints, developers);
    this.buildIssueTypeBreakdown();
    this.buildPrioritySplit();
    this.buildEpicProgress();
  }

  private baseOpts() {
    const tickColor = '#5E6C84';
    const tickFont  = { size: 11, family: 'Inter' };
    const gridColor = 'rgba(223,225,230,.8)';
    return {
      base: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: tickColor, font: tickFont, boxWidth: 12 } },
          tooltip: {
            backgroundColor: '#172B4D', padding: 10,
            titleFont: { size: 12, weight: '600' }, bodyFont: { size: 12 },
            cornerRadius: 4, displayColors: true,
          },
        },
      },
      axes: {
        x: { ticks: { color: tickColor, font: tickFont }, grid: { color: gridColor, drawBorder: false } },
        y: { ticks: { color: tickColor, font: tickFont }, grid: { color: gridColor, drawBorder: false }, beginAtZero: true },
      },
    };
  }

  /** 1. Velocity — grouped bar, planned & completed per sprint. */
  private buildVelocity(sprints: BackendSprint[]): void {
    const { base, axes } = this.baseOpts();
    const labels   = sprints.map(s => s.sprintName);
    const planned  = sprints.map(s => this.committedFor(s));
    const finished = sprints.map(s => this.completedFor(s));
    this.track(new Chart(this.cVelocity.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Planned',   data: planned,  backgroundColor: '#0052CC', borderRadius: 4 },
          { label: 'Completed', data: finished, backgroundColor: '#36B37E', borderRadius: 4 },
        ],
      },
      options: { ...base, scales: axes },
    }));
  }

  /** 2. Completion rate — bar, with target reference line at 85%. */
  private buildCompletionRate(sprints: BackendSprint[]): void {
    const { base } = this.baseOpts();
    const labels = sprints.map(s => s.sprintName);
    const rates = sprints.map(s => {
      const planned = this.committedFor(s);
      if (planned <= 0) return 0;
      return Math.round((this.completedFor(s) / planned) * 100);
    });
    const colors = rates.map(r => r >= 85 ? '#36B37E' : r >= 60 ? '#FFAB00' : '#FF5630');
    const targetLine = labels.map(() => 85);

    this.track(new Chart(this.cCompletion.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Completion %',
            data: rates,
            backgroundColor: colors,
            borderRadius: 4,
            order: 2,
          },
          {
            type: 'line',
            label: 'Target (85%)',
            data: targetLine,
            borderColor: '#172B4D',
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            order: 1,
          } as any,
        ],
      },
      options: {
        ...base,
        scales: {
          x: { ticks: { color: '#5E6C84', font: { size: 11, family: 'Inter' } }, grid: { color: 'rgba(223,225,230,.8)' } },
          y: {
            beginAtZero: true, max: 100,
            ticks: {
              color: '#5E6C84',
              font: { size: 11, family: 'Inter' },
              callback: (v: any) => `${v}%`,
            },
            grid: { color: 'rgba(223,225,230,.8)' },
          },
        },
      },
    }));
  }

  /** 3. Per-developer burndown — line, days vs remaining points. */
  private buildDevBurndown(): void {
    const { base, axes } = this.baseOpts();
    const bd = this.activeBurndown;
    if (!bd || !bd.days?.length) {
      // Render an empty placeholder chart so the canvas isn't blank.
      this.track(new Chart(this.cDevBurn.nativeElement, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { ...base, scales: axes },
      }));
      return;
    }
    const dayLabels = bd.days.map(d => this.shortDate(d));
    const idealDataset = {
      label: 'Ideal',
      data: bd.ideal,
      borderColor: '#7A869A',
      backgroundColor: 'transparent',
      borderDash: [6, 4],
      tension: 0, fill: false, borderWidth: 2,
      pointRadius: 0,
    };
    const userDatasets = Object.keys(bd.perUserActual || {}).map((name, i) => ({
      label: name,
      data: bd.perUserActual[name],
      borderColor: USER_COLORS[i % USER_COLORS.length],
      backgroundColor: 'transparent',
      tension: .3, fill: false, borderWidth: 2,
      pointBackgroundColor: USER_COLORS[i % USER_COLORS.length],
      pointBorderColor: '#fff', pointBorderWidth: 1.5, pointRadius: 3,
    }));

    this.track(new Chart(this.cDevBurn.nativeElement, {
      type: 'line',
      data: { labels: dayLabels, datasets: [idealDataset, ...userDatasets] },
      options: { ...base, scales: axes, interaction: { mode: 'index', intersect: false } },
    }));
  }

  /** 4. Workload distribution — horizontal bar. */
  private buildWorkloadDistribution(sprints: BackendSprint[], developers: string[]): void {
    const { base } = this.baseOpts();
    const points = developers.map(d =>
      sprints.reduce((acc, s) => acc + this.committedForUser(s, d), 0));
    this.track(new Chart(this.cWorkload.nativeElement, {
      type: 'bar',
      data: {
        labels: developers,
        datasets: [{
          label: 'Story points assigned',
          data: points,
          backgroundColor: developers.map((_, i) => USER_COLORS[i % USER_COLORS.length]),
          borderRadius: 4,
        }],
      },
      options: {
        ...base,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, ticks: { color: '#5E6C84', font: { size: 11, family: 'Inter' } }, grid: { color: 'rgba(223,225,230,.8)' } },
          y: { ticks: { color: '#5E6C84', font: { size: 11, family: 'Inter' } }, grid: { display: false } },
        },
        plugins: { ...base.plugins, legend: { display: false } },
      },
    }));
  }

  /** 5. Throughput — grouped bar, last 3 sprints x developers. */
  private buildThroughput(sprints: BackendSprint[], developers: string[]): void {
    const { base, axes } = this.baseOpts();
    const last3 = sprints.slice(-3);
    this.track(new Chart(this.cThroughput.nativeElement, {
      type: 'bar',
      data: {
        labels: last3.map(s => s.sprintName),
        datasets: developers.map((d, i) => ({
          label: d,
          data: last3.map(s => this.completedForUser(s, d)),
          backgroundColor: USER_COLORS[i % USER_COLORS.length],
          borderRadius: 4,
        })),
      },
      options: { ...base, scales: axes },
    }));
  }

  /** 6. Issue type breakdown — donut (Story / Task / Epic). */
  private buildIssueTypeBreakdown(): void {
    const { base } = this.baseOpts();
    const stories = this.allTickets.filter(t => t.type === 'USER_STORY').length;
    const tasks   = this.allTickets.filter(t => t.type === 'TASK').length;
    const epics   = this.allTickets.filter(t => t.type === 'EPIC').length;
    const total = stories + tasks + epics || 1;
    const pct = (n: number) => Math.round(n / total * 100);

    this.track(new Chart(this.cIssueType.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [
          `Story (${pct(stories)}%)`,
          `Task (${pct(tasks)}%)`,
          `Epic (${pct(epics)}%)`,
        ],
        datasets: [{
          data: [stories, tasks, epics],
          backgroundColor: ['#0052CC', '#36B37E', '#6554C0'],
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        ...base,
        cutout: '62%',
        plugins: {
          ...base.plugins,
          legend: { position: 'right', labels: { color: '#5E6C84', font: { size: 11, family: 'Inter' }, boxWidth: 12 } },
        },
      },
    }));
  }

  /** 8. Priority split — donut. Currently empty (no priority field on backend). */
  private buildPrioritySplit(): void {
    const { base } = this.baseOpts();
    // Not wired — backend Ticket has no priority field today.
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    const total = counts.CRITICAL + counts.HIGH + counts.MEDIUM + counts.LOW;
    this.priorityEmpty = total === 0;

    this.track(new Chart(this.cPriority.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [
          `Critical (${counts.CRITICAL})`,
          `High (${counts.HIGH})`,
          `Medium (${counts.MEDIUM})`,
          `Low (${counts.LOW})`,
        ],
        datasets: [{
          data: total > 0
            ? [counts.CRITICAL, counts.HIGH, counts.MEDIUM, counts.LOW]
            : [1, 1, 1, 1], // even slices when there's no real data
          backgroundColor: ['#FF5630', '#FF991F', '#FFAB00', '#36B37E'],
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        ...base,
        cutout: '62%',
        plugins: {
          ...base.plugins,
          legend: { position: 'right', labels: { color: '#5E6C84', font: { size: 11, family: 'Inter' }, boxWidth: 12 } },
          tooltip: { ...base.plugins.tooltip, enabled: !this.priorityEmpty },
        },
      },
    }));
  }

  /** Rebuild the Epic Progress chart from the current `epicMode` selection. */
  onEpicModeChange(): void {
    if (this.epicChart) { this.epicChart.destroy(); this.epicChart = null; }
    this.buildEpicProgress();
  }

  /** 7. Epic progress — horizontal stacked bar (Done / Remaining).
   *
   *  Epics live outside any sprint, so we discover them via:
   *    1. Tickets in `allTickets` whose own type is EPIC (project-scoped fetch).
   *    2. Inline parent references on child tickets (carried by @JsonIdentityInfo's
   *       first occurrence).
   *
   *  Mode controls the unit of measure:
   *    - 'count'   → number of child stories (Done vs Remaining)
   *    - 'points'  → sum of story points (Done vs Remaining)
   *    - 'percent' → % of points completed (always 0-100, stacks to 100)
   */
  private buildEpicProgress(): void {
    const { base } = this.baseOpts();

    // Pass 1a: tickets that ARE epics.
    const epicMap = new Map<number, { id: number; title: string }>();
    for (const t of this.allTickets) {
      if (t.type === 'EPIC') {
        epicMap.set(t.ticketId, { id: t.ticketId, title: t.title || `Epic ${t.ticketId}` });
      }
    }
    // Pass 1b: epics seen as inline parent references on children.
    for (const t of this.allTickets) {
      const p = (t as any).parent;
      if (p && typeof p === 'object' && p.type === 'EPIC' && p.ticketId) {
        if (!epicMap.has(p.ticketId)) {
          epicMap.set(p.ticketId, { id: p.ticketId, title: p.title || `Epic ${p.ticketId}` });
        }
      }
    }
    // Pass 2: bucket children under each epic.
    const childrenByEpic = new Map<number, BackendTicket[]>();
    for (const t of this.allTickets) {
      const p = (t as any).parent;
      if (p == null) continue;
      const epicId: number = typeof p === 'number' ? p : p.ticketId;
      if (!epicMap.has(epicId)) continue;
      const arr = childrenByEpic.get(epicId) || [];
      arr.push(t);
      childrenByEpic.set(epicId, arr);
    }

    const epics = Array.from(epicMap.values());
    this.epicEmpty = epics.length === 0;

    if (this.epicEmpty) {
      this.epicChart = this.track(new Chart(this.cEpic.nativeElement, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: { ...base, indexAxis: 'y' },
      }));
      return;
    }

    const labels = epics.map(e => e.title);
    const doneSeries: number[] = [];
    const remainingSeries: number[] = [];
    for (const epic of epics) {
      const children = childrenByEpic.get(epic.id) || [];
      const completed = children.filter(t => t.status === 'COMPLETED');
      const totalCount = children.length;
      const doneCount = completed.length;
      const totalPts  = children.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
      const donePts   = completed.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

      switch (this.epicMode) {
        case 'count':
          doneSeries.push(doneCount);
          remainingSeries.push(Math.max(0, totalCount - doneCount));
          break;
        case 'points':
          doneSeries.push(donePts);
          remainingSeries.push(Math.max(0, totalPts - donePts));
          break;
        case 'percent': {
          const pct = totalPts > 0 ? Math.round((donePts / totalPts) * 100) : 0;
          doneSeries.push(pct);
          remainingSeries.push(100 - pct);
          break;
        }
      }
    }

    const isPercent = this.epicMode === 'percent';
    const xUnit = isPercent ? '%' : (this.epicMode === 'count' ? '' : ' pts');
    const doneLabel = this.epicMode === 'count' ? 'Stories done'
                    : this.epicMode === 'points' ? 'Points done'
                    : 'Done';
    const remainingLabel = this.epicMode === 'count' ? 'Stories remaining'
                         : this.epicMode === 'points' ? 'Points remaining'
                         : 'Remaining';

    this.epicChart = this.track(new Chart(this.cEpic.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: doneLabel,      data: doneSeries,      backgroundColor: '#36B37E', borderRadius: 4, stack: 'epic' },
          { label: remainingLabel, data: remainingSeries, backgroundColor: '#DFE1E6', borderRadius: 4, stack: 'epic' },
        ],
      },
      options: {
        ...base,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            max: isPercent ? 100 : undefined,
            stacked: true,
            ticks: {
              color: '#5E6C84', font: { size: 11, family: 'Inter' },
              callback: (v: any) => `${v}${xUnit}`,
              precision: 0,
            },
            grid: { color: 'rgba(223,225,230,.8)' },
          },
          y: {
            stacked: true,
            ticks: { color: '#5E6C84', font: { size: 11, family: 'Inter' } },
            grid: { display: false },
          },
        },
      },
    }));
  }

  /* ══════════════════════════════════════════════════════════════
     Helpers
     ══════════════════════════════════════════════════════════════ */

  private sortedSprints(): BackendSprint[] {
    return [...this.backendSprints].sort((a, b) => {
      const da = a.startDate ? Date.parse(a.startDate) : 0;
      const db = b.startDate ? Date.parse(b.startDate) : 0;
      if (da !== db) return da - db;
      return (a.sprintId || 0) - (b.sprintId || 0);
    });
  }

  private collectDevelopers(sprints: BackendSprint[]): string[] {
    const set = new Set<string>();
    for (const s of sprints) {
      for (const t of (s.tickets || [])) {
        const name = AnalyticsApiService.userLabel(t.assignee);
        if (name && name !== 'Unassigned') set.add(name);
      }
    }
    return Array.from(set).sort();
  }

  private committedFor(sprint: BackendSprint): number {
    return (sprint.tickets || []).reduce((s, t) => s + (t.storyPoints || 0), 0);
  }
  private completedFor(sprint: BackendSprint): number {
    return (sprint.tickets || [])
      .filter(t => t.status === 'COMPLETED')
      .reduce((s, t) => s + (t.storyPoints || 0), 0);
  }
  private committedForUser(sprint: BackendSprint, user: string): number {
    return (sprint.tickets || [])
      .filter(t => AnalyticsApiService.userLabel(t.assignee) === user)
      .reduce((s, t) => s + (t.storyPoints || 0), 0);
  }
  private completedForUser(sprint: BackendSprint, user: string): number {
    return (sprint.tickets || [])
      .filter(t => AnalyticsApiService.userLabel(t.assignee) === user && t.status === 'COMPLETED')
      .reduce((s, t) => s + (t.storyPoints || 0), 0);
  }

  private shortDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
