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

  form = {
    type: 'STORY', sum: '', desc: '', ass: '',
    pri: 'MEDIUM', pts: '', epic: '', labels: '',
  };

  constructor(public ds: DataService, public ui: UiService) {}

  submit(): void {
    if (!this.form.sum.trim()) { this.ui.toast('Summary is required'); return; }
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
      labels: this.form.labels || undefined,
      sprint: 'Sprint 3',
    });
    this.close.emit();
    this.created.emit();
    this.form = { type: 'STORY', sum: '', desc: '', ass: '', pri: 'MEDIUM', pts: '', epic: '', labels: '' };
    this.ui.toast('Issue created ✓');
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close.emit();
  }
}
