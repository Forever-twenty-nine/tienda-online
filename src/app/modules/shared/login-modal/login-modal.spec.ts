import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginModalComponent } from './login-modal';
import { AuthService } from '../../../core/services/auth.service';

class AuthServiceStub {
  loginResult = false;
  hasAdminResult = false;
  loginCalls: { email: string; password: string }[] = [];

  login(email: string, password: string) {
    this.loginCalls.push({ email, password });
    return Promise.resolve(this.loginResult);
  }
  hasAdminAccess() { return this.hasAdminResult; }
}

describe('LoginModalComponent', () => {
  let component: LoginModalComponent;
  let authStub: AuthServiceStub;

  beforeEach(() => {
    authStub = new AuthServiceStub();
    TestBed.configureTestingModule({
      providers: [
        LoginModalComponent,
        provideRouter([]),
        { provide: AuthService, useValue: authStub },
      ],
    });
    component = TestBed.inject(LoginModalComponent);
  });

  it('deberia crearse', () => {
    expect(component).toBeTruthy();
  });

  it('deberia arrancar con credentials vacios y sin error', () => {
    expect(component.credentials).toEqual({ email: '', password: '' });
    expect(component.showError).toBe(false);
    expect(component.isLoading).toBe(false);
  });

  describe('onSubmit', () => {
    it('deberia NO hacer nada si email o password vacios', async () => {
      component.credentials.email = '';
      component.credentials.password = '';
      await component.onSubmit();
      expect(authStub.loginCalls).toHaveLength(0);
      expect(component.isLoading).toBe(false);
    });

    it('deberia llamar auth.login con email y password correctos', async () => {
      component.credentials.email = 'a@b.com';
      component.credentials.password = 'pw';
      await component.onSubmit();
      expect(authStub.loginCalls).toEqual([{ email: 'a@b.com', password: 'pw' }]);
    });

    it('deberia mostrar error y limpiar password si login falla', async () => {
      component.credentials.email = 'a@b.com';
      component.credentials.password = 'pw';
      authStub.loginResult = false;
      await component.onSubmit();
      expect(component.showError).toBe(true);
      expect(component.errorMessage).toBe('Email o contraseña incorrectos');
      expect(component.credentials.password).toBe('');
      expect(component.isLoading).toBe(false);
    });

    it('deberia mostrar mensaje distinto si login OK pero sin admin', async () => {
      component.credentials.email = 'a@b.com';
      component.credentials.password = 'pw';
      authStub.loginResult = true;
      authStub.hasAdminResult = false;
      await component.onSubmit();
      expect(component.errorMessage).toContain('permisos de admin');
      expect(component.isLoading).toBe(false);
    });

    it('deberia desactivar isLoading aunque login lance excepción', async () => {
      component.credentials.email = 'a@b.com';
      component.credentials.password = 'pw';
      authStub.login = () => Promise.reject(new Error('network'));
      await component.onSubmit();
      expect(component.isLoading).toBe(false);
      expect(component.showError).toBe(true);
      expect(component.errorMessage).toContain('Error inesperado');
    });

    it('deberia activar isLoading durante el await y desactivarlo al terminar', async () => {
      let resolveLogin!: (v: boolean) => void;
      authStub.login = () => new Promise<boolean>((res) => { resolveLogin = res; });
      component.credentials.email = 'a@b.com';
      component.credentials.password = 'pw';

      const promise = component.onSubmit();
      expect(component.isLoading).toBe(true);

      resolveLogin(false);
      await promise;
      expect(component.isLoading).toBe(false);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('deberia alternar showPassword', () => {
      expect(component.showPassword).toBe(false);
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(true);
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(false);
    });
  });
});