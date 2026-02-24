import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSignal = signal<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSignal; // No longer an observable but a signal

  // Credenciales por defecto (en producción esto debería venir de un backend)
  private readonly adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  constructor() {
    // Verificar si ya está autenticado al cargar la aplicación
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    this.isAuthenticatedSignal.set(isLoggedIn);
  }

  login(username: string, password: string): boolean {
    if (username === this.adminCredentials.username && 
        password === this.adminCredentials.password) {
      this.isAuthenticatedSignal.set(true);
      localStorage.setItem('adminLoggedIn', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticatedSignal.set(false);
    localStorage.removeItem('adminLoggedIn');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }
}
