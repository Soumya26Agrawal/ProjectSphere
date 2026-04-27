import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { DefectApiService, Page } from '../../core/services/defect-api.service';
import { Defect, DefectStatus } from '../../core/models/models';

/** Mock linked-artifact shape — stands in until we wire the backend. */
interface LinkedTestCase { id: string; title: string; result: 'PASSED' | 'FAILED' | 'NEW'; }
interface ActivityEvent { icon: string; color: string; text: string; time: string; }

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
  assignedFilter = '';
  selectedDefect: Defect | null = null;
  moreOpen = false;
  detailTab: 'details' | 'tests' | 'activity' = 'details';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  isLoading = false;
  defectsPage: Defect[] = [];

  constructor(
    public ds: DataService,
    public ui: UiService,
    private defectApi: DefectApiService,
  ) {}

  ngOnInit(): void {
    this.loadDefects();
    
    // Listen for defect creation events
    this.ui.defectCreated$.subscribe(() => {
      this.currentPage = 0;
      this.loadDefects();
    });
  }

  /**
   * Load defects from the backend with current filters and pagination.
   */
  loadDefects(): void {
    this.isLoading = true;
    this.defectApi.getAlDefects(
      this.currentPage,
      this.pageSize,
      this.sevFilter || undefined,
      this.statusFilter || undefined,
      this.assignedFilter || undefined,
      this.repFilter || undefined,
    ).subscribe({
      next: (response: Page<Defect>) => {
        this.defectsPage = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading defects:', err);
        this.isLoading = false;
        this.ui.toast('Failed to load defects');
      },
    });
  }

  /**
   * Called when filters change — reset to page 0 and reload.
   */
  onFilterChange(): void {
    this.currentPage = 0;
    this.loadDefects();
  }

  /**
   * Pagination: go to next page.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadDefects();
    }
  }

  /**
   * Pagination: go to previous page.
   */
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadDefects();
    }
  }

  /**
   * Pagination: go to a specific page.
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadDefects();
    }
  }

  /* ── Status bucketing (collapse 10 backend states into 3 UI buckets) ── */
  private static readonly BUCKET_INPROG:   ReadonlyArray<string> = ['IN_PROGRESS','RETEST'];
  private static readonly BUCKET_RESOLVED: ReadonlyArray<string> = ['FIXED','CLOSED','DEFERRED','REJECTED','DUPLICATE'];

  private bucketFor(d: Defect): 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' {
    if (DefectsComponent.BUCKET_INPROG.includes(d.status))   return 'IN_PROGRESS';
    if (DefectsComponent.BUCKET_RESOLVED.includes(d.status)) return 'RESOLVED';
    return 'OPEN';
  }

  /* ── Filtered list (local filtering on the current page) ────────── */
  get filteredDefects(): Defect[] {
    const s = this.search.toLowerCase();
    return this.defectsPage.filter(d =>
      (!s || d.title.toLowerCase().includes(s) || d.bid.toLowerCase().includes(s))
    );
  }

  /* ── KPI getters (from the current page, or use backend totals) ────── */
  get criticalCount(): number { return this.defectsPage.filter(d => d.sev === 'CRITICAL').length; }
  get openCount():     number { return this.defectsPage.filter(d => this.bucketFor(d) === 'OPEN').length; }
  get inProgCount():   number { return this.defectsPage.filter(d => this.bucketFor(d) === 'IN_PROGRESS').length; }
  get resolvedCount(): number { return this.defectsPage.filter(d => this.bucketFor(d) === 'RESOLVED').length; }

  countByStatus(status: DefectStatus): number {
    return this.defectsPage.filter(d => d.status === status).length;
  }

  readonly kanbanStates = [
    { id: 'NEW' as DefectStatus, label: 'New', statusText: 'Just reported', icon: 'note_add', bg: '#E9F4FF', fg: '#0052CC' },
    { id: 'OPEN' as DefectStatus, label: 'Open', statusText: 'Triaged and awaiting work', icon: 'warning', bg: '#FFF4E5', fg: '#7F5F01' },
    { id: 'IN_PROGRESS' as DefectStatus, label: 'In Progress', statusText: 'Work underway', icon: 'hourglass_top', bg: '#EEE5FF', fg: '#403294' },
    { id: 'FIXED' as DefectStatus, label: 'Fixed', statusText: 'Fix completed', icon: 'check_circle', bg: '#E3FCEF', fg: '#006644' },
    { id: 'RETEST' as DefectStatus, label: 'Retest', statusText: 'Ready for validation', icon: 'science', bg: '#E6FCFF', fg: '#00687D' },
    { id: 'CLOSED' as DefectStatus, label: 'Closed', statusText: 'Verified and closed', icon: 'lock', bg: '#E8EAED', fg: '#42526E' },
    { id: 'REOPENED' as DefectStatus, label: 'Reopened', statusText: 'Issue found again', icon: 'restore', bg: '#FFE5F0', fg: '#8B2C6B' },
    { id: 'DEFERRED' as DefectStatus, label: 'Deferred', statusText: 'Postponed', icon: 'schedule', bg: '#FFFAE6', fg: '#974F0C' },
    { id: 'REJECTED' as DefectStatus, label: 'Rejected', statusText: 'Not a defect', icon: 'block', bg: '#F8E4EB', fg: '#943D73' },
    { id: 'DUPLICATE' as DefectStatus, label: 'Duplicate', statusText: 'Already reported', icon: 'content_copy', bg: '#E5F2FF', fg: '#004B87' },
  ] as const;

  statusCount(status: DefectStatus): number {
    return this.defectsPage.filter(d => d.status === status).length;
  }

  defectsByState(status: DefectStatus): Defect[] {
    return this.defectsPage.filter(d => d.status === status);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  onDragStart(event: DragEvent, defect: Defect): void {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) {
      return;
    }
    dataTransfer.setData('text/plain', String(defect.id));
    dataTransfer.effectAllowed = 'move';
  }

  onDrop(event: DragEvent, targetStatus: DefectStatus): void {
    event.preventDefault();
    const payload = event.dataTransfer?.getData('text/plain');
    const defectId = payload ? Number(payload) : NaN;
    if (isNaN(defectId)) return;

    const defect = this.defectsPage.find(d => d.id === defectId);
    if (!defect || defect.status === targetStatus) return;

    // Call the API to update the status
    this.defectApi.updateDefectStatus(defectId, targetStatus).subscribe({
      next: () => {
        // Update local state
        const updated = this.defectsPage.map(d => d.id === defectId ? {...d, status: targetStatus} : d);
        this.defectsPage = updated;
        this.ui.toast(`${defect.bid} moved to ${this.ds.sl(targetStatus)}`);
      },
      error: (err) => {
        console.error('Error updating defect status:', err);
        this.ui.toast('Failed to update defect status');
      },
    });
  }

  /** Resolution rate — percentage of defects that have been closed out. */
  get resolutionPct(): number {
    return this.totalElements
      ? Math.round(this.resolvedCount / this.totalElements * 100)
      : 0;
  }

  /* ── Mock traceability data (swap for real API later) ─────────── */
  linkedTests(d: Defect): LinkedTestCase[] {
    // Derive stable mock data from the defect id.
    const seed = d.id;
    return [
      { id: 'TC-' + (100 + seed * 3),     title: 'Happy-path regression',  result: 'FAILED' },
      { id: 'TC-' + (100 + seed * 3 + 1), title: 'Boundary condition',     result: seed % 2 ? 'PASSED' : 'FAILED' },
      { id: 'TC-' + (100 + seed * 3 + 2), title: 'Smoke test · release',   result: 'NEW' },
    ];
  }

  activityFor(d: Defect): ActivityEvent[] {
    return [
      { icon: 'add_circle',    color: '#0052CC', text: `<b>${d.ass}</b> opened the defect`,                  time: '2 days ago' },
      { icon: 'person_add',    color: '#6554C0', text: `Assigned to <b>${d.ass}</b>`,                         time: '2 days ago' },
      { icon: 'edit',          color: '#FF991F', text: 'Severity set to <b>' + d.sev + '</b>',               time: '1 day ago'  },
      { icon: 'chat',          color: '#36B37E', text: '<b>Priya Sharma</b> added a comment',                time: '1 day ago'  },
      { icon: 'trending_down', color: '#0052CC', text: `Status moved to <b>${this.ds.sl(d.status)}</b>`,     time: '3 hours ago' },
    ];
  }

  /* ── Visuals ──────────────────────────────────────────────────── */
  sevStyle(sev: string): Record<string, string> {
    const m: Record<string, Record<string, string>> = {
      CRITICAL: { background: '#FFEBE6', color: '#BF2600', border: '1px solid #FFBDAD' },
      HIGH:     { background: '#FFF0B3', color: '#172B4D', border: '1px solid #FFE380' },
      MEDIUM:   { background: '#FFFAE6', color: '#172B4D', border: '1px solid #FFC400' },
      LOW:      { background: '#E3FCEF', color: '#006644', border: '1px solid #ABF5D1' },
    };
    return {
      display: 'inline-flex', 'font-size': '11px', 'font-weight': '700',
      padding: '2px 8px', 'border-radius': '3px', 'letter-spacing': '.04em',
      ...m[sev],
    };
  }

  tcResultClass(r: string): string {
    return { PASSED: 'tc-pass', FAILED: 'tc-fail', NEW: 'tc-new' }[r] ?? 'tc-new';
  }

  /** Unique assignee list, for the filter dropdown. */
  get assignees(): string[] {
    const set = new Set(this.defectsPage.map(d => d.ass));
    return Array.from(set).sort();
  }

  /* ── Detail actions ───────────────────────────────────────────── */
  openDefect(d: Defect): void {
    this.selectedDefect = d;
    this.detailTab = 'details';
    this.moreOpen = false;
  }
  closeDefect(): void { this.selectedDefect = null; this.moreOpen = false; }

  deleteDefect(): void {
    if (this.selectedDefect) {
      this.defectApi.deleteDefect(this.selectedDefect.id).subscribe({
        next: () => {
          this.defectsPage = this.defectsPage.filter(d => d.id !== this.selectedDefect!.id);
          this.selectedDefect = null;
          this.ui.toast('Defect deleted');
        },
        error: (err) => {
          console.error('Error deleting defect:', err);
          this.ui.toast('Failed to delete defect');
        },
      });
    }
  }

  getSteps(steps: string): string[] {
    return steps.split('\n').map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
  }

  onOverlayClick(e: MouseEvent, which: string): void {
    if ((e.target as HTMLElement).classList.contains('overlay') && which === 'detail') {
      this.closeDefect();
    }
  }
}