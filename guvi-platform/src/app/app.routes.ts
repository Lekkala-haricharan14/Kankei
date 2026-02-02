import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Public Pages
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'enroll',
        loadComponent: () => import('./features/enroll/enroll.component').then(m => m.EnrollComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },

    // Protected Routes - Admin
    {
        path: 'admin',
        loadComponent: () => import('./shared/components/main-layout.component').then(m => m.MainLayoutComponent),
        canActivate: [authGuard, roleGuard(['Admin'])],
        children: [
            { path: '', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) }
        ]
    },

    // Protected Routes - Trainer
    {
        path: 'trainer',
        loadComponent: () => import('./shared/components/main-layout.component').then(m => m.MainLayoutComponent),
        canActivate: [authGuard, roleGuard(['Trainer'])],
        children: [
            { path: '', loadComponent: () => import('./features/trainer/trainer-dashboard.component').then(m => m.TrainerDashboardComponent) }
        ]
    },

    // Protected Routes - Client
    {
        path: 'client',
        loadComponent: () => import('./shared/components/main-layout.component').then(m => m.MainLayoutComponent),
        canActivate: [authGuard, roleGuard(['Client'])],
        children: [
            { path: '', loadComponent: () => import('./features/client/client-dashboard.component').then(m => m.ClientDashboardComponent) }
        ]
    },

    // Fallback
    { path: '**', redirectTo: '' }
];
