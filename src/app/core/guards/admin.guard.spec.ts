import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

class AuthServiceStub {
  isAuthenticatedValue = false;
  isAuthenticated() { return this.isAuthenticatedValue; }
}

class RouterStub {
  navigateCalls: any[][] = [];
  navigate(commands: any[]) {
    this.navigateCalls.push(commands);
    return Promise.resolve(true);
  }
}

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authStub: AuthServiceStub;
  let routerStub: RouterStub;

  beforeEach(() => {
    authStub = new AuthServiceStub();
    routerStub = new RouterStub();
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerStub },
      ],
    });
    guard = TestBed.inject(AdminGuard);
  });

  it('deberia crearse', () => {
    expect(guard).toBeTruthy();
  });

  it('deberia permitir acceso si user esta autenticado', () => {
    authStub.isAuthenticatedValue = true;
    expect(guard.canActivate()).toBe(true);
    expect(routerStub.navigateCalls).toHaveLength(0);
  });

  it('deberia denegar acceso y redirigir si user no esta autenticado', () => {
    authStub.isAuthenticatedValue = false;
    expect(guard.canActivate()).toBe(false);
    expect(routerStub.navigateCalls).toHaveLength(1);
    expect(routerStub.navigateCalls[0]).toEqual(['/']);
  });
});