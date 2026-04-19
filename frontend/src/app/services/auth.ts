import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginResponseDto {
  message: string;
  token: string;
  userId: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = 'http://localhost:8081/api/v1/auth';
  constructor(private http: HttpClient){}

  login(email: string, password: string): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/login`, { email, password });
  }
}
