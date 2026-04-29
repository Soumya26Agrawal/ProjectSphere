import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-defect-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './defect-analytics.component.html',
  styleUrls: ['./defect-analytics.component.css']
})
export class DefectAnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  // References to Canvas elements in HTML
  @ViewChild('severityChart') severityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('densityChart') densityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leakageChart') leakageChart!: ElementRef<HTMLCanvasElement>;

  // Array to keep track of chart instances for cleanup
  private chartInstances: Chart[] = [];

  // Industry-standard KPIs
  metrics = [
    { label: 'Defect Removal Efficiency (DRE)', value: '94.2%', trend: '+2.1%', status: 'success', desc: 'Internal vs External detection' },
    { label: 'Defect Leakage Rate', value: '5.8%', trend: '-0.5%', status: 'success', desc: 'Escaped to Production' },
    { label: 'Mean Time to Repair (MTTR)', value: '1.4 Days', trend: '+0.2d', status: 'warning', desc: 'Avg fix velocity' },
    { label: 'Defect Rejection Rate', value: '12.4%', trend: '-4.0%', status: 'success', desc: 'Invalid/Duplicate reports' }
  ];

  summary = {
    total: 482,
    active: 56,
    critical: 4,
    regression: 18
  };

  constructor() {}

  // FIX: Added missing ngOnInit to satisfy the interface
  ngOnInit(): void {
    console.log('Analytics data initialized');
    // This is where you would typically call a service to fetch real data
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  // Best Practice: Clean up charts when component is destroyed
  ngOnDestroy(): void {
    this.chartInstances.forEach(chart => chart.destroy());
  }

  private initCharts() {
    // 1. Severity Distribution
    const sevChart = new Chart(this.severityChart.nativeElement, {
      type: 'polarArea',
      data: {
        labels: ['Blocker', 'Critical', 'Major', 'Minor', 'Trivial'],
        datasets: [{
          data: [4, 12, 45, 80, 120],
          backgroundColor: ['#b91c1c', '#ef4444', '#f97316', '#3b82f6', '#94a3b8']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Found vs Fixed Trend
    const trendChart = new Chart(this.trendChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'],
        datasets: [
          { 
            label: 'Discovered', 
            data: [40, 65, 55, 90, 70, 110], 
            borderColor: '#6366f1', 
            fill: true, 
            backgroundColor: 'rgba(99, 102, 241, 0.1)', 
            tension: 0.3 
          },
          { 
            label: 'Resolved', 
            data: [35, 50, 60, 80, 75, 95], 
            borderColor: '#22c55e', 
            tension: 0.3 
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // 3. Defect Density by Module
    const densityChart = new Chart(this.densityChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Auth-Service', 'Payment-Gateway', 'UI-Core', 'Analytics-Engine', 'Notification-Svc'],
        datasets: [{
          label: 'Bugs/KLOC',
          data: [1.2, 4.8, 2.5, 3.9, 0.8],
          backgroundColor: '#8b5cf6',
          borderRadius: 4
        }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
    });

    // 4. Leakage Trend
    const leakageChart = new Chart(this.leakageChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['v1.0', 'v1.1', 'v1.2', 'v2.0', 'v2.1'],
        datasets: [{
          label: 'Escaped Bugs',
          data: [12, 8, 15, 5, 7],
          backgroundColor: '#fda4af'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Push to instances array for cleanup
    this.chartInstances.push(sevChart, trendChart, densityChart, leakageChart);
  }
}