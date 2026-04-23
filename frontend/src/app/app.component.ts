import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TopnavComponent }              from './layout/topnav/topnav.component';
import { SidebarComponent }             from './layout/sidebar/sidebar.component';
import { NotificationPanelComponent }   from './layout/notification-panel/notification-panel.component';
import { ChatbotComponent }             from './features/chatbot/chatbot.component';
import { TicketDetailComponent }        from './features/ticket-detail/ticket-detail.component';
import { CreateIssueComponent }         from './features/create-issue/create-issue.component';
import { UiService }                    from './core/services/ui.service';

/** Routes that render WITHOUT the app shell (no topnav / sidebar). */
const PUBLIC_ROUTES = ['/landing', '/login', '/admin'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TopnavComponent,
    SidebarComponent,
    NotificationPanelComponent,
    ChatbotComponent,
    TicketDetailComponent,
    CreateIssueComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  /** True when the current route should show the app shell. */
  isShellRoute = false;

  constructor(public ui: UiService, private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const url = e.urlAfterRedirects ?? e.url;
        this.isShellRoute = !PUBLIC_ROUTES.some(p => url.startsWith(p));
      });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (!this.isShellRoute) return;
    if (e.key === 'Escape') {
      this.ui.closeTicket();
      this.ui.closeCreateIssue();
      this.ui.closeNotif();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.ui.openCreateIssue();
    }
  }
}
