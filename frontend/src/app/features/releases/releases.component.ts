import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Release {
  version: string;
  name: string;
  date: string;
  status: 'Released' | 'Planned' | 'In Progress';
  features: number;
  fixes: number;
  description: string;
}

@Component({
  selector: 'app-releases',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './releases.component.html',
  styleUrl: './releases.component.css',
})
export class ReleasesComponent {
  releases: Release[] = [
    {
      version: 'v3.0.0', name: 'Major Platform Upgrade', date: 'Mar 15, 2025',
      status: 'Planned', features: 12, fixes: 5,
      description: 'Full redesign with AI assistant, advanced analytics, and real-time collaboration.',
    },
    {
      version: 'v2.5.0', name: 'Analytics & Reporting', date: 'Feb 1, 2025',
      status: 'In Progress', features: 7, fixes: 3,
      description: 'Sprint reports, velocity charts, burndown graphs, and export to CSV.',
    },
    {
      version: 'v2.0.0', name: 'Board & Backlog Overhaul', date: 'Jan 10, 2025',
      status: 'Released', features: 9, fixes: 6,
      description: 'Drag-and-drop Kanban board, custom backlog views, and sprint planning tools.',
    },
    {
      version: 'v1.5.0', name: 'Defect Tracker', date: 'Dec 5, 2024',
      status: 'Released', features: 4, fixes: 8,
      description: 'Bug reporting, assignment, severity tracking, and defect-to-story linking.',
    },
    {
      version: 'v1.0.0', name: 'Initial Release', date: 'Nov 1, 2024',
      status: 'Released', features: 6, fixes: 0,
      description: 'Core project management features: team management, sprint creation, and basic board.',
    },
  ];

  private readonly statusClasses: Record<Release['status'], string> = {
    Released:    'badge-released',
    Planned:     'badge-planned',
    'In Progress': 'badge-progress',
  };

  statusClass(r: Release): string { return this.statusClasses[r.status]; }

  countByStatus(status: Release['status']): number {
    return this.releases.filter(r => r.status === status).length;
  }

  get released():   number { return this.countByStatus('Released'); }
  get inProgress(): number { return this.countByStatus('In Progress'); }
  get planned():    number { return this.countByStatus('Planned'); }
}
