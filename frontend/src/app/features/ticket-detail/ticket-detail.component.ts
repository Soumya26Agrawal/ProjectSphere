import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectContextService } from '../../core/services/project-context.service';
import {
  AnalyticsApiService, BackendSprint, BackendTicket,
  ProjectTeam, TeamMember,
} from '../../core/services/analytics-api.service';
import { Ticket } from '../../core/models/models';

type IssueType   = 'EPIC' | 'USER_STORY' | 'TASK' | 'SUB_TASK' | 'DEFECT';
type IssueStatus = 'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

interface BackendComment {
  commentId: number;
  commentBody: string;
  createdAt: string;
  user?: { userId: number; firstName?: string; lastName?: string; email?: string };
}

interface BackendHistory {
  historyId: number;
  changedBy: number;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  timeStamp: string;
}

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css',
})
export class TicketDetailComponent implements OnChanges {
  @Input() ticket: Ticket | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() ticketDeleted = new EventEmitter<number>();

  /** 'comments' or 'history' — the legacy "all" tab is removed. */
  activeTab: 'comments' | 'history' = 'comments';
  commentText = '';
  moreOpen = false;

  /* Edit mode */
  editing = false;
  editForm: {
    title: string;
    description: string;
    status: IssueStatus;
    type: IssueType;
    storyPoints: string;
    sprintId: number | null;
    assigneeId: number | null;
    parentId: number | null;
  } = this.emptyForm();
  saving = false;
  errorMsg: string | null = null;

  /* Backend data */
  sprints: BackendSprint[] = [];
  team: ProjectTeam | null = null;
  projectTickets: BackendTicket[] = [];
  comments: BackendComment[] = [];
  history: BackendHistory[] = [];

  constructor(
    public ds: DataService,
    public ui: UiService,
    private auth: AuthService,
    private api: AnalyticsApiService,
    private projectCtx: ProjectContextService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['ticket']) return;
    if (this.ticket) {
      this.editing = false;
      this.commentText = '';
      this.moreOpen = false;
      this.errorMsg = null;
      this.activeTab = 'comments';
      this.loadAll();
    } else {
      this.comments = [];
      this.history = [];
    }
  }

  /* ── Loaders ───────────────────────────────────────────────────────── */

  private loadAll(): void {
    if (!this.ticket) return;
    const id = this.ticket.id;
    this.api.getCommentsByTicket(id).subscribe(list => this.comments = list);
    this.api.getTicketHistory(id).subscribe(list => this.history = list);
    this.loadProjectContext();
  }

  /** Loads the dropdown options needed for edit mode. */
  private loadProjectContext(): void {
    const userId = this.auth.currentUser()?.userId;
    const selected = this.projectCtx.selectedProjectId();
    if (selected != null) {
      this.fetchProjectData(selected);
      return;
    }
    if (userId == null) return;
    this.api.getProjectIdsForUser(userId).subscribe(ids => {
      if (ids.length > 0) this.fetchProjectData(ids[0]);
    });
  }

  private fetchProjectData(projectId: number): void {
    forkJoin({
      sprints:        this.api.getSprintsByProject(projectId),
      team:           this.api.getTeamForProject(projectId),
      projectTickets: this.api.getTicketsByProject(projectId),
    }).subscribe(({ sprints, team, projectTickets }) => {
      this.sprints = sprints || [];
      this.team = team;
      this.projectTickets = projectTickets || [];
    });
  }

  /* ── Edit mode ────────────────────────────────────────────────────── */

  startEdit(): void {
    if (!this.ticket) return;
    this.errorMsg = null;
    // Resolve current sprint/assignee/parent ids from the project data.
    const currentSprintId = this.sprints.find(s => s.sprintName === this.ticket?.sprint)?.sprintId ?? null;
    const currentAssigneeId = this.team?.members?.find(m => this.fullName(m) === this.ticket?.ass)?.userId ?? null;
    const currentParentId = (this.projectTickets.find(t => t.ticketId === this.ticket?.parentId)?.ticketId)
                            ?? (this.ticket.parentId ?? null);
    this.editForm = {
      title:       this.ticket.sum,
      description: this.ticket.desc || '',
      status:      this.ticket.status as IssueStatus,
      type:        this.ticket.type as IssueType,
      storyPoints: this.ticket.pts != null ? String(this.ticket.pts) : '',
      sprintId:    currentSprintId,
      assigneeId:  currentAssigneeId,
      parentId:    currentParentId,
    };
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.errorMsg = null;
  }

  save(): void {
    if (!this.ticket) return;
    if (!this.editForm.title.trim()) { this.errorMsg = 'Title is required.'; return; }
    this.saving = true;
    this.errorMsg = null;
    const points = parseInt(this.editForm.storyPoints, 10);
    this.api.updateTicket(this.ticket.id, {
      title:       this.editForm.title.trim(),
      description: this.editForm.description?.trim() || '',
      status:      this.editForm.status,
      type:        this.editForm.type,
      storyPoints: isNaN(points) ? null : points,
      sprint:      this.editForm.type === 'EPIC' ? null : this.editForm.sprintId,
      assignee:    this.editForm.assigneeId,
      parent:      this.editForm.type === 'EPIC' ? null : this.editForm.parentId,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.editing = false;
        // Reflect locally so the user sees the change immediately.
        if (this.ticket) {
          this.ticket.sum    = this.editForm.title.trim();
          this.ticket.desc   = this.editForm.description?.trim() || '';
          this.ticket.status = this.editForm.status as any;
          this.ticket.type   = this.editForm.type as any;
          this.ticket.pts    = isNaN(points) ? undefined : points;
        }
        // Refetch history so the new audit rows show on the History tab.
        this.api.getTicketHistory(this.ticket!.id).subscribe(h => this.history = h);
        this.ui.notifyTicketCreated(); // reuse the same refresh signal for the board
        this.ui.toast('Issue saved ✓');
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Failed to save changes.';
      },
    });
  }

  onTypeChange(): void { this.editForm.parentId = null; }

  /** Eligible parents while editing — same rules as the create dialog. */
  get availableParents(): BackendTicket[] {
    if (this.editForm.type === 'EPIC') return [];
    if (this.editForm.type === 'SUB_TASK') {
      return this.projectTickets.filter(t => t.type === 'USER_STORY' && t.ticketId !== this.ticket?.id);
    }
    return this.projectTickets.filter(t => t.type === 'EPIC');
  }

  get parentLabel(): string {
    return this.editForm.type === 'SUB_TASK' ? 'Parent Story' : 'Parent Epic';
  }

  get teamMembers(): TeamMember[] { return this.team?.members || []; }

  /* ── Comments ─────────────────────────────────────────────────────── */

  addComment(): void {
    if (!this.ticket || !this.commentText.trim()) return;
    const userId = this.auth.currentUser()?.userId;
    if (!userId) { this.ui.toast('Please log in to comment'); return; }
    const ticketId = this.ticket.id;
    const body = this.commentText.trim();
    const beforeCount = this.comments.length;

    // Refresh comments after the request completes — successful or not — and
    // judge success by whether the count went up. Avoids the false "failed"
    // toast when the row IS saved but the response body fails to serialize.
    const afterRequest = () => {
      this.api.getCommentsByTicket(ticketId).subscribe(list => {
        this.comments = list;
        if (list.length > beforeCount) {
          this.commentText = '';
          this.ui.toast('Comment added');
        } else {
          this.ui.toast('Failed to post comment');
        }
      });
    };

    this.api.postComment(ticketId, userId, body).subscribe({
      next: () => afterRequest(),
      error: () => afterRequest(),
    });
  }

  commentAuthor(c: BackendComment): string {
    if (!c.user) return 'Someone';
    const fn = (c.user.firstName || '').trim();
    const ln = (c.user.lastName || '').trim();
    return `${fn} ${ln}`.trim() || c.user.email || `User ${c.user.userId}`;
  }

  initialsForUser(c: BackendComment): string {
    const name = this.commentAuthor(c);
    return this.ds.ini(name);
  }

  /* ── History ──────────────────────────────────────────────────────── */

  /** Group history rows that share the same author and were written within
   *  a few seconds of each other (i.e. one Save click that touched multiple
   *  fields). Returns groups newest-first, with their underlying field changes. */
  get groupedHistory(): { changedBy: number; timestamp: string; rows: BackendHistory[] }[] {
    if (!this.history?.length) return [];
    const sorted = [...this.history].sort((a, b) =>
      Date.parse(a.timeStamp) - Date.parse(b.timeStamp));
    const groups: { changedBy: number; timestamp: string; rows: BackendHistory[] }[] = [];
    const WINDOW_MS = 5_000;
    for (const row of sorted) {
      const last = groups[groups.length - 1];
      const ts = Date.parse(row.timeStamp);
      if (
        last &&
        last.changedBy === row.changedBy &&
        Math.abs(ts - Date.parse(last.timestamp)) < WINDOW_MS
      ) {
        last.rows.push(row);
        // Use the latest timestamp inside the window so display reflects the
        // moment the click landed.
        if (ts > Date.parse(last.timestamp)) last.timestamp = row.timeStamp;
      } else {
        groups.push({ changedBy: row.changedBy, timestamp: row.timeStamp, rows: [row] });
      }
    }
    return groups.reverse(); // newest first
  }

  /** Friendly verb for an edit event. */
  groupHeadline(group: { rows: BackendHistory[] }): string {
    if (group.rows.length === 1) {
      const r = group.rows[0];
      return `changed ${r.fieldChanged}`;
    }
    return 'modified ticket details';
  }

  /** Map a userId to a display name using the team membership we already loaded. */
  userIdToName(userId: number): string {
    const m = this.team?.members?.find(x => x.userId === userId);
    if (m) return this.fullName(m);
    if (userId === this.auth.currentUser()?.userId) return this.auth.currentUser()?.name || `User ${userId}`;
    return `User ${userId}`;
  }

  formatHistoryValue(field: string, value: string): string {
    if (value == null || value === 'null' || value === '') return '—';
    if (field === 'assignee' || field === 'parent') {
      const id = parseInt(value, 10);
      if (!isNaN(id)) {
        if (field === 'assignee') return this.userIdToName(id);
        if (field === 'parent') {
          const t = this.projectTickets.find(t => t.ticketId === id);
          return t ? `PS-${id} · ${t.title}` : `Ticket ${id}`;
        }
      }
    }
    if (field === 'sprint') {
      const id = parseInt(value, 10);
      if (!isNaN(id)) {
        const s = this.sprints.find(s => s.sprintId === id);
        return s ? s.sprintName : `Sprint ${id}`;
      }
    }
    return value;
  }

  formatTimestamp(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  }

  /* ── Helpers ──────────────────────────────────────────────────────── */

  fullName(m: TeamMember): string {
    return `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || `User ${m.userId}`;
  }

  /** Updates only the status (used by the inline status dropdown in view mode). */
  updateStatusOnly(newStatus: string): void {
    if (!this.ticket) return;
    if (this.ticket.status === newStatus) return;
    const prev = this.ticket.status;
    this.ticket.status = newStatus as any;
    this.api.updateTicketStatus(this.ticket.id, newStatus).subscribe({
      next: () => {
        this.api.getTicketHistory(this.ticket!.id).subscribe(h => this.history = h);
        this.ui.notifyTicketCreated();
        this.ui.toast('Status updated ✓');
      },
      error: () => {
        if (this.ticket) this.ticket.status = prev;
        this.ui.toast('Failed to update status');
      },
    });
  }

  deleteTicket(): void {
    if (!this.ticket) return;
    const id = this.ticket.id;
    // Backend has no delete endpoint yet; just remove from the mock list and close.
    this.ds.deleteTicket(id);
    this.close.emit();
    this.ticketDeleted.emit(id);
    this.ui.toast('Issue deleted');
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.close.emit();
  }

  private emptyForm() {
    return {
      title: '', description: '', status: 'TO_DO' as IssueStatus, type: 'USER_STORY' as IssueType,
      storyPoints: '', sprintId: null as number | null, assigneeId: null as number | null,
      parentId: null as number | null,
    };
  }
}
