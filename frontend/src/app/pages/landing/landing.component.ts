import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LandingNavbarComponent } from '../../shared/components/landing-navbar/landing-navbar.component';
import { LandingFooterComponent } from '../../shared/components/landing-footer/landing-footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, LandingNavbarComponent, LandingFooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  graphHeights: number[] = [40, 70, 45, 90, 65, 85, 100];
}
