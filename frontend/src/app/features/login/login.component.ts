import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import { AnalyticsApiService, ProjectDTO } from '../../core/services/analytics-api.service';

const API_BASE = 'http://localhost:8081/api/v1';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  form: FormGroup;
  forgotForm: FormGroup;

  showPassword     = false;
  showNewPassword  = false;
  showConfirmPw    = false;

  loginError    = '';
  forgotError   = '';
  forgotMessage = '';

  loading       = false;
  resetting     = false;

  forgotMode = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private projectCtx: ProjectContextService,
    private analyticsApi: AnalyticsApiService,
  ) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.auth.getDashboardRoute()]);
    }

    this.form = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(3)]],
      rememberMe: [false],
    });

    this.forgotForm = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get newPassword()     { return this.forgotForm.get('newPassword')!; }
  get confirmPassword() { return this.forgotForm.get('confirmPassword')!; }

  togglePassword():       void { this.showPassword    = !this.showPassword; }
  toggleNewPassword():    void { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword():void { this.showConfirmPw   = !this.showConfirmPw; }

  openForgot(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      this.loginError = 'Enter your email above first to reset its password.';
      return;
    }
    this.loginError = '';
    this.forgotError = '';
    this.forgotMessage = '';
    this.forgotForm.reset({ newPassword: '', confirmPassword: '' });
    this.forgotMode = true;
  }

  backToLogin(): void {
    this.forgotMode = false;
    this.forgotError = '';
    this.forgotMessage = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading    = true;
    this.loginError = '';

    this.auth.login(this.email.value, this.password.value).subscribe({
      next: () => {
        this.loading = false;
        this.afterLogin();
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 401 || err?.status === 403) {
          this.loginError = 'Invalid email or password. Please try again.';
        } else if (err?.status === 0) {
          this.loginError = 'Cannot reach server. Make sure the backend is running on http://localhost:8081.';
        } else {
          this.loginError = 'Login failed. Please try again.';
        }
      },
    });
  }

  /** Initialise the global project context based on the user's role.
   *  - Developer → auto-select their IN_PROGRESS project so /board, /backlog,
   *    /timeline etc. are scoped immediately, without needing the dev to pick.
   *  - Admin / PM → clear any stale context; they pick a project explicitly
   *    via the "Move to Workspace" button on a project card. */
  private afterLogin(): void {
    const dest = this.auth.getDashboardRoute();
    const role = this.auth.userRole();
    const userId = this.auth.currentUser()?.userId;

    if (role !== 'developer' || !userId) {
      this.projectCtx.clear();
      this.router.navigate([dest]);
      return;
    }

    // Start the dev session from a clean slate — wipe any stale active
    // selection AND IDs from a previous user before we refill them.
    this.projectCtx.clear();

    // Resolve their projects once, fill the global ID cache, and pick the
    // IN_PROGRESS one as the active workspace. The fetch is shareReplay'd
    // in AnalyticsApiService, so /dev's later call to getProjectsForUser
    // reuses this same response — no second HTTP roundtrip.
    this.analyticsApi.getProjectsForUser(userId)
      .pipe(
        timeout(5_000),
        catchError(() => of([] as ProjectDTO[])),
      )
      .subscribe(projects => {
        const list = projects || [];
        this.projectCtx.setUserProjectIds(list.map(p => p.projectId));
        const active = list.find(p => (p.status || '').toUpperCase() === 'IN_PROGRESS');
        if (active) this.projectCtx.set(active.projectId);
        this.router.navigate([dest]);
      });
  }

  submitForgot(): void {
    this.forgotError = '';
    this.forgotMessage = '';
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    if (this.newPassword.value !== this.confirmPassword.value) {
      this.forgotError = 'Passwords do not match.';
      return;
    }

    this.resetting = true;
    this.http.post(`${API_BASE}/auth/forgot-password`, {
      email: this.email.value,
      newPassword: this.newPassword.value,
    }, { responseType: 'text' }).subscribe({
      next: () => {
        this.resetting = false;
        this.forgotMessage = 'Password reset successfully. You can sign in now.';
        this.password.setValue('');
        setTimeout(() => { this.forgotMode = false; }, 1200);
      },
      error: (err) => {
        this.resetting = false;
        if (err?.status === 0) {
          this.forgotError = 'Cannot reach server. Make sure the backend is running on http://localhost:8081.';
        } else if (typeof err?.error === 'string' && err.error.length < 200) {
          this.forgotError = err.error;
        } else {
          this.forgotError = 'Failed to reset password. Please try again.';
        }
      },
    });
  }
}
