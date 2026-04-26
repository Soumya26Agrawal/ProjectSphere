import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { Ticket } from '../../core/models/models';

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [CommonModule, RouterLink, DragDropModule],
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.css'],
})
export class BacklogComponent implements OnInit {
  collapsed: Record<string, boolean> = {};
  expandedSection: 'none' | 'sprints' | 'backlog' = 'none';
  selectedSprintNames: string[] = [];

  constructor(public ds: DataService, public ui: UiService) {}

  ngOnInit(): void {
    this.selectedSprintNames = this.ds.sprints.map(sp => sp.name);
  }

  get activeSprints() {
    return this.ds.sprints
      .filter(s => s.status === 'ACTIVE')
      .sort((a, b) => b.id - a.id);
  }

  get doneSprints() {
    return this.ds.sprints
      .filter(s => s.status === 'COMPLETED')
      .sort((a, b) => b.id - a.id);
  }

  get dropListIds(): string[] {
    return ['backlog-drop', ...this.ds.sprints.map(sp => this.listId(sp.id))];
  }

  get filteredActiveSprints() {
    return this.activeSprints.filter(sp => this.isSprintVisible(sp.name));
  }

  get filteredDoneSprints() {
    return this.doneSprints.filter(sp => this.isSprintVisible(sp.name));
  }

  isSprintVisible(name: string): boolean {
    return this.selectedSprintNames.includes(name);
  }

  toggleSprintFilter(name: string): void {
    const index = this.selectedSprintNames.indexOf(name);
    if (index >= 0) {
      this.selectedSprintNames.splice(index, 1);
    } else {
      this.selectedSprintNames.push(name);
    }
  }

  /** Backlog = tickets with no sprint assigned. Epics are shown separately. */
  get backlogTickets(): Ticket[] {
    return this.ds.tickets.filter(t => !t.sprint && t.type !== 'EPIC');
  }

  getSprintTickets(sprintName: string): Ticket[] {
    return this.ds.tickets.filter(t => t.sprint === sprintName);
  }

  listId(id: number): string {
    return `sprint-drop-${id}`;
  }

  sprintDone(name: string): number  { return this.getSprintTickets(name).filter(t => t.status === 'COMPLETED').length; }
  sprintTotal(name: string): number { return this.getSprintTickets(name).length; }
  sprintPct(name: string): number   { const t = this.sprintTotal(name); return t ? Math.round(this.sprintDone(name) / t * 100) : 0; }

  toggleSection(key: string): void  { this.collapsed[key] = !this.collapsed[key]; }

  toggleFocus(section: 'sprints' | 'backlog'): void {
    this.expandedSection = this.expandedSection === section ? 'none' : section;
  }

  onTicketDrop(event: CdkDragDrop<Ticket[]>, targetSprint: string | null): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const ticket = event.previousContainer.data[event.previousIndex];
    if (ticket) {
      this.ds.updateTicket(ticket.id, { sprint: targetSprint });
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
