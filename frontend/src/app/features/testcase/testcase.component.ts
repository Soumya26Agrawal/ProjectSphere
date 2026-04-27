import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { TestCaseApiService, TestCaseRequest, TestCaseResponse } from '../../core/services/testcase-api.service';

interface TestCase {
  testCaseId: number;
  description: string;
  designerName: string;
  type: 'UI' | 'FUNCTIONAL' | 'POSITIVE' | 'NEGATIVE';
  testData: string;
  complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'CRITICAL';
  expectedResult: string;
  status: 'NEW' | 'PASSED' | 'FAILED';
  userStoryTitles: string[];
  defectId?: string;
}

interface TraceabilityItem {
  storyTitle: string;
  testCases: TestCase[];
}

@Component({
  selector: 'app-testcase',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './testcase.component.html',
  styleUrl: './testcase.component.css',
})
export class TestCaseComponent implements OnInit {
  testCases: TestCase[] = [];
  traceabilityMatrix: TraceabilityItem[] = [];
  showCreateModal = false;
  isSubmitting = false;

  form: {
    description: string;
    type: string;
    testData: string;
    complexity: string;
    expectedResult: string;
    userStoryIds: string;
  } = {
    description: '',
    type: 'FUNCTIONAL',
    testData: '',
    complexity: 'MEDIUM',
    expectedResult: '',
    userStoryIds: '',
  };

  constructor(
    private ui: UiService,
    private auth: AuthService,
    private testCaseApi: TestCaseApiService,
  ) {}

  ngOnInit(): void {
    this.loadTestCases();
  }

  loadTestCases(): void {
    // Mock data — replace this block with testCaseApi.getAllTestCases() once the backend endpoint is ready.
    this.testCases = [
      {
        testCaseId: 1,
        description: 'Login with valid credentials',
        designerName: 'John Doe',
        type: 'FUNCTIONAL',
        testData: 'username: test@example.com, password: pass123',
        complexity: 'SIMPLE',
        expectedResult: 'User logged in successfully',
        status: 'PASSED',
        userStoryTitles: ['User Login Feature'],
      },
      {
        testCaseId: 2,
        description: 'Login with invalid credentials',
        designerName: 'John Doe',
        type: 'NEGATIVE',
        testData: 'username: wrong@example.com, password: wrong',
        complexity: 'SIMPLE',
        expectedResult: 'Error message displayed',
        status: 'PASSED',
        userStoryTitles: ['User Login Feature'],
      },
      {
        testCaseId: 3,
        description: 'Upload image in profile',
        designerName: 'Jane Smith',
        type: 'UI',
        testData: 'Image file: test.png',
        complexity: 'MEDIUM',
        expectedResult: 'Image uploaded and displayed',
        status: 'FAILED',
        userStoryTitles: ['Profile Image Upload'],
        defectId: 'BUG-001',
      },
      {
        testCaseId: 4,
        description: 'New test case',
        designerName: 'John Doe',
        type: 'POSITIVE',
        testData: '',
        complexity: 'COMPLEX',
        expectedResult: 'Expected result',
        status: 'NEW',
        userStoryTitles: ['New Feature'],
      },
    ];
    this.buildTraceabilityMatrix();
  }

  buildTraceabilityMatrix(): void {
    const map = new Map<string, TraceabilityItem>();
    this.testCases.forEach(tc => {
      tc.userStoryTitles.forEach(title => {
        if (!map.has(title)) {
          map.set(title, { storyTitle: title, testCases: [] });
        }
        map.get(title)!.testCases.push(tc);
      });
    });
    this.traceabilityMatrix = Array.from(map.values());
  }

  get totalTestCases(): number { return this.testCases.length; }

  get passRate(): number {
    const passed = this.testCases.filter(tc => tc.status === 'PASSED').length;
    return this.totalTestCases ? Math.round((passed / this.totalTestCases) * 100) : 0;
  }

  get untestedItems(): number {
    return this.testCases.filter(tc => tc.status === 'NEW').length;
  }

  openCreateModal(): void { this.showCreateModal = true; }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.form = {
      description: '',
      type: 'FUNCTIONAL',
      testData: '',
      complexity: 'MEDIUM',
      expectedResult: '',
      userStoryIds: '',
    };
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.closeCreateModal();
  }

  submitTestCase(): void {
    if (!this.form.description.trim()) { this.ui.toast('Description is required'); return; }
    if (!this.form.expectedResult.trim()) { this.ui.toast('Expected result is required'); return; }

    const designerId = this.auth.currentUser()?.userId;
    if (!designerId) { this.ui.toast('You must be logged in to create a test case'); return; }

    const userStoryIds = this.form.userStoryIds
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    const request: TestCaseRequest = {
      description: this.form.description.trim(),
      designerId,
      type: this.form.type,
      testData: this.form.testData.trim(),
      complexity: this.form.complexity,
      expectedResult: this.form.expectedResult.trim(),
      userStoryIds,
    };

    this.isSubmitting = true;
    this.testCaseApi.createTestCase(request).subscribe({
      next: (res: TestCaseResponse) => {
        const created = this.mapResponseToModel(res);
        this.testCases.push(created);
        this.buildTraceabilityMatrix();
        this.closeCreateModal();
        this.ui.toast('Test case created successfully');
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating test case:', err);
        this.ui.toast('Failed to create test case');
        this.isSubmitting = false;
      },
    });
  }

  private mapResponseToModel(res: TestCaseResponse): TestCase {
    return {
      testCaseId: res.testCaseId,
      description: res.description,
      designerName: res.designerName ?? 'Unknown',
      type: res.type as TestCase['type'],
      testData: res.testData ?? '',
      complexity: res.complexity as TestCase['complexity'],
      expectedResult: res.expectedResult ?? '',
      status: (res.status as TestCase['status']) ?? 'NEW',
      userStoryTitles: res.userStoryTitles ?? [],
    };
  }
}
