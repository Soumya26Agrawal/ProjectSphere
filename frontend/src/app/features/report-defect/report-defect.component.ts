import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { DefectApiService, DefectRequestDTO } from '../../core/services/defect-api.service';

interface AttachedFile { name: string; size: string; }

@Component({
  selector: 'app-report-defect',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-defect.component.html',
  styleUrl: './report-defect.component.css',
})
export class ReportDefectComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() defectCreated = new EventEmitter<void>();

  form: DefectRequestDTO = {
    ticketId: 0,
    testCaseId: 0,
    reproducible: 'ALWAYS',
    severity: 'MEDIUM',
    status: 'NEW',
    steps: [''],
  };

  unmappedTickets: number[] = [];
  unmappedTestCases: number[] = [];
  reproducibilityOptions = ['ALWAYS', 'SOMETIMES', 'ONCE'];
  severityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  attachments: AttachedFile[] = [];
  isSubmitting = false;
  isLoadingData = false;

  constructor(
    public ds: DataService,
    public ui: UiService,
    private defectApi: DefectApiService
  ) {}

  ngOnInit(): void {
    this.loadUnmappedData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.loadUnmappedData();
    }
  }

  loadUnmappedData(): void {
    this.isLoadingData = true;
    this.defectApi.getUnMappedTickets().subscribe({
      next: (ids) => { this.unmappedTickets = ids; },
      error: () => { this.unmappedTickets = []; },
    });
    this.defectApi.getUnMappedTestCases().subscribe({
      next: (ids) => { this.unmappedTestCases = ids; this.isLoadingData = false; },
      error: () => { this.unmappedTestCases = []; this.isLoadingData = false; },
    });
  }

  addStep(): void { this.form.steps.push(''); }

  removeStep(index: number): void {
    if (this.form.steps.length > 1) this.form.steps.splice(index, 1);
  }

  onFilesSelected(ev: Event): void {
    const files = (ev.target as HTMLInputElement).files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      this.attachments.push({ name: f.name, size: (f.size / 1024).toFixed(0) + ' KB' });
    }
    (ev.target as HTMLInputElement).value = '';
  }

  removeAttachment(i: number): void { this.attachments.splice(i, 1); }

  submit(): void {
    if (!this.form.ticketId) { this.ui.toast('Please select a ticket'); return; }
    if (!this.form.testCaseId) { this.ui.toast('Please select a test case'); return; }
    if (this.form.steps.some(s => !s.trim())) { this.ui.toast('All steps must be filled'); return; }

    this.isSubmitting = true;
    const payload: DefectRequestDTO = {
      ticketId: +this.form.ticketId,
      testCaseId: +this.form.testCaseId,
      reproducible: this.form.reproducible,
      severity: this.form.severity,
      status: 'NEW',
      steps: this.form.steps.filter(s => s.trim()),
    };

    this.defectApi.createDefect(payload).subscribe({
      next: () => {
        this.ui.toast('Defect reported successfully');
        this.isSubmitting = false;
        this.ui.notifyDefectCreated();
        this.defectCreated.emit();
        this.close.emit();
        this.reset();
      },
      error: (err) => {
        console.error('Error creating defect:', err);
        this.ui.toast('Failed to report defect');
        this.isSubmitting = false;
      },
    });
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close.emit();
  }

  trackByIndex(index: number): number { return index; }

  private reset(): void {
    this.form = { ticketId: 0, testCaseId: 0, reproducible: 'ALWAYS', severity: 'MEDIUM', status: 'NEW', steps: [''] };
    this.attachments = [];
  }
}
