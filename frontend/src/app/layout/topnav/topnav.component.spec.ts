import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TopnavComponent } from './topnav.component';

describe('TopnavComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopnavComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TopnavComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
