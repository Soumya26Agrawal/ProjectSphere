import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LandingFooterComponent } from '../../shared/components/landing-footer/landing-footer.component';
import { Auth, LoginResponseDto } from '../../services/auth';

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

  constructor(private auth: Auth, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.isLoggedIn = false;
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (res: LoginResponseDto) => {
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
