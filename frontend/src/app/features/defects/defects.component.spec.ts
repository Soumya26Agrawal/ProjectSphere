import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DefectsComponent } from './defects.component';

describe('DefectsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefectsComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DefectsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
