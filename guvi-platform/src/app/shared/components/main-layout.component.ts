import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  sidebarCollapsed = false;
  mobileMenuOpen = false;

  goToSection(sectionId: string) {
    // Navigate to admin route, then scroll to element after navigation completes
    this.router.navigate(['/admin']).then(() => {
      // Small timeout to allow view to render
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    });
    // close mobile menu if open
    this.mobileMenuOpen = false;
  }
}
