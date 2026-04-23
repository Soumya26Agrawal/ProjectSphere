import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { AuthService } from '../../core/services/auth.service';

describe('DashboardAdminComponent', () => {
  let component: DashboardAdminComponent;
  let fixture: ComponentFixture<DashboardAdminComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: jasmine.createSpy().and.returnValue({
        name: 'Alice Johnson', role: 'admin', email: 'admin@logicminds.dev', avatar: 'AJ',
      }),
    });
    await TestBed.configureTestingModule({
      imports: [DashboardAdminComponent, RouterTestingModule, FormsModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
  it('should have 4 stat cards', () => expect(component.stats.length).toBe(4));
  it('should have 3 projects', () => expect(component.allProjects.length).toBe(3));
  it('should filter projects correctly', () => {
    component.statusFilter = 'ONGOING';
    expect(component.filteredProjects.length).toBe(2);
  });
});
