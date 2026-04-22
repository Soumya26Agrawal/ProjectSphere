import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface SprintReport {
  sprint: string;
  startDate: string;
  endDate: string;
  planned: number;
  completed: number;
  defects: number;
  velocity: number;
  status: 'Completed' | 'In Progress';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent {
  sprints: SprintReport[] = [
    { sprint: 'Sprint 1', startDate: 'Jan 1, 2025',  endDate: 'Jan 14, 2025', planned: 20, completed: 18, defects: 2, velocity: 90, status: 'Completed'   },
    { sprint: 'Sprint 2', startDate: 'Jan 15, 2025', endDate: 'Jan 28, 2025', planned: 22, completed: 19, defects: 3, velocity: 86, status: 'Completed'   },
    { sprint: 'Sprint 3', startDate: 'Jan 29, 2025', endDate: 'Feb 11, 2025', planned: 18, completed: 14, defects: 5, velocity: 78, status: 'Completed'   },
    { sprint: 'Sprint 4', startDate: 'Feb 12, 2025', endDate: 'Feb 25, 2025', planned: 24, completed: 20, defects: 1, velocity: 83, status: 'Completed'   },
    { sprint: 'Sprint 5', startDate: 'Feb 26, 2025', endDate: 'Mar 11, 2025', planned: 20, completed: 11, defects: 4, velocity: 55, status: 'In Progress' },
  ];

  get totalPlanned():   number { return this.sprints.reduce((s, r) => s + r.planned,   0); }
  get totalCompleted(): number { return this.sprints.reduce((s, r) => s + r.completed, 0); }
  get totalDefects():   number { return this.sprints.reduce((s, r) => s + r.defects,   0); }
  get avgVelocity():    number {
    const done = this.sprints.filter(s => s.status === 'Completed');
    return done.length ? Math.round(done.reduce((s, r) => s + r.velocity, 0) / done.length) : 0;
  }

  statusClass(s: SprintReport): string {
    return s.status === 'Completed' ? 'badge-done' : 'badge-progress';
  }

  velClass(v: number): string {
    return v >= 85 ? 'vel-green' : v >= 70 ? 'vel-orange' : 'vel-red';
  }
}
