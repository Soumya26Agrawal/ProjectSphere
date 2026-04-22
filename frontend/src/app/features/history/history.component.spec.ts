import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HistoryComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
