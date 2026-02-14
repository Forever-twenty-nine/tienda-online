import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCard, FormsModule],
  templateUrl: './catalog.html'
})
export class CatalogComponent implements OnInit {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);

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
}
