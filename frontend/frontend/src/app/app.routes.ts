import { Routes } from '@angular/router';
import { authGuard }  from './core/guards/auth.guard';
import { roleGuard }  from './core/guards/role.guard';
import { LandingComponent }        from './features/landing/landing.component';
import { LoginComponent }          from './features/login/login.component';
import { DashboardAdminComponent } from './features/dashboard-admin/dashboard-admin.component';
import { DashboardPmComponent }    from './features/dashboard-pm/dashboard-pm.component';
import { DashboardDevComponent }   from './features/dashboard-dev/dashboard-dev.component';
import { SummaryComponent }    from './features/summary/summary.component';
import { BoardComponent }      from './features/board/board.component';
import { BacklogComponent }    from './features/backlog/backlog.component';
import { TimelineComponent }   from './features/timeline/timeline.component';
import { HistoryComponent }    from './features/history/history.component';
import { DefectsComponent }    from './features/defects/defects.component';
import { AnalyticsComponent }  from './features/analytics/analytics.component';
import { TeamComponent }       from './features/team/team.component';
import { EvaluationComponent } from './features/evaluation/evaluation.component';
import { SettingsComponent }   from './features/settings/settings.component';
import { ReportsComponent }    from './features/reports/reports.component';
import { ReleasesComponent }   from './features/releases/releases.component';

export const routes: Routes = [
  // ── Public routes (no shell, no auth required) ──────────────────────────
  { path: '',        redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'login',   component: LoginComponent },

  // ── Role-based dashboards (shell + auth + role guard) ───────────────────
  {
    path: 'admin',
    component: DashboardAdminComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },
  {
    path: 'pm',
    component: DashboardPmComponent,
    canActivate: [authGuard, roleGuard(['project_manager'])],
  },
  {
    path: 'dev',
    component: DashboardDevComponent,
    canActivate: [authGuard, roleGuard(['developer'])],
  },

  // ── App feature routes (shell + auth required) ───────────────────────────
  { path: 'summary',    component: SummaryComponent,    canActivate: [authGuard] },
  { path: 'board',      component: BoardComponent,      canActivate: [authGuard] },
  { path: 'backlog',    component: BacklogComponent,    canActivate: [authGuard] },
  { path: 'timeline',   component: TimelineComponent,   canActivate: [authGuard] },
  { path: 'history',    component: HistoryComponent,    canActivate: [authGuard] },
  { path: 'defects',    component: DefectsComponent,    canActivate: [authGuard] },
  { path: 'analytics',  component: AnalyticsComponent,  canActivate: [authGuard] },
  { path: 'team',       component: TeamComponent,       canActivate: [authGuard] },
  { path: 'evaluation', component: EvaluationComponent, canActivate: [authGuard] },
  { path: 'settings',   component: SettingsComponent,   canActivate: [authGuard] },
  { path: 'reports',    component: ReportsComponent,    canActivate: [authGuard] },
  { path: 'releases',   component: ReleasesComponent,   canActivate: [authGuard] },

  { path: '**', redirectTo: 'landing' },
];
