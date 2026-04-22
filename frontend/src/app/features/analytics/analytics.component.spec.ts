import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AnalyticsComponent } from './analytics.component';

describe('AnalyticsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
