import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products';
import { ProductCard } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html'
})
export class Home {
  productsService = inject(ProductsService);

  get featuredProducts() {
    return this.productsService.products().filter(p => p.destacado).slice(0, 4);
  }
}
