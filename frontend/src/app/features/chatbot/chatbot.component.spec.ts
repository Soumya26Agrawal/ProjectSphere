import { TestBed } from '@angular/core/testing';
import { ChatbotComponent } from './chatbot.component';

describe('ChatbotComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ChatbotComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
