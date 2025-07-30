import { Component, inject, signal } from '@angular/core';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../services/products';
import { Product } from '../../models/product.model';
import { ProductDetailModalComponent } from '../../components/product-detail-modal/product-detail-modal';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCard, ProductDetailModalComponent],
  templateUrl: './home.html'
})
export class Home {
  productsService = inject(ProductsService);

  selectedProduct = signal<Product | null>(null);
  modalOpen = signal(false);

  openProductModal(product: Product) {
    this.selectedProduct.set(product);
    this.modalOpen.set(true);
  }

  closeProductModal() {
    this.modalOpen.set(false);
    this.selectedProduct.set(null);
  }
}
