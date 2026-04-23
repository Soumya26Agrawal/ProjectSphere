import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-dev',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-dev.component.html',
  styleUrl: './dashboard-dev.component.css',
})
export class DashboardDevComponent {
  readonly user = this.auth.currentUser;

  stats = [
    { label: 'My Open Tasks',    value: '3',  icon: 'task',         color: '#0052cc' },
    { label: 'Done Today',       value: '1',  icon: 'task_alt',     color: '#36b37e' },
    { label: 'Defects Assigned', value: '2',  icon: 'bug_report',   color: '#ff5630' },
    { label: 'Days Left',        value: '3',  icon: 'timer',        color: '#ff991f' },
  ];

  myTickets = [
    { id: 'PS-010', title: 'Kanban Dashboard UI',   status: 'IN_PROGRESS', pri: 'HIGH',   pts: 5 },
    { id: 'PS-009', title: 'Fix Login Redirect',    status: 'IN_PROGRESS', pri: 'MEDIUM', pts: 3 },
    { id: 'PS-011', title: 'Setup CI/CD Pipeline',  status: 'TO_DO',       pri: 'HIGH',   pts: 8 },
  ];

  myDefects = [
    { id: 'BUG-007', title: 'Sidebar collapse glitch', sev: 'HIGH',   status: 'IN_PROGRESS' },
    { id: 'BUG-009', title: 'Sprint chart not loading', sev: 'CRITICAL', status: 'OPEN'     },
  ];

  activity = [
    { icon: 'edit',         text: 'Updated PS-010 status to In Progress', time: '1h ago'  },
    { icon: 'comment',      text: 'Commented on PS-007 — "JWT done"',     time: '3h ago'  },
    { icon: 'check_circle', text: 'Closed PS-006 — MySQL Schema',         time: '1d ago'  },
    { icon: 'add_task',     text: 'PS-011 assigned to you',               time: '2d ago'  },
  ];

  constructor(private auth: AuthService) {}

  logout(): void { this.auth.logout(); }

  statusClass(s: string): string {
    return { TO_DO:'chip-todo', IN_PROGRESS:'chip-progress', DONE:'chip-done', OPEN:'chip-todo', RESOLVED:'chip-done' }[s] ?? '';
  }
  sevClass(s: string): string {
    return { CRITICAL:'sev-critical', HIGH:'sev-high', MEDIUM:'sev-medium', LOW:'sev-low' }[s] ?? '';
  }
}
