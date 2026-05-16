import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { API_BASE } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  joined: string;
  avatar: string;
  status: 'active' | 'suspended' | 'banned';
  violations: number;
  bio?: string;
  suspendedUntil?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {

  private _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // GET /api/Admin/users
  loadUsers(): void {
    this.http.get<any[]>(`${API_BASE}/Admin/users`, { headers: this.headers }).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      if (data?.length) this._users.set(data.map(u => this.mapUser(u)));
    });
  }

  // ✅ بدل ما تستدعي /Admin/user/{id} اللي مش موجود
  loadUser(userId: number): void {
    const existing = this._users().find(u => u.id === userId);
    if (existing) return;
    this.loadUsers();
  }

  private mapUser(u: any): User {
    const userId = u.id || u.Id || 0;

    const isBanned    = u.isBanned || u.IsBanned || false;
    const isSuspended = u.isSuspended || u.IsSuspended || (u.status === 'suspended') || false;
    const apiViolations   = u.violationCount || u.violations || u.Violations || 0;
    const localViolations = parseInt(localStorage.getItem(`violations_${userId}`) || '0', 10);
    const violations = Math.max(apiViolations, localViolations);

    let status: User['status'] = 'active';
    if (isBanned)         status = 'banned';
    else if (isSuspended) status = 'suspended';

    const savedAvatar = localStorage.getItem(`avatar_${userId}`) || '';
    const avatar = u.profileImageUrl || u.ProfileImageUrl || u.avatar || savedAvatar || '';
    if (avatar && userId) localStorage.setItem(`avatar_${userId}`, avatar);

    return {
      id:             userId,
      name:           u.username  || u.userName  || u.UserName || u.name || '',
      email:          u.email     || u.Email     || '',
      role:           ((u.role    || u.Role      || 'user').toLowerCase()) as 'admin' | 'user',
      joined:         u.createdAt || u.CreatedAt || u.joined || '',
      avatar,
      status,
      violations,
      bio:            u.bio || u.Bio || '',
      suspendedUntil: u.suspendedUntil || u.SuspendedUntil || u.bannedUntil || u.BannedUntil,
    };
  }

  getAll(): User[] { return this._users(); }

  getUserById(id: number): User | undefined {
    return this._users().find(u => u.id === id);
  }

  // PUT /api/Admin/ban/{userId}
  ban(userId: number): void {
    this.http.put(`${API_BASE}/Admin/ban/${userId}`, {}, { headers: this.headers }).pipe(
      catchError(() => of(null))
    ).subscribe();
    this._users.update(users => users.map(u =>
      u.id === userId ? { ...u, status: 'banned', suspendedUntil: undefined } : u
    ));
  }

  // PUT /api/Admin/unban/{userId}
  unban(userId: number): void {
    this.http.put(`${API_BASE}/Admin/unban/${userId}`, {}, { headers: this.headers }).pipe(
      catchError(() => of(null))
    ).subscribe();
    this._users.update(users => users.map(u =>
      u.id === userId ? { ...u, status: 'active', suspendedUntil: undefined } : u
    ));
  }

  activate(userId: number): void { this.unban(userId); }

  // DELETE /api/Admin/user/{userId}
  deleteUser(userId: number): void {
    this.http.delete(`${API_BASE}/Admin/user/${userId}`, { headers: this.headers }).pipe(
      catchError(() => of(null))
    ).subscribe();
    this._users.update(users => users.filter(u => u.id !== userId));
  }

  // PUT /api/Admin/suspend/{userId}
  suspend(userId: number, days: number): void {
    this.http.put(`${API_BASE}/Admin/suspend/${userId}`, { days }, { headers: this.headers }).pipe(
      catchError(() => of(null))
    ).subscribe();
    const until = new Date();
    until.setDate(until.getDate() + days);
    this._users.update(users => users.map(u =>
      u.id === userId ? { ...u, status: 'suspended', suspendedUntil: until.toISOString() } : u
    ));
  }

  checkSuspensions(): void {
    const now = new Date();
    this._users.update(users => users.map(u => {
      if (u.status === 'suspended' && u.suspendedUntil) {
        if (new Date(u.suspendedUntil) <= now)
          return { ...u, status: 'active', suspendedUntil: undefined };
      }
      return u;
    }));
  }

  daysLeft(user: User): number {
    if (!user.suspendedUntil) return 0;
    return Math.max(0, Math.ceil((new Date(user.suspendedUntil).getTime() - Date.now()) / 86400000));
  }
}