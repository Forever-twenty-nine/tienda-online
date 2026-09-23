import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

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
  ) {}

  async onSubmit(): Promise<void> {
    if (this.credentials.email && this.credentials.password) {
      this.isLoading = true;
      this.showError = false;

      const loginSuccess = await this.authService.login(
        this.credentials.email,
        this.credentials.password
      );

      this.isLoading = false;

      if (loginSuccess && this.authService.hasAdminAccess()) {
        this.closeModal();
        this.router.navigate(['/admin']);
      } else if (loginSuccess) {
        this.showError = true;
        this.errorMessage = 'Login exitoso pero la cuenta no tiene permisos de admin.';
        this.credentials.password = '';
      } else {
        this.showError = true;
        this.errorMessage = 'Email o contraseña incorrectos';
        this.credentials.password = '';
      }
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
