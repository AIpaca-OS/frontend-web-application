import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private readonly router = inject(Router);

  selectedRole: 'tutor' | 'driver' = 'tutor';
  language = 'ES';

  selectRole(role: 'tutor' | 'driver'): void {
    this.selectedRole = role;
  }

  redirect() {
    if (this.selectedRole === 'tutor') {
      this.router.navigate(['/tutor']).then();
    }
    if (this.selectedRole === 'driver') {
      this.router.navigate(['/driver']).then();
    }
  }

  toggleLanguage(): void {
    this.language = this.language === 'ES' ? 'EN' : 'ES';
  }
}
