import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.css',
})
export class NotificationPanelComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  constructor(public ui: UiService) {}
}
