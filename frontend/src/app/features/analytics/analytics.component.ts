import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';

declare const Chart: any;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('cTask') cTask!: ElementRef;
  @ViewChild('cPrio') cPrio!: ElementRef;
  @ViewChild('cDef')  cDef!: ElementRef;
  @ViewChild('cVel')  cVel!: ElementRef;

  private chartsBuilt = false;

  /* Project meta (mock until wired to /api/projects/dto/{id}) */
  readonly project = {
    name: 'ProjectSphere',
    description: 'Jira-style project management platform with tickets, sprints, defect tracking and analytics.',
    domain: 'TECHNOLOGY',
    manager: 'Rajesh Kumar',
    scrumMaster: 'Arjun Kumar',
    startDate: 'Dec 15, 2024',
    activeSprint: 'Sprint 3',
  };

  constructor(public ds: DataService, public ui: UiService) {}

  ngOnInit(): void { /* nothing — template binds directly */ }

  ngAfterViewInit(): void { setTimeout(() => this.buildCharts(), 100); }

  /* ── Backlog helper ── */
  private isBacklog(t: { sprint?: string | null }): boolean { return !t.sprint; }

  /* ── Ticket stats ── */
  get totalTickets(): number { return this.ds.tickets.length; }
  get totalStories(): number { return this.ds.tickets.filter(t => t.type === 'USER_STORY').length; }
  get totalEpics():   number { return this.ds.tickets.filter(t => t.type === 'EPIC').length; }
  get totalTasks():   number { return this.ds.tickets.filter(t => t.type === 'TASK').length; }
  get doneCount():    number { return this.ds.tickets.filter(t => t.status === 'COMPLETED').length; }
  get inProgCount():  number { return this.ds.tickets.filter(t => t.status === 'IN_PROGRESS').length; }
  get backlogCount(): number { return this.ds.tickets.filter(t => this.isBacklog(t)).length; }

  /* ── Completion percentages ── */
  get projectCompletion(): number {
    return this.totalTickets ? Math.round(this.doneCount / this.totalTickets * 100) : 0;
  }
  get sprintCompletion(): number {
    const tix = this.ds.tickets.filter(x => x.sprint === this.project.activeSprint);
    if (!tix.length) return 0;
    return Math.round(tix.filter(x => x.status === 'COMPLETED').length / tix.length * 100);
  }

  /* ── Agile metrics ── */
  get committedPoints(): number {
    return this.ds.tickets
      .filter(x => x.sprint === this.project.activeSprint)
      .reduce((s, t) => s + (t.pts || 0), 0);
  }
  get deliveredPoints(): number {
    return this.ds.tickets
      .filter(x => x.sprint === this.project.activeSprint && x.status === 'COMPLETED')
      .reduce((s, t) => s + (t.pts || 0), 0);
  }
  get velocity(): number {
    /** Mock average delivered points over the last 3 completed sprints. */
    const past = this.ds.histData.filter(h => h.status === 'COMPLETED');
    const bySprint: Record<string, number> = {};
    past.forEach(h => bySprint[h.sprint] = (bySprint[h.sprint] || 0) + 5);
    const values = Object.values(bySprint);
    if (!values.length) return 0;
    return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  }

  /* ── Defect stats ── */
  private static readonly RESOLVED = ['FIXED','CLOSED','DEFERRED','REJECTED','DUPLICATE'];
  get totalDefects():  number { return this.ds.defects.length; }
  get openDefects():   number {
    return this.ds.defects.filter(d => !AnalyticsComponent.RESOLVED.includes(d.status)).length;
  }
  get solvedDefects(): number {
    return this.ds.defects.filter(d => AnalyticsComponent.RESOLVED.includes(d.status)).length;
  }
  get criticalDefects(): number { return this.ds.defects.filter(d => d.sev === 'CRITICAL').length; }
  get defectResolutionPct(): number {
    return this.totalDefects ? Math.round(this.solvedDefects / this.totalDefects * 100) : 0;
  }

  /* ── Sprint info ── */
  get activeSprintInfo() { return this.ds.sprints.find(s => s.status === 'ACTIVE'); }
  get daysRemaining(): number {
    // Mock: use a fixed "today" relative to the seeded active sprint.
    const end = new Date('2026-02-14');
    const today = new Date('2026-02-10');
    return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));
  }

  get teamSize(): number { return this.ds.engineers.length; }

  /* ── Charts ── */
  buildCharts(): void {
    if (this.chartsBuilt) return;
    if (typeof Chart === 'undefined') return;
    this.chartsBuilt = true;

    const t = this.ds.tickets;
    const d = this.ds.defects;
    const cnt  = (s: string) => t.filter(x => x.status === s).length;
    const dbucket = (bucket: 'open' | 'inprog' | 'resolved') => {
      const open     = ['NEW','OPEN','REOPENED'];
      const inprog   = ['IN_PROGRESS','RETEST'];
      const resolved = AnalyticsComponent.RESOLVED;
      const set = bucket === 'open' ? open : bucket === 'inprog' ? inprog : resolved;
      return d.filter(x => set.includes(x.status)).length;
    };
    const pcnt = (p: string) => t.filter(x => x.pri === p).length;
    const backlog = t.filter(x => !x.sprint).length;

    const gridColor = 'rgba(223,225,230,.8)';
    const tickFont  = { size: 11, family: 'Inter' };
    const tickColor = '#5E6C84';
    const base = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tickColor, font: tickFont, boxWidth: 12 } },
        tooltip: {
          backgroundColor: '#172B4D', padding: 10,
          titleFont: { size: 12, weight: '600' }, bodyFont: { size: 12 },
          cornerRadius: 4, displayColors: true,
        },
      },
    };
    const axes = {
      x: { ticks: { color: tickColor, font: tickFont }, grid: { color: gridColor, drawBorder: false } },
      y: { ticks: { color: tickColor, font: tickFont }, grid: { color: gridColor, drawBorder: false }, beginAtZero: true },
    };

    new Chart(this.cTask.nativeElement, {
      type: 'bar',
      data: {
        labels: ['To Do', 'In Progress', 'In Review', 'Done', 'Backlog'],
        datasets: [{
          label: 'Issues',
          data: [cnt('TO_DO'), cnt('IN_PROGRESS'), cnt('REVIEW'), cnt('COMPLETED'), backlog],
          backgroundColor: ['#DFE1E6', '#DEEBFF', '#EAE6FF', '#E3FCEF', '#F4F5F7'],
          borderColor:     ['#97A0AF', '#0052CC', '#403294', '#006644', '#97A0AF'],
          borderWidth: 1.5, borderRadius: 4, borderSkipped: false,
        }],
      },
      options: {
        ...base,
        plugins: { ...base.plugins, legend: { display: false } },
        scales: axes,
      },
    });

    new Chart(this.cPrio.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [{
          data: [pcnt('LOW'), pcnt('MEDIUM'), pcnt('HIGH'), pcnt('CRITICAL')],
          backgroundColor: ['#E3FCEF', '#FFF0B3', '#FFE2BD', '#FFEBE6'],
          borderColor:     ['#36B37E', '#FFAB00', '#FF991F', '#FF5630'],
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        ...base,
        cutout: '62%',
        plugins: { ...base.plugins, legend: { position: 'right' } },
      },
    });

    new Chart(this.cDef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [{
          data: [dbucket('open'), dbucket('inprog'), dbucket('resolved')],
          backgroundColor: ['#DEEBFF', '#FFF0B3', '#E3FCEF'],
          borderColor:     ['#0052CC', '#FFAB00', '#36B37E'],
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        ...base,
        cutout: '62%',
        plugins: { ...base.plugins, legend: { position: 'right' } },
      },
    });

    new Chart(this.cVel.nativeElement, {
      type: 'line',
      data: {
        labels: ['Sprint 1', 'Sprint 2', 'Sprint 3'],
        datasets: [
          {
            label: 'Planned',
            data: [30, 35, this.committedPoints || 32],
            borderColor: '#0052CC',
            backgroundColor: 'rgba(0,82,204,.08)',
            fill: true, tension: .4,
            pointBackgroundColor: '#0052CC', pointBorderColor: '#fff',
            pointBorderWidth: 2, pointRadius: 5,
          },
          {
            label: 'Completed',
            data: [24, 31, this.deliveredPoints || 28],
            borderColor: '#36B37E',
            backgroundColor: 'rgba(54,179,126,.08)',
            fill: true, tension: .4,
            pointBackgroundColor: '#36B37E', pointBorderColor: '#fff',
            pointBorderWidth: 2, pointRadius: 5,
          },
        ],
      },
      options: { ...base, scales: axes },
    });
  }
}
