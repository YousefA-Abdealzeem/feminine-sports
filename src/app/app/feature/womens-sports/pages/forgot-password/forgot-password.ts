import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from 'app/core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnDestroy {
devCode: string = '';

  step = 1;
  loading = false;

  email      = '';
  emailError = '';

  // الـ API بيبعت token مش OTP — هنحفظه
  resetToken = '';
  digits: string[] = ['', '', '', '', '', ''];
  codeError = '';

  timer = 60;
  newPass  = '';
  confPass = '';
  passError = '';
  showNew  = false;
  showConf = false;
  serverError = '';

  private timerRef: any;

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnDestroy() { clearInterval(this.timerRef); }

  sendCode(): void {
    this.emailError = '';
    this.serverError = '';
    if (!this.email) { this.emailError = 'البريد مطلوب'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'صيغة البريد غير صحيحة'; return;
    }
    this.loading = true;
    this.cdr.detectChanges();
    this.auth.sendResetCode(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.resetToken = res?.token || res?.Token || res?.resetToken || '';
        this.step = 2;
        this.startTimer();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.emailError = err?.error?.message || err?.error?.Message || 'هذا البريد غير مسجل';
        this.cdr.detectChanges();
      }
    });
  }

  onInput(e: Event, i: number): void {
    const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
    this.digits[i] = v;
    (e.target as HTMLInputElement).value = v;
    this.codeError = '';
    if (v && i < 5) setTimeout(() => document.getElementById(`fp-box-${i + 1}`)?.focus(), 0);
  }

  onKey(e: KeyboardEvent, i: number): void {
    if (e.key === 'Backspace' && !this.digits[i] && i > 0)
      setTimeout(() => document.getElementById(`fp-box-${i - 1}`)?.focus(), 0);
  }

  onPaste(e: ClipboardEvent): void {
    const t = e.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) || '';
    if (t.length === 6) { this.digits = t.split(''); e.preventDefault(); this.cdr.detectChanges(); }
  }

  verify(): void {
    const otp = this.digits.join('');
    if (otp.length < 6) { this.codeError = 'أدخل الكود كاملاً'; return; }
    this.loading = true;
    this.codeError = '';
    this.cdr.detectChanges();
    this.auth.verifyOtp(this.email, otp).subscribe({
      next: () => {
        this.loading = false;
        this.resetToken = otp;
        this.step = 3;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.codeError = err?.error?.message || err?.error?.Message || 'الكود غير صحيح أو منتهي الصلاحية';
        this.cdr.detectChanges();
      }
    });
  }

  startTimer(): void {
    this.timer = 60;
    clearInterval(this.timerRef);
    this.timerRef = setInterval(() => {
      if (this.timer > 0) { this.timer--; this.cdr.detectChanges(); }
      else clearInterval(this.timerRef);
    }, 1000);
  }

  resend(): void {
    this.auth.sendResetCode(this.email).subscribe({
      next: (res: any) => {
        this.resetToken = res?.token || res?.Token || res?.resetToken || '';
        this.digits = ['', '', '', '', '', ''];
        this.codeError = '';
        this.startTimer();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  resetPass(): void {
    this.passError = '';
    this.serverError = '';
    if (this.newPass.length < 8) { this.passError = 'كلمة المرور 8 أحرف على الأقل'; return; }
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/.test(this.newPass)) {
      this.passError = 'يجب أن تحتوي على حرف كبير، رقم، ورمز'; return;
    }
    if (this.newPass !== this.confPass) { this.passError = 'كلمتا المرور غير متطابقتين'; return; }
    this.loading = true;
    this.cdr.detectChanges();
    const token = this.resetToken || this.digits.join('');
    this.auth.resetPassword(this.email, token, this.newPass).subscribe({
      next: () => { this.loading = false; this.step = 4; this.cdr.detectChanges(); },
      error: (err) => {
        this.loading = false;
        this.passError = err?.error?.message || err?.error?.Message || 'حدث خطأ، حاول مرة أخرى';
        this.cdr.detectChanges();
      }
    });
  }

  get sPct(): number {
    let s = 0; const p = this.newPass;
    if (p.length >= 6) s += 25; if (p.length >= 10) s += 25;
    if (/[A-Z]/.test(p)) s += 25; if (/[0-9!@#$%^&*]/.test(p)) s += 25;
    return s;
  }
  get sCls(): string { return (['','weak','fair','good','strong'][[0,25,50,75,100].findIndex(v => this.sPct <= v)] || 'strong'); }
  get sLbl(): string { return ({ weak:'ضعيفة', fair:'مقبولة', good:'جيدة', strong:'قوية' } as any)[this.sCls] || ''; }
}
