import { Component, inject } from '@angular/core';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../services/products';

@Component({
  selector: 'app-home',
  standalone: true,         // ✅ componente standalone (Angular 17+)
  imports: [ProductCard],    // 🧩 solo necesitas importar tu card
  templateUrl: './home.html'
})
export class Home {
  // 🔍 inyectamos el servicio de productos
  productsService = inject(ProductsService);
}
