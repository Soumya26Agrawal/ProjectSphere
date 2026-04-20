import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent implements OnInit {
  statusRows: { key: string; count: number }[] = [];
  quickActions: any[] = [];
  activities: any[] = [];
  doneWidth = 0;
  testedWidth = 0;
  inProgWidth = 0;

  constructor(public ds: DataService, public ui: UiService, public router: Router) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const t = this.ds.tickets;
    const sprint3 = t.filter(x => x.sprint === 'Sprint 3' && x.status !== 'BACKLOG');
    const total3 = sprint3.length || 1;
    const byStatus: Record<string, number> = { TO_DO: 0, IN_PROGRESS: 0, TESTED: 0, DONE: 0 };
    sprint3.forEach(x => byStatus[x.status] = (byStatus[x.status] || 0) + 1);
    this.doneWidth   = Math.round(byStatus['DONE'] / total3 * 100);
    this.testedWidth = Math.round(byStatus['TESTED'] / total3 * 100);
    this.inProgWidth = Math.round(byStatus['IN_PROGRESS'] / total3 * 100);
    this.statusRows  = ['TO_DO', 'IN_PROGRESS', 'TESTED', 'DONE'].map(k => ({ key: k, count: byStatus[k] || 0 }));

    this.quickActions = [
      { icon: 'view_kanban', text: 'Open Sprint Board',    sub: 'Sprint 3 · ' + this.totalActive + ' active issues', color: 'var(--jira-blue)', route: '/board' },
      { icon: 'bug_report',  text: 'View Defect Tracker',  sub: this.openDefects + ' open · ' + this.criticalDefects + ' critical', color: '#FF5630', route: '/defects' },
      { icon: 'bar_chart',   text: 'Analytics Dashboard',  sub: 'KPIs, velocity, burn-down', color: '#36B37E', route: '/analytics' },
      { icon: 'timeline',    text: 'Sprint Timeline',       sub: 'Gantt view · 3 sprints completed', color: '#6554C0', route: '/timeline' },
    ];

    this.activities = [
      { av: 'AK', text: '<b>Arjun Kumar</b> moved "Analytics Charts" to <b>Tested</b>',       time: '5 min ago',   color: '#0052CC' },
      { av: 'PS', text: '<b>Priya Sharma</b> reported <b>BUG-002</b> — Critical severity',     time: '20 min ago',  color: '#6554C0' },
      { av: 'RK', text: '<b>Rajesh Kumar</b> started <b>Sprint 3</b>',                         time: '2 hours ago', color: '#0052CC' },
      { av: 'SI', text: '<b>Sneha Iyer</b> commented on "Fix login redirect loop"',             time: '3 hours ago', color: '#36B37E' },
      { av: 'RP', text: '<b>Ravi Patel</b> closed <b>PS-003</b> — MySQL Schema done',          time: 'Yesterday',   color: '#008DA6' },
      { av: 'MT', text: '<b>Mohan Tej</b> was assigned <b>BUG-006</b>',                        time: 'Yesterday',   color: '#FF991F' },
    ];
  }

  navigate(route: string): void {
    this.router.navigate(['/' + route]);
  }

  get totalActive():    number { return this.ds.tickets.filter(t => t.status !== 'BACKLOG').length; }
  get doneCount():      number { return this.ds.tickets.filter(t => t.status === 'DONE').length; }
  get inProgCount():    number { return this.ds.tickets.filter(t => t.status === 'IN_PROGRESS').length; }
  get sprintPct():      number { const d = this.doneCount, tot = this.totalActive || 1; return Math.round(d / tot * 100); }
  get openDefects():    number { return this.ds.defects.filter(d => d.status !== 'RESOLVED').length; }
  get criticalDefects():number { return this.ds.defects.filter(d => d.sev === 'CRITICAL').length; }
  get backlogCount():   number { return this.ds.tickets.filter(t => t.status === 'BACKLOG').length; }
}
