import { Route } from '@angular/router';
import { authGuard } from './auth/auth-guard';

export const appRoutes: Route[] = [
    {
        path: 'login',
        loadComponent: () => import('./auth/login').then((m) => m.LoginComponent),
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent),
    },
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
