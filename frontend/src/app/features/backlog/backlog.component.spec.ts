import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BacklogComponent } from './backlog.component';

describe('BacklogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacklogComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BacklogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
