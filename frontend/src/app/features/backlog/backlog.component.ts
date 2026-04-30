import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { Ticket } from '../../core/models/models';

const TICKET_BASE = 'http://localhost:8081/api/v1/ticket';
const SPRINT_BASE  = 'http://localhost:8081/api/v1/sprint';

// ── Backend DTO types ─────────────────────────────────────────
export interface BackendSprint {
  sprintId: number;
  sprintName: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
}

export interface SprintCompletionResponse {
  isCompleted: 'PASS' | 'FAIL';
  openWorkItems: number;
  completedWorkItems: number;
  dto: BackendSprint[];
}

interface CompletionModal {
  show: boolean;
  sprint: BackendSprint | null;
  response: SprintCompletionResponse | null;
  selectedTarget: number | null;
  isProcessing: boolean;
}

// ── Backlog panel DTO types ───────────────────────────────────
interface DefectInfo {
  defectId: number;
  reproducible: string;
  severity: string;
  expectedResult: string;
  actualResult: string;
  status: string;
  stepsToReproduce: string[];
}

export interface BacklogTicket {
  ticketId: number;
  title: string;
  description: string;
  storyPoints: number;
  status: string;
  type: string;
  fullName: string;
  defect: DefectInfo | null;
}

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule],
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.css'],
})
export class BacklogComponent implements OnInit {

  // ── Sprint panel (backend) ────────────────────────────────────
  incompleteSprints: BackendSprint[] = [];
  isLoadingSprints = false;
  processingSprintId: number | null = null;

  completionModal: CompletionModal = {
    show: false, sprint: null, response: null, selectedTarget: null, isProcessing: false,
  };

  confirmStartModal: { show: boolean; sprint: BackendSprint | null } = { show: false, sprint: null };

  // ── Shared UI state ───────────────────────────────────────────
  expandedSection: 'none' | 'sprints' | 'backlog' = 'none';
  selectedSprintNames: string[] = [];
  collapsed: Record<string, boolean> = {};

  // ── Backlog panel (backend) ───────────────────────────────────
  storyBacklog: BacklogTicket[] = [];
  taskBacklog: BacklogTicket[] = [];
  defectBacklog: BacklogTicket[] = [];
  otherBacklog: BacklogTicket[] = [];
  isLoadingBacklog = false;
  expandedCards: Set<number> = new Set();
  blSectionCollapsed: Record<string, boolean> = { stories: false, tasks: false, defects: false, other: false };

  constructor(
    public ds: DataService,
    public ui: UiService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadIncompleteSprints();
    this.loadBacklog();
  }

  // ── Sprint API calls ──────────────────────────────────────────

  loadIncompleteSprints(): void {
    this.isLoadingSprints = true;
    this.http.get<BackendSprint[]>(`${SPRINT_BASE}/incomplete`).subscribe({
      next: (data) => {
        this.incompleteSprints = data;
        this.selectedSprintNames = data.map(s => s.sprintName);
        this.isLoadingSprints = false;
      },
      error: () => {
        this.ui.toast('Failed to load sprints');
        this.isLoadingSprints = false;
      },
    });
  }

  confirmStartSprint(sprint: BackendSprint): void {
    this.confirmStartModal = { show: true, sprint };
  }

  cancelStartSprint(): void {
    this.confirmStartModal = { show: false, sprint: null };
  }

  executeStartSprint(): void {
    if (!this.confirmStartModal.sprint) return;
    const sprint = this.confirmStartModal.sprint;
    this.cancelStartSprint();
    this.processingSprintId = sprint.sprintId;
    this.http.patch(`${SPRINT_BASE}/activate/${sprint.sprintId}`, null, { responseType: 'text' }).subscribe({
      next: () => {
        this.processingSprintId = null;
        const idx = this.incompleteSprints.findIndex(s => s.sprintId === sprint.sprintId);
        if (idx >= 0) this.incompleteSprints[idx] = { ...this.incompleteSprints[idx], status: 'ACTIVE' };
      },
      error: () => {
        this.processingSprintId = null;
        this.ui.toast('Failed to start sprint');
      },
    });
  }

  onCompleteSprint(sprint: BackendSprint): void {
    this.processingSprintId = sprint.sprintId;
    this.http.patch<SprintCompletionResponse>(`${SPRINT_BASE}/complete/${sprint.sprintId}`, null).subscribe({
      next: (res) => {
        this.processingSprintId = null;
        if (res.isCompleted === 'PASS') {
          this.ui.toast(`${sprint.sprintName} completed successfully!`);
          this.loadIncompleteSprints();
        } else {
          this.completionModal = {
            show: true,
            sprint,
            response: res,
            selectedTarget: null,
            isProcessing: false,
          };
        }
      },
      error: () => {
        this.processingSprintId = null;
        this.ui.toast('Failed to complete sprint');
      },
    });
  }

  forceCompleteSprint(): void {
    if (this.completionModal.selectedTarget === null || !this.completionModal.sprint) return;
    this.completionModal.isProcessing = true;
    const from = this.completionModal.sprint.sprintId;
    const to   = this.completionModal.selectedTarget;
    this.http.patch(`${SPRINT_BASE}/force-complete?from=${from}&to=${to}`, null, { responseType: 'text' }).subscribe({
      next: () => {
        this.cancelCompletion();
        this.loadIncompleteSprints();
        this.loadBacklog();
        this.ui.toast('Sprint completed. Open items moved successfully.');
      },
      error: () => {
        this.completionModal.isProcessing = false;
        this.ui.toast('Failed to force complete sprint');
      },
    });
  }

  cancelCompletion(): void {
    this.completionModal = { show: false, sprint: null, response: null, selectedTarget: null, isProcessing: false };
  }

  // ── Sprint panel helpers ──────────────────────────────────────

  get activeSprints(): BackendSprint[] {
    return this.incompleteSprints.filter(s => s.status === 'ACTIVE');
  }
  get plannedSprints(): BackendSprint[] {
    return this.incompleteSprints.filter(s => s.status === 'PLANNED');
  }
  get filteredActiveSprints(): BackendSprint[] {
    return this.activeSprints.filter(s => this.isSprintVisible(s.sprintName));
  }
  get filteredPlannedSprints(): BackendSprint[] {
    return this.plannedSprints.filter(s => this.isSprintVisible(s.sprintName));
  }

  isSprintVisible(name: string): boolean { return this.selectedSprintNames.includes(name); }
  toggleSprintFilter(name: string): void {
    const i = this.selectedSprintNames.indexOf(name);
    if (i >= 0) this.selectedSprintNames.splice(i, 1); else this.selectedSprintNames.push(name);
  }

  isSprintProcessing(id: number): boolean { return this.processingSprintId === id; }

  sprintStatusClass(status: string): string {
    const m: Record<string, string> = { ACTIVE: 'loz-active', PLANNED: 'loz-todo', COMPLETED: 'loz-done2' };
    return m[status] ?? 'loz-todo';
  }

  // Ticket helpers (still use DataService mock data keyed by sprint name)
  getSprintTickets(sprintName: string): Ticket[] { return this.ds.tickets.filter(t => t.sprint === sprintName); }
  listId(id: number): string { return `sprint-drop-${id}`; }
  sprintDone(name: string): number  { return this.getSprintTickets(name).filter(t => t.status === 'COMPLETED').length; }
  sprintTotal(name: string): number { return this.getSprintTickets(name).length; }
  sprintPct(name: string): number   { const t = this.sprintTotal(name); return t ? Math.round(this.sprintDone(name) / t * 100) : 0; }

  sprintCardClass(type: string): string {
    return ({ USER_STORY: 'bl-card--story', TASK: 'bl-card--task', DEFECT: 'bl-card--defect-ticket' } as Record<string,string>)[type] ?? '';
  }

  toggleSection(key: string): void { this.collapsed[key] = !this.collapsed[key]; }
  toggleFocus(section: 'sprints' | 'backlog'): void {
    this.expandedSection = this.expandedSection === section ? 'none' : section;
  }

  // CDK drop list IDs — all sprint + backlog sections connected
  readonly backlogDropIds = ['bl-drop-stories', 'bl-drop-tasks', 'bl-drop-defects', 'bl-drop-other'];
  get dropListIds(): string[] {
    return [...this.backlogDropIds, ...this.incompleteSprints.map(sp => this.listId(sp.sprintId))];
  }

  // ── Sprint drag-drop handlers ─────────────────────────────────

  onTicketDrop(event: CdkDragDrop<any[]>, targetSprint: string | null): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    if (!item) return;

    if ('ticketId' in item) {
      const bl = item as BacklogTicket;
      event.previousContainer.data.splice(event.previousIndex, 1);
      const ticket: Ticket = {
        id: bl.ticketId, type: bl.type as any, sum: bl.title, desc: bl.description,
        ass: bl.fullName || undefined, pri: 'MEDIUM', status: bl.status as any,
        pts: bl.storyPoints, sprint: targetSprint, comments: [],
      };
      this.ds.addTicketWithId(ticket);
    } else {
      const ticket = item as Ticket;
      if (ticket) this.ds.updateTicket(ticket.id, { sprint: targetSprint });
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  onBacklogDrop(event: CdkDragDrop<any[]>, targetSection: BacklogTicket[]): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    if (!item) return;

    if ('ticketId' in item) {
      const bl = item as BacklogTicket;
      event.previousContainer.data.splice(event.previousIndex, 1);
      targetSection.splice(event.currentIndex, 0, bl);
    } else {
      const ticket = item as Ticket;
      event.previousContainer.data.splice(event.previousIndex, 1);
      const bl: BacklogTicket = {
        ticketId: ticket.id, title: ticket.sum, description: ticket.desc || '',
        storyPoints: ticket.pts || 0, status: ticket.status, type: ticket.type,
        fullName: ticket.ass || '', defect: null,
      };
      targetSection.splice(event.currentIndex, 0, bl);
      this.ds.updateTicket(ticket.id, { sprint: null });
    }
  }

  // ── Backlog API call ──────────────────────────────────────────

  loadBacklog(): void {
    this.isLoadingBacklog = true;
    this.http.get<BacklogTicket[]>(`${TICKET_BASE}/backlog`).subscribe({
      next: (data) => {
        this.storyBacklog  = data.filter(t => t.type === 'USER_STORY');
        this.taskBacklog   = data.filter(t => t.type === 'TASK');
        this.defectBacklog = data.filter(t => t.type === 'DEFECT');
        this.otherBacklog  = data.filter(t => !['USER_STORY','TASK','DEFECT'].includes(t.type));
        this.isLoadingBacklog = false;
      },
      error: () => {
        this.ui.toast('Failed to load backlog');
        this.isLoadingBacklog = false;
      },
    });
  }

  // ── Backlog panel helpers ─────────────────────────────────────

  toggleCard(id: number): void {
    if (this.expandedCards.has(id)) this.expandedCards.delete(id);
    else this.expandedCards.add(id);
  }
  isExpanded(id: number): boolean { return this.expandedCards.has(id); }

  get backlogItems(): BacklogTicket[] {
    return [...this.storyBacklog, ...this.taskBacklog, ...this.defectBacklog, ...this.otherBacklog];
  }
  get storyCount(): number        { return this.storyBacklog.length; }
  get taskCount(): number         { return this.taskBacklog.length; }
  get defectCount(): number       { return this.defectBacklog.length; }
  get totalPoints(): number       { return this.backlogItems.reduce((s, t) => s + (t.storyPoints || 0), 0); }
  get storyPoints(): number       { return this.storyBacklog.reduce((s, t) => s + (t.storyPoints || 0), 0); }
  get taskPoints(): number        { return this.taskBacklog.reduce((s, t) => s + (t.storyPoints || 0), 0); }
  get defectPoints(): number      { return this.defectBacklog.reduce((s, t) => s + (t.storyPoints || 0), 0); }
  get linkedDefectCount(): number { return this.defectBacklog.filter(t => !!t.defect).length; }

  toggleBLSection(key: string): void { this.blSectionCollapsed[key] = !this.blSectionCollapsed[key]; }

  // ── Styling helpers ───────────────────────────────────────────

  typeIcon(type: string): string {
    const m: Record<string, string> = {
      EPIC: 'auto_awesome', USER_STORY: 'bookmarks', TASK: 'task_alt',
      DEFECT: 'bug_report', SUB_TASK: 'subdirectory_arrow_right',
    };
    return m[type] ?? 'circle';
  }
  typeClass(type: string): string {
    const m: Record<string, string> = {
      EPIC: 'bl-type--epic', USER_STORY: 'bl-type--story', TASK: 'bl-type--task',
      DEFECT: 'bl-type--defect', SUB_TASK: 'bl-type--subtask',
    };
    return m[type] ?? '';
  }
  typeLabel(type: string): string {
    const m: Record<string, string> = {
      EPIC: 'Epic', USER_STORY: 'User Story', TASK: 'Task', DEFECT: 'Defect', SUB_TASK: 'Sub-task',
    };
    return m[type] ?? type;
  }
  statusClass(status: string): string {
    const m: Record<string, string> = {
      TO_DO: 'loz-todo', IN_PROGRESS: 'loz-inprog', REVIEW: 'loz-tested', COMPLETED: 'loz-done',
    };
    return m[status] ?? 'loz-todo';
  }
  statusLabel(status: string): string {
    const m: Record<string, string> = {
      TO_DO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', COMPLETED: 'Done',
    };
    return m[status] ?? status;
  }
  sevClass(sev: string): string {
    const m: Record<string, string> = {
      CRITICAL: 'sev--critical', HIGH: 'sev--high', MEDIUM: 'sev--medium', LOW: 'sev--low',
    };
    return m[sev] ?? '';
  }
  defectStatusClass(status: string): string {
    const m: Record<string, string> = {
      NEW: 'dloz--new', OPEN: 'dloz--open', IN_PROGRESS: 'dloz--inprog',
      FIXED: 'dloz--fixed', RETEST: 'dloz--retest', CLOSED: 'dloz--closed',
      REOPENED: 'dloz--reopened', DEFERRED: 'dloz--deferred',
      REJECTED: 'dloz--rejected', DUPLICATE: 'dloz--duplicate',
    };
    return m[status] ?? 'dloz--new';
  }
  ini(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
