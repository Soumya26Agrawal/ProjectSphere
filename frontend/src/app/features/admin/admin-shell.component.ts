import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-theme.css', './admin-shell.component.css'],
})
export class AdminShellComponent {
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
