import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { Ticket } from '../../core/models/models';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent implements OnInit {
  searchTerm = '';
  filterType = '';
  filterPri = '';
  filterEpic = '';
  selectedAssignee: string | null = null;
  dragId: number | null = null;
  dragOverCol: string | null = null;

  constructor(public ds: DataService, public ui: UiService) {}

  ngOnInit(): void {}

  get assignees() {
    const names = [...new Set(this.ds.tickets.filter(t => t.ass).map(t => t.ass!))];
    return names.slice(0, 5).map(n => ({ name: n, initials: this.ds.ini(n) }));
  }

  toggleAssignee(name: string): void {
    this.selectedAssignee = this.selectedAssignee === name ? null : name;
  }

  getColTickets(colId: string): Ticket[] {
    return this.ds.tickets.filter(t =>
      t.status === colId &&
      (!this.searchTerm || t.sum.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.filterType || t.type === this.filterType) &&
      (!this.filterPri || t.pri === this.filterPri) &&
      (!this.filterEpic || t.epic === this.filterEpic) &&
      (!this.selectedAssignee || t.ass === this.selectedAssignee)
    );
  }

  onDragStart(e: DragEvent, id: number): void {
    this.dragId = id;
    e.dataTransfer!.effectAllowed = 'move';
  }

  onDragEnd(): void {
    this.dragId = null;
    this.dragOverCol = null;
  }

  onDragOver(e: DragEvent, colId: string): void {
    e.preventDefault();
    this.dragOverCol = colId;
  }

  onDragLeave(colId: string): void {
    if (this.dragOverCol === colId) this.dragOverCol = null;
  }

  onDrop(e: DragEvent, colId: string): void {
    e.preventDefault();
    this.dragOverCol = null;
    if (this.dragId !== null) {
      const t = this.ds.tickets.find(x => x.id === this.dragId);
      if (t && t.status !== colId) {
        this.ds.updateTicket(this.dragId, { status: colId as any });
        this.ui.toast('Moved to ' + this.ds.sl(colId) + ' ✓');
      }
      this.dragId = null;
    }
  }
}
