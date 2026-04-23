import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardDevComponent } from './dashboard-dev.component';
import { AuthService } from '../../core/services/auth.service';

describe('DashboardDevComponent', () => {
  let component: DashboardDevComponent;
  let fixture: ComponentFixture<DashboardDevComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: jasmine.createSpy().and.returnValue({ name: 'Arjun Kumar', role: 'developer', email: '', avatar: 'AK' }),
    });
    await TestBed.configureTestingModule({
      imports: [DashboardDevComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardDevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
  it('should have 4 stat cards', () => expect(component.stats.length).toBe(4));
});
