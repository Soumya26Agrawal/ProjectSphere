import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-project-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-project-card.component.html',
  styleUrls: ['./admin-project-card.component.css']
})
export class AdminProjectCardComponent {
  @Input() project: any;
}
