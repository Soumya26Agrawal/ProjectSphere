import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { DefectReproducibility, DefectSeverity } from '../../core/models/models';

interface AttachedFile { name: string; size: string; }

@Component({
  selector: 'app-report-defect',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-defect.component.html',
  styleUrl: './report-defect.component.css',
})
export class ReportDefectComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  form: {
    title: string; env: string;
    sev: DefectSeverity; rep: DefectReproducibility;
    desc: string; exp: string; act: string; steps: string;
    remarks: string;
  } = {
    title: '', env: '',
    sev: 'MEDIUM', rep: 'ALWAYS',
    desc: '', exp: '', act: '', steps: '',
    remarks: '',
  };

  attachments: AttachedFile[] = [];

  constructor(public ds: DataService, public ui: UiService) {}

  onFilesSelected(ev: Event): void {
    const files = (ev.target as HTMLInputElement).files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      this.attachments.push({
        name: f.name,
        size: (f.size / 1024).toFixed(0) + ' KB',
      });
    }
    (ev.target as HTMLInputElement).value = '';
  }

  removeAttachment(i: number): void { this.attachments.splice(i, 1); }

  submit(): void {
    if (!this.form.title.trim()) {
      this.ui.toast('Summary is required');
      return;
    }
    this.ds.addDefect({
      title: this.form.title,
      env:   this.form.env || 'Not specified',
      sev:   this.form.sev,
      rep:   this.form.rep,
      desc:  this.form.desc  || 'No description provided.',
      exp:   this.form.exp   || '—',
      act:   this.form.act   || '—',
      steps: this.form.steps || 'No steps provided.',
    });
    this.close.emit();
    this.ui.toast('Defect reported ✓');
    this.reset();
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close.emit();
  }

  private reset(): void {
    this.form = {
      title: '', env: '', sev: 'MEDIUM', rep: 'ALWAYS',
      desc: '', exp: '', act: '', steps: '', remarks: '',
    };
    this.attachments = [];
  }
}
