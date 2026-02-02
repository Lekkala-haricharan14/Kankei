import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-enroll',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './enroll.component.html',
  styleUrl: './enroll.component.css'
})
export class EnrollComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  activeTab: 'client' | 'trainer' = 'client';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  clientForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companySize: '',
    industry: '',
    acceptTerms: false
  };

  trainerForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    experience: '',
    expertise: '',
    acceptTerms: false
  };

  registerClient() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.clientForm.name || !this.clientForm.email || !this.clientForm.password || !this.clientForm.companyName) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    if (this.clientForm.password !== this.clientForm.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }
    if (!this.clientForm.acceptTerms) {
      this.errorMessage = 'Please accept the terms and conditions to continue';
      return;
    }

    this.isLoading = true;
    // Note: Additional fields like companyName are not currently passed to auth service
    this.auth.register(this.clientForm.name, this.clientForm.email, this.clientForm.password, 'Client')
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Your account has been created successfully. You can now login.';
          this.clientForm = {
            name: '', email: '', password: '', confirmPassword: '',
            companyName: '', companySize: '', industry: '', acceptTerms: false
          };
        },
        error: (err) => {
          this.isLoading = false;
          this.handleError(err);
        }
      });
  }

  registerTrainer() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.trainerForm.name || !this.trainerForm.email || !this.trainerForm.password || !this.trainerForm.expertise) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    if (this.trainerForm.password !== this.trainerForm.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }
    if (this.trainerForm.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }
    if (!this.trainerForm.acceptTerms) {
      this.errorMessage = 'Please accept the terms and conditions to continue';
      return;
    }

    this.isLoading = true;
    this.auth.register(this.trainerForm.name, this.trainerForm.email, this.trainerForm.password, 'Trainer')
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Your account has been created successfully. You can now login.';
          this.trainerForm = {
            name: '', email: '', password: '', confirmPassword: '',
            phone: '', experience: '', expertise: '', acceptTerms: false
          };
        },
        error: (err) => {
          this.isLoading = false;
          this.handleError(err);
        }
      });
  }

  private handleError(err: any) {
    console.log('Registration error:', err);
    if (err.error && typeof err.error === 'object' && err.error.error) {
      this.errorMessage = err.error.error;
    } else if (err.status === 400) {
      this.errorMessage = 'Email already registered or invalid data provided.';
    } else if (err.status === 0) {
      this.errorMessage = 'Unable to connect to server.';
    } else {
      this.errorMessage = 'Registration failed. Please try again.';
    }
  }
}
