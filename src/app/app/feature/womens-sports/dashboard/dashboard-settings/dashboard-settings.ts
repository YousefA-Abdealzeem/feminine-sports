import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { API_BASE } from 'app/core/services/api';
import { AuthService } from 'app/core/services/auth';

@Component({
  selector: 'app-dashboard-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // ✅ شيل HttpClientModule
  ],
  templateUrl: './dashboard-settings.html',
  styleUrls: ['./dashboard-settings.css']
})
export class DashboardSettings implements OnInit {

  @ViewChild('avatarInput')
  avatarInput!: ElementRef<HTMLInputElement>;

  loading = false;
  saved = false;

  passError = '';
  passSuccess = '';

  showOld = false;
  showNew = false;
  showConf = false;

  selectedFile: File | null = null;

  form = {
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  };

  passForm = {
    old: '',
    new: '',
    confirm: ''
  };

  settings = {
    hateSpeechFilter: true,
    autoSuspend: true,
    allowComments: true
  };

  constructor(private http: HttpClient, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      Authorization: `Bearer ${token}`
    });
  }

  ngOnInit(): void {

    this.http.get<any>(
      `${API_BASE}/Profile`,
      { headers: this.headers }
    )
    .pipe(
      catchError(() => of(null))
    )
    .subscribe((res) => {

      console.log('API Response:', res); // ← اشيل السطر ده بعد ما تعرف الأسماء

      if (!res) return;

      this.form.name   = res.name ?? res.username ?? '';
      this.form.email  = res.email ?? res.emailAddress ?? res.Email ?? '';
      this.form.phone  = res.phone ?? res.phoneNumber ?? res.Phone ?? '';
      this.form.bio    = res.bio ?? '';
      this.form.avatar = res.profileImageUrl ?? '';
    });
  }

  triggerAvatarInput(): void {
    this.avatarInput?.nativeElement.click();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.form.avatar = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

saveProfile(): void {

  this.loading = true;
  this.saved = false;

  const formData = new FormData();

  formData.append('Username', this.form.name);
  formData.append('Bio', this.form.bio);

  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }

  this.http.put<any>(
    `${API_BASE}/Profile`,
    formData,
    { headers: this.headers }
  )
  .pipe(
    catchError(() => {

      this.loading = false;

      return of(null);
    })
  )
  .subscribe(res => {

    this.loading = false;

    if (!res) return;

    this.saved = true;
    this.selectedFile = null;

    const newAvatar =
      res?.profileImageUrl ||
      res?.ProfileImageUrl;

    if (newAvatar) {

      this.form.avatar = newAvatar;

      this.authService.updateCurrentUser({
        avatar: newAvatar,
        name: this.form.name
      });

    } else {

      this.authService.updateCurrentUser({
        name: this.form.name
      });
    }

    this.cdr.detectChanges();

    setTimeout(() => {

      this.saved = false;
      this.cdr.detectChanges();

    }, 2000);
  });
}

  changePassword(): void {

    this.passError = '';
    this.passSuccess = '';

    if (!this.passForm.old) {
      this.passError = 'أدخل كلمة المرور الحالية';
      return;
    }

    if (this.passForm.new.length < 8) {
      this.passError = 'كلمة المرور 8 أحرف على الأقل';
      return;
    }

    if (this.passForm.new !== this.passForm.confirm) {
      this.passError = 'كلمتا المرور غير متطابقتين';
      return;
    }

    const body = {
      oldPassword: this.passForm.old,
      newPassword: this.passForm.new,
      confirmPassword: this.passForm.confirm
    };

    this.http.post(
      `${API_BASE}/Profile/change-password`,
      body,
      { headers: this.headers }
    )
    .pipe(
      catchError((err) => {

        this.passError =
          err?.error?.message ||
          err?.error?.Message ||
          'حدث خطأ، حاول مرة أخرى';

        return of(null);
      })
    )
    .subscribe((res) => {

      if (res !== null) {

        this.passSuccess = 'تم تغيير كلمة المرور بنجاح';

        this.passForm = {
          old: '',
          new: '',
          confirm: ''
        };

        setTimeout(() => {
          this.passSuccess = '';
        }, 3000);
      }
    });
  }
}