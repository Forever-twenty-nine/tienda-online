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

  defaultHeroImage =
    'http://127.0.0.1:9199/v0/b/tienda-online-50dda.firebasestorage.app/o/home%2F1790157409371_hand_holding_iphone.jpg?alt=media&token=eeaf1d7c-be0a-45a9-9135-ca2b74069b93';

  topLevelCategories = computed(() => {
    return this.categoriesService.rubros();
  });

  heroProduct = computed(() => {
    const products = this.productsService.products();
    if (products.length === 0) return null;

    // Productos con descuento
    const discounted = products.filter((p) => (p.descuento ?? 0) > 0);
    const pool =
      discounted.length > 0 ? discounted : products.filter((p) => p.destacado);

    if (pool.length === 0) return products[0];

    return pool[Math.floor(Math.random() * pool.length)];
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
