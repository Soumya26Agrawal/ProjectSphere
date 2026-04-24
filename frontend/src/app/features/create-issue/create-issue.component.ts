import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-create-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-issue.component.html',
  styleUrl: './create-issue.component.css',
})
export class CreateIssueComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  form: {
    type: 'EPIC' | 'USER_STORY' | 'TASK' | 'SUB_TASK';
    sum: string; desc: string; ass: string;
    pri: 'MEDIUM' | 'LOW' | 'HIGH' | 'CRITICAL';
    pts: string; epic: string; parentId: string;
    sprint: string; labels: string;
  } = {
    type: 'USER_STORY', sum: '', desc: '', ass: '',
    pri: 'MEDIUM', pts: '', epic: '', parentId: '',
    sprint: 'Sprint 3', labels: '',
  };

  constructor(public ds: DataService, public ui: UiService) {}

  /** Epics — used as parent picker for USER_STORY and TASK. */
  get epicTickets() { return this.ds.tickets.filter(t => t.type === 'EPIC'); }
  /** Stories — used as parent picker for SUB_TASK. */
  get storyTickets() { return this.ds.tickets.filter(t => t.type === 'USER_STORY'); }

  /** Human label for the Parent field, depending on the selected type. */
  get parentLabel(): string {
    if (this.form.type === 'EPIC')     return 'Parent';
    if (this.form.type === 'SUB_TASK') return 'Parent Story';
    return 'Parent Epic';
  }

  /** Called when the user changes the issue type — clear any stale parent
      because the parent pool just switched (Epic → Story or disabled). */
  onTypeChange(): void {
    this.form.parentId = '';
  }

  submit(): void {
    if (!this.form.sum.trim()) { this.ui.toast('Summary is required'); return; }
    const parentId = this.form.parentId ? parseInt(this.form.parentId) : null;
    this.ds.addTicket({
      type:   this.form.type as any,
      sum:    this.form.sum,
      desc:   this.form.desc,
      ass:    this.form.ass || undefined,
      rep:    'Arjun Kumar',
      pri:    this.form.pri as any,
      status: 'TO_DO',
      pts:    parseInt(this.form.pts) || undefined,
      epic:   this.form.epic || undefined,
      parentId,
      labels: this.form.labels || undefined,
      sprint: this.form.type === 'EPIC' ? null : (this.form.sprint || null),
    });
    this.close.emit();
    this.created.emit();
    this.resetForm();
    this.ui.toast('Issue created ✓');
  }

  private resetForm(): void {
    this.form = {
      type: 'USER_STORY', sum: '', desc: '', ass: '',
      pri: 'MEDIUM', pts: '', epic: '', parentId: '',
      sprint: 'Sprint 3', labels: '',
    };
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close.emit();
  }
}
