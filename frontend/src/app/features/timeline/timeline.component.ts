import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiService } from '../../core/services/ui.service';

interface TlStory  { title: string; color: string; s: number; e: number; }
interface TlSprint { name: string; s: number; e: number; color: string; stories: TlStory[]; }

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css',
})
export class TimelineComponent implements OnInit {
  months   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  total    = 6;
  todayPct = '43.33%';

  tlSprints: TlSprint[] = [
    { name: 'Sprint 1', s: 0, e: 1.1, color: '#0052CC', stories: [
      { title: 'JWT Auth Service',  color: '#0052CC', s: .05, e: .55 },
      { title: 'MySQL Schema',      color: '#E65100', s: .3,  e: 1.0 },
    ]},
    { name: 'Sprint 2', s: 1.1, e: 2.1, color: '#6554C0', stories: [
      { title: 'Sprint CRUD APIs',      color: '#E65100', s: 1.15, e: 1.7  },
      { title: 'Kanban Column Logic',   color: '#36B37E', s: 1.4,  e: 2.05 },
    ]},
    { name: 'Sprint 3', s: 2.1, e: 3.1, color: '#008DA6', stories: [
      { title: 'Analytics KPI',         color: '#FF5630', s: 2.15, e: 2.6  },
      { title: 'Defect CRUD APIs',      color: '#E65100', s: 2.4,  e: 3.05 },
      { title: 'Kanban Dashboard UI',   color: '#6554C0', s: 2.2,  e: 3.05 },
    ]},
  ];

  constructor(public ui: UiService) {}

  ngOnInit(): void {}

  pct(v: number): string { return (v / this.total * 100).toFixed(2) + '%'; }
}
