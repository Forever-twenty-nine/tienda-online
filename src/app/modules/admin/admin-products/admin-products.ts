import { Component, inject, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '../../../core/services/products';
import { CategoriesService } from '../../../core/services/categories.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  imports: [NgOptimizedImage],
  templateUrl: './admin-products.html',
})
export class AdminProducts implements OnInit, OnDestroy, AfterViewInit {

  // ⚙️ Inyectamos el servicio de productos y el router
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  router = inject(Router);

  private observer!: IntersectionObserver;

  @ViewChild('sentinel') set sentinel(element: ElementRef) {
    if (element) {
      this.observer.observe(element.nativeElement);
    }
  }

  ngOnInit() {
    this.productsService.clearSearch();
    this.productsService.categoryFilter.set(null);
    this.productsService.featuredFilter.set(null);
    this.productsService.publishedFilter.set(null);
    this.productsService.stockFilter.set(null);
    this.productsService.discountFilter.set(null);
    this.productsService.resetPagination();
  }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && this.productsService.hasMore()) {
        this.productsService.loadMore();
      }
    }, { threshold: 0.1 });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.productsService.clearSearch();
    this.productsService.categoryFilter.set(null);
    this.productsService.featuredFilter.set(null);
    this.productsService.publishedFilter.set(null);
    this.productsService.stockFilter.set(null);
    this.productsService.discountFilter.set(null);
    this.productsService.resetPagination();
  }

  isAvailable = (p: Product) => p.disponibilidad;
  
  getCategoryName(id?: string): string {
    if (!id) return 'Sin categoría';
    const cat = this.categoriesService.categories().find(c => c.id === id);
    return cat ? cat.nombre : 'Cargando...';
  }

  // ➕ crea uno nuevo
  onNew() {
    this.router.navigate(['/admin', 'products', 'new']);
  }
  // ✏️ editar existente
  onEdit(id: string) {
    this.router.navigate(['/admin', 'products', id]);
  }

}
