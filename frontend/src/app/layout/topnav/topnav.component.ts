import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './topnav.component.html',
  // Reuse the same Jira-blue theme CSS as the admin/PM shells.
  styleUrls: ['../../features/admin/admin-theme.css', './topnav.component.css'],
})
export class TopnavComponent {
  readonly currentUser = this.auth.currentUser;

  menuOpen = false;
  query = '';

  constructor(private auth: AuthService, public ui: UiService) {}

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }
  logout():     void { this.closeMenu(); this.auth.logout(); }
}
