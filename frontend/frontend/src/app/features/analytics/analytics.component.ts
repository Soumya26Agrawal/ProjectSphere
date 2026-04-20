import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';

declare const Chart: any;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('cTask') cTask!: ElementRef;
  @ViewChild('cPrio') cPrio!: ElementRef;
  @ViewChild('cDef')  cDef!: ElementRef;
  @ViewChild('cVel')  cVel!: ElementRef;

  kpis: any[] = [];
  private chartsBuilt = false;

  constructor(public ds: DataService, public ui: UiService) {}

  ngOnInit(): void { this.buildKpis(); }

  ngAfterViewInit(): void { setTimeout(() => this.buildCharts(), 100); }

  buildKpis(): void {
    const done    = this.ds.tickets.filter(t => t.status === 'DONE').length;
    const total   = this.ds.tickets.filter(t => t.status !== 'BACKLOG').length || 1;
    const inprog  = this.ds.tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const res     = this.ds.defects.filter(d => d.status === 'RESOLVED').length;
    const defTotal = this.ds.defects.length || 1;
    this.kpis = [
      { v: Math.round(done / total * 100) + '%', l: 'Task Completion',    bar: Math.round(done / total * 100), color: '#0052CC' },
      { v: inprog,                                l: 'Stories In Progress',                                     color: '#6554C0' },
      { v: Math.round(res / defTotal * 100) + '%',l: 'Defect Resolution',  bar: Math.round(res / defTotal * 100), color: '#36B37E' },
      { v: this.ds.defects.length,                l: 'Total Defects',      sub: res + ' resolved',              color: '#FF5630' },
    ];
  }

  buildCharts(): void {
    if (this.chartsBuilt) return;
    if (typeof Chart === 'undefined') return;
    this.chartsBuilt = true;

    const t = this.ds.tickets;
    const d = this.ds.defects;
    const cnt  = (s: string) => t.filter(x => x.status === s).length;
    const dcnt = (s: string) => d.filter(x => x.status === s).length;
    const pcnt = (p: string) => t.filter(x => x.pri === p).length;
    const gridColor = 'rgba(223,225,230,.8)';
    const base = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#5E6C84', font: { size: 11, family: 'Inter' } } } },
    };

    new Chart(this.cTask.nativeElement, {
      type: 'bar',
      data: {
        labels: ['To Do', 'In Progress', 'Tested', 'Done', 'Backlog'],
        datasets: [{
          label: 'Issues',
          data: [cnt('TO_DO'), cnt('IN_PROGRESS'), cnt('TESTED'), cnt('DONE'), cnt('BACKLOG')],
          backgroundColor: ['#DFE1E6', '#DEEBFF', '#EAE6FF', '#E3FCEF', '#F4F5F7'],
          borderColor:     ['#97A0AF', '#0052CC', '#403294', '#006644', '#97A0AF'],
          borderWidth: 1.5, borderRadius: 3, borderSkipped: false,
        }],
      },
      options: {
        ...base,
        plugins: { ...base.plugins, legend: { display: false } },
        scales: {
          x: { ticks: { color: '#5E6C84', font: { size: 11 } }, grid: { color: gridColor } },
          y: { ticks: { color: '#5E6C84', font: { size: 11 } }, grid: { color: gridColor } },
        },
      },
    });

    new Chart(this.cPrio.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [{
          data: [pcnt('LOW'), pcnt('MEDIUM'), pcnt('HIGH'), pcnt('CRITICAL')],
          backgroundColor: ['#E3FCEF', '#FFF0B3', '#FFE2BD', '#FFEBE6'],
          borderColor:     ['#36B37E', '#FFAB00', '#FF991F', '#FF5630'],
          borderWidth: 2,
        }],
      },
      options: { ...base, plugins: { legend: { position: 'right', labels: { color: '#5E6C84', font: { size: 11 } } } } },
    });

    new Chart(this.cDef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [{
          data: [dcnt('OPEN'), dcnt('IN_PROGRESS'), dcnt('RESOLVED')],
          backgroundColor: ['#DEEBFF', '#FFF0B3', '#E3FCEF'],
          borderColor:     ['#0052CC', '#FFAB00', '#36B37E'],
          borderWidth: 2,
        }],
      },
      options: { ...base, plugins: { legend: { position: 'right', labels: { color: '#5E6C84', font: { size: 11 } } } } },
    });

    new Chart(this.cVel.nativeElement, {
      type: 'line',
      data: {
        labels: ['Sprint 1', 'Sprint 2', 'Sprint 3'],
        datasets: [
          { label: 'Planned',   data: [30, 35, 32], borderColor: '#0052CC', backgroundColor: 'rgba(0,82,204,.08)',   fill: true, tension: .4, pointBackgroundColor: '#0052CC', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5 },
          { label: 'Completed', data: [24, 31, 28], borderColor: '#36B37E', backgroundColor: 'rgba(54,179,126,.08)', fill: true, tension: .4, pointBackgroundColor: '#36B37E', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5 },
        ],
      },
      options: {
        ...base,
        scales: {
          x: { ticks: { color: '#5E6C84', font: { size: 11 } }, grid: { color: gridColor } },
          y: { ticks: { color: '#5E6C84', font: { size: 11 } }, grid: { color: gridColor } },
        },
      },
    });
  }
}
