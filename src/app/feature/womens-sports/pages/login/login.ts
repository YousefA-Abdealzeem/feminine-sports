import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'app/core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = ''; password = ''; showPassword = false; loading = false;
  errorMsg = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword() { this.showPassword = !this.showPassword; }

  login() {
    if (!this.email || !this.password) { alert('من فضلك أدخل البيانات'); return; }
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.cdr.detectChanges();
        // تحقق لو الـ user متحظر من الـ response
        const isBanned    = res?.isBanned || res?.IsBanned || false;
        const isSuspended = res?.isSuspended || res?.IsSuspended || false;
        if (isBanned) {
          this.errorMsg = 'تم حظر حسابك. يرجى التواصل مع الإدارة.';
          this.auth.logout();
          this.cdr.detectChanges();
          return;
        }
        if (isSuspended) {
          const until = res?.bannedUntil || res?.suspendedUntil || '';
          const days = until ? Math.ceil((new Date(until).getTime() - Date.now()) / 86400000) : 0;
          this.errorMsg = `حسابك موقف لمدة ${days} يوم.`;
          this.auth.logout();
          this.cdr.detectChanges();
          return;
        }
        this.router.navigate(['/hero']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.Message || '';
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('ban') || lowerMsg.includes('حظر')) {
          this.errorMsg = 'تم حظر حسابك. يرجى التواصل مع الإدارة.';
        } else if (lowerMsg.includes('suspend') || lowerMsg.includes('موقف')) {
          this.errorMsg = 'حسابك موقف مؤقتاً. حاول لاحقاً.';
        } else {
          this.errorMsg = msg || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        }
        this.cdr.detectChanges();
      }
    });
  }

  goRegister() { this.router.navigate(['/register']); }
}
