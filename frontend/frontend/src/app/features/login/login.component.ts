import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  form: FormGroup;
  showPassword = false;
  loginError   = '';
  loading      = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // If already logged in, go straight to dashboard
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.getDashboardRoute()]);
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      rememberMe: [false],
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading    = true;
    this.loginError = '';

    const user = this.auth.login(
      this.email.value,
      this.password.value
    );

    this.loading = false;

    if (user) {
      this.router.navigate([this.auth.getDashboardRoute()]);
    } else {
      this.loginError = 'Invalid email or password. Please try again.';
    }
  }
}
