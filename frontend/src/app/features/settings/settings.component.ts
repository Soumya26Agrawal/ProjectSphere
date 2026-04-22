import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  projectName     = 'ProjectSphere';
  projectKey      = 'PS';
  description     = 'Agile project management platform';
  sprintDuration  = 14;
  timezone        = 'Asia/Kolkata';
  notifications   = true;
  autoAssign      = false;
  saved           = false;

  constructor(private ui: UiService) {}

  save(): void {
    this.saved = true;
    this.ui.toast('Project settings saved successfully');
    setTimeout(() => (this.saved = false), 3000);
  }
}
