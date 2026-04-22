import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

interface SprintEval {
  sprint: string;
  planned: number;
  completed: number;
  defects: number;
  velocity: number;
}

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, RouterLink, InitialsPipe],
  templateUrl: './evaluation.component.html',
  styleUrl: './evaluation.component.css',
})
export class EvaluationComponent {
  sprints: SprintEval[] = [
    { sprint: 'Sprint 1', planned: 10, completed: 9,  defects: 1, velocity: 90 },
    { sprint: 'Sprint 2', planned: 12, completed: 10, defects: 2, velocity: 83 },
    { sprint: 'Sprint 3', planned: 11, completed: 6,  defects: 1, velocity: 55 },
  ];

  teamMetrics = [
    { name: 'David Brown',   role: 'Team Lead',   tasks: 8, done: 7, score: 88 },
    { name: 'Henry Moore',   role: 'Developer',   tasks: 6, done: 5, score: 83 },
    { name: 'Alice Green',   role: 'Developer',   tasks: 5, done: 5, score: 100 },
    { name: 'Mark Johnson',  role: 'QA Tester',   tasks: 4, done: 3, score: 75 },
  ];

  get avgVelocity(): number {
    return Math.round(this.sprints.reduce((s, sp) => s + sp.velocity, 0) / this.sprints.length);
  }

  get totalDefects(): number {
    return this.sprints.reduce((s, sp) => s + sp.defects, 0);
  }

  scoreClass(score: number): string {
    if (score >= 90) return 'score-green';
    if (score >= 70) return 'score-orange';
    return 'score-red';
  }
}
