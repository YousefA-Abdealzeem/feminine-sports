import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {

  constructor(private router: Router) {}

  ngAfterViewInit(): void {

    // Login
    const loginForm = document.querySelector('.login-card form') as HTMLFormElement;

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = (loginForm.querySelector('input[type="email"]') as HTMLInputElement)?.value;
        const password = (loginForm.querySelector('input[type="password"]') as HTMLInputElement)?.value;

        if (!email || !password) {
          alert("من فضلك أدخل البريد الإلكتروني وكلمة المرور");
        } else {
          alert("تم تسجيل الدخول بنجاح!");
          this.router.navigate(['/hero']);
        }
      });

      const goToReg = document.querySelector('.register span') as HTMLElement;
      if (goToReg) {
        goToReg.onclick = () => this.router.navigate(['/register']);
      }
    }

    // Register (لو نفس الصفحة فيها)
    const regForm = document.querySelector('.card form') as HTMLFormElement;

    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = regForm.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        const fullName = inputs[0]?.value;
        const email = inputs[1]?.value;
        const pass = inputs[2]?.value;
        const confirmPass = inputs[3]?.value;

        if (!fullName || !email || !pass) {
          alert("من فضلك أكمل جميع البيانات");
          return;
        }

        if (pass !== confirmPass) {
          alert("كلمة المرور غير متطابقة");
          return;
        }

        alert("تم إنشاء الحساب بنجاح");
        this.router.navigate(['/login']);
      });

      const goToLog = document.querySelector('.login span') as HTMLElement;
      if (goToLog) {
        goToLog.onclick = () => this.router.navigate(['/login']);
      }
    }
  }
}