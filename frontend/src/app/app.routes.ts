import { Routes } from '@angular/router';
import { LandingComponent }        from './features/landing/landing.component';
import { LoginComponent }          from './features/login/login.component';

import { AdminShellComponent }     from './features/admin/admin-shell.component';
import { DashboardAdminComponent } from './features/dashboard-admin/dashboard-admin.component';
import { ProjectsListComponent }   from './features/admin/projects-list.component';
import { ProjectEditComponent }    from './features/admin/project-edit.component';
import { ManagersListComponent }   from './features/admin/managers-list.component';
import { MembersListComponent }    from './features/admin/members-list.component';
import { TeamsListComponent }      from './features/admin/teams-list.component';
import { TeamEditComponent }       from './features/admin/team-edit.component';
import { UserEditComponent }       from './features/admin/user-edit.component';

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

  // ── Admin area: has its own navbar (AdminShellComponent) ────────────────
  {
    path: 'admin',
    component: AdminShellComponent,
    children: [
      { path: '',                      component: DashboardAdminComponent },
      { path: 'projects',              component: ProjectsListComponent   },
      { path: 'projects/:id',          component: ProjectEditComponent    },
      { path: 'project-managers',      component: ManagersListComponent   },
      { path: 'project-managers/:id',  component: UserEditComponent       },
      { path: 'team-members',          component: MembersListComponent    },
      { path: 'team-members/:id',      component: UserEditComponent       },
      { path: 'teams',                 component: TeamsListComponent      },
      { path: 'teams/new',             component: TeamEditComponent       },
      { path: 'teams/:id',             component: TeamEditComponent       },
    ],
  },

  // ── Other role dashboards / feature routes (shell + auth) ──────────────
  { path: 'pm',         component: DashboardPmComponent  },
  { path: 'dev',        component: DashboardDevComponent },
  { path: 'summary',    component: SummaryComponent   },
  { path: 'board',      component: BoardComponent     },
  { path: 'backlog',    component: BacklogComponent   },
  { path: 'timeline',   component: TimelineComponent  },
  { path: 'history',    component: HistoryComponent   },
  { path: 'defects',    component: DefectsComponent   },
  { path: 'analytics',  component: AnalyticsComponent },
  { path: 'team',       component: TeamComponent      },
  { path: 'evaluation', component: EvaluationComponent},
  { path: 'settings',   component: SettingsComponent  },
  { path: 'reports',    component: ReportsComponent   },
  { path: 'releases',   component: ReleasesComponent  },

  { path: '**', redirectTo: 'landing' },
];
