import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-dashboard-dev',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-dev.component.html',
  styleUrls: ['../admin/admin-theme.css', './dashboard-dev.component.css'],
})
export class DashboardDevComponent implements OnInit {
  readonly user = this.auth.currentUser;

  /* Single-project model (mock). Matches the shape we'd get from /api/projects later. */
  readonly project = {
    name: 'ProjectSphere',
    description: 'Jira-style project management platform with tickets, sprints, defect tracking and analytics.',
    domain: 'TECHNOLOGY',
    manager: 'Rajesh Kumar',
    activeSprint: 'Sprint 3',
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    public ds: DataService,
  ) {}

  ngOnInit(): void { /* no-op; mock only */ }

  /* ── Stats computed from the mock DataService ── */
  get totalTickets(): number { return this.ds.tickets.length; }
  get openTickets():  number { return this.ds.tickets.filter(t => t.status !== 'COMPLETED').length; }
  get doneTickets():  number { return this.ds.tickets.filter(t => t.status === 'COMPLETED').length; }
  get progressPct():  number {
    return this.totalTickets ? Math.round(this.doneTickets / this.totalTickets * 100) : 0;
  }
  get openDefects():  number {
    const resolved = ['FIXED','CLOSED','DEFERRED','REJECTED','DUPLICATE'];
    return this.ds.defects.filter(d => !resolved.includes(d.status)).length;
  }
  get teamSize(): number { return this.ds.engineers.length; }
  get myOpenTickets() {
    const me = this.user()?.name;
    return this.ds.tickets.filter(t => t.ass === me && t.status !== 'COMPLETED').slice(0, 4);
  }
  get recentActivity() {
    // Derive a simple "latest tickets" list from mock data.
    return [...this.ds.tickets]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }

  enter(): void { this.router.navigate(['/board']); }
  logout(): void { this.auth.logout(); }

  statusClass(s: string): string { return this.ds.lozClass(s); }
  typeClass(t: string):   string { return this.ds.itClass(t); }
  typeIcon(t: string):    string { return this.ds.itIcon(t); }
  priIcon(p: string):     string { return this.ds.priIcon(p); }
  priClass(p: string):    string { return this.ds.priClass(p); }
  sl(s: string):          string { return this.ds.sl(s); }
}
