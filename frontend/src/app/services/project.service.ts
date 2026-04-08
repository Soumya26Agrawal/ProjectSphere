import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8081/api/projects'; 

  constructor(private http: HttpClient) {}

  getAllProjects(page: number = 0, size: number = 16): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`, {
      params: { page, size }
    });
  }
}
