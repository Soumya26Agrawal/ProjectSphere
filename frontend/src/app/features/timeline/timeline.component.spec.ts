import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TimelineComponent } from './timeline.component';

describe('TimelineComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TimelineComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
