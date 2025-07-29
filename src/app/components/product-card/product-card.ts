import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage, CurrencyPipe],      
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.html'
})
export class ProductCard {
  @Input() product!: Product;
  private router = inject(Router);

  navigateToDetail() {
    this.router.navigate(['/product', this.product.id]);
  }
}