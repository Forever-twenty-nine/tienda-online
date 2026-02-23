import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CategoriesService } from '../../../core/services/categories.service';
import { ProductsService } from '../../../core/services/products';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html'
})
export class HeaderComponent {
  private categoriesService = inject(CategoriesService);
  private productsService = inject(ProductsService);

  isMenuOpen = false;

  topLevelCategories = computed(() => {
    return this.categoriesService.rubros();
  });

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  setCategory(id: string | null) {
    this.productsService.clearSearch();
    this.productsService.setRubro(id);
    this.closeMenu();
  }
}
