import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  constructor(public ui: UiService, private data: DataService) {}

  get boardCount(): number {
    return this.data.tickets.filter(t => t.status !== 'BACKLOG').length;
  }
  get backlogCount(): number {
    return this.data.tickets.filter(t => t.status === 'BACKLOG').length;
  }
  get defectCount(): number {
    return this.data.defects.length;
  }
}
