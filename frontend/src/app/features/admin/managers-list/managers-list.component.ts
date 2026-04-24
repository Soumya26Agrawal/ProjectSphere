import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AdminApiService, BackendRole, ProjectManager,
} from '../../../core/services/admin-api.service';

type Tab = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'MULTI';

@Component({
  selector: 'app-managers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './managers-list.component.html',
  styleUrls: ['../admin-theme.css', './managers-list.component.css'],
})
export class ManagersListComponent implements OnInit {
  all: ProjectManager[] = [];
  loading = false;
  error = '';

  query = '';
  activeTab: Tab = 'ALL';

  readonly pageSize = 12;
  page = 1;

  /* PM registration modal */
  showPmModal = false;
  pmForm: FormGroup;
  pmSubmitting = false;
  pmMessage = '';
  pmError = '';

  constructor(
    private api: AdminApiService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.pmForm = this.fb.group({
      employeeId:  ['', [Validators.required]],
      firstName:   ['', [Validators.required, Validators.minLength(2)]],
      lastName:    ['', [Validators.required]],
      email:       ['', [Validators.required, Validators.email]],
      password:    ['', [Validators.required, Validators.minLength(4)]],
      phoneNumber: ['', [Validators.required]],
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.api.getProjectManagers(0, 1000).subscribe({
      next: (p) => { this.all = p.content; this.loading = false; this.page = 1; },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 0 ? 'Cannot reach backend.' : 'Failed to load project managers.';
      },
    });
  }

  setTab(t: Tab): void { this.activeTab = t; this.page = 1; }
  onSearch(): void   { this.page = 1; }

  get filtered(): ProjectManager[] {
    const q = this.query.trim().toLowerCase();
    return this.all.filter(m => {
      if (this.activeTab === 'ACTIVE'   && !m.isActive) return false;
      if (this.activeTab === 'INACTIVE' &&  m.isActive) return false;
      if (this.activeTab === 'MULTI'    && (m.managedProjects.length || 0) <= 1) return false;
      if (!q) return true;
      return (m.firstName || '').toLowerCase().includes(q)
          || (m.lastName  || '').toLowerCase().includes(q)
          || (m.email     || '').toLowerCase().includes(q)
          || String(m.employeeId).includes(q);
    });
  }

  /* Stats */
  get total():    number { return this.all.length; }
  get active():   number { return this.all.filter(m => m.isActive).length; }
  get inactive(): number { return this.all.filter(m => !m.isActive).length; }
  get multiCount(): number { return this.all.filter(m => m.managedProjects.length > 1).length; }
  get totalProjects(): number { return this.all.reduce((s, m) => s + m.managedProjects.length, 0); }

  /* Pagination */
  get pageCount(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageItems(): ProjectManager[] {
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

  initials(m: ProjectManager): string {
    return ((m.firstName?.[0] ?? '') + (m.lastName?.[0] ?? '')).toUpperCase() || 'PM';
  }
  colorClass(i: number): string { return 'c' + (i % 8); }
  empTag(id: number): string   { return 'EMP-' + String(id).padStart(3, '0'); }

  open(m: ProjectManager): void { this.router.navigate(['/admin/project-managers', m.userId]); }

  /* ── PM modal ── */

  openPmModal(): void {
    this.pmMessage = ''; this.pmError = '';
    this.pmForm.reset();
    this.showPmModal = true;
  }
  closePmModal(): void { this.showPmModal = false; }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.showPmModal) this.closePmModal(); }

  submitPmForm(): void {
    if (this.pmForm.invalid) { this.pmForm.markAllAsTouched(); return; }
    this.pmSubmitting = true; this.pmMessage = ''; this.pmError = '';
    const v = this.pmForm.value;
    this.api.registerUser({
      employeeId:  Number(v.employeeId),
      firstName:   v.firstName,
      lastName:    v.lastName,
      email:       v.email,
      password:    v.password,
      phoneNumber: Number(v.phoneNumber),
      role:        'PROJECT_MANAGER' as BackendRole,
      isActive:    true,
    }).subscribe({
      next: () => {
        this.pmSubmitting = false;
        this.pmMessage = 'Project Manager registered successfully.';
        this.pmForm.reset();
        this.load();
      },
      error: (err) => {
        this.pmSubmitting = false;
        this.pmError = this._errMsg(err, 'Registration failed.');
      },
    });
  }

  private _errMsg(err: any, fallback: string): string {
    if (!err) return fallback;
    if (typeof err.error === 'string') return err.error;
    if (err.error?.message) return err.error.message;
    if (err.status === 0)   return 'Cannot reach backend at http://localhost:8081.';
    if (err.status === 401 || err.status === 403) return 'Not authorized. Please log in as admin.';
    return fallback;
  }
}
