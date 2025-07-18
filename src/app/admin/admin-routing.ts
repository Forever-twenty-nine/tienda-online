import type { Routes } from '@angular/router';
import { AdminProducts } from './admin-products/admin-products';
import { ProductForm } from './product-form/product-form';

export const adminRoutes: Routes = [
  { path: 'products', component: AdminProducts },
  { path: 'products/new', component: ProductForm },
  { path: 'products/:id', component: ProductForm }
];
