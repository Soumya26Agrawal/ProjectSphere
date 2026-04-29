import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestCaseAnalyticsComponent } from './test-case-analytics.component';
import { DecimalPipe } from '@angular/common';

describe('TestCaseAnalyticsComponent', () => {
  let component: TestCaseAnalyticsComponent;
  let fixture: ComponentFixture<TestCaseAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseAnalyticsComponent],
      providers: [DecimalPipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCaseAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and contain 4 complex chart instances', () => {
    // Check if initCharts pushed all instances to the array
    // @ts-ignore - accessing private for test
    expect(component.chartInstances.length).toBe(4);
  });

  it('should correctly calculate and display the execution percentage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const progressText = compiled.querySelector('.progress-text')?.textContent;
    // (4500 / 5200) * 100 approx 87%
    expect(progressText).toContain('87%');
  });
});