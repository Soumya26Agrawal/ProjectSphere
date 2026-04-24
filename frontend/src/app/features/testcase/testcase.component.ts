import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UiService } from '../../core/services/ui.service';

interface TestCase {
  testCaseId: number;
  description: string;
  designer: { userId: number; firstName: string; lastName: string };
  type: 'UI' | 'FUNCTIONAL' | 'POSITIVE' | 'NEGATIVE';
  testData: string;
  complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'CRITICAL';
  expectedResult: string;
  actualResult: string;
  status: 'NEW' | 'PASSED' | 'FAILED';
  userStories: Ticket[];
  defect?: { defectId: string };
}

interface Ticket {
  ticketId: number;
  title: string;
  // other fields as needed
}

interface TraceabilityItem {
  userStory: Ticket;
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
  form: {
    description: string;
    type: 'UI' | 'FUNCTIONAL' | 'POSITIVE' | 'NEGATIVE';
    testData: string;
    complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'CRITICAL';
    expectedResult: string;
    actualResult: string;
    status: 'NEW' | 'PASSED' | 'FAILED';
    userStoryIds: string;
  } = {
    description: '',
    type: 'FUNCTIONAL',
    testData: '',
    complexity: 'MEDIUM',
    expectedResult: '',
    actualResult: '',
    status: 'NEW',
    userStoryIds: '',
  };
  selectedFile: File | null = null;
  uploading = false;

  constructor(private http: HttpClient, private ui: UiService) {}

  ngOnInit(): void {
    this.loadTestCases();
    this.buildTraceabilityMatrix();
  }

  loadTestCases(): void {
    // Mock data; replace with API
    this.testCases = [
      {
        testCaseId: 1,
        description: 'Login with valid credentials',
        designer: { userId: 1, firstName: 'John', lastName: 'Doe' },
        type: 'FUNCTIONAL',
        testData: 'username: test@example.com, password: pass123',
        complexity: 'SIMPLE',
        expectedResult: 'User logged in successfully',
        actualResult: 'User logged in successfully',
        status: 'PASSED',
        userStories: [{ ticketId: 101, title: 'User Login Feature' }],
      },
      {
        testCaseId: 2,
        description: 'Login with invalid credentials',
        designer: { userId: 1, firstName: 'John', lastName: 'Doe' },
        type: 'NEGATIVE',
        testData: 'username: wrong@example.com, password: wrong',
        complexity: 'SIMPLE',
        expectedResult: 'Error message displayed',
        actualResult: 'Error message displayed',
        status: 'PASSED',
        userStories: [{ ticketId: 101, title: 'User Login Feature' }],
      },
      {
        testCaseId: 3,
        description: 'Upload image in profile',
        designer: { userId: 2, firstName: 'Jane', lastName: 'Smith' },
        type: 'UI',
        testData: 'Image file: test.png',
        complexity: 'MEDIUM',
        expectedResult: 'Image uploaded and displayed',
        actualResult: 'Upload failed',
        status: 'FAILED',
        userStories: [{ ticketId: 102, title: 'Profile Image Upload' }],
        defect: { defectId: 'BUG-001' },
      },
      {
        testCaseId: 4,
        description: 'New test case',
        designer: { userId: 1, firstName: 'John', lastName: 'Doe' },
        type: 'POSITIVE',
        testData: '',
        complexity: 'COMPLEX',
        expectedResult: 'Expected result',
        actualResult: '',
        status: 'NEW',
        userStories: [{ ticketId: 103, title: 'New Feature' }],
      },
    ];
  }

  buildTraceabilityMatrix(): void {
    const userStoryMap = new Map<number, TraceabilityItem>();

    this.testCases.forEach(tc => {
      tc.userStories.forEach(us => {
        if (!userStoryMap.has(us.ticketId)) {
          userStoryMap.set(us.ticketId, { userStory: us, testCases: [] });
        }
        userStoryMap.get(us.ticketId)!.testCases.push(tc);
      });
    });

    this.traceabilityMatrix = Array.from(userStoryMap.values());
  }

  // KPIs
  get totalTestCases(): number {
    return this.testCases.length;
  }

  get passRate(): number {
    const passed = this.testCases.filter(tc => tc.status === 'PASSED').length;
    return this.totalTestCases ? Math.round((passed / this.totalTestCases) * 100) : 0;
  }

  get untestedItems(): number {
    return this.testCases.filter(tc => tc.status === 'NEW').length;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
    this.selectedFile = null;
  }

  private resetForm(): void {
    this.form = {
      description: '',
      type: 'FUNCTIONAL',
      testData: '',
      complexity: 'MEDIUM',
      expectedResult: '',
      actualResult: '',
      status: 'NEW',
      userStoryIds: '',
    };
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.closeCreateModal();
  }

  submitTestCase(): void {
    if (!this.form.description.trim()) { this.ui.toast('Description is required'); return; }
    if (!this.form.expectedResult.trim()) { this.ui.toast('Expected result is required'); return; }

    this.uploading = true;
    const formData = new FormData();
    Object.keys(this.form).forEach(key => {
      if (key === 'userStoryIds') {
        const ids = this.form.userStoryIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        formData.append(key, JSON.stringify(ids));
      } else {
        formData.append(key, this.form[key as keyof typeof this.form]);
      }
    });
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Replace with actual API
    this.http.post<TestCase>('/api/v1/testcase', formData).subscribe({
      next: (newTestCase) => {
        this.testCases.push(newTestCase);
        this.buildTraceabilityMatrix();
        this.closeCreateModal();
        this.ui.toast('Test case created successfully');
      },
      error: (err) => {
        console.error('Error creating test case:', err);
        this.ui.toast('Failed to create test case');
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }
}