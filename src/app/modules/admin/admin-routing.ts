import type { Routes } from '@angular/router';
import { AdminProducts } from './admin-products/admin-products';
import { ProductForm } from './product-form/product-form';
import { AdminCategories } from './admin-categories/admin-categories';
import { AdminDashboard } from './dashboard/dashboard';
import { AdminContact } from './admin-contact/admin-contact';
import { AdminLegalComponent } from './admin-legal/admin-legal';

export const adminRoutes: Routes = [
  { path: '', component: AdminDashboard },
  { path: 'products', component: AdminProducts },
  { path: 'products/new', component: ProductForm },
  { path: 'products/:id', component: ProductForm },
  { path: 'categories', component: AdminCategories },
  { path: 'contact', component: AdminContact },
  { path: 'terms', component: AdminLegalComponent, data: { type: 'terms' } },
  { path: 'privacy', component: AdminLegalComponent, data: { type: 'privacy' } },
  { path: 'returns', component: AdminLegalComponent, data: { type: 'returns' } },
  { path: 'about', component: AdminLegalComponent, data: { type: 'about' } }
];
