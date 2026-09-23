import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('hoverAnimation', [
      state('initial', style({
        transform: 'translateY(0)',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)'
      })),
      state('hovered', style({
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px 0 rgb(0 0 0 / 0.08)'
      })),
      transition('initial <=> hovered', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class ProductCard {
  product = input.required<Product>();
  hoverState = 'initial'; // Estado para la animación de hover
}
