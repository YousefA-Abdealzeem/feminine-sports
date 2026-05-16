import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { API_BASE } from 'app/core/services/api';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {

  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  submit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.form.name || !this.form.email || !this.form.subject || !this.form.message) {
      this.errorMsg = 'من فضلك أكمل جميع البيانات';
      return;
    }

    if (this.form.message.length < 10) {
      this.errorMsg = 'الرسالة يجب أن تكون 10 أحرف على الأقل';
      return;
    }

    this.loading = true;

    this.http.post(`${API_BASE}/Contact`, this.form).pipe(
      catchError(err => {
        this.loading = false;
        this.errorMsg =
          err?.error?.message ||
          err?.error?.Message ||
          'حدث خطأ، حاول مرة أخرى';
        return of(null);
      })
    ).subscribe(res => {
      if (res !== null) {
        this.loading = false;

        this.successMsg = 'تم إرسال رسالتك بنجاح، سنرد عليك قريباً!';
        this.errorMsg = '';

        this.form = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };

        setTimeout(() => {
          this.successMsg = '';
        }, 4000);
      }
    });
  }
}