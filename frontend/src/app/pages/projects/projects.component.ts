import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavbarComponent } from '../../shared/components/admin-navbar/admin-navbar.component';
import { AdminProjectCardComponent } from '../../shared/components/admin-project-card/admin-project-card.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdvancedFiltersComponent } from "../../shared/components/advanced-filters/advanced-filters.component";

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    AdminNavbarComponent,
    AdminProjectCardComponent,
    FormsModule,
    MatIconModule,
    AdvancedFiltersComponent
],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  
  // Data State
  allProjects = [
    {
      projectId: 1042,
      projectName: "E-Commerce Platform Revamp",
      domain: "Retail",
      description: "Complete overhaul of the main e-commerce storefront including new payment gateways.",
      status: "ONGOING", 
      manager: { id: 1, name: "Sarah Jenkins" },
      progress: 65, 
      targetDate: "Jun 15, 2026",
      team: [
        { id: 1, initials: "SJ", bg: "bg-pink-500" },
        { id: 2, initials: "MI", bg: "bg-indigo-500" },
        { id: 3, initials: "KT", bg: "bg-sky-500" }
      ],
      extraTeamCount: 1
    },
    {
      projectId: 1043,
      projectName: "Mobile App V2.0",
      domain: "Technology",
      description: "Developing the new React Native mobile application for iOS and Android.",
      status: "ONGOING",
      manager: { id: 2, name: "David Chen" },
      progress: 32,
      targetDate: "Aug 1, 2026",
      team: [
        { id: 4, initials: "DC", bg: "bg-rose-500" },
        { id: 5, initials: "AP", bg: "bg-violet-500" }
      ],
      extraTeamCount: 0
    },
    {
      projectId: 1044,
      projectName: "Q1 Marketing Campaign",
      domain: "Finance",
      description: "Global marketing campaign rollout across social, print, and digital media.",
      status: "COMPLETED",
      manager: { id: 3, name: "Elena Rodriguez" },
      progress: 100,
      targetDate: "Mar 30, 2026",
      team: [
        { id: 6, initials: "ER", bg: "bg-emerald-500" },
        { id: 7, initials: "JS", bg: "bg-blue-500" },
        { id: 8, initials: "MK", bg: "bg-amber-500" }
      ],
      extraTeamCount: 0
    }
  ];

  filteredProjects = [...this.allProjects];

  // Stats
  totalProjects: number = 0;
  ongoingProjects: number = 0;
  completedProjects: number = 0;
  avgCompletion: number = 0;

  // Filter State
  searchTerm: string = '';
  activeTab: string = 'All';
  statusTabs: string[] = ['All', 'Active', 'Completed'];
  isAdvancedOpen: boolean = false;

  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 12;

  paginatedProjects: any[] = [];

  ngOnInit() {
    this.calculateStats();
    this.applySimpleFilters();
  }

  calculateStats() {
    this.totalProjects = this.allProjects.length;
    this.ongoingProjects = this.allProjects.filter(p => p.status === 'ONGOING').length;
    this.completedProjects = this.allProjects.filter(p => p.status === 'COMPLETED').length;
    
    const sumProgress = this.allProjects.reduce((acc, curr) => acc + curr.progress, 0);
    this.avgCompletion = this.totalProjects > 0 ? Math.round(sumProgress / this.totalProjects) : 0;
  }

  // Uses only standard tabs & search box - advanced filteration is handled via backend hypothetically
  applySimpleFilters() {
    let result = [...this.allProjects];

    // 1. Tab Filter
    if (this.activeTab === 'Active') {
      result = result.filter(p => p.status === 'ONGOING');
    } else if (this.activeTab === 'Completed') {
      result = result.filter(p => p.status === 'COMPLETED');
    }

    // 2. Search Filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => 
        p.projectName.toLowerCase().includes(term) ||
        ('prj-' + p.projectId).includes(term)
      );
    }

    this.filteredProjects = result;
    this.totalPages = Math.ceil(this.filteredProjects.length / this.pageSize) || 1;
    this.currentPage = 1;
    this.updatePagination();
  }

  onAdvancedFiltersChanged(advancedFilters: any) {
    // In a real application, you would pass these to your backend service
    console.log("Filters changed. Sending payload to backend API (no local filtering logic required):", advancedFilters);
    
    // For visual demonstration we just perform our basic tab/search filtering logic.
    this.applySimpleFilters(); 
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedProjects = this.filteredProjects.slice(startIndex, startIndex + this.pageSize);
  }

  onSearchChange() {
    this.applySimpleFilters();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.applySimpleFilters();
  }

  toggleAdvanced() {
    this.isAdvancedOpen = !this.isAdvancedOpen;
  }

  changePage(amount: number) {
    const next = this.currentPage + amount;
    if (next >= 1 && next <= this.totalPages) {
      this.currentPage = next;
      this.updatePagination();
    }
  }
}
