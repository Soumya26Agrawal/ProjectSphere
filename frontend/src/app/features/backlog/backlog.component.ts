import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { Ticket } from '../../core/models/models';

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './backlog.component.html',
  styleUrl: './backlog.component.css',
})
export class BacklogComponent implements OnInit {
  collapsed: Record<string, boolean> = {};

  constructor(public ds: DataService, public ui: UiService) {}

  ngOnInit(): void {}

  get activeSprints() { return this.ds.sprints.filter(s => s.status === 'ACTIVE'); }
  get doneSprints()   { return this.ds.sprints.filter(s => s.status === 'DONE'); }
  get backlogTickets(): Ticket[] { return this.ds.tickets.filter(t => t.status === 'BACKLOG'); }

  getSprintTickets(sprintName: string): Ticket[] {
    return this.ds.tickets.filter(t => t.sprint === sprintName && t.status !== 'BACKLOG');
  }

  sprintDone(name: string): number  { return this.getSprintTickets(name).filter(t => t.status === 'DONE').length; }
  sprintTotal(name: string): number { return this.getSprintTickets(name).length; }
  sprintPct(name: string): number   { const t = this.sprintTotal(name); return t ? Math.round(this.sprintDone(name) / t * 100) : 0; }

  toggleSection(key: string): void  { this.collapsed[key] = !this.collapsed[key]; }
}
