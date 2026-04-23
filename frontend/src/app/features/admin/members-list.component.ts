import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminApiService, BackendRole, TeamMember } from '../../core/services/admin-api.service';

type Tab = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './members-list.component.html',
  styleUrls: ['./admin-theme.css'],
})
export class MembersListComponent implements OnInit {
  all: TeamMember[] = [];
  loading = false;
  error = '';

  query = '';
  activeTab: Tab = 'ALL';

  readonly pageSize = 12;
  page = 1;

  /* Team member modal */
  showTeamModal = false;
  teamForm: FormGroup;
  teamSubmitting = false;
  teamMessage = '';
  teamError = '';
  teamFile: File | null = null;
  uploadMessage = '';
  uploadError = '';
  uploading = false;

  constructor(
    private api: AdminApiService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.teamForm = this.fb.group({
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
    this.api.getTeamMembers(0, 1000).subscribe({
      next: (p) => { this.all = p.content; this.loading = false; this.page = 1; },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 0 ? 'Cannot reach backend.' : 'Failed to load team members.';
      },
    });
  }

  setTab(t: Tab): void { this.activeTab = t; this.page = 1; }
  onSearch(): void   { this.page = 1; }

  get filtered(): TeamMember[] {
    const q = this.query.trim().toLowerCase();
    return this.all.filter(m => {
      if (this.activeTab === 'ACTIVE'   && !m.isActive) return false;
      if (this.activeTab === 'INACTIVE' &&  m.isActive) return false;
      if (!q) return true;
      return (m.firstName || '').toLowerCase().includes(q)
          || (m.lastName  || '').toLowerCase().includes(q)
          || (m.email     || '').toLowerCase().includes(q)
          || String(m.employeeId).includes(q);
    });
  }

  get total():     number { return this.all.length; }
  get active():    number { return this.all.filter(m => m.isActive).length; }
  get inactive():  number { return this.all.filter(m => !m.isActive).length; }
  get activePct(): number { return this.total === 0 ? 0 : Math.round(this.active * 100 / this.total); }

  get pageCount(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pageItems(): TeamMember[] {
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

  initials(m: TeamMember): string {
    return ((m.firstName?.[0] ?? '') + (m.lastName?.[0] ?? '')).toUpperCase() || 'TM';
  }
  colorClass(i: number): string { return 'c' + (i % 8); }
  empTag(id: number): string   { return 'EMP-' + String(id).padStart(3, '0'); }

  open(m: TeamMember): void { this.router.navigate(['/admin/team-members', m.userId]); }

  /* ── Team Member modal ── */

  openTeamModal(): void {
    this.teamMessage = ''; this.teamError = '';
    this.uploadMessage = ''; this.uploadError = '';
    this.teamForm.reset();
    this.teamFile = null;
    this.showTeamModal = true;
  }
  closeTeamModal(): void { this.showTeamModal = false; }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.showTeamModal) this.closeTeamModal(); }

  onTeamFile(ev: Event): void {
    const files = (ev.target as HTMLInputElement).files;
    this.teamFile = files && files.length ? files[0] : null;
    this.uploadMessage = '';
    this.uploadError = '';
  }

  submitTeamUpload(): void {
    if (!this.teamFile) {
      this.uploadError = 'Please choose an Excel (.xlsx) file first.';
      return;
    }
    this.uploading = true; this.uploadError = ''; this.uploadMessage = '';
    this.api.uploadUsersExcel(this.teamFile).subscribe({
      next: (msg) => {
        this.uploading = false;
        this.uploadMessage = msg || 'File uploaded successfully';
        this.teamFile = null;
        const input = document.getElementById('members-excel-input') as HTMLInputElement | null;
        if (input) input.value = '';
        this.load();
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = this._errMsg(err, 'Upload failed.');
      },
    });
  }

  submitTeamForm(): void {
    if (this.teamForm.invalid) { this.teamForm.markAllAsTouched(); return; }
    this.teamSubmitting = true; this.teamMessage = ''; this.teamError = '';
    const v = this.teamForm.value;
    this.api.registerUser({
      employeeId:  Number(v.employeeId),
      firstName:   v.firstName,
      lastName:    v.lastName,
      email:       v.email,
      password:    v.password,
      phoneNumber: Number(v.phoneNumber),
      role:        'DEVELOPER' as BackendRole,
      isActive:    true,
    }).subscribe({
      next: () => {
        this.teamSubmitting = false;
        this.teamMessage = 'Team member registered successfully.';
        this.teamForm.reset();
        this.load();
      },
      error: (err) => {
        this.teamSubmitting = false;
        this.teamError = this._errMsg(err, 'Registration failed.');
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
