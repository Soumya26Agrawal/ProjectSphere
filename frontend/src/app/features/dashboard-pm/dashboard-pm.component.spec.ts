import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardPmComponent } from './dashboard-pm.component';
import { AuthService } from '../../core/services/auth.service';

describe('DashboardPmComponent', () => {
  let component: DashboardPmComponent;
  let fixture: ComponentFixture<DashboardPmComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: jasmine.createSpy().and.returnValue({
        name: 'Bob Smith', role: 'project_manager', email: 'pm@logicminds.dev', avatar: 'BS',
      }),
    });
    await TestBed.configureTestingModule({
      imports: [DashboardPmComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
  it('should have 3 KPI stat cards', () => expect(component.stats.length).toBe(3));
  it('should have 2 projects', () => expect(component.projects.length).toBe(2));
  it('should show ongoing project first', () => expect(component.projects[0].status).toBe('ONGOING'));
});
