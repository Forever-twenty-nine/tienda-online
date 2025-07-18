import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage, CurrencyPipe],      
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.html'
})
export class ProductCard {
  @Input() product!: Product;  
}