import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  constructor(public ui: UiService, private data: DataService, private auth: AuthService) {}

  /** Home route based on the logged-in user's role. */
  get homeRoute(): string { return this.auth.getDashboardRoute(); }

  /** Board shows tickets that are assigned to a sprint. */
  get boardCount(): number {
    return this.data.tickets.filter(t => !!t.sprint).length;
  }
  /** Backlog shows tickets that are not in any sprint. */
  get backlogCount(): number {
    return this.data.tickets.filter(t => !t.sprint).length;
  }
  get defectCount(): number {
    return this.data.defects.length;
  }
  get testCaseCount(): number {
    // For now, return a static count; integrate with data service later
    return 4; // Mock count
  }
  
}
