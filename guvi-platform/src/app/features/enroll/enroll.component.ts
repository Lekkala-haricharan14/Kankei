import { Component, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
    this.cdr.detectChanges(); // Force UI update to show loading state
    console.log('📤 Calling auth.register...');

    this.auth.register(
      this.clientForm.name,
      this.clientForm.email,
      this.clientForm.password,
      'Client',
      {
        companyName: this.clientForm.companyName,
        companySize: this.clientForm.companySize,
        industry: this.clientForm.industry
      }
    ).subscribe({
      next: (response) => {
        console.log('✅ Registration next callback:', response);
        console.log('📋 Response message:', response.message);
        console.log('📋 Response user:', response.user);
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update to hide loading state

        // Defer success message to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.successMessage = response.message || 'Registration successful. Please wait for admin approval before logging in.';
          console.log('✅ Success message set to:', this.successMessage);
          this.cdr.detectChanges(); // Force change detection after setting message
          this.clientForm = {
            name: '', email: '', password: '', confirmPassword: '',
            companyName: '', companySize: '', industry: '', acceptTerms: false
          };
        }, 0);
      },
      error: (err) => {
        console.log('❌ Registration error callback:', err);
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update on error
        this.handleError(err);
      },
      complete: () => {
        console.log('✔️ Registration observable completed');
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
    this.cdr.detectChanges();

    this.auth.register(
      this.trainerForm.name,
      this.trainerForm.email,
      this.trainerForm.password,
      'Trainer',
      {
        phone: this.trainerForm.phone,
        experience: this.trainerForm.experience,
        expertise: this.trainerForm.expertise
      }
    ).subscribe({
      next: (response) => {
        console.log('✅ Trainer Registration next callback:', response);
        console.log('📋 Trainer Response message:', response.message);
        this.isLoading = false;
        this.cdr.detectChanges();

        // Defer success message to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.successMessage = response.message || 'Registration successful. Please wait for admin approval before logging in.';
          console.log('✅ Trainer Success message set to:', this.successMessage);
          this.cdr.detectChanges(); // Force change detection after setting message
          this.trainerForm = {
            name: '', email: '', password: '', confirmPassword: '',
            phone: '', experience: '', expertise: '', acceptTerms: false
          };
        }, 0);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
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
