import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminProject, AdminTeam } from '../../core/services/admin-api.service';
import { AuthService } from '../../core/services/auth.service';
import { PmApiService } from '../../core/services/pm-api.service';

@Component({
  selector: 'app-pm-teams-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './teams-list.component.html',
  styleUrls: ['../admin/admin-theme.css'],
})
export class PmTeamsListComponent implements OnInit {
  all: AdminTeam[] = [];
  myProjects: AdminProject[] = [];
  loading = false;
  error = '';

  query = '';

  readonly pageSize = 12;
  page = 1;

  /* Create-team modal */
  showCreate = false;
  creating = false;
  createError = '';
  createMessage = '';
  createForm: FormGroup;

  constructor(
    private api: PmApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.createForm = this.fb.group({
      teamName:  ['', [Validators.required, Validators.minLength(2)]],
      projectId: [null, Validators.required],
    });
  }

  private get managerId(): number | null {
    return this.auth.currentUser()?.userId ?? null;
  }

  ngOnInit(): void {
    this.load();
    this.loadMyProjects();
    if (this.route.snapshot.queryParamMap.get('create') === 'true') {
      this.openCreate();
    }
  }

  load(): void {
    this.loading = true; this.error = '';
    this.api.listTeams().subscribe({
      next: (list) => { this.all = list; this.loading = false; this.page = 1; },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 0 ? 'Cannot reach backend.' : 'Failed to load teams.';
      },
    });
  }

  loadMyProjects(): void {
    const id = this.managerId;
    if (id == null) return;
    this.api.listMyProjects(id, 0, 1000).subscribe({
      next: (p) => { this.myProjects = p.content; },
      error: () => {},
    });
  }

  onSearch(): void { this.page = 1; }

  // Is this team attached to one of the PM's projects?
  private isMine(t: AdminTeam): boolean {
    if (t.projectId == null) return false;
    return this.myProjects.some(p => p.projectId === t.projectId);
  }

  get mineTeams(): AdminTeam[] {
    return this.all.filter(t => this.isMine(t));
  }

  get filtered(): AdminTeam[] {
    const q = this.query.trim().toLowerCase();
    return this.mineTeams.filter(t => {
      if (!q) return true;
      return (t.teamName    || '').toLowerCase().includes(q)
          || (t.projectName || '').toLowerCase().includes(q)
          || (t.scrumMasterName || '').toLowerCase().includes(q);
    });
  }

  get total():   number { return this.mineTeams.length; }
  get ongoing(): number { return this.mineTeams.filter(t => t.projectStatus === 'IN_PROGRESS').length; }
  get completed(): number { return this.mineTeams.filter(t => t.projectStatus === 'COMPLETED').length; }
  get totalMembers(): number { return this.mineTeams.reduce((s, t) => s + (t.memberCount || 0), 0); }

  /* Projects of this PM that don't yet have a team. */
  get projectsWithoutTeam(): AdminProject[] {
    const takenIds = new Set(
      this.all.map(t => t.projectId).filter((x): x is number => x != null),
    );
    return this.myProjects.filter(p => !takenIds.has(p.projectId));
  }

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
  openTeam(t: AdminTeam): void { this.router.navigate(['/pm/teams', t.teamId]); }

  /* Create-team modal */

  openCreate(): void {
    this.createError = '';
    this.createMessage = '';
    this.createForm.reset({ teamName: '', projectId: null });
    this.showCreate = true;
  }
  closeCreate(): void { this.showCreate = false; }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.showCreate) this.closeCreate(); }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      const v = this.createForm.value;
      if (!v.teamName) this.createError = 'Please enter a team name.';
      else if (v.projectId == null) this.createError = 'Please pick one of your projects.';
      return;
    }
    this.creating = true;
    this.createError = '';
    this.createMessage = '';
    const v = this.createForm.value;
    this.api.createTeam({
      teamName:      v.teamName,
      projectId:     Number(v.projectId),
      userIds:       [],
      scrumMasterId: null,
    }).subscribe({
      next: (t) => {
        this.creating = false;
        this.createMessage = 'Team created. Taking you to add members…';
        this.load();
        setTimeout(() => {
          this.closeCreate();
          this.router.navigate(['/pm/teams', t.teamId]);
        }, 700);
      },
      error: (err) => {
        this.creating = false;
        if (err?.status === 409) this.createError = 'A team already exists for that project.';
        else this.createError = typeof err?.error === 'string' ? err.error : 'Team creation failed.';
      },
    });
  }
}
