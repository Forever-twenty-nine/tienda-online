import type { Routes } from '@angular/router';
import { AdminProducts } from './admin-products/admin-products';
import { ProductForm } from './product-form/product-form';
import { AdminCategories } from './admin-categories/admin-categories';
import { AdminDashboard } from './dashboard/dashboard';
import { AdminContact } from './admin-contact/admin-contact';

export const adminRoutes: Routes = [
  { path: '', component: AdminDashboard },
  { path: 'products', component: AdminProducts },
  { path: 'products/new', component: ProductForm },
  { path: 'products/:id', component: ProductForm },
  { path: 'categories', component: AdminCategories },
  { path: 'contact', component: AdminContact }
];
