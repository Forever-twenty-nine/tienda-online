import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { ProductCard } from '../../components/product-card/product-card';
import { IPhoneComparator } from '../../components/iphone-comparator/iphone-comparator';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard, IPhoneComparator],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './home.html',
})
export class Home {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  router = inject(Router);

  topLevelCategories = computed(() => {
    return this.categoriesService.rubros();
  });

  get featuredProducts() {
    return this.productsService
      .products()
      .filter((p) => p.destacado)
      .slice(0, 4);
  }

  navigateToCategory(id: string) {
    this.productsService.clearSearch();
    this.productsService.setRubro(id);
    this.router.navigate(['/catalogo']);
  }
}
