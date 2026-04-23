import {
  AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  AdminApiService, AdminProject, AdminStats,
  BackendDomain, BackendProjectStatus, BackendRole,
  ProjectManager, TeamMember,
} from '../../core/services/admin-api.service';

declare const Chart: any;

type Modal = 'none' | 'team' | 'pm' | 'project';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['../admin/admin-theme.css', './dashboard-admin.component.css'],
})
export class DashboardAdminComponent implements OnInit, AfterViewInit {
  readonly user = this.auth.currentUser;

  /* Canvas refs */
  @ViewChild('cProjStatus') cProjStatus!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cProjDomain') cProjDomain!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cUserMix')    cUserMix!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('cRoleActive') cRoleActive!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cManagerLoad') cManagerLoad!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cTeamSize')   cTeamSize!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('cCreated')    cCreated!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('cCompleted')  cCompleted!:  ElementRef<HTMLCanvasElement>;

  stats: AdminStats | null = null;
  statsError = '';
  statsLoading = false;

  /* Analytics data */
  projects: AdminProject[] = [];
  pmList:   ProjectManager[] = [];
  members:  TeamMember[] = [];
  analyticsLoading = false;
  analyticsError = '';
  private chartInstances: any[] = [];
  private viewInitialized = false;
  private dataReady = false;

  /** Modal state */
  activeModal: Modal = 'none';

  teamForm: FormGroup;
  teamSubmitting = false;
  teamMessage = '';
  teamError = '';
  teamFile: File | null = null;
  uploadMessage = '';
  uploadError = '';
  uploading = false;

  pmForm: FormGroup;
  pmSubmitting = false;
  pmMessage = '';
  pmError = '';

  projectForm: FormGroup;
  projectSubmitting = false;
  projectMessage = '';
  projectError = '';
  managers: ProjectManager[] = [];
  loadingManagers = false;

  readonly statusOptions: BackendProjectStatus[] = ['IN_PROGRESS', 'COMPLETED'];
  readonly domainOptions: BackendDomain[] = [
    'BANKING','HEALTHCARE','RETAIL','INSURANCE',
    'TECHNOLOGY','EDUCATION','GOVERNMENT','MANUFACTURING',
  ];

  constructor(
    private auth: AuthService,
    private api: AdminApiService,
    private router: Router,
    private route: ActivatedRoute,
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

    this.pmForm = this.fb.group({
      employeeId:  ['', [Validators.required]],
      firstName:   ['', [Validators.required, Validators.minLength(2)]],
      lastName:    ['', [Validators.required]],
      email:       ['', [Validators.required, Validators.email]],
      password:    ['', [Validators.required, Validators.minLength(4)]],
      phoneNumber: ['', [Validators.required]],
    });

    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      status:      ['IN_PROGRESS' as BackendProjectStatus, Validators.required],
      domain:      ['TECHNOLOGY' as BackendDomain, Validators.required],
      managerId:   [null],
    });
  }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn() || this.auth.userRole() !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
    this.loadStats();
    this.loadAnalyticsData();

    const open = this.route.snapshot.queryParamMap.get('open');
    if (open === 'pm' || open === 'team' || open === 'project') {
      this.openModal(open);
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.tryBuildCharts();
  }

  loadStats(): void {
    this.statsLoading = true;
    this.statsError = '';
    this.api.getStats().subscribe({
      next: (s) => { this.stats = s; this.statsLoading = false; },
      error: (err) => {
        this.statsLoading = false;
        if (err?.status === 401 || err?.status === 403) {
          this.statsError = 'Session expired. Please log in again.';
        } else if (err?.status === 0) {
          this.statsError = 'Cannot reach backend at http://localhost:8081.';
        } else {
          this.statsError = 'Failed to load stats.';
        }
      },
    });
  }

  loadAnalyticsData(): void {
    this.analyticsLoading = true;
    this.analyticsError = '';
    this.dataReady = false;
    let pending = 3;
    const done = () => {
      if (--pending === 0) {
        this.analyticsLoading = false;
        this.dataReady = true;
        this.tryBuildCharts();
      }
    };
    this.api.listProjects(0, 1000).subscribe({
      next: (p) => { this.projects = p.content; done(); },
      error: () => { this.analyticsError = 'Failed to load analytics data.'; done(); },
    });
    this.api.getProjectManagers(0, 1000).subscribe({
      next: (p) => { this.pmList = p.content; done(); },
      error: () => { done(); },
    });
    this.api.getTeamMembers(0, 1000).subscribe({
      next: (p) => { this.members = p.content; done(); },
      error: () => { done(); },
    });
  }

  refreshAll(): void {
    this.loadStats();
    this.loadAnalyticsData();
  }

  /* ─── Charts ─────────────────────────────────────────────────── */

  private tryBuildCharts(): void {
    if (!this.viewInitialized || !this.dataReady) return;
    if (typeof Chart === 'undefined') return;
    this.destroyCharts();
    this.buildCharts();
  }

  private destroyCharts(): void {
    this.chartInstances.forEach(c => { try { c.destroy(); } catch {} });
    this.chartInstances = [];
  }

  private buildCharts(): void {
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

    /* 1 — Project Status doughnut */
    const ongoing   = this.projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completed = this.projects.filter(p => p.status === 'COMPLETED').length;
    this.chartInstances.push(new Chart(this.cProjStatus.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Ongoing', 'Completed'],
        datasets: [{
          data: [ongoing, completed],
          backgroundColor: ['#DEEBFF', '#E3FCEF'],
          borderColor:     ['#0052CC', '#006644'],
          borderWidth: 2, hoverOffset: 8,
        }],
      },
      options: {
        ...base, cutout: '65%',
        plugins: { ...base.plugins, legend: { position: 'bottom', labels: { color: tickColor, font: tickFont, boxWidth: 12 } } },
        onClick: (_: any, els: any[]) => {
          if (!els.length) return;
          this.router.navigate(['/admin/projects']);
        },
      },
    }));

    /* 2 — Projects by Domain (bar) */
    const domainCounts = this.domainOptions.map(d =>
      this.projects.filter(p => p.domain === d).length
    );
    this.chartInstances.push(new Chart(this.cProjDomain.nativeElement, {
      type: 'bar',
      data: {
        labels: this.domainOptions.map(d => this.titleCase(d)),
        datasets: [{
          label: 'Projects',
          data: domainCounts,
          backgroundColor: [
            '#DEEBFF', '#E3FCEF', '#FFF0B3', '#EAE6FF',
            '#FFEBE6', '#DDF4F7', '#FFE0F0', '#FFF7D6',
          ],
          borderColor: [
            '#0052CC', '#006644', '#7F5F01', '#403294',
            '#BF2600', '#00687D', '#A5275F', '#974F0C',
          ],
          borderWidth: 1.5, borderRadius: 4, borderSkipped: false,
        }],
      },
      options: { ...base, plugins: { ...base.plugins, legend: { display: false } }, scales: axes },
    }));

    /* 3 — User mix doughnut (Admin / PM / Developer) */
    const adminCount = 1; // from seed; we don't have per-role count but admin exists
    const pmCount    = this.pmList.length;
    const devCount   = this.members.length;
    this.chartInstances.push(new Chart(this.cUserMix.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Admins', 'Project Managers', 'Developers'],
        datasets: [{
          data: [adminCount, pmCount, devCount],
          backgroundColor: ['#FFEBE6', '#DEEBFF', '#EAE6FF'],
          borderColor:     ['#BF2600', '#0052CC', '#403294'],
          borderWidth: 2, hoverOffset: 8,
        }],
      },
      options: {
        ...base, cutout: '65%',
        plugins: { ...base.plugins, legend: { position: 'bottom', labels: { color: tickColor, font: tickFont, boxWidth: 12 } } },
      },
    }));

    /* 4 — Active vs Inactive (stacked bar by role) */
    const pmActive    = this.pmList.filter(m => m.isActive).length;
    const pmInactive  = this.pmList.length - pmActive;
    const devActive   = this.members.filter(m => m.isActive).length;
    const devInactive = this.members.length - devActive;
    this.chartInstances.push(new Chart(this.cRoleActive.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Project Managers', 'Developers'],
        datasets: [
          {
            label: 'Active',
            data: [pmActive, devActive],
            backgroundColor: '#36B37E', borderColor: '#006644',
            borderWidth: 1.5, borderRadius: 4, borderSkipped: false,
          },
          {
            label: 'Inactive',
            data: [pmInactive, devInactive],
            backgroundColor: '#FF8F73', borderColor: '#BF2600',
            borderWidth: 1.5, borderRadius: 4, borderSkipped: false,
          },
        ],
      },
      options: {
        ...base,
        scales: {
          x: { ...axes.x, stacked: true },
          y: { ...axes.y, stacked: true },
        },
      },
    }));

    /* 5 — Manager workload (horizontal bar, top 8) */
    const topManagers = [...this.pmList]
      .map(m => ({ name: `${m.firstName} ${m.lastName}`.trim() || m.email, count: m.managedProjects.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    this.chartInstances.push(new Chart(this.cManagerLoad.nativeElement, {
      type: 'bar',
      data: {
        labels: topManagers.map(m => m.name),
        datasets: [{
          label: 'Projects',
          data: topManagers.map(m => m.count),
          backgroundColor: '#DEEBFF', borderColor: '#0052CC',
          borderWidth: 1.5, borderRadius: 4, borderSkipped: false,
        }],
      },
      options: {
        ...base, indexAxis: 'y' as const,
        plugins: { ...base.plugins, legend: { display: false } },
        scales: {
          x: { ...axes.y },
          y: { ticks: { color: tickColor, font: tickFont }, grid: { display: false } },
        },
      },
    }));

    /* 6 — Team Size Distribution (bar) */
    const buckets: [string, (s: number) => boolean][] = [
      ['No team',   s => s === 0],
      ['1–3',       s => s >= 1 && s <= 3],
      ['4–6',       s => s >= 4 && s <= 6],
      ['7+',        s => s >= 7],
    ];
    const bucketCounts = buckets.map(([, fn]) => this.projects.filter(p => fn(p.teamSize)).length);
    this.chartInstances.push(new Chart(this.cTeamSize.nativeElement, {
      type: 'bar',
      data: {
        labels: buckets.map(([label]) => label),
        datasets: [{
          label: 'Projects',
          data: bucketCounts,
          backgroundColor: ['#F4F5F7', '#DEEBFF', '#EAE6FF', '#E3FCEF'],
          borderColor:     ['#97A0AF', '#0052CC', '#403294', '#006644'],
          borderWidth: 1.5, borderRadius: 4, borderSkipped: false,
        }],
      },
      options: { ...base, plugins: { ...base.plugins, legend: { display: false } }, scales: axes },
    }));

    /* 7 — Projects Created Over Time (last 6 months, line) */
    const createdMonths = this.monthBuckets(this.projects, p => p.createdAt);
    this.chartInstances.push(new Chart(this.cCreated.nativeElement, {
      type: 'line',
      data: {
        labels: createdMonths.labels,
        datasets: [{
          label: 'Projects created',
          data: createdMonths.counts,
          borderColor: '#0052CC',
          backgroundColor: 'rgba(0,82,204,.12)',
          fill: true, tension: .4,
          pointBackgroundColor: '#0052CC', pointBorderColor: '#fff',
          pointBorderWidth: 2, pointRadius: 5,
        }],
      },
      options: { ...base, scales: axes },
    }));

    /* 8 — Completion Trend (last 6 months, line) */
    const doneMonths = this.monthBuckets(
      this.projects.filter(p => p.completedAt),
      p => p.completedAt,
    );
    this.chartInstances.push(new Chart(this.cCompleted.nativeElement, {
      type: 'line',
      data: {
        labels: doneMonths.labels,
        datasets: [{
          label: 'Projects completed',
          data: doneMonths.counts,
          borderColor: '#36B37E',
          backgroundColor: 'rgba(54,179,126,.12)',
          fill: true, tension: .4,
          pointBackgroundColor: '#36B37E', pointBorderColor: '#fff',
          pointBorderWidth: 2, pointRadius: 5,
        }],
      },
      options: { ...base, scales: axes },
    }));
  }

  /* Helpers */
  private titleCase(s: string): string {
    return s.charAt(0) + s.slice(1).toLowerCase();
  }
  private monthBuckets(items: AdminProject[], getDate: (p: AdminProject) => string | null):
      { labels: string[]; counts: number[] } {
    const now = new Date();
    const labels: string[] = [];
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      keys.push(key);
      labels.push(d.toLocaleString('en-US', { month: 'short' }));
    }
    const counts = new Array(keys.length).fill(0);
    items.forEach(p => {
      const raw = getDate(p);
      if (!raw) return;
      const d = new Date(raw);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const idx = keys.indexOf(key);
      if (idx >= 0) counts[idx]++;
    });
    return { labels, counts };
  }

  /* Extra computed KPIs */
  get avgDuration(): number | null {
    const completed = this.projects.filter(p => p.durationDays != null && p.status === 'COMPLETED');
    if (!completed.length) return null;
    const sum = completed.reduce((s, p) => s + (p.durationDays || 0), 0);
    return Math.round(sum / completed.length);
  }

  /* ─── Modal / navigation ─────────────────────────────────────── */

  goTo(path: string): void { this.router.navigate([path]); }

  openModal(m: Modal): void {
    this.activeModal = m;
    if (m === 'project' && this.managers.length === 0) this.loadManagers();
    this.teamMessage = this.teamError = '';
    this.pmMessage   = this.pmError   = '';
    this.projectMessage = this.projectError = '';
    this.uploadMessage  = this.uploadError  = '';
  }
  closeModal(): void { this.activeModal = 'none'; }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.activeModal !== 'none') this.closeModal(); }

  /* ─── Form handlers ──────────────────────────────────────────── */

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
    this.uploading = true;
    this.uploadError = '';
    this.uploadMessage = '';
    this.api.uploadUsersExcel(this.teamFile).subscribe({
      next: (msg) => {
        this.uploading = false;
        this.uploadMessage = msg || 'File uploaded successfully';
        this.teamFile = null;
        const input = document.getElementById('team-excel-input') as HTMLInputElement | null;
        if (input) input.value = '';
        this.refreshAll();
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
        this.refreshAll();
      },
      error: (err) => {
        this.teamSubmitting = false;
        this.teamError = this._errMsg(err, 'Registration failed.');
      },
    });
  }

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
        this.refreshAll();
      },
      error: (err) => {
        this.pmSubmitting = false;
        this.pmError = this._errMsg(err, 'Registration failed.');
      },
    });
  }

  loadManagers(): void {
    this.loadingManagers = true;
    this.api.getProjectManagers(0, 1000).subscribe({
      next: (p) => { this.managers = p.content; this.loadingManagers = false; },
      error: () => { this.loadingManagers = false; },
    });
  }

  submitProjectForm(): void {
    if (this.projectForm.invalid) { this.projectForm.markAllAsTouched(); return; }
    this.projectSubmitting = true; this.projectMessage = ''; this.projectError = '';
    const v = this.projectForm.value;
    this.api.createProject({
      projectName: v.projectName,
      description: v.description,
      status:      v.status as BackendProjectStatus,
      domain:      v.domain as BackendDomain,
      managerId:   v.managerId != null ? Number(v.managerId) : null,
    }).subscribe({
      next: () => {
        this.projectSubmitting = false;
        this.projectMessage = 'Project created successfully.';
        this.projectForm.reset({ status: 'IN_PROGRESS', domain: 'TECHNOLOGY', managerId: null });
        this.refreshAll();
      },
      error: (err) => {
        this.projectSubmitting = false;
        this.projectError = this._errMsg(err, 'Project creation failed.');
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
