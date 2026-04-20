export interface Ticket {
  id: number;
  type: 'STORY' | 'TASK' | 'BUG' | 'SUBTASK';
  sum: string;
  desc?: string;
  ass?: string;
  rep?: string;
  pri: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TO_DO' | 'IN_PROGRESS' | 'TESTED' | 'DONE' | 'BACKLOG';
  pts?: number;
  epic?: string;
  labels?: string;
  sprint?: string | null;
  comments: Comment[];
}

export interface Comment {
  user: string;
  text: string;
  time: string;
}

export interface Defect {
  id: number;
  bid: string;
  title: string;
  env: string;
  sev: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  rep: 'ALWAYS' | 'SOMETIMES' | 'RARELY' | 'NEVER';
  desc: string;
  exp: string;
  act: string;
  steps: string;
  ass: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
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

export interface Sprint {
  id: number;
  name: string;
  start: string;
  end: string;
  status: 'ACTIVE' | 'DONE';
}

export interface HistoryItem {
  id: string;
  title: string;
  sprint: string;
  epic: string;
  ass: string;
  status: 'DONE' | 'CANCELLED';
  start: string;
  end: string;
}

export interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  text: string;
}

/* ── Auth Models ── */
export type UserRole = 'admin' | 'project_manager' | 'developer';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
