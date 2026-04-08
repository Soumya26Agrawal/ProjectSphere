import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminNavbarComponent } from '../../shared/components/admin-navbar/admin-navbar.component';
import { AdminProjectCardComponent } from '../../shared/components/admin-project-card/admin-project-card.component';
import { MatIconModule } from '@angular/material/icon';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent, AdminProjectCardComponent, MatIconModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  allProjects: any[] = [];
  currentPage = 0;
  pageSize = 16;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private projectService: ProjectService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.fetchProjects(0), 0);
    }
  }

  fetchProjects(page: number): void {
    this.projectService.getAllProjects(page, this.pageSize).subscribe({
      next: (response: any) => {
        setTimeout(() => {
          this.currentPage = page;
          const projects = response?.content ?? [];
          this.totalElements = response?.totalElements ?? projects.length;
          this.totalPages = response?.totalPages ?? 1;

          this.allProjects = projects.map((p: any) => ({
            projectId: p.projectId,
            projectName: p.projectName || 'Untitled Project',
            domain: p.domain || 'N/A',
            description: p.description || 'No description available.',
            status: p.status === 'IN_PROGRESS' ? 'ONGOING' : (p.status || 'ONGOING'),
            manager: { id: p.managerId || 0, name: 'Unassigned Manager' },
            progress: 50,
            targetDate: 'TBD',
            team: [],
            extraTeamCount: p.userIds?.length ?? 0
          }));

          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => console.error('Error fetching projects', err)
    });
  }

  get totalProjects(): number { return this.totalElements; }
  get ongoingProjects(): number { return this.allProjects.filter(p => p.status === 'ONGOING').length; }
  get completedProjects(): number { return this.allProjects.filter(p => p.status === 'COMPLETED').length; }
  get avgCompletion(): number {
    if (!this.allProjects.length) return 0;
    const sum = this.allProjects.reduce((acc, p) => acc + (p.progress || 0), 0);
    return Math.round(sum / this.allProjects.length);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.fetchProjects(this.currentPage + 1);
  }

  prevPage(): void {
    if (this.currentPage > 0) this.fetchProjects(this.currentPage - 1);
  }
}
