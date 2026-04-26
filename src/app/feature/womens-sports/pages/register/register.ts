import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initRegisterForm();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  initRegisterForm() {
    const regForm = document.querySelector('.card form') as HTMLFormElement;

    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const inputs = regForm.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        const fullName = inputs[0].value;
        const email = inputs[1].value;
        const pass = inputs[2].value;
        const confirmPass = inputs[3].value;

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
    }
  }
}