import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY     = 'ps_active_project_id';
const STORAGE_IDS_KEY = 'ps_user_project_ids';

/**
 * Holds the "currently selected project" the user is working in across pages.
 * /board, /analytics and /team all read this so that selecting "Move to Workspace"
 * on a past or current project on the home page consistently scopes every other
 * view to that project.
 *
 * Also caches the *list* of project IDs the logged-in user has access to —
 * filled by login.component (for devs) or the role dashboards (admin/PM).
 * Other components can read these without re-hitting the network.
 *
 * Both values persist to sessionStorage so they survive a page reload but are
 * cleared on browser-tab close (or on logout via `clear()`).
 */
@Injectable({ providedIn: 'root' })
export class ProjectContextService {
  private readonly _selectedProjectId = signal<number | null>(this.loadIdFromStorage());
  private readonly _userProjectIds    = signal<number[]>(this.loadIdsFromStorage());

  /** The project the user is currently "in" (set via Move to Workspace, or
   *  auto-set on dev login). Null when nothing is selected. */
  readonly selectedProjectId = this._selectedProjectId.asReadonly();

  /** Every project ID the logged-in user can access (dev: their team's
   *  projects; PM: their managed projects; admin: every project). Empty until
   *  populated by the role dashboards / login. */
  readonly userProjectIds    = this._userProjectIds.asReadonly();

  /** Convenience: are we in a workspace right now? */
  readonly hasSelection = computed(() => this._selectedProjectId() !== null);

  set(projectId: number): void {
    this._selectedProjectId.set(projectId);
    try {
      sessionStorage.setItem(STORAGE_KEY, String(projectId));
    } catch {
      // sessionStorage may be unavailable; fall through.
    }
  }

  /** Replace the cached project-id list. Pass `[]` to clear without
   *  affecting the active selection. */
  setUserProjectIds(ids: number[]): void {
    const clean = (ids || []).filter(id => Number.isFinite(id));
    this._userProjectIds.set(clean);
    try {
      sessionStorage.setItem(STORAGE_IDS_KEY, JSON.stringify(clean));
    } catch { /* no-op */ }
  }

  clear(): void {
    this._selectedProjectId.set(null);
    this._userProjectIds.set([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_IDS_KEY);
    } catch { /* no-op */ }
  }

  private loadIdFromStorage(): number | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }

  private loadIdsFromStorage(): number[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_IDS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((n: unknown) => typeof n === 'number' && Number.isFinite(n));
    } catch {
      return [];
    }
  }
}
