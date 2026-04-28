import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import {
  AnalyticsApiService, BackendSprint, BackendTicket,
  ProjectDTO, ProjectTeam, TeamMember,
} from '../../core/services/analytics-api.service';
import { Observable, of } from 'rxjs';

type IssueType   = 'EPIC' | 'USER_STORY' | 'TASK' | 'SUB_TASK';
type IssueStatus = 'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

@Component({
  selector: 'app-create-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-issue.component.html',
  styleUrl: './create-issue.component.css',
})
export class CreateIssueComponent implements OnChanges {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  /** Backend context for the dropdowns. */
  project: ProjectDTO | null = null;
  team: ProjectTeam | null = null;
  sprints: BackendSprint[] = [];
  /** All tickets in this project — used to populate the parent picker. */
  projectTickets: BackendTicket[] = [];
  loading = false;
  errorMsg: string | null = null;

  form: {
    type: IssueType;
    title: string;
    description: string;
    assigneeId: number | null;
    storyPoints: string;
    sprintId: number | null;
    status: IssueStatus;
    parentId: number | null;
  } = {
    type: 'USER_STORY',
    title: '',
    description: '',
    assigneeId: null,
    storyPoints: '',
    sprintId: null,
    status: 'TO_DO',
    parentId: null,
  };

  constructor(
    public ui: UiService,
    private auth: AuthService,
    private api: AnalyticsApiService,
    private projectCtx: ProjectContextService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.bootstrap();
    }
  }

  /** Fetches project, team and sprints when the dialog opens. */
  private bootstrap(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) {
      this.errorMsg = 'You must be logged in to create an issue.';
      return;
    }
    this.loading = true;
    this.errorMsg = null;

    const selected = this.projectCtx.selectedProjectId();
    const ids$: Observable<number[]> = selected != null
      ? of([selected])
      : this.api.getProjectIdsForUser(userId);

    ids$.subscribe(ids => {
      if (ids.length === 0) {
        this.loading = false;
        this.errorMsg = 'You are not assigned to any project.';
        return;
      }
      const projectId = ids[0];
      forkJoin({
        project:        this.api.getProject(projectId),
        sprints:        this.api.getSprintsByProject(projectId),
        team:           this.api.getTeamForProject(projectId),
        projectTickets: this.api.getTicketsByProject(projectId),
      }).subscribe(({ project, sprints, team, projectTickets }) => {
        this.project = project;
        this.sprints = sprints || [];
        this.team = team;
        this.projectTickets = projectTickets || [];
        this.loading = false;
        this.applyDefaults();
      });
    });
  }

  /** Pre-fills sensible defaults: status from the column, sprint = active sprint. */
  private applyDefaults(): void {
    const status = (this.ui.createIssueInitialStatus as IssueStatus | null);
    const active = this.sprints.find(s => (s.status || '').toUpperCase() === 'ACTIVE');
    this.form = {
      type: 'USER_STORY',
      title: '',
      description: '',
      assigneeId: this.auth.currentUser()?.userId ?? null,
      storyPoints: '',
      sprintId: active ? active.sprintId : null,
      status: status && this.isValidStatus(status) ? status : 'TO_DO',
      parentId: null,
    };
  }

  /** Reset the parent when the issue type changes — the eligible parent pool
   *  swaps (epics for stories/tasks, stories for sub-tasks, none for epics). */
  onTypeChange(): void {
    this.form.parentId = null;
  }

  /** Tickets eligible to be the new ticket's parent, given the current type. */
  get availableParents(): BackendTicket[] {
    if (this.form.type === 'EPIC') return [];
    if (this.form.type === 'SUB_TASK') {
      return this.projectTickets.filter(t => t.type === 'USER_STORY');
    }
    // USER_STORY or TASK → epics
    return this.projectTickets.filter(t => t.type === 'EPIC');
  }

  get parentLabel(): string {
    return this.form.type === 'SUB_TASK' ? 'Parent Story' : 'Parent Epic';
  }

  private isValidStatus(s: string): s is IssueStatus {
    return ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].includes(s);
  }

  get teamMembers(): TeamMember[] {
    return this.team?.members || [];
  }

  fullName(m: TeamMember): string {
    return `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || `User ${m.userId}`;
  }

  get reporterName(): string {
    return this.auth.currentUser()?.name || '—';
  }

  submit(): void {
    if (!this.form.title.trim()) {
      this.errorMsg = 'Summary is required.';
      return;
    }
    if (!this.project) {
      this.errorMsg = 'No project selected.';
      return;
    }

    this.errorMsg = null;
    const points = parseInt(this.form.storyPoints, 10);

    this.api.createTicket({
      project:     this.project.projectId,
      sprint:      this.form.type === 'EPIC' ? null : this.form.sprintId,
      parent:      this.form.type === 'EPIC' ? null : this.form.parentId,
      type:        this.form.type,
      status:      this.form.status,
      storyPoints: isNaN(points) ? undefined : points,
      title:       this.form.title.trim(),
      description: this.form.description?.trim(),
      assignee:    this.form.assigneeId,
    }).subscribe({
      next: () => {
        this.ui.notifyTicketCreated();
        this.close.emit();
        this.created.emit();
        this.ui.toast('Issue created ✓');
      },
      error: () => {
        this.errorMsg = 'Failed to create issue. Please try again.';
      },
    });
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close.emit();
  }
}
