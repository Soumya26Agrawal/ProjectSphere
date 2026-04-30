import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Defect } from '../models/models';

export interface DefectResponseDTO {
  defectId: number;
  reproducible: string;
  severity: string;
  expectedResult: string;
  actualResult: string;
  title: string;
  firstName: string;
  lastName: string;
  status: string;
  stepsToReproduce: string[];
}

export interface DefectRequestDTO {
  ticketId: number;
  testCaseId: number;
  reproducible: string;
  severity: string;
  status: string;
  steps: string[];
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

  getUnMappedTickets(): Observable<number[]> {
    return this.http.get<number[]>(`${TICKETS_BASE}/unmapped`);
  }

  getUnMappedTestCases(): Observable<number[]> {
    return this.http.get<number[]>(`${TESTCASES_BASE}/unmapped`);
  }

  /**
   * Fetch all defects from the backend.
   * Backend returns a flat List; pagination and filtering are applied client-side.
   */
  getAlDefects(
    page: number = 0,
    size: number = 10,
    severity?: string,
    status?: string,
    assignee?: string,
    reproducibility?: string
  ): Observable<Page<Defect>> {
    return this.http.get<DefectResponseDTO[]>(`${DEFECTS_BASE}`).pipe(
      map((dtos: DefectResponseDTO[]) => {
        if (!dtos || !Array.isArray(dtos)) {
          return { content: [], totalElements: 0, totalPages: 0, number: page, size, first: true, last: true };
        }

        let filtered = dtos.map(dto => this.mapDtoToDefect(dto));

        if (severity)       filtered = filtered.filter(d => d.sev === severity);
        if (status)         filtered = filtered.filter(d => d.status === status);
        if (assignee)       filtered = filtered.filter(d => d.ass === assignee);
        if (reproducibility) filtered = filtered.filter(d => d.rep === reproducibility);

        const totalElements = filtered.length;
        const totalPages    = Math.ceil(totalElements / size) || 1;
        const start         = page * size;
        const content       = filtered.slice(start, start + size);

        return { content, totalElements, totalPages, number: page, size, first: page === 0, last: page >= totalPages - 1 };
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

    const steps = dto.stepsToReproduce && Array.isArray(dto.stepsToReproduce)
      ? dto.stepsToReproduce.join('\n')
      : '';

    const defectIdStr = String(dto.defectId || 0).padStart(3, '0');
    const title = dto.title || `Defect #${defectIdStr}`;
    const fullName = [dto.firstName, dto.lastName].filter(Boolean).join(' ') || 'Unassigned';

    return {
      id: dto.defectId || 0,
      bid: `BUG-${defectIdStr}`,
      title,
      env: dto.reproducible || 'SOMETIMES',
      sev: (dto.severity || 'MEDIUM') as any,
      rep: (dto.reproducible || 'SOMETIMES') as any,
      desc: dto.expectedResult || 'No description provided',
      exp: dto.expectedResult || 'No expected result',
      act: dto.actualResult || 'No actual result',
      steps,
      ass: fullName,
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

  /** Create a new defect. */
  createDefect(defectRequest: DefectRequestDTO): Observable<DefectResponseDTO> {
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