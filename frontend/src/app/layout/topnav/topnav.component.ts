import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './topnav.component.html',
  styleUrl: './topnav.component.css',
})
export class TopnavComponent {
  readonly currentUser = this.auth.currentUser;

  constructor(public ui: UiService, private auth: AuthService) {}

  logout(): void { this.auth.logout(); }
}
