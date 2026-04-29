import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private users = signal([
    { email: 'sara@example.com',   password: 'sara123',     name: 'سارة أحمد' },
    { email: 'nour@example.com',   password: 'nour123',     name: 'نور محمد'  },
    { email: 'admin@herpower.com', password: 'herpower123', name: 'Admin'     },
  ]);

  private resetEmail = '';
  private resetCode  = '';
  private codeExpiry = 0;

  emailExists(email: string): boolean {
    return this.users().some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  sendResetCode(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetEmail = email.toLowerCase();
    this.resetCode  = code;
    this.codeExpiry = Date.now() + 10 * 60 * 1000;
    console.log(`[Dev] Reset code for ${email}: ${code}`);
    return code;
  }

  verifyCode(email: string, code: string): boolean {
    return email.toLowerCase() === this.resetEmail &&
           code === this.resetCode &&
           Date.now() < this.codeExpiry;
  }

  resetPassword(email: string, newPassword: string): void {
    this.users.update(users =>
      users.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u)
    );
    this.resetEmail = ''; this.resetCode = ''; this.codeExpiry = 0;
  }
}
