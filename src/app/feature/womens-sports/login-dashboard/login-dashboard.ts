import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-dashboard.html',
  styleUrl: './login-dashboard.css',
})
export class LoginDashboard {
  email = '';
  password = '';
  showPass = false;
  isLoading = false;
  emailError = false;
  passwordError = false;
  wrongCreds = false;

  // بيانات الأدمن الافتراضية
  private readonly ADMIN_EMAIL = 'admin@herpower.com';
  private readonly ADMIN_PASS = 'herpower123';

  constructor(private router: Router) {}

  onLogin(): void {
    this.emailError = !this.email;
    this.passwordError = !this.password;
    this.wrongCreds = false;

    if (this.emailError || this.passwordError) return;

    this.isLoading = true;

    setTimeout(() => {
      if (this.email === this.ADMIN_EMAIL && this.password === this.ADMIN_PASS) {
        localStorage.setItem('isAdmin', 'true');
        this.router.navigate(['/dashboard']);
      } else {
        this.wrongCreds = true;
        this.isLoading = false;
      }
    }, 1200);
  }
}
