import { Component, inject, signal, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
export class CatalogComponent implements OnInit, AfterViewInit {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);

  @ViewChild('sentinel') sentinel!: ElementRef;

  searchTerm = '';

  ngOnInit() {
    this.searchTerm = this.productsService.searchTerm();
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && this.productsService.hasMore()) {
        this.productsService.loadMore();
      }
    }, { threshold: 0.1 });

    observer.observe(this.sentinel.nativeElement);
  }

  onSearchChange() {
    this.productsService.setSearchTerm(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.productsService.clearSearch();
  }

  setCategory(id: string | null) {
    this.productsService.setCategory(id);
  }
}
