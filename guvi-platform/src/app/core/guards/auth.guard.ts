import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn()) {
        return true;
    }

    // Redirect to login if not authenticated
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
    return (route, state) => {
        const auth = inject(AuthService);
        const router = inject(Router);

        if (!auth.isLoggedIn()) {
            router.navigate(['/login']);
            return false;
        }

        const userRole = auth.currentUser()?.role;
        if (userRole && allowedRoles.includes(userRole)) {
            return true;
        }

        // Redirect to appropriate dashboard if wrong role
        if (userRole === 'Admin') router.navigate(['/admin']);
        else if (userRole === 'Trainer') router.navigate(['/trainer']);
        else if (userRole === 'Client') router.navigate(['/client']);
        else router.navigate(['/login']);

        return false;
    };
};

// Guard to prevent logged-in users from accessing login/enroll pages
export const guestGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
        return true;
    }

    // Redirect to appropriate dashboard if already logged in
    const userRole = auth.currentUser()?.role;
    if (userRole === 'Admin') router.navigate(['/admin']);
    else if (userRole === 'Trainer') router.navigate(['/trainer']);
    else if (userRole === 'Client') router.navigate(['/client']);

    return false;
};
