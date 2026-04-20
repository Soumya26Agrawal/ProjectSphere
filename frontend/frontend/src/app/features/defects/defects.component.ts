import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { Defect } from '../../core/models/models';

@Component({
  selector: 'app-defects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './defects.component.html',
  styleUrl: './defects.component.css',
})
export class DefectsComponent implements OnInit {
  search = '';
  statusFilter = '';
  sevFilter = '';
  repFilter = '';
  selectedDefect: Defect | null = null;
  showReportDialog = false;
  moreOpen = false;

  form = { title: '', env: '', sev: 'MEDIUM', rep: 'ALWAYS', desc: '', exp: '', act: '', steps: '' };

  constructor(public ds: DataService, public ui: UiService) {}

  ngOnInit(): void {}

  get filteredDefects(): Defect[] {
    const s = this.search.toLowerCase();
    return this.ds.defects.filter(d =>
      (!this.statusFilter || d.status === this.statusFilter) &&
      (!this.sevFilter    || d.sev    === this.sevFilter) &&
      (!this.repFilter    || d.rep    === this.repFilter) &&
      (!s || d.title.toLowerCase().includes(s) || d.bid.toLowerCase().includes(s))
    );
  }

  get criticalCount(): number { return this.ds.defects.filter(d => d.sev === 'CRITICAL').length; }
  get openCount():     number { return this.ds.defects.filter(d => d.status !== 'RESOLVED').length; }
  get resolvedCount(): number { return this.ds.defects.filter(d => d.status === 'RESOLVED').length; }

  sevStyle(sev: string): Record<string, string> {
    const m: Record<string, Record<string, string>> = {
      CRITICAL: { background: '#FFEBE6', color: '#BF2600', border: '1px solid #FFBDAD' },
      HIGH:     { background: '#FFF0B3', color: '#172B4D', border: '1px solid #FFE380' },
      MEDIUM:   { background: '#FFFAE6', color: '#172B4D', border: '1px solid #FFC400' },
      LOW:      { background: '#E3FCEF', color: '#006644', border: '1px solid #ABF5D1' },
    };
    return { display: 'inline-flex', 'font-size': '11px', 'font-weight': '700', padding: '2px 7px', 'border-radius': '3px', ...m[sev] };
  }

  openDefect(d: Defect): void { this.selectedDefect = d; this.moreOpen = false; }

  deleteDefect(): void {
    if (this.selectedDefect) {
      this.ds.deleteDefect(this.selectedDefect.id);
      this.selectedDefect = null;
      this.ui.toast('Defect deleted');
    }
  }

  submitDefect(): void {
    if (!this.form.title.trim()) { this.ui.toast('Summary is required'); return; }
    this.ds.addDefect({
      title: this.form.title,
      env:   this.form.env || 'Not specified',
      sev:   this.form.sev as any,
      rep:   this.form.rep as any,
      desc:  this.form.desc  || 'No description provided.',
      exp:   this.form.exp   || '—',
      act:   this.form.act   || '—',
      steps: this.form.steps || 'No steps provided.',
    });
    this.showReportDialog = false;
    this.form = { title: '', env: '', sev: 'MEDIUM', rep: 'ALWAYS', desc: '', exp: '', act: '', steps: '' };
    this.ui.toast('Defect reported ✓');
  }

  getSteps(steps: string): string[] {
    return steps.split('\n').map(s => s.replace(/^\d+\.\s*/, ''));
  }

  onOverlayClick(e: MouseEvent, which: string): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      if (which === 'detail') this.selectedDefect = null;
      if (which === 'report') this.showReportDialog = false;
    }
  }
}
