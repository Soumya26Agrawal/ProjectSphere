import { TestBed } from '@angular/core/testing';
import { TicketDetailComponent } from './ticket-detail.component';

describe('TicketDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetailComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TicketDetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
