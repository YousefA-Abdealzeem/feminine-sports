import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'app/core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userName        = '';
  email           = '';
  password        = '';
  confirmPassword = '';
  showPass        = false;
  showConfirm     = false;
  loading         = false;
  errorMsg        = '';
  successMsg      = '';

  constructor(private router: Router, private auth: AuthService) {}

  goToLogin() { this.router.navigate(['/login']); }

  registerUser() {
    this.errorMsg   = '';
    this.successMsg = '';

    if (!this.userName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMsg = 'من فضلك أكمل جميع البيانات'; return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'كلمة المرور غير متطابقة'; return;
    }
    if (this.userName.length < 3) {
      this.errorMsg = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'; return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/.test(this.password)) {
      this.errorMsg = 'كلمة المرور يجب أن تحتوي على حرف كبير، رقم، ورمز (!@#$...)'; return;
    }

    this.loading = true;

    this.auth.register(this.userName, this.email, this.password, this.confirmPassword).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;

        // الـ API بيرجع plain text "Registration successful" فـ Angular بيحطه في error block
        if (typeof err?.error === 'string' && err.error.toLowerCase().includes('successful')) {
          this.successMsg = 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.';
          setTimeout(() => this.router.navigate(['/login']), 1500);
          return;
        }

        const errBody = err?.error;
        if (errBody?.errors) {
          const messages = Object.values(errBody.errors).flat() as string[];
          this.errorMsg = messages.join(' | ');
        } else {
          this.errorMsg =
            errBody?.message ||
            errBody?.Message ||
            errBody?.title   ||
            (typeof errBody === 'string' ? errBody : 'حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى');
        }
      }
    });
  }
}