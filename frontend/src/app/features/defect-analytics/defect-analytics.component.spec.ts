import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefectAnalyticsComponent } from './defect-analytics.component';

describe('DefectAnalyticsComponent', () => {
  let component: DefectAnalyticsComponent;
  let fixture: ComponentFixture<DefectAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefectAnalyticsComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefectAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize all 4 charts', () => {
    expect(component.severityChart).toBeDefined();
    expect(component.trendChart).toBeDefined();
    expect(component.densityChart).toBeDefined();
    expect(component.leakageChart).toBeDefined();
  });

  it('should display the correct DRE percentage', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dreCard = compiled.textContent;
    expect(dreCard).toContain('94.2%');
  });
});