import { TestBed } from '@angular/core/testing';
import { NotificationPanelComponent } from './notification-panel.component';

describe('NotificationPanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationPanelComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NotificationPanelComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
