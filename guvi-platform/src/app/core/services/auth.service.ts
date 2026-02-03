import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, throwError } from 'rxjs';

export type Role = 'Admin' | 'Trainer' | 'Client';

export interface User {
    id: string;
    name: string;
    role: Role;
    email: string;
}

interface AuthResponse {
    user: User;
    token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSignal = signal<User | null>(null);
    private tokenSignal = signal<string | null>(null);

    readonly currentUser = this.currentUserSignal.asReadonly();
    readonly token = this.tokenSignal.asReadonly();
    readonly isLoggedIn = computed(() => !!this.currentUserSignal());
    readonly isClient = computed(() => this.currentUserSignal()?.role === 'Client');
    readonly isTrainer = computed(() => this.currentUserSignal()?.role === 'Trainer');
    readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'Admin');

    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient, private router: Router) {
        // Check local storage for persistence
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const storedUser = localStorage.getItem('kankei_user');
        const storedToken = localStorage.getItem('kankei_token');
        if (storedUser && storedToken) {
            try {
                this.currentUserSignal.set(JSON.parse(storedUser));
                this.tokenSignal.set(storedToken);
            } catch {
                this.clearStorage();
            }
        }
    }

    private saveToStorage(user: User, token: string) {
        localStorage.setItem('kankei_user', JSON.stringify(user));
        localStorage.setItem('kankei_token', token);
    }

    private clearStorage() {
        localStorage.removeItem('kankei_user');
        localStorage.removeItem('kankei_token');
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
            .pipe(
                tap(response => {
                    this.currentUserSignal.set(response.user);
                    this.tokenSignal.set(response.token);
                    this.saveToStorage(response.user, response.token);
                    this.redirectToDashboard(response.user.role);
                })
            );
    }

    register(
        name: string,
        email: string,
        password: string,
        role: Role,
        additionalFields?: {
            companyName?: string;
            companySize?: string;
            industry?: string;
            phone?: string;
            experience?: string;
            expertise?: string;
        }
    ): Observable<{ message: string; user: any }> {
        console.log('🔵 Registration request starting...', { name, email, role, additionalFields });

        const payload = { name, email, password, role, ...additionalFields };

        return this.http.post<{ message: string; user: any }>(`${this.apiUrl}/auth/register`, payload)
            .pipe(
                tap(response => console.log('✅ Registration successful:', response)),
                catchError((error: any) => {
                    console.error('❌ Registration error:', error);
                    return throwError(() => error);
                })
            );
    }

    logout() {
        this.currentUserSignal.set(null);
        this.tokenSignal.set(null);
        this.clearStorage();
        this.router.navigate(['/login']);
    }

    getAuthHeader(): { [key: string]: string } {
        const token = this.tokenSignal();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private redirectToDashboard(role: Role) {
        switch (role) {
            case 'Admin':
                this.router.navigate(['/admin']);
                break;
            case 'Trainer':
                this.router.navigate(['/trainer']);
                break;
            case 'Client':
                this.router.navigate(['/client']);
                break;
            default:
                this.router.navigate(['/']);
        }
    }
}
