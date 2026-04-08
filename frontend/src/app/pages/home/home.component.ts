import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface UserDetailsDto {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  role: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  jwtToken = '';
  user: UserDetailsDto | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.jwtToken = localStorage.getItem('jwt') || '';

      const currUser = localStorage.getItem('user');
      if (currUser) {
        try {
          this.user = JSON.parse(currUser) as UserDetailsDto;
        } catch {
          this.user = null;
        }
      }
    }
  }
}
