import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LandingFooterComponent } from '../../shared/components/landing-footer/landing-footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LandingFooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;

  loading = false;
  errorMessage = '';
  isLoggedIn = false;
  jwtToken = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoggedIn = false;
    this.loading = true;

    this.authService.login({email: this.email, password: this.password}).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.jwtToken = res.token;
        this.isLoggedIn = true;

        localStorage.setItem('jwt', res.token);
        localStorage.setItem('user', JSON.stringify({
          employeeId: res.employeeId,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email,
          phoneNumber: res.phoneNumber,
          role: res.role
        }));

        this.router.navigateByUrl('/home');
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage =
          err?.status === 0
            ? 'Cannot reach backend / CORS blocked'
            : (typeof err?.error === 'string'
                ? err.error
                : err?.error?.message || 'Login failed');
      }
    });
  }
}
