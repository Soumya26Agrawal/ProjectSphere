import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-test-case-analytics',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe],
  templateUrl: './test-case-analytics.component.html',
  styleUrls: ['./test-case-analytics.component.css']
})
export class TestCaseAnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('executionTrendChart') executionTrendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('coverageRadarChart') coverageRadarChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('automationRatioChart') automationRatioChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('defectCorrelationChart') defectCorrelationChart!: ElementRef<HTMLCanvasElement>;

  private chartInstances: Chart[] = [];

  // Deep-dive Industry Metrics
  detailedMetrics = [
    { label: 'Test Case Effectiveness', value: '18.5%', trend: '+2.4%', status: 'success', desc: '% of tests finding valid bugs' },
    { label: 'Automation ROI', value: '$4.2k', trend: '+$800', status: 'success', desc: 'Estimated cost savings vs Manual' },
    { label: 'Test Case Stability', value: '98.1%', trend: '-0.2%', status: 'warning', desc: 'Percentage of non-flaky tests' },
    { label: 'Requirement Traceability', value: '100%', trend: 'Stable', status: 'success', desc: 'Tests mapped to requirements' }
  ];

  summaryData = {
    executed: 4500,
    total: 5200,
    blockedByDefects: 142,
    avgRepairTime: '4.5 hrs'
  };

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.renderAdvancedCharts(), 0);
  }

  ngOnDestroy(): void {
    this.chartInstances.forEach(c => c.destroy());
  }

  private renderAdvancedCharts() {
    // 1. Stacked Execution History (Success/Fail/Blocked over time)
    const trend = new Chart(this.executionTrendChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Sprint 10', 'Sprint 11', 'Sprint 12', 'Sprint 13', 'Sprint 14'],
        datasets: [
          { label: 'Passed', data: [400, 450, 420, 500, 550], backgroundColor: '#10b981' },
          { label: 'Failed', data: [40, 30, 55, 20, 15], backgroundColor: '#f43f5e' },
          { label: 'Blocked', data: [20, 15, 25, 10, 5], backgroundColor: '#f59e0b' }
        ]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        scales: { x: { stacked: true }, y: { stacked: true } } 
      }
    });

    // 2. Functional Coverage Radar (UI, Security, API, etc.)
    const radar = new Chart(this.coverageRadarChart.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Performance', 'Security', 'UI/UX', 'API/Business', 'Integrations', 'Data Integrity'],
        datasets: [{
          label: 'Coverage %',
          data: [65, 80, 95, 90, 75, 85],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          pointBackgroundColor: '#6366f1'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // 3. Automation vs Manual Distribution
    const ratio = new Chart(this.automationRatioChart.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Automated (CI/CD)', 'Manual (Exploratory)', 'Manual (Regression)'],
        datasets: [{
          data: [75, 15, 10],
          backgroundColor: ['#8b5cf6', '#ec4899', '#64748b']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });

    // 4. Defect Correlation (Scatter: Test complexity vs Bugs found)
    const correlation = new Chart(this.defectCorrelationChart.nativeElement, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Tests vs Defects',
          data: [{x: 10, y: 1}, {x: 20, y: 3}, {x: 35, y: 8}, {x: 50, y: 12}, {x: 70, y: 15}],
          backgroundColor: '#0ea5e9'
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        scales: { 
          x: { title: { display: true, text: 'Test Steps' } }, 
          y: { title: { display: true, text: 'Defects Linked' } } 
        } 
      }
    });

    this.chartInstances.push(trend, radar, ratio, correlation);
  }
}