import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { Ticket } from '../../core/models/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css',
})
export class TicketDetailComponent implements OnChanges {
  @Input() ticket: Ticket | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() ticketDeleted = new EventEmitter<number>();

  activeTab = 'all';
  commentText = '';
  currentStatus = 'TO_DO';
  moreOpen = false;

  constructor(public ds: DataService, public ui: UiService) {}

  ngOnChanges(): void {
    if (this.ticket) {
      this.currentStatus = this.ticket.status;
      this.commentText = '';
      this.moreOpen = false;
    }
  }

  addComment(): void {
    if (!this.ticket || !this.commentText.trim()) return;
    this.ds.addComment(this.ticket.id, this.commentText.trim());
    this.commentText = '';
    this.ticket = this.ds.tickets.find(t => t.id === this.ticket!.id) || null;
    this.ui.toast('Comment added');
  }

  updateStatus(): void {
    if (!this.ticket) return;
    this.ds.updateTicket(this.ticket.id, { status: this.currentStatus as any });
    this.ui.toast('Status updated ✓');
  }

  deleteTicket(): void {
    if (!this.ticket) return;
    const id = this.ticket.id;
    this.ds.deleteTicket(id);
    this.close.emit();
    this.ticketDeleted.emit(id);
    this.ui.toast('Issue deleted');
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close.emit();
  }
}
