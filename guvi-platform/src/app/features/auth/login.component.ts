import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  emailError = '';
  passwordError = '';

  validateForm(): boolean {
    this.emailError = '';
    this.passwordError = '';
    let isValid = true;

    if (!this.email) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.email.includes('@')) {
      this.emailError = 'Please enter a valid email';
      isValid = false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    }

    return isValid;
  }

  onLogin() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.log('Login error:', err);
        // Handle different error response formats
        if (err.error && typeof err.error === 'object' && err.error.error) {
          this.errorMessage = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check if the backend is running.';
        } else {
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      }
    });
  }

  quickLogin(email: string, password: string) {
    this.email = email;
    this.password = password;
    this.emailError = '';
    this.passwordError = '';
    this.onLogin();
  }
}
