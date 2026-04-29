import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'ps_active_project_id';

/**
 * Holds the "currently selected project" the user is working in across pages.
 * /board, /analytics and /team all read this so that selecting "Move to Workspace"
 * on a past or current project on the home page consistently scopes every other
 * view to that project.
 *
 * Persisted to sessionStorage so the selection survives page reloads but is
 * cleared on browser-tab close.
 */
@Injectable({ providedIn: 'root' })
export class ProjectContextService {
  private readonly _selectedProjectId = signal<number | null>(this.loadFromStorage());
  readonly selectedProjectId = this._selectedProjectId.asReadonly();

  set(projectId: number): void {
    this._selectedProjectId.set(projectId);
    try {
      sessionStorage.setItem(STORAGE_KEY, String(projectId));
    } catch {
      // sessionStorage may be unavailable; fall through.
    }
  }

  clear(): void {
    this._selectedProjectId.set(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
  }

  private loadFromStorage(): number | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }
}
