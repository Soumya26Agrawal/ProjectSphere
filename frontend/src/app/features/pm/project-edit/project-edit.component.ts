import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AdminProject, AdminTeam, BackendDomain, BackendProjectStatus,
} from '../../../core/services/admin-api.service';
import { PmApiService } from '../../../core/services/pm-api.service';

@Component({
  selector: 'app-pm-project-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './project-edit.component.html',
  styleUrls: ['../../admin/admin-theme.css', './project-edit.component.css'],
})
export class PmProjectEditComponent implements OnInit {
  projectId!: number;
  loading = false;
  saving = false;
  error = '';
  message = '';
  project: AdminProject | null = null;
  team: AdminTeam | null = null;
  form!: FormGroup;

  readonly statusOptions: BackendProjectStatus[] = ['IN_PROGRESS', 'COMPLETED'];
  readonly domainOptions: BackendDomain[] = [
    'BANKING','HEALTHCARE','RETAIL','INSURANCE',
    'TECHNOLOGY','EDUCATION','GOVERNMENT','MANUFACTURING',
  ];

  constructor(
    private api: PmApiService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group({
      projectName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      status:      ['IN_PROGRESS' as BackendProjectStatus, Validators.required],
      domain:      ['TECHNOLOGY' as BackendDomain, Validators.required],
    });
    this.load();
    this.loadTeam();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.getProject(this.projectId).subscribe({
      next: (p) => {
        this.project = p;
        this.form.patchValue({
          projectName: p.projectName,
          description: p.description ?? '',
          status:      p.status,
          domain:      p.domain,
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.status === 404 ? 'Project not found.' : 'Failed to load project.';
      },
    });
  }

  // Look up whether this project already has a team (to show a link/button).
  loadTeam(): void {
    this.api.listTeams().subscribe({
      next: (teams) => {
        this.team = teams.find(t => t.projectId === this.projectId) ?? null;
      },
      error: () => {},
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.error = ''; this.message = '';
    const v = this.form.value;
    this.api.updateProject(this.projectId, {
      projectName: v.projectName,
      description: v.description,
      status:      v.status,
      domain:      v.domain,
    }).subscribe({
      next: (p) => {
        this.project = p;
        this.saving = false;
        this.message = 'Saved successfully.';
      },
      error: (err) => {
        this.saving = false;
        this.error = typeof err?.error === 'string' ? err.error : 'Save failed.';
      },
    });
  }

  back(): void { this.router.navigate(['/pm/projects']); }

  goToTeam(): void {
    if (this.team) {
      this.router.navigate(['/pm/teams', this.team.teamId]);
    } else {
      this.router.navigate(['/pm/teams/new'], { queryParams: { projectId: this.projectId } });
    }
  }

  prjTag(id: number): string { return 'PRJ-' + String(id).padStart(3, '0'); }
}
