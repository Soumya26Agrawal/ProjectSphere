import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface PmProject {
  name: string;
  description: string;
  status: 'ONGOING' | 'COMPLETED';
  teamLead: string;
  absentees: number;
  activeStories: number;
  openDefects: number;
  progress: number;
}

@Component({
  selector: 'app-dashboard-pm',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-pm.component.html',
  styleUrl: './dashboard-pm.component.css',
})
export class DashboardPmComponent {
  readonly user = this.auth.currentUser;

  /** 3 KPI cards matching Figma design */
  stats = [
    { icon: 'view_kanban',  value: 2, label: 'Assigned Projects',   cls: 'kpi-blue'   },
    { icon: 'check_circle', value: 2, label: 'Active User Stories', cls: 'kpi-purple' },
    { icon: 'error',        value: 1, label: 'Open Defects',        cls: 'kpi-red'    },
  ];

  projects: PmProject[] = [
    {
      name: 'E-Commerce Platform',
      description: 'Building a comprehensive e-commerce solution',
      status: 'ONGOING',
      teamLead: 'David Brown',
      absentees: 4,
      activeStories: 2,
      openDefects: 1,
      progress: 65,
    },
    {
      name: 'Mobile Banking App',
      description: 'Secure mobile banking application',
      status: 'COMPLETED',
      teamLead: 'David Brown',
      absentees: 3,
      activeStories: 0,
      openDefects: 0,
      progress: 100,
    },
  ];

  constructor(private auth: AuthService) {}
  logout(): void { this.auth.logout(); }
}
