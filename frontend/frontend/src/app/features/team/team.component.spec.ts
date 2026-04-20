import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TeamComponent } from './team.component';

describe('TeamComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TeamComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
