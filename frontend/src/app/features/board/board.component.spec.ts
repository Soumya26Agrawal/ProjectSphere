import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BoardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
