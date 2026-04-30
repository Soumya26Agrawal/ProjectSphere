import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';

const TC_BASE     = 'http://localhost:8081/api/v1/testcase';
const TICKET_BASE = 'http://localhost:8081/api/v1/ticket';

export type TestCaseType = 'UI' | 'FUNCTIONAL' | 'POSITIVE' | 'NEGATIVE';
export type Complexity   = 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'CRITICAL';
export type TestStatus   = 'NEW' | 'PASSED' | 'FAILED';

interface TcSummary { testCaseId: number; status: TestStatus; }

interface UserStoryResponseDTO {
  userStoryId: number;
  userStoryTitle: string;
  testCases: TcSummary[];
}

interface TicketDetail {
  ticketId: number;
  title: string;
  description: string;
  storyPoints: number;
  status: string;
  type: string;
}

interface TestCaseResponseDTO {
  testCaseId: number;
  description: string;
  designerName: string;
  type: TestCaseType;
  testData: string;
  complexity: Complexity;
  expectedResult: string;
  status: TestStatus;
  userStoryTitles: string[];
}

interface CreateForm {
  description: string;
  type: TestCaseType;
  testData: string;
  complexity: Complexity;
  expectedResult: string;
}

@Component({
  selector: 'app-testcase',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './testcase.component.html',
  styleUrl: './testcase.component.css',
})
export class TestCaseComponent implements OnInit {
  // Repository data
  testCases: TestCaseResponseDTO[] = [];
  isLoading = false;

  // Pagination
  currentPage = 0;
  pageSize = 8;
  get totalPages(): number { return Math.ceil(this.testCases.length / this.pageSize) || 1; }
  get pagedTestCases(): TestCaseResponseDTO[] {
    const s = this.currentPage * this.pageSize;
    return this.testCases.slice(s, s + this.pageSize);
  }

  // Active sprint traceability
  activeStories: UserStoryResponseDTO[] = [];
  isLoadingStories = false;

  // Create modal
  showCreateModal = false;
  isSubmitting = false;
  selectedStoryIds: Set<number> = new Set();
  form: CreateForm = this.emptyForm();

  // User story detail popup
  selectedUserStory: TicketDetail | null = null;
  isLoadingStory = false;

  // Test case detail popup
  selectedTestCase: TestCaseResponseDTO | null = null;
  isLoadingTc = false;

  constructor(
    private http: HttpClient,
    private ui: UiService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadTestCases();
    this.loadActiveStories();
  }

  // ── Data loaders ──────────────────────────────────────────────

  loadTestCases(): void {
    this.isLoading = true;
    this.http.get<TestCaseResponseDTO[]>(TC_BASE).subscribe({
      next: (data) => { this.testCases = data; this.currentPage = 0; this.isLoading = false; },
      error: () => { this.ui.toast('Failed to load test cases'); this.isLoading = false; },
    });
  }

  loadActiveStories(): void {
    this.isLoadingStories = true;
    this.http.get<UserStoryResponseDTO[]>(`${TICKET_BASE}/user-stories-active`).subscribe({
      next: (data) => { this.activeStories = data; this.isLoadingStories = false; },
      error: () => { this.isLoadingStories = false; },
    });
  }

  // ── KPIs ──────────────────────────────────────────────────────

  get totalTestCases(): number { return this.testCases.length; }
  get passRate(): number {
    const passed = this.testCases.filter(tc => tc.status === 'PASSED').length;
    return this.totalTestCases ? Math.round((passed / this.totalTestCases) * 100) : 0;
  }
  get failedCount(): number { return this.testCases.filter(tc => tc.status === 'FAILED').length; }
  get untestedCount(): number { return this.testCases.filter(tc => tc.status === 'NEW').length; }

  // ── Pagination ────────────────────────────────────────────────

  prevPage(): void { if (this.currentPage > 0) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.currentPage++; }
  goToPage(p: number): void { this.currentPage = p; }

  // ── User story popup ──────────────────────────────────────────

  openUserStory(id: number): void {
    this.selectedUserStory = null;
    this.isLoadingStory = true;
    this.http.get<TicketDetail>(`${TICKET_BASE}/${id}`).subscribe({
      next: (d) => { this.selectedUserStory = d; this.isLoadingStory = false; },
      error: () => { this.ui.toast('Failed to load user story'); this.isLoadingStory = false; },
    });
  }

  closeUserStory(): void { this.selectedUserStory = null; this.isLoadingStory = false; }

  // ── Test case popup ───────────────────────────────────────────

  openTestCase(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedTestCase = null;
    this.isLoadingTc = true;
    this.http.get<TestCaseResponseDTO>(`${TC_BASE}/${id}`).subscribe({
      next: (d) => { this.selectedTestCase = d; this.isLoadingTc = false; },
      error: () => { this.ui.toast('Failed to load test case'); this.isLoadingTc = false; },
    });
  }

  closeTestCase(): void { this.selectedTestCase = null; this.isLoadingTc = false; }

  // ── Create modal ──────────────────────────────────────────────

  openCreateModal(): void {
    this.showCreateModal = true;
    this.form = this.emptyForm();
    this.selectedStoryIds = new Set();
  }

  closeCreateModal(): void { this.showCreateModal = false; }

  onOverlayClick(e: MouseEvent, which: 'create' | 'story' | 'tc'): void {
    if (!(e.target as HTMLElement).classList.contains('tc-overlay')) return;
    if (which === 'create') this.closeCreateModal();
    if (which === 'story') this.closeUserStory();
    if (which === 'tc') this.closeTestCase();
  }

  toggleStory(id: number): void {
    if (this.selectedStoryIds.has(id)) this.selectedStoryIds.delete(id);
    else this.selectedStoryIds.add(id);
  }

  isStorySelected(id: number): boolean { return this.selectedStoryIds.has(id); }

  submitTestCase(): void {
    if (!this.form.description.trim()) { this.ui.toast('Description is required'); return; }
    if (!this.form.expectedResult.trim()) { this.ui.toast('Expected result is required'); return; }

    const designerId: number | undefined =
      this.auth.currentUser()?.userId ??
      (() => { try { return JSON.parse(sessionStorage.getItem('ps_auth_user') ?? '{}')?.userId; } catch { return undefined; } })();

    const body = {
      description:    this.form.description.trim(),
      designerId,
      type:           this.form.type,
      testData:       this.form.testData.trim(),
      complexity:     this.form.complexity,
      expectedResult: this.form.expectedResult.trim(),
      status:         'NEW',
      userStoryIds:   Array.from(this.selectedStoryIds),
    };

    this.isSubmitting = true;
    this.http.post<TestCaseResponseDTO>(TC_BASE, body).subscribe({
      next: () => {
        this.ui.toast('Test case created successfully');
        this.isSubmitting = false;
        this.closeCreateModal();
        this.loadTestCases();
        this.loadActiveStories();
      },
      error: (err) => {
        console.error('Error creating test case:', err);
        this.ui.toast('Failed to create test case');
        this.isSubmitting = false;
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────

  tcStatusClass(status: TestStatus): string {
    return { NEW: 'tc-chip--new', PASSED: 'tc-chip--pass', FAILED: 'tc-chip--fail' }[status] ?? 'tc-chip--new';
  }

  tcStatusIcon(status: TestStatus): string {
    return { NEW: 'radio_button_unchecked', PASSED: 'check_circle', FAILED: 'cancel' }[status] ?? 'radio_button_unchecked';
  }

  rowStatusClass(status: TestStatus): string {
    return { NEW: '', PASSED: 'row--pass', FAILED: 'row--fail' }[status] ?? '';
  }

  complexityColor(c: Complexity): string {
    return { SIMPLE: 'badge--simple', MEDIUM: 'badge--medium', COMPLEX: 'badge--complex', CRITICAL: 'badge--critical' }[c] ?? '';
  }

  typeColor(t: TestCaseType): string {
    return { FUNCTIONAL: 'badge--func', UI: 'badge--ui', POSITIVE: 'badge--pos', NEGATIVE: 'badge--neg' }[t] ?? '';
  }

  storyPassRate(us: UserStoryResponseDTO): number {
    if (!us.testCases.length) return 0;
    return Math.round(us.testCases.filter(t => t.status === 'PASSED').length / us.testCases.length * 100);
  }

  pageRange(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const cur = this.currentPage;
    const pages: number[] = [];
    for (let i = 0; i < total; i++) {
      if (i === 0 || i === total - 1 || Math.abs(i - cur) <= 1) pages.push(i);
    }
    return pages;
  }

  private emptyForm(): CreateForm {
    return { description: '', type: 'FUNCTIONAL', testData: '', complexity: 'MEDIUM', expectedResult: '' };
  }
}
