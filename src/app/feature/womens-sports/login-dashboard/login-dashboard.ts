import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'app/core/services/auth';

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
  errorMsg = '';

  constructor(private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  onLogin(): void {
    this.emailError = !this.email;
    this.passwordError = !this.password;
    this.wrongCreds = false;
    this.errorMsg = '';
    this.cdr.detectChanges();

    if (this.emailError || this.passwordError) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    this.auth.adminLogin(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.wrongCreds = true;
        this.errorMsg = err?.message === 'no_admin'
          ? 'ليس لديك صلاحيات الأدمن'
          : (err?.error?.message || err?.error?.Message || 'البريد أو كلمة المرور غير صحيحة');
        this.cdr.detectChanges();
      }
    });
  }
}
