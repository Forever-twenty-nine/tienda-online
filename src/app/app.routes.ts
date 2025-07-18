import { Routes } from '@angular/router';
import { Home} from './pages/home/home';
import { Admin } from './admin/admin/admin';
import { adminRoutes } from './admin/admin-routing';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'admin', component: Admin, children: adminRoutes},
];
