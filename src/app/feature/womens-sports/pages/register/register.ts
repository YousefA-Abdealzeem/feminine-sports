import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPass = false;
  showConfirm = false;
  loading = false;

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  registerUser() {

    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      alert("من فضلك أكمل جميع البيانات");
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert("كلمة المرور غير متطابقة");
      return;
    }

    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      alert("تم إنشاء الحساب بنجاح");
      this.router.navigate(['/login']);
    }, 1500);
  }
}