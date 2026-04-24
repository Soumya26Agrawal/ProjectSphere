import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pm-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './pm-shell.component.html',
  styleUrls: ['../admin/admin-theme.css'],
})
export class PmShellComponent {
  readonly user = this.auth.currentUser;
  menuOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }
}
