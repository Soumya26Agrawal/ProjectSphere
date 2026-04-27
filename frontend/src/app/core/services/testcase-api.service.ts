import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TestCaseRequest {
  description: string;
  designerId: number;
  type: string;
  testData: string;
  complexity: string;
  expectedResult: string;
  userStoryIds: number[];
}

export interface TestCaseResponse {
  testCaseId: number;
  description: string;
  designerName: string;
  type: string;
  testData: string;
  complexity: string;
  expectedResult: string;
  status: string;
  userStoryTitles: string[];
}

const TESTCASES_BASE = 'http://localhost:8081/api/v1/testcase';

@Injectable({ providedIn: 'root' })
export class TestCaseApiService {
  constructor(private http: HttpClient) {}

  createTestCase(req: TestCaseRequest): Observable<TestCaseResponse> {
    return this.http.post<TestCaseResponse>(TESTCASES_BASE, req);
  }

  // getAllTestCases(): Observable<TestCaseResponse[]>
  // Backend GET /api/v1/testcase endpoint not yet implemented — wire up when ready.
}
