import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css',
})
export class TeamComponent implements OnInit {
  constructor(public ds: DataService, public ui: UiService) {}
  ngOnInit(): void {}
}
