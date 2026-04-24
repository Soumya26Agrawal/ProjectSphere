import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminApiService, AdminTeam } from '../../../core/services/admin-api.service';

type Tab = 'ALL' | 'IN_PROGRESS' | 'COMPLETED';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teams-list.component.html',
  styleUrls: ['../admin-theme.css', './teams-list.component.css'],
})
export class TeamsListComponent implements OnInit {
  all: AdminTeam[] = [];
  loading = false;
  error = '';

  query = '';
  activeTab: Tab = 'ALL';

  readonly pageSize = 12;
  page = 1;

  constructor(private api: AdminApiService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.api.listTeams(0, 1000).subscribe({
      next: (p) => { this.all = p.content; this.loading = false; this.page = 1; },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 0 ? 'Cannot reach backend.' : 'Failed to load teams.';
      },
    });
  }

  setTab(t: Tab): void { this.activeTab = t; this.page = 1; }
  onSearch(): void   { this.page = 1; }

  get filtered(): AdminTeam[] {
    const q = this.query.trim().toLowerCase();
    return this.all.filter(t => {
      if (this.activeTab === 'IN_PROGRESS' && t.projectStatus !== 'IN_PROGRESS') return false;
      if (this.activeTab === 'COMPLETED'   && t.projectStatus !== 'COMPLETED')   return false;
      if (!q) return true;
      return (t.teamName    || '').toLowerCase().includes(q)
          || (t.projectName || '').toLowerCase().includes(q)
          || (t.scrumMasterName || '').toLowerCase().includes(q);
    });
  }

  get total():     number { return this.all.length; }
  get ongoing():   number { return this.all.filter(t => t.projectStatus === 'IN_PROGRESS').length; }
  get completed(): number { return this.all.filter(t => t.projectStatus === 'COMPLETED').length; }
  get totalMembers(): number { return this.all.reduce((s, t) => s + (t.memberCount || 0), 0); }

  /* Pagination */
  get pageCount(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageItems(): AdminTeam[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  get pageList(): (number | '…')[] {
    const total = this.pageCount, cur = this.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    const start = Math.max(2, cur - 1);
    const end   = Math.min(total - 1, cur + 1);
    if (start > 2) pages.push('…');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('…');
    pages.push(total);
    return pages;
  }
  goPage(p: number | '…'): void {
    if (p === '…') return;
    if (p < 1 || p > this.pageCount || p === this.page) return;
    this.page = p;
  }
  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.pageCount) this.page++; }

  /* Presentation helpers */
  teamInitials(t: AdminTeam): string {
    const parts = (t.teamName || '').trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? parts[0]?.[1] ?? '';
    return (a + b).toUpperCase() || 'TM';
  }
  memberInitials(m: { firstName?: string; lastName?: string }): string {
    return ((m.firstName?.[0] ?? '') + (m.lastName?.[0] ?? '')).toUpperCase() || '?';
  }
  colorClass(i: number): string { return 'c' + (i % 8); }

  /* Navigation */
  newTeam(): void { this.router.navigate(['/admin/teams/new']); }
  openTeam(t: AdminTeam): void { this.router.navigate(['/admin/teams', t.teamId]); }
}
