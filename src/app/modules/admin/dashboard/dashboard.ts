import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';

import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './dashboard.html',
})
export class AdminDashboard {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);

  totalProducts = computed(() => this.productsService.allProducts().length);
  totalCategories = computed(() => this.categoriesService.categories().length);
  
  // Resumen de productos por categoría (opcional pero útil)
  productsByCategory = computed(() => {
    const products = this.productsService.allProducts();
    const categories = this.categoriesService.categories();
    
    return categories.map(cat => ({
      nombre: cat.nombre,
      count: products.filter(p => p.categoriaId === cat.id).length
    })).sort((a, b) => b.count - a.count);
  });
}
