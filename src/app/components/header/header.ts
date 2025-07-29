import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './header.html'
})
export class HeaderComponent {
  private productsService = inject(ProductsService);
  
  isMenuOpen = false;
  searchTerm = '';

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onSearchChange() {
    this.productsService.setSearchTerm(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.productsService.clearSearch();
  }
}
