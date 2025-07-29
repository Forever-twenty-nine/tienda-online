import { Component, inject } from '@angular/core';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../services/products';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,         // ✅ componente standalone (Angular 17+)
  imports: [ProductCard, HeaderComponent, FooterComponent],    // 🧩 incluimos header, footer y card
  templateUrl: './home.html'
})
export class Home {
  // 🔍 inyectamos el servicio de productos
  productsService = inject(ProductsService);
}
