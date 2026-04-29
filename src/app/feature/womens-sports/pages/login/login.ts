import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = ''; password = ''; showPassword = false; loading = false;

  constructor(private router: Router) {}

  togglePassword() { this.showPassword = !this.showPassword; }

  login() {
    if (!this.email || !this.password) { alert('من فضلك أدخل البيانات'); return; }
    this.loading = true;
    setTimeout(() => { this.loading = false; this.router.navigate(['/hero']); }, 1500);
  }

  goRegister() { this.router.navigate(['/register']); }
}
