import { Routes } from '@angular/router';

import { Home } from './modules/public/home/home';
import { CatalogComponent } from './modules/public/catalog/catalog';
import { AboutComponent } from './modules/public/about/about';
import { TermsComponent } from './modules/public/terms/terms';
import { PrivacyComponent } from './modules/public/privacy/privacy';
import { ReturnsComponent } from './modules/public/returns/returns';
import { ProductDetailComponent } from './modules/public/product-detail/product-detail';
import { adminRoutes } from './modules/admin/admin-routing';
import { AdminGuard } from './core/guards/admin.guard';
import { PublicLayoutComponent } from './modules/shared/layouts/public/layout';
import { AdminLayoutComponent } from './modules/shared/layouts/admin/layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: Home },
      { path: 'catalogo', component: CatalogComponent },
      { path: 'product/:slug', component: ProductDetailComponent },
      { path: 'about', component: AboutComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'returns', component: ReturnsComponent },
    ]
  },
  { 
    path: 'admin', 
    component: AdminLayoutComponent, 
    canActivate: [AdminGuard], 
    children: adminRoutes 
  },
];
