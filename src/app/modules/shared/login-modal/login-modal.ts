import { Component, input, output, ChangeDetectionStrategy, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalComponent } from '../modal/modal';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './login-modal.html'
})
export class LoginModalComponent {
  open = input(false);
  closeModalEvent = output<void>();

  credentials = {
    email: '',
    password: ''
  };

  showPassword = false;
  showError = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Cada vez que el usuario toca el email o el password, limpio el error
    // para que el banner rojo no quede persistido de un intento fallido.
    // Ademas, asi el spinner trabado (caso reportado: si algo tira entre
    // `isLoading = true` y un `await`, queda `false` en el UI) no se confunde
    // con el error viejo.
    let lastEmail = '';
    let lastPassword = '';
    effect(() => {
      const email = this.credentials.email;
      const password = this.credentials.password;
      if (email !== lastEmail || password !== lastPassword) {
        lastEmail = email;
        lastPassword = password;
        if (this.showError) {
          this.showError = false;
          this.errorMessage = '';
        }
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.credentials.email || !this.credentials.password) return;

    this.isLoading = true;
    this.showError = false;

    try {
      const loginSuccess = await this.authService.login(
        this.credentials.email,
        this.credentials.password
      );

      if (loginSuccess && this.authService.hasAdminAccess()) {
        this.closeModal();
        this.router.navigate(['/admin']);
        return;
      }
      if (loginSuccess) {
        this.errorMessage =
          'Login exitoso pero la cuenta no tiene permisos de admin.';
      } else {
        this.errorMessage = 'Email o contraseña incorrectos';
      }
      this.credentials.password = '';
      this.showError = true;
    } catch (err) {
      // Defensa contra cualquier throw inesperado (network, emulador caido,
      // etc). El bug que el user reporto (spiner trabado si el network/auth
      // emulator se cae a mitad del signIn) ya no puede pasar: el finally
      // siempre apaga el spinner.
      this.errorMessage = `Error inesperado: ${(err as Error)?.message ?? String(err)}`;
      this.showError = true;
      console.error('Login submit error:', err);
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}