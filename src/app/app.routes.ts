import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Admin } from './admin/admin/admin';
import { AboutComponent } from './pages/about/about';
import { TermsComponent } from './pages/terms/terms';
import { PrivacyComponent } from './pages/privacy/privacy';
import { ReturnsComponent } from './pages/returns/returns';
import { ProductDetailComponent } from './pages/product-detail/product-detail';
import { adminRoutes } from './admin/admin-routing';
import { AdminGuard } from './guards/admin.guard';
import { LayoutComponent } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: Home },
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'about', component: AboutComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'returns', component: ReturnsComponent },
    ]
  },
  { path: 'admin', component: Admin, canActivate: [AdminGuard], children: adminRoutes },
];
