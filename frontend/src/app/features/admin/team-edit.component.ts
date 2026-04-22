import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AdminApiService, AdminProject, AdminTeam, TeamMember,
} from '../../core/services/admin-api.service';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './team-edit.component.html',
  styleUrls: ['./admin-theme.css'],
})
export class TeamEditComponent implements OnInit {
  isNew = true;
  teamId: number | null = null;
  current: AdminTeam | null = null;

  allProjects: AdminProject[]   = [];
  allDevelopers: TeamMember[]   = [];
  allTeams: AdminTeam[]         = [];

  loading = false;
  saving  = false;
  error   = '';
  message = '';
  warning = '';

  form!: FormGroup;
  projectSearch = '';
  memberSearch  = '';

  constructor(
    private api: AdminApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isNew = !idParam;
    this.teamId = idParam ? Number(idParam) : null;

    this.form = this.fb.group({
      teamName:      ['', [Validators.required, Validators.minLength(2)]],
      projectId:     [null, Validators.required],
      userIds:       [[] as number[]],
      scrumMasterId: [null],
    });

    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    let pending = 3 + (this.isNew ? 0 : 1);
    const done = () => { if (--pending === 0) this.loading = false; };

    this.api.listProjects(0, 1000).subscribe({
      next: (p) => { this.allProjects = p.content; done(); },
      error: () => { done(); },
    });
    this.api.getTeamMembers(0, 1000).subscribe({
      next: (p) => { this.allDevelopers = p.content; done(); },
      error: () => { done(); },
    });
    this.api.listTeams(0, 1000).subscribe({
      next: (p) => { this.allTeams = p.content; done(); },
      error: () => { done(); },
    });

    if (!this.isNew && this.teamId) {
      this.api.getTeam(this.teamId).subscribe({
        next: (t) => {
          this.current = t;
          this.form.patchValue({
            teamName:      t.teamName || '',
            projectId:     t.projectId,
            userIds:       t.members.map(m => m.userId),
            scrumMasterId: t.scrumMasterId,
          });
          done();
        },
        error: () => { this.error = 'Failed to load team.'; done(); },
      });
    }
  }

  /* ── Membership lookups ─────────────────────────────────────────── */

  /** Returns the team a developer currently belongs to (excluding this team). */
  teamOfUser(userId: number): AdminTeam | undefined {
    return this.allTeams.find(t =>
      (this.current == null || t.teamId !== this.current.teamId) &&
      t.members.some(m => m.userId === userId)
    );
  }

  isMemberAssignedElsewhere(userId: number): boolean {
    return this.teamOfUser(userId) != null;
  }

  isMemberSelected(userId: number): boolean {
    const ids: number[] = this.form.value.userIds || [];
    return ids.includes(userId);
  }

  /* ── Project picker ─────────────────────────────────────────────── */

  get availableProjects(): AdminProject[] {
    const takenIds = new Set(
      this.allTeams
        .filter(t => !this.current || t.teamId !== this.current.teamId)
        .map(t => t.projectId)
        .filter((x): x is number => x != null)
    );
    const q = this.projectSearch.trim().toLowerCase();
    return this.allProjects
      .filter(p => !takenIds.has(p.projectId))
      .filter(p => !q
        || (p.projectName || '').toLowerCase().includes(q)
        || String(p.projectId).includes(q));
  }

  get selectedProject(): AdminProject | undefined {
    const id = this.form.value.projectId;
    if (id == null) return undefined;
    return this.allProjects.find(p => p.projectId === Number(id));
  }

  pickProject(p: AdminProject): void {
    this.form.patchValue({ projectId: p.projectId });
    this.projectSearch = '';
  }

  clearProject(): void {
    this.form.patchValue({ projectId: null });
    this.projectSearch = '';
  }

  /* ── Member picker ──────────────────────────────────────────────── */

  get filteredDevelopers(): TeamMember[] {
    const q = this.memberSearch.trim().toLowerCase();
    if (!q) return this.allDevelopers;
    return this.allDevelopers.filter(d =>
      (d.firstName || '').toLowerCase().includes(q) ||
      (d.lastName  || '').toLowerCase().includes(q) ||
      (d.email     || '').toLowerCase().includes(q) ||
      String(d.employeeId).includes(q)
    );
  }

  get selectedMembers(): TeamMember[] {
    const ids: number[] = this.form.value.userIds || [];
    return this.allDevelopers.filter(d => ids.includes(d.userId));
  }

  get scrumMasterOptions(): TeamMember[] { return this.selectedMembers; }

  addMember(d: TeamMember): void {
    this.warning = '';
    if (this.isMemberSelected(d.userId)) return;
    if (this.isMemberAssignedElsewhere(d.userId)) {
      const t = this.teamOfUser(d.userId);
      this.warning = `${d.firstName} ${d.lastName} is already in team "${t?.teamName}" — remove them from that team first.`;
      return;
    }
    if (d.isActive === false) {
      this.warning = `${d.firstName} ${d.lastName} is marked inactive.`;
    }
    const updated = [...(this.form.value.userIds || []), d.userId];
    this.form.patchValue({ userIds: updated });
  }

  removeMember(userId: number): void {
    this.warning = '';
    const updated: number[] = (this.form.value.userIds || []).filter((x: number) => x !== userId);
    this.form.patchValue({ userIds: updated });
    if (this.form.value.scrumMasterId === userId) {
      this.form.patchValue({ scrumMasterId: null });
    }
  }

  /* ── Presentation helpers ──────────────────────────────────────── */

  initials(d: { firstName?: string; lastName?: string }): string {
    return ((d.firstName?.[0] ?? '') + (d.lastName?.[0] ?? '')).toUpperCase() || '?';
  }
  colorClass(i: number): string { return 'c' + (i % 8); }
  teamTag(id: number | null): string {
    return id == null ? 'TEAM' : ('TEAM-' + id);
  }

  /* ── Save ──────────────────────────────────────────────────────── */

  save(): void {
    this.error = ''; this.message = ''; this.warning = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const v = this.form.value;
      if (!v.teamName || String(v.teamName).trim().length < 2) {
        this.error = 'Please enter a team name (at least 2 characters).';
      } else if (v.projectId == null) {
        this.error = 'Please select a project for this team.';
      } else {
        this.error = 'Please fill in all required fields.';
      }
      return;
    }
    this.saving = true;
    const v = this.form.value;
    const payload = {
      teamName:      v.teamName,
      projectId:     Number(v.projectId),
      userIds:       (v.userIds || []).map((x: any) => Number(x)),
      scrumMasterId: v.scrumMasterId != null ? Number(v.scrumMasterId) : null,
    };

    if (this.isNew) {
      this.api.createTeam(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/admin/teams']);
        },
        error: (err) => { this.saving = false; this.error = this._errMsg(err, 'Create failed.'); },
      });
    } else if (this.teamId) {
      this.api.updateTeam(this.teamId, payload).subscribe({
        next: (t) => {
          this.saving = false;
          this.current = t;
          this.message = 'Team updated successfully.';
          // refresh allTeams so assignment labels stay current
          this.api.listTeams(0, 1000).subscribe({
            next: (p) => { this.allTeams = p.content; },
          });
        },
        error: (err) => { this.saving = false; this.error = this._errMsg(err, 'Update failed.'); },
      });
    }
  }

  back(): void { this.router.navigate(['/admin/teams']); }

  private _errMsg(err: any, fallback: string): string {
    if (!err) return fallback;
    if (typeof err.error === 'string') return err.error;
    if (err.error?.message) return err.error.message;
    if (err.status === 0)   return 'Cannot reach backend at http://localhost:8081.';
    if (err.status === 401 || err.status === 403) return 'Not authorized. Please log in as admin.';
    if (err.status === 409) return 'Conflict — a team already exists for this project.';
    return fallback;
  }
}
