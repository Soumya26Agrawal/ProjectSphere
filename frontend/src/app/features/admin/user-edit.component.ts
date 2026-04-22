import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminApiService, TeamMember } from '../../core/services/admin-api.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./admin-theme.css'],
})
export class UserEditComponent implements OnInit {
  userId!: number;
  /** 'pm' | 'member' — drives labels and breadcrumb */
  kind: 'pm' | 'member' = 'member';
  loading = false;
  saving = false;
  error = '';
  message = '';
  user: TeamMember | null = null;
  form!: FormGroup;

  constructor(
    private api: AdminApiService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    const path = this.route.snapshot.url.map(s => s.path).join('/');
    // path is the segment following /admin/…; detect via parent route data too.
    this.kind = this.router.url.includes('project-managers') ? 'pm' : 'member';

    this.form = this.fb.group({
      firstName:   ['', [Validators.required]],
      lastName:    ['', [Validators.required]],
      email:       ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      isActive:    [true],
    });
    this.load();
  }

  load(): void {
    this.loading = true; this.error = '';
    this.api.getUser(this.userId).subscribe({
      next: (u) => {
        this.user = u;
        this.form.patchValue({
          firstName:   u.firstName ?? '',
          lastName:    u.lastName ?? '',
          email:       u.email ?? '',
          phoneNumber: u.phoneNumber ?? '',
          isActive:    !!u.isActive,
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 404 ? 'User not found.' : 'Failed to load user.';
      },
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.error = ''; this.message = '';
    const v = this.form.value;
    this.api.updateUser(this.userId, {
      firstName:   v.firstName,
      lastName:    v.lastName,
      email:       v.email,
      phoneNumber: Number(v.phoneNumber),
      isActive:    !!v.isActive,
    }).subscribe({
      next: (u) => {
        this.user = u;
        this.saving = false;
        this.message = 'Saved successfully.';
      },
      error: (err) => {
        this.saving = false;
        this.error = typeof err?.error === 'string' ? err.error : 'Save failed.';
      },
    });
  }

  back(): void {
    this.router.navigate([this.kind === 'pm' ? '/admin/project-managers' : '/admin/team-members']);
  }

  empTag(id: number): string { return 'EMP-' + String(id).padStart(3, '0'); }

  initials(u: TeamMember): string {
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || 'U';
  }

  get kindLabel(): string { return this.kind === 'pm' ? 'Project Manager' : 'Team Member'; }
}
