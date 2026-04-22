import { TestBed } from '@angular/core/testing';
import { CreateIssueComponent } from './create-issue.component';

describe('CreateIssueComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateIssueComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CreateIssueComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
