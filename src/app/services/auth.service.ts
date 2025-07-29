import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Credenciales por defecto (en producción esto debería venir de un backend)
  private readonly adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  constructor() {
    // Verificar si ya está autenticado al cargar la aplicación
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    this.isAuthenticatedSubject.next(isLoggedIn);
  }

  login(username: string, password: string): boolean {
    if (username === this.adminCredentials.username && 
        password === this.adminCredentials.password) {
      this.isAuthenticatedSubject.next(true);
      localStorage.setItem('adminLoggedIn', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('adminLoggedIn');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
