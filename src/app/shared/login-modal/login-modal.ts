import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './login-modal.html'
})
export class LoginModalComponent {
  @Input() open = false;
  @Output() closeModalEvent = new EventEmitter<void>();

  credentials = {
    username: '',
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

  onSubmit(): void {
    if (this.credentials.username && this.credentials.password) {
      this.isLoading = true;
      this.showError = false;

      // Simular un pequeño delay para mostrar el loading
      setTimeout(() => {
        const loginSuccess = this.authService.login(
          this.credentials.username, 
          this.credentials.password
        );

        this.isLoading = false;

        if (loginSuccess) {
          this.closeModal();
          this.router.navigate(['/admin']);
        } else {
          this.showError = true;
          this.errorMessage = 'Usuario o contraseña incorrectos';
          // Limpiar la contraseña
          this.credentials.password = '';
        }
      }, 1000);
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
