import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Defect } from '../models/models';

export interface DefectResponseDTO {
  defectId: number;
  reproducible: string;
  severity: string;
  expectedResult: string;
  actualResult: string;
  status: string;
  stepsToReproduce: string[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

const DEFECTS_BASE = 'http://localhost:8081/api/v1/defect';
const TICKETS_BASE = 'http://localhost:8081/api/v1/ticket';
const TESTCASES_BASE = 'http://localhost:8081/api/v1/testcase';

@Injectable({ providedIn: 'root' })
export class DefectApiService {
  constructor(private http: HttpClient) {}

  /**
   * Fetch all unmapped tickets (tickets not linked to any defect).
   */
  getUnMappedTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${TICKETS_BASE}/unmapped`);
  }

  /**
   * Fetch all unmapped test cases (test cases not linked to any defect).
   */
  getUnMappedTestCases(): Observable<any[]> {
    return this.http.get<any[]>(`${TESTCASES_BASE}/unmapped`);
  }

  /**
   * Fetch all defects from the backend.
   * Backend returns a List, so we simulate pagination on the frontend.
   */
  getAlDefects(
    page: number = 0,
    size: number = 10,
    severity?: string,
    status?: string,
    assignee?: string
  ): Observable<Page<Defect>> {
    return this.http.get<DefectResponseDTO[]>(`${DEFECTS_BASE}`).pipe(
      map((dtos: DefectResponseDTO[]) => {
        // Handle empty response
        if (!dtos || !Array.isArray(dtos)) {
          console.warn('Invalid defect response format:', dtos);
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: page,
            size,
            first: true,
            last: true,
          };
        }

        // Map backend DTOs to frontend Defect models
        const defects = dtos.map(dto => this.mapDtoToDefect(dto));
        
        // Apply client-side filtering
        let filtered = defects;
        if (severity) filtered = filtered.filter(d => d.sev === severity);
        if (status) filtered = filtered.filter(d => d.status === status);
        if (assignee) filtered = filtered.filter(d => d.ass === assignee);
        
        // Apply pagination
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size) || 1;
        const start = page * size;
        const content = filtered.slice(start, start + size);
        
        return {
          content,
          totalElements,
          totalPages,
          number: page,
          size,
          first: page === 0,
          last: page === totalPages - 1,
        };
      })
    );
  }

  /**
   * Map backend DefectResponseDTO to frontend Defect model.
   */
  private mapDtoToDefect(dto: DefectResponseDTO): Defect {
    if (!dto) {
      throw new Error('Invalid defect DTO: null or undefined');
    }

    const title = (dto.expectedResult || 'Untitled Defect').substring(0, 50);
    const steps = dto.stepsToReproduce && Array.isArray(dto.stepsToReproduce) 
      ? dto.stepsToReproduce.join('\n') 
      : 'No steps provided';

    return {
      id: dto.defectId || 0,
      bid: `BUG-${String(dto.defectId || 0).padStart(3, '0')}`,
      title: title || 'Untitled Defect',
      env: 'Unknown Environment',
      sev: (dto.severity || 'MEDIUM') as any,
      rep: (dto.reproducible || 'SOMETIMES') as any,
      desc: 'No description provided',
      exp: dto.expectedResult || 'No expected result',
      act: dto.actualResult || 'No actual result',
      steps: steps,
      ass: 'Unassigned',
      status: (dto.status || 'NEW') as any,
    };
  }

  /**
   * Get a single defect by ID.
   * Since backend doesn't have a GET /{id} endpoint, we fetch all and filter.
   */
  getDefect(id: number): Observable<Defect> {
    return this.http.get<DefectResponseDTO[]>(`${DEFECTS_BASE}`).pipe(
      map((dtos: DefectResponseDTO[]) => {
        const dto = dtos.find(d => d.defectId === id);
        if (!dto) throw new Error(`Defect with id ${id} not found`);
        return this.mapDtoToDefect(dto);
      })
    );
  }

  /**
   * Create a new defect using DefectRequestDTO format.
   */
  createDefect(defectRequest: {
    ticketId: number;
    testCaseId: number;
    severity: string;
    reproducible: string;
    status: string;
    steps: string[];
  }): Observable<DefectResponseDTO> {
    return this.http.post<DefectResponseDTO>(`${DEFECTS_BASE}`, defectRequest);
  }

  /**
   * Update an existing defect.
   * Since backend doesn't support PUT, we only support PATCH for status.
   */
  updateDefect(id: number, body: Partial<Defect>): Observable<any> {
    // For now, only status updates are supported via PATCH
    if (body.status) {
      return this.updateDefectStatus(id, body.status);
    }
    // Return a no-op observable for other updates
    return this.getDefect(id);
  }

  /**
   * Update only the status of a defect.
   */
  updateDefectStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${DEFECTS_BASE}/${id}/status?status=${status}`, {});
  }

  /**
   * Delete a defect by ID.
   * Backend doesn't have a DELETE endpoint yet, so this is a no-op.
   */
  deleteDefect(id: number): Observable<void> {
    // Placeholder - backend doesn't support DELETE yet
    console.warn(`DELETE endpoint not available for defect ${id}`);
    return new Observable<void>(observer => {
      observer.next();
      observer.complete();
    });
  }
}