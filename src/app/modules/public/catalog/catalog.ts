import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { Product } from '../../../core/models/product.model';
import { ProductDetailModalComponent } from '../../shared/product-detail-modal/product-detail-modal';


@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCard, ProductDetailModalComponent, FormsModule],
  templateUrl: './catalog.html'
})
export class CatalogComponent implements OnInit {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);

  selectedProduct = signal<Product | null>(null);
  modalOpen = signal(false);
  searchTerm = '';

  ngOnInit() {
    this.searchTerm = this.productsService.searchTerm();
  }

  onSearchChange() {
    this.productsService.setSearchTerm(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.productsService.clearSearch();
  }

  setCategory(id: string | null) {
    this.productsService.categoryFilter.set(id);
  }

  openProductModal(product: Product) {
    this.selectedProduct.set(product);
    this.modalOpen.set(true);
  }

  closeProductModal() {
    this.modalOpen.set(false);
    this.selectedProduct.set(null);
  }
}
