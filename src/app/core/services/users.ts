import { Injectable, signal } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  joined: string;
  avatar: string;
  status: 'active' | 'suspended' | 'banned';
  suspendedUntil?: string;   // ISO date string
  violations: number;        // عدد مرات الكومنتات المسيئة
  bio?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {

  private _users = signal<User[]>([
    { id: 1, name: 'Admin HerPower', email: 'admin@herpower.com', role: 'admin',  joined: '2024-01-01', avatar: 'https://i.pravatar.cc/150?img=10', status: 'active',    violations: 0, bio: 'مشرف المنصة', phone: '01000000000' },
    { id: 2, name: 'سارة أحمد',      email: 'sara@example.com',  role: 'user',   joined: '2024-02-15', avatar: 'https://i.pravatar.cc/150?img=47', status: 'active',    violations: 1, bio: 'محبة الرياضة', phone: '01111111111' },
    { id: 3, name: 'منى خالد',       email: 'mona@example.com',  role: 'user',   joined: '2024-03-10', avatar: 'https://i.pravatar.cc/150?img=45', status: 'suspended', violations: 3, suspendedUntil: new Date(Date.now() + 2*24*60*60*1000).toISOString(), bio: '', phone: '' },
    { id: 4, name: 'نور محمد',       email: 'nour@example.com',  role: 'user',   joined: '2024-04-05', avatar: 'https://i.pravatar.cc/150?img=48', status: 'active',    violations: 0, bio: 'رياضية ومدربة', phone: '01222222222' },
    { id: 5, name: 'ريم علي',        email: 'reem@example.com',  role: 'user',   joined: '2024-04-20', avatar: 'https://i.pravatar.cc/150?img=44', status: 'banned',    violations: 7, bio: '', phone: '' },
  ]);

  readonly users = this._users;

  getAll(): User[] { return this._users(); }

  getUserById(id: number): User | undefined {
    return this._users().find(u => u.id === id);
  }

  /** يُسجّل مخالفة للمستخدم — إذا وصل 3+ يوقفه 3 أيام، 6+ باند نهائي */
  recordViolation(userId: number): void {
    this._users.update(users => users.map(u => {
      if (u.id !== userId) return u;
      const v = u.violations + 1;
      let status = u.status;
      let suspendedUntil = u.suspendedUntil;

      if (v >= 6) {
        status = 'banned';
        suspendedUntil = undefined;
      } else if (v >= 3) {
        status = 'suspended';
        const until = new Date();
        until.setDate(until.getDate() + 3);
        suspendedUntil = until.toISOString();
      }
      return { ...u, violations: v, status, suspendedUntil };
    }));
  }

  suspend(userId: number, days: number): void {
    this._users.update(users => users.map(u => {
      if (u.id !== userId) return u;
      const until = new Date();
      until.setDate(until.getDate() + days);
      return { ...u, status: 'suspended', suspendedUntil: until.toISOString() };
    }));
  }

  ban(userId: number): void {
    this._users.update(users => users.map(u =>
      u.id === userId ? { ...u, status: 'banned', suspendedUntil: undefined } : u
    ));
  }

  activate(userId: number): void {
    this._users.update(users => users.map(u =>
      u.id === userId ? { ...u, status: 'active', suspendedUntil: undefined } : u
    ));
  }

  updateProfile(userId: number, data: Partial<User>): void {
    this._users.update(users => users.map(u =>
      u.id === userId ? { ...u, ...data } : u
    ));
  }

  /** تحقق تلقائي: هل انتهت مدة الإيقاف؟ */
  checkSuspensions(): void {
    const now = new Date();
    this._users.update(users => users.map(u => {
      if (u.status === 'suspended' && u.suspendedUntil) {
        if (new Date(u.suspendedUntil) <= now) {
          return { ...u, status: 'active', suspendedUntil: undefined };
        }
      }
      return u;
    }));
  }

  daysLeft(user: User): number {
    if (!user.suspendedUntil) return 0;
    const diff = new Date(user.suspendedUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
