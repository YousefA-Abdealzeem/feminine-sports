import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private users = signal([
    { email: 'sara@example.com',   password: 'sara123',     name: 'سارة أحمد' },
    { email: 'nour@example.com',   password: 'nour123',     name: 'نور محمد'  },
    { email: 'admin@herpower.com', password: 'herpower123', name: 'Admin'     },
    { email: 'mona@example.com',   password: 'mona123',     name: 'منى خالد'  },
    { email: 'reem@example.com',   password: 'reem123',     name: 'ريم علي'   },
  ]);

  private resetEmail = '';
  private resetCode  = '';
  private codeExpiry = 0;

  /**
   * في بيئة التطوير: أي إيميل بصيغة صحيحة يعدي
   * في الـ production: اشيل السطر ده واعتمد على الـ backend
   */
  emailExists(email: string): boolean {
    const knownUser = this.users().some(u => u.email.toLowerCase() === email.toLowerCase());
    if (knownUser) return true;

    // DEV MODE: أي إيميل بصيغة صحيحة يُقبل
    const isDev = true; // غيّرها لـ false في الـ production
    return isDev && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  sendResetCode(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetEmail = email.toLowerCase();
    this.resetCode  = code;
    this.codeExpiry = Date.now() + 10 * 60 * 1000; // 10 دقايق
    console.log(`[Dev] Reset code for ${email}: ${code}`);
    return code; // بيرجع للـ UI عشان يعرضه في DEV
  }

  verifyCode(email: string, code: string): boolean {
    return (
      email.toLowerCase() === this.resetEmail &&
      code === this.resetCode &&
      Date.now() < this.codeExpiry
    );
  }

  resetPassword(email: string, newPassword: string): void {
    // يحدّث لو الإيميل موجود فعلاً
    this.users.update(users =>
      users.map(u => u.email.toLowerCase() === email.toLowerCase()
        ? { ...u, password: newPassword }
        : u
      )
    );
    // يصفّر الـ session
    this.resetEmail = '';
    this.resetCode  = '';
    this.codeExpiry = 0;
  }

  login(email: string, password: string): boolean {
    return this.users().some(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
  }
}
