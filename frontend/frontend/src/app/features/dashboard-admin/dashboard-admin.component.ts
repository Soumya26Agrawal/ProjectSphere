import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/models';

interface Project {
  name: string;
  description: string;
  domain: string;
  pm: string;
  teamLead: string;
  teamSize: number;
  status: 'ONGOING' | 'COMPLETED';
  progress: number;
  activeStories: number;
  openDefects: number;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
})
export class DashboardAdminComponent implements OnDestroy {
  readonly user = this.auth.currentUser;

  stats = [
    { icon: 'work',         trendIcon: 'show_chart',  value: 2, label: 'Project Managers',  btnLabel: 'View Profiles',    cls: 'card-blue'   },
    { icon: 'group',        trendIcon: 'trending_up', value: 6, label: 'Team Members',       btnLabel: 'View Profiles',    cls: 'card-indigo' },
    { icon: 'view_kanban',  trendIcon: 'schedule',    value: 2, label: 'Ongoing Projects',   btnLabel: '4 Active Stories', cls: 'card-green'  },
    { icon: 'check_circle', trendIcon: 'trending_up', value: 1, label: 'Completed Projects', btnLabel: '2 Open Defects',   cls: 'card-purple' },
  ];

  allProjects: Project[] = [
    {
      name: 'E-Commerce Platform',
      description: 'Building a comprehensive e-commerce solution',
      domain: 'Retail',    pm: 'Bob Smith',      teamLead: 'David Brown',  teamSize: 4,
      status: 'ONGOING',   progress: 65,         activeStories: 2,         openDefects: 1,
    },
    {
      name: 'Customer Analytics Dashboard',
      description: 'Real-time analytics and reporting system',
      domain: 'Analytics', pm: 'Carol Williams', teamLead: 'Henry Moore',  teamSize: 2,
      status: 'ONGOING',   progress: 45,         activeStories: 2,         openDefects: 1,
    },
    {
      name: 'Mobile Banking App',
      description: 'Secure mobile banking application',
      domain: 'Finance',   pm: 'Bob Smith',      teamLead: 'David Brown',  teamSize: 3,
      status: 'COMPLETED', progress: 100,        activeStories: 0,         openDefects: 0,
    },
  ];

  domainFilter = 'All Domains';
  statusFilter = 'All Statuses';
  pmFilter     = 'All Managers';

  get domains():  string[] { return ['All Domains',  ...new Set(this.allProjects.map(p => p.domain))]; }
  get statuses(): string[] { return ['All Statuses', 'ONGOING', 'COMPLETED']; }
  get pms():      string[] { return ['All Managers', ...new Set(this.allProjects.map(p => p.pm))]; }

  get filteredProjects(): Project[] {
    return this.allProjects.filter(p =>
      (this.domainFilter === 'All Domains'  || p.domain === this.domainFilter) &&
      (this.statusFilter === 'All Statuses' || p.status === this.statusFilter) &&
      (this.pmFilter     === 'All Managers' || p.pm     === this.pmFilter)
    );
  }

  get domainChartData() {
    return ['Retail', 'Analytics', 'Finance'].map(d => ({
      label: d,
      count: this.allProjects.filter(p => p.domain === d).length,
    }));
  }

  get maxDomain():      number { return Math.max(...this.domainChartData.map(d => d.count), 1); }
  get ongoingCount():   number { return this.allProjects.filter(p => p.status === 'ONGOING').length; }
  get completedCount(): number { return this.allProjects.filter(p => p.status === 'COMPLETED').length; }
  get ongoingDeg():     number { return Math.round((this.ongoingCount / this.allProjects.length) * 360); }

  // ── Register Modal ──────────────────────────────────────────────
  showRegisterModal  = false;
  registerSuccess    = false;
  registerError      = '';
  private _closeTimer: ReturnType<typeof setTimeout> | null = null;
  registerForm: FormGroup;

  readonly roles: { label: string; value: UserRole }[] = [
    { label: 'Admin',           value: 'admin'           },
    { label: 'Project Manager', value: 'project_manager' },
    { label: 'Developer',       value: 'developer'       },
  ];

  constructor(private auth: AuthService, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role:     ['developer' as UserRole, Validators.required],
    });
  }

  openRegister(): void {
    this.registerForm.reset({ role: 'developer' });
    this.registerError   = '';
    this.registerSuccess = false;
    this.showRegisterModal = true;
  }

  closeRegister(): void {
    if (this._closeTimer !== null) { clearTimeout(this._closeTimer); this._closeTimer = null; }
    this.showRegisterModal = false;
  }

  ngOnDestroy(): void {
    if (this._closeTimer !== null) clearTimeout(this._closeTimer);
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { name, email, password, role } = this.registerForm.value;
    const result = this.auth.register(name, email, password, role as UserRole);
    if (result === 'duplicate') {
      this.registerError = 'A user with this email already exists.';
    } else {
      this.registerSuccess = true;
      this.registerError   = '';
      this._closeTimer = setTimeout(() => this.closeRegister(), 1800);
    }
  }

  logout(): void { this.auth.logout(); }
}
