import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiService } from '../../core/services/ui.service';

interface DocItem {
  id: number;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'LINK';
  category: string;
  owner: string;
  size: string;
  updated: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
})
export class DocumentsComponent {
  search = '';
  category = '';

  readonly docs: DocItem[] = [
    { id:1, name: 'Product Requirements v3',         type:'PDF',  category:'Specs',   owner:'Rajesh Kumar', size:'1.2 MB', updated:'2 days ago' },
    { id:2, name: 'Sprint 3 Planning Notes',         type:'DOCX', category:'Agile',   owner:'Arjun Kumar',  size:'124 KB', updated:'yesterday' },
    { id:3, name: 'Database Schema Design',          type:'PDF',  category:'Specs',   owner:'Ravi Patel',   size:'890 KB', updated:'4 days ago' },
    { id:4, name: 'Release Checklist Template',      type:'DOCX', category:'Process', owner:'Priya Sharma', size:'56 KB',  updated:'1 week ago' },
    { id:5, name: 'API Contract (OpenAPI 3.0)',      type:'LINK', category:'Specs',   owner:'Sneha Iyer',   size:'—',      updated:'3 days ago' },
    { id:6, name: 'Sprint 2 Retrospective Actions',  type:'DOCX', category:'Agile',   owner:'Arjun Kumar',  size:'92 KB',  updated:'2 weeks ago' },
    { id:7, name: 'Defect Triage Playbook',          type:'PDF',  category:'Process', owner:'Priya Iyer',   size:'412 KB', updated:'5 days ago' },
    { id:8, name: 'Velocity & Capacity Tracking',    type:'XLSX', category:'Agile',   owner:'Rajesh Kumar', size:'78 KB',  updated:'1 day ago' },
    { id:9, name: 'Onboarding Handbook',             type:'PDF',  category:'Process', owner:'Priya Sharma', size:'2.4 MB', updated:'1 month ago' },
    { id:10, name:'Chat System Architecture',        type:'PDF',  category:'Specs',   owner:'Ravi Patel',   size:'1.6 MB', updated:'1 week ago' },
  ];

  readonly categories = ['Specs', 'Agile', 'Process'];

  constructor(public ui: UiService) {}

  get filtered(): DocItem[] {
    const q = this.search.trim().toLowerCase();
    return this.docs.filter(d =>
      (!this.category || d.category === this.category) &&
      (!q || d.name.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q))
    );
  }

  typeIcon(t: string): string {
    return { PDF: 'picture_as_pdf', DOCX: 'description', XLSX: 'table_chart', LINK: 'link' }[t] ?? 'description';
  }
  typeClass(t: string): string {
    return 'dt-' + t.toLowerCase();
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
