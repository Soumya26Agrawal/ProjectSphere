/* ═══════════════════════════════════════════════════════════════
   Models that mirror the backend enums so the frontend speaks
   the same language as the REST API we'll wire up later.
   ═══════════════════════════════════════════════════════════════ */

export type TicketType   = 'EPIC' | 'USER_STORY' | 'TASK' | 'SUB_TASK' | 'DEFECT';
export type TicketStatus = 'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type Priority     = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Ticket {
  id: number;
  type: TicketType;
  sum: string;
  desc?: string;
  ass?: string;
  rep?: string;
  pri: Priority;
  status: TicketStatus;
  pts?: number;
  /** Name of the parent epic (for USER_STORY or TASK grouping). */
  epic?: string;
  /** Id of the parent ticket (for SUB_TASK under a USER_STORY). */
  parentId?: number | null;
  labels?: string;
  /** `null` means the ticket is in the product backlog (no sprint). */
  sprint?: string | null;
  comments: Comment[];
}

export interface Comment {
  user: string;
  text: string;
  time: string;
}

export type DefectSeverity      = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DefectReproducibility = 'ALWAYS' | 'SOMETIMES' | 'ONCE';
export type DefectStatus        =
  | 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'RETEST'
  | 'CLOSED' | 'REOPENED' | 'DEFERRED' | 'REJECTED' | 'DUPLICATE';

export interface Defect {
  id: number;
  bid: string;
  title: string;
  env: string;
  sev: DefectSeverity;
  rep: DefectReproducibility;
  desc: string;
  exp: string;
  act: string;
  steps: string;
  ass: string;
  status: DefectStatus;
}

export interface Engineer {
  av: string;
  name: string;
  role: string;
  email: string;
  cls: string;
}

export interface Notification {
  id: number;
  icon: string;
  ic: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export interface Sprint {
  id: number;
  name: string;
  start: string;
  end: string;
  status: SprintStatus;
}

export interface HistoryItem {
  id: string;
  title: string;
  sprint: string;
  epic: string;
  ass: string;
  status: 'COMPLETED' | 'CANCELLED';
  start: string;
  end: string;
}

export interface KanbanColumn {
  id: TicketStatus;
  label: string;
  color: string;
  text: string;
}

/* ── Auth Models ── */
export type UserRole = 'admin' | 'project_manager' | 'developer';

export interface AuthUser {
  userId?: number;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
