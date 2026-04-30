import {
  AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import {
  AdminProject, AdminTeam, BackendDomain, BackendProjectStatus,
} from '../../core/services/admin-api.service';
import { PmApiService, PmStats } from '../../core/services/pm-api.service';

declare const Chart: any;

type Modal = 'none' | 'project' | 'team';

@Component({
  selector: 'app-dashboard-pm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard-pm.component.html',
  styleUrls: ['../admin/admin-theme.css', './dashboard-pm.component.css'],
})
export class DashboardPmComponent implements OnInit, AfterViewInit {
  readonly user = this.auth.currentUser;

  @ViewChild('cProjStatus') cProjStatus!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cProjDomain') cProjDomain!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cTeamSize')   cTeamSize!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('cCreated')    cCreated!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('cCompleted')  cCompleted!:  ElementRef<HTMLCanvasElement>;

  stats: PmStats | null = null;
  statsLoading = false;
  statsError = '';

  projects: AdminProject[] = [];
  allTeams: AdminTeam[] = [];
  analyticsLoading = false;
  analyticsError = '';

  private chartInstances: any[] = [];
  private viewInitialized = false;
  private dataReady = false;

  readonly domainOptions: BackendDomain[] = [
    'BANKING','HEALTHCARE','RETAIL','INSURANCE',
    'TECHNOLOGY','EDUCATION','GOVERNMENT','MANUFACTURING',
  ];
  readonly statusOptions: BackendProjectStatus[] = ['IN_PROGRESS', 'COMPLETED'];

  /* ── Modal state ── */
  activeModal: Modal = 'none';

  // New Project modal
  projectForm: FormGroup;
  projectSubmitting = false;
  projectMessage = '';
  projectError = '';

  // New Team modal
  teamForm: FormGroup;
  teamSubmitting = false;
  teamMessage = '';
  teamError = '';

  constructor(
    private auth: AuthService,
    private api: PmApiService,
    private router: Router,
    private fb: FormBuilder,
    private projectCtx: ProjectContextService,
  ) {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      status:      ['IN_PROGRESS' as BackendProjectStatus, Validators.required],
      domain:      ['TECHNOLOGY' as BackendDomain, Validators.required],
    });
    this.teamForm = this.fb.group({
      teamName:  ['', [Validators.required, Validators.minLength(2)]],
      projectId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn() || this.auth.userRole() !== 'project_manager') {
      this.router.navigate(['/login']);
      return;
    }
    this.loadStats();
    this.loadProjects();
    this.loadTeams();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.tryBuildCharts();
  }

  private get managerId(): number | null {
    return this.user()?.userId ?? null;
  }

  refreshAll(): void {
    this.loadStats();
    this.loadProjects();
    this.loadTeams();
  }

  loadStats(): void {
    const id = this.managerId;
    if (id == null) return;
    this.statsLoading = true;
    this.statsError = '';
    this.api.getStats(id).subscribe({
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

  loadProjects(): void {
    const id = this.managerId;
    if (id == null) return;
    this.analyticsLoading = true;
    this.analyticsError = '';
    this.dataReady = false;
    this.api.listMyProjects(id, 0, 1000).subscribe({
      next: (p) => {
        this.projects = p.content;
        // Mirror this PM's project IDs into the global store for downstream pages.
        this.projectCtx.setUserProjectIds(this.projects.map(x => x.projectId));
        this.analyticsLoading = false;
        this.dataReady = true;
        this.tryBuildCharts();
      },
      error: () => {
        this.analyticsLoading = false;
        this.analyticsError = 'Failed to load your projects.';
      },
    });
  }

  loadTeams(): void {
    this.api.listTeams().subscribe({
      next: (list) => { this.allTeams = list; },
      error: () => {},
    });
  }

  /** Count of teams attached to one of this PM's projects. */
  get myTeamsCount(): number {
    const myIds = new Set(this.projects.map(p => p.projectId));
    return this.allTeams.filter(t => t.projectId != null && myIds.has(t.projectId)).length;
  }

  /* ─── Charts ─── */

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
      },
    }));

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

  goTo(path: string): void { this.router.navigate([path]); }

  /* ─── Modal helpers ─── */

  openModal(m: Modal): void {
    this.activeModal = m;
    this.projectMessage = this.projectError = '';
    this.teamMessage = this.teamError = '';
    if (m === 'project') this.projectForm.reset({ status: 'IN_PROGRESS', domain: 'TECHNOLOGY' });
    if (m === 'team')    this.teamForm.reset({ teamName: '', projectId: null });
  }
  closeModal(): void { this.activeModal = 'none'; }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.activeModal !== 'none') this.closeModal(); }

  /** Projects of this PM that don't yet have a team. */
  get projectsWithoutTeam(): AdminProject[] {
    const takenIds = new Set(
      this.allTeams.map(t => t.projectId).filter((x): x is number => x != null),
    );
    return this.projects.filter(p => !takenIds.has(p.projectId));
  }

  submitProject(): void {
    if (this.projectForm.invalid) { this.projectForm.markAllAsTouched(); return; }
    const id = this.managerId;
    if (id == null) { this.projectError = 'Not logged in.'; return; }
    this.projectSubmitting = true;
    this.projectError = '';
    this.projectMessage = '';
    const v = this.projectForm.value;
    this.api.createProject({
      projectName: v.projectName,
      description: v.description,
      status:      v.status,
      domain:      v.domain,
      managerId:   id,
    }).subscribe({
      next: () => {
        this.projectSubmitting = false;
        this.projectMessage = 'Project created successfully.';
        this.refreshAll();
        setTimeout(() => this.closeModal(), 700);
      },
      error: (err) => {
        this.projectSubmitting = false;
        this.projectError = typeof err?.error === 'string' ? err.error : 'Project creation failed.';
      },
    });
  }

  submitTeam(): void {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      const v = this.teamForm.value;
      if (!v.teamName) this.teamError = 'Please enter a team name.';
      else if (v.projectId == null) this.teamError = 'Please pick one of your projects.';
      return;
    }
    this.teamSubmitting = true;
    this.teamError = '';
    this.teamMessage = '';
    const v = this.teamForm.value;
    this.api.createTeam({
      teamName:      v.teamName,
      projectId:     Number(v.projectId),
      userIds:       [],
      scrumMasterId: null,
    }).subscribe({
      next: (t) => {
        this.teamSubmitting = false;
        this.teamMessage = 'Team created. Taking you to add members…';
        this.refreshAll();
        setTimeout(() => {
          this.closeModal();
          this.router.navigate(['/pm/teams', t.teamId]);
        }, 700);
      },
      error: (err) => {
        this.teamSubmitting = false;
        if (err?.status === 409) this.teamError = 'A team already exists for that project.';
        else this.teamError = typeof err?.error === 'string' ? err.error : 'Team creation failed.';
      },
    });
  }
}
