import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AdminApiService, AdminProject, BackendDomain, BackendProjectStatus, ProjectManager,
} from '../../../core/services/admin-api.service';
import { ProjectContextService } from '../../../core/services/project-context.service';

type Tab = 'ALL' | 'IN_PROGRESS' | 'COMPLETED';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './projects-list.component.html',
  styleUrls: ['../admin-theme.css', './projects-list.component.css'],
})
export class ProjectsListComponent implements OnInit {
  all: AdminProject[] = [];
  loading = false;
  error = '';

  query = '';
  activeTab: Tab = 'ALL';
  domainFilter = '';
  showFilters = false;

  readonly pageSize = 12;
  page = 1;

  /* Create-project modal */
  showCreate = false;
  creating = false;
  createError = '';
  createMessage = '';
  managers: ProjectManager[] = [];
  loadingManagers = false;
  createForm: FormGroup;

  readonly statusOptions: BackendProjectStatus[] = ['IN_PROGRESS', 'COMPLETED'];
  readonly domainOptions: BackendDomain[] = [
    'BANKING','HEALTHCARE','RETAIL','INSURANCE',
    'TECHNOLOGY','EDUCATION','GOVERNMENT','MANUFACTURING',
  ];

  constructor(
    private api: AdminApiService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private projectCtx: ProjectContextService,
  ) {
    this.createForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      status:      ['IN_PROGRESS' as BackendProjectStatus, Validators.required],
      domain:      ['TECHNOLOGY' as BackendDomain, Validators.required],
      managerId:   [null],
    });
  }

  ngOnInit(): void {
    const s = this.route.snapshot.queryParamMap.get('status');
    if (s === 'IN_PROGRESS' || s === 'COMPLETED') this.activeTab = s;
    this.load();
  }

  load(): void {
    this.loading = true; this.error = '';
    this.api.listProjects(0, 1000).subscribe({
      next: (p) => { this.all = p.content; this.loading = false; this.page = 1; },
      error: (err) => { this.loading = false;
        this.error = err?.status === 0 ? 'Cannot reach backend.' : 'Failed to load projects.'; },
    });
  }

  setTab(t: Tab): void { this.activeTab = t; this.page = 1; }
  onSearch(): void { this.page = 1; }
  onDomainChange(): void { this.page = 1; }

  get filtered(): AdminProject[] {
    const q = this.query.trim().toLowerCase();
    return this.all.filter(p => {
      if (this.activeTab !== 'ALL' && p.status !== this.activeTab) return false;
      if (this.domainFilter && p.domain !== this.domainFilter) return false;
      if (!q) return true;
      return (p.projectName || '').toLowerCase().includes(q)
          || String(p.projectId).includes(q)
          || ('prj-' + p.projectId).includes(q);
    });
  }

  /* Stats from full list */
  get total():     number { return this.all.length; }
  get ongoing():   number { return this.all.filter(p => p.status === 'IN_PROGRESS').length; }
  get completed(): number { return this.all.filter(p => p.status === 'COMPLETED').length; }

  /* Pagination */
  get pageCount(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageItems(): AdminProject[] {
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

  /* Card helpers */
  prjTag(id: number): string { return 'PRJ-' + String(id).padStart(3, '0'); }
  colorClass(i: number): string { return 'c' + (i % 8); }
  avClass(i: number): string { return 'c' + (i % 8); }

  /** First letters of first two words of the project name. */
  projInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? parts[0]?.[1] ?? '';
    return (a + b).toUpperCase() || '?';
  }

  overflow(p: AdminProject): number {
    return Math.max(0, p.teamSize - p.memberInitials.length);
  }

  open(p: AdminProject): void { this.router.navigate(['/admin/projects', p.projectId]); }

  moveToWorkspace(e: Event, p: AdminProject): void {
    e.stopPropagation();
    this.projectCtx.set(p.projectId);
    this.router.navigate(['/board']);
  }

  /* Create-project modal */

  toggleCreate(): void {
    this.showCreate = !this.showCreate;
    if (this.showCreate && this.managers.length === 0) this.loadManagers();
    if (this.showCreate) { this.createError = ''; this.createMessage = ''; }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.showCreate) this.showCreate = false; }

  loadManagers(): void {
    this.loadingManagers = true;
    this.api.getProjectManagers(0, 1000).subscribe({
      next: (p) => { this.managers = p.content; this.loadingManagers = false; },
      error: () => { this.loadingManagers = false; },
    });
  }

  submitCreate(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.creating = true;
    this.createError = '';
    this.createMessage = '';
    const v = this.createForm.value;
    this.api.createProject({
      projectName: v.projectName,
      description: v.description,
      status:      v.status,
      domain:      v.domain,
      managerId:   v.managerId != null ? Number(v.managerId) : null,
    }).subscribe({
      next: () => {
        this.creating = false;
        this.createMessage = 'Project created successfully.';
        this.createForm.reset({ status: 'IN_PROGRESS', domain: 'TECHNOLOGY', managerId: null });
        this.load();
      },
      error: (err) => {
        this.creating = false;
        this.createError = typeof err?.error === 'string' ? err.error : 'Project creation failed.';
      },
    });
  }
}
