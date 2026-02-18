import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
})
export class Home {
  productsService = inject(ProductsService);

  defaultHeroImage =
    'https://firebasestorage.googleapis.com/v0/b/tienda-online-50dda.firebasestorage.app/o/products%2F1770994343043_pulsera-2.jpg?alt=media&token=c6885275-a59c-4ad4-a8bb-49e4ad2a9b11';

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
}
