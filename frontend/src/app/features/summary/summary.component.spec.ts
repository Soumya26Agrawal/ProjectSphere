import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SummaryComponent } from './summary.component';

describe('SummaryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SummaryComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
