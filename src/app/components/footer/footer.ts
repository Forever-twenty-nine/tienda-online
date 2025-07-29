import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginModalComponent } from '../../shared/login-modal/login-modal';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LoginModalComponent],
  templateUrl: './footer.html'
})
export class FooterComponent {
  clickCount = 0;
  showAdminAccess = false;
  showLoginModal = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogoClick() {
    this.clickCount++;
    if (this.clickCount >= 5) {
      this.showAdminAccess = true;
      setTimeout(() => {
        this.showAdminAccess = false;
        this.clickCount = 0;
      }, 10000); // Se oculta después de 10 segundos
    }
  }

  onAdminClick(): void {
    if (this.authService.isAuthenticated()) {
      // Si ya está autenticado, ir directamente al admin
      this.router.navigate(['/admin']);
    } else {
      // Si no está autenticado, mostrar el modal de login
      this.showLoginModal = true;
    }
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }
}
