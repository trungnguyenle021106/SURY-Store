import { Routes } from '@angular/router';
import { CatalogComponent } from './catalog.component';

export const CATALOG_ROUTES: Routes = [
    { path: '', component: CatalogComponent },
    {
        path: ':id',
        loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent)
    }
];