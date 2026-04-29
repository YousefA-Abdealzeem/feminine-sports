import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from 'app/core/services/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword implements OnDestroy {
  step = 1; loading = false;
  email = ''; emailError = ''; devCode = '';
  digits: string[] = ['','','','','',''];
  codeError = ''; timer = 60;
  newPass = ''; confPass = ''; passError = '';
  showNew = false; showConf = false;
  private timerRef: any;

  constructor(private auth: AuthService) {}
  ngOnDestroy() { clearInterval(this.timerRef); }

  sendCode(): void {
    this.emailError = '';
    if (!this.email) { this.emailError = 'البريد مطلوب'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) { this.emailError = 'صيغة البريد غير صحيحة'; return; }
    if (!this.auth.emailExists(this.email)) { this.emailError = 'هذا البريد غير مسجل'; return; }
    this.loading = true;
    setTimeout(() => { this.devCode = this.auth.sendResetCode(this.email); this.loading = false; this.step = 2; this.startTimer(); }, 1200);
  }

  onInput(e: Event, i: number): void {
    const v = (e.target as HTMLInputElement).value.replace(/\D/g,'').slice(-1);
    this.digits[i] = v; (e.target as HTMLInputElement).value = v;
    this.codeError = '';
    if (v && i < 5) setTimeout(() => document.getElementById(`fp-box-${i+1}`)?.focus(), 0);
  }
  onKey(e: KeyboardEvent, i: number): void {
    if (e.key === 'Backspace' && !this.digits[i] && i > 0) setTimeout(() => document.getElementById(`fp-box-${i-1}`)?.focus(), 0);
  }
  onPaste(e: ClipboardEvent): void {
    const t = e.clipboardData?.getData('text')?.replace(/\D/g,'').slice(0,6) || '';
    if (t.length === 6) { this.digits = t.split(''); e.preventDefault(); }
  }

  verify(): void {
    this.codeError = '';
    if (this.digits.join('').length < 6) { this.codeError = 'أدخل الكود كاملاً'; return; }
    this.loading = true;
    setTimeout(() => {
      if (this.auth.verifyCode(this.email, this.digits.join(''))) { this.step = 3; }
      else { this.codeError = 'الكود غير صحيح أو منتهي الصلاحية'; }
      this.loading = false;
    }, 900);
  }

  startTimer(): void {
    this.timer = 60; clearInterval(this.timerRef);
    this.timerRef = setInterval(() => { if (this.timer > 0) this.timer--; else clearInterval(this.timerRef); }, 1000);
  }
  resend(): void { this.devCode = this.auth.sendResetCode(this.email); this.digits = ['','','','','','']; this.codeError = ''; this.startTimer(); }

  get sPct(): number {
    let s = 0, p = this.newPass;
    if (p.length >= 6) s += 25; if (p.length >= 10) s += 25;
    if (/[A-Z]/.test(p)||/[\u0600-\u06FF]/.test(p)) s += 25;
    if (/[0-9!@#$%^&*]/.test(p)) s += 25;
    return s;
  }
  get sCls(): string { return ['','weak','fair','good','strong'][[0,25,50,75,100].findIndex(v=>this.sPct<=v)] || 'strong'; }
  get sLbl(): string { return ({weak:'ضعيفة',fair:'مقبولة',good:'جيدة',strong:'قوية'} as any)[this.sCls]||''; }

  resetPass(): void {
    this.passError = '';
    if (this.newPass.length < 6) { this.passError = 'كلمة المرور 6 أحرف على الأقل'; return; }
    if (this.newPass !== this.confPass) { this.passError = 'كلمتا المرور غير متطابقتين'; return; }
    this.loading = true;
    setTimeout(() => { this.auth.resetPassword(this.email, this.newPass); this.step = 4; this.loading = false; }, 1000);
  }
}
