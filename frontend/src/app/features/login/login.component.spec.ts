import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn', 'getDashboardRoute'], {
      isLoggedIn: jasmine.createSpy().and.returnValue(false),
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, ReactiveFormsModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when form is submitted empty', () => {
    component.onSubmit();
    expect(component.form.invalid).toBeTrue();
    expect(component.email.touched).toBeTrue();
    expect(component.password.touched).toBeTrue();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  });
});
