import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginModalComponent } from '../../shared/login-modal/login-modal';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ContactService } from '../../../core/services/contact.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LoginModalComponent],
  templateUrl: './footer.html'
})
export class FooterComponent {
  public contactService = inject(ContactService);
  clickCount = 0;
  showAdminAccess = false;
  showLoginModal = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogoClick() {
    this.clickCount++;
    if (this.clickCount >= 5) {
      this.showAdminAccess = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.showAdminAccess = false;
        this.clickCount = 0;
        this.cdr.detectChanges();
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
