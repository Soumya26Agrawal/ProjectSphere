import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule
  ],
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.css']
})
export class AdvancedFiltersComponent {
  // Domain selection
  domainSearch: string = '';
  domains: string[] = ['Retail', 'Finance', 'Technology', 'Healthcare'];
  selectedDomains: string[] = [];
  isDomainOpen: boolean = false;

  // Manager selection
  managerSearch: string = '';
  managers: string[] = ['Sarah Jenkins', 'David Chen', 'Elena Rodriguez'];
  selectedManagers: string[] = [];
  isManagerOpen: boolean = false;

  // Team Member selection
  teamMemberSearch: string = '';
  teamMembers: string[] = ['SJ', 'MI', 'KT', 'DC', 'AP', 'ER', 'JS', 'MK'];
  selectedTeamMembers: string[] = [];
  isTeamMemberOpen: boolean = false;

  // Timeline
  timelineContext: string = ''; // Active, Started, Deadline
  selectedDate: string = ''; // Replaced two inputs with single date input

  // Progress
  progressStatus: number = 0; // Single progress bar

  @Output() filtersChanged = new EventEmitter<any>();

  // Methods to apply filters over mock objects (the component doesn't actually process data, just emits the filters!)
  applyFilters() {
    this.filtersChanged.emit({
      domains: this.selectedDomains,
      managers: this.selectedManagers,
      teamMembers: this.selectedTeamMembers,
      timelineContext: this.timelineContext,
      selectedDate: this.selectedDate,
      progressStatus: this.progressStatus
    });
  }

  clearFilters() {
    this.selectedDomains = [];
    this.selectedManagers = [];
    this.selectedTeamMembers = [];
    this.timelineContext = '';
    this.selectedDate = '';
    this.progressStatus = 0;
    this.domainSearch = '';
    this.managerSearch = '';
    this.teamMemberSearch = '';
    this.applyFilters();
  }

  // Toggles
  toggleDomain() {
    this.isDomainOpen = !this.isDomainOpen;
    if (this.isDomainOpen) { this.isManagerOpen = false; this.isTeamMemberOpen = false; }
  }

  toggleManager() {
    this.isManagerOpen = !this.isManagerOpen;
    if (this.isManagerOpen) { this.isDomainOpen = false; this.isTeamMemberOpen = false; }
  }

  toggleTeamMember() {
    this.isTeamMemberOpen = !this.isTeamMemberOpen;
    if (this.isTeamMemberOpen) { this.isDomainOpen = false; this.isManagerOpen = false; }
  }

  // Item selections
  toggleDomainSelection(domain: string, event: any) {
    if (event.target.checked) {
      if (!this.selectedDomains.includes(domain)) this.selectedDomains.push(domain);
    } else {
      this.selectedDomains = this.selectedDomains.filter(d => d !== domain);
    }
    this.applyFilters();
  }

  toggleManagerSelection(manager: string, event: any) {
    if (event.target.checked) {
      if (!this.selectedManagers.includes(manager)) this.selectedManagers.push(manager);
    } else {
      this.selectedManagers = this.selectedManagers.filter(m => m !== manager);
    }
    this.applyFilters();
  }

  toggleTeamMemberSelection(tm: string, event: any) {
    if (event.target.checked) {
      if (!this.selectedTeamMembers.includes(tm)) this.selectedTeamMembers.push(tm);
    } else {
      this.selectedTeamMembers = this.selectedTeamMembers.filter(t => t !== tm);
    }
    this.applyFilters();
  }
}