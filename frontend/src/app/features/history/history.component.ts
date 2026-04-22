import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { HistoryItem } from '../../core/models/models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
  search = '';
  filterSprint = '';
  filterEpic = '';
  filterStatus = '';
  dateFrom = '';
  dateTo = '';

  constructor(public ds: DataService, public ui: UiService) {}

  ngOnInit(): void {}

  get filtered(): HistoryItem[] {
    const s = this.search.toLowerCase();
    return this.ds.histData.filter(h =>
      (!s || h.title.toLowerCase().includes(s) || h.id.toLowerCase().includes(s)) &&
      (!this.filterSprint || h.sprint === this.filterSprint) &&
      (!this.filterEpic   || h.epic   === this.filterEpic) &&
      (!this.filterStatus || h.status === this.filterStatus) &&
      (!this.dateFrom     || h.start  >= this.dateFrom) &&
      (!this.dateTo       || h.end    <= this.dateTo)
    );
  }

  duration(start: string, end: string): string {
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 'd';
  }
}
