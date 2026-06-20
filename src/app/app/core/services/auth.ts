import { Injectable, signal, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, switchMap, throwError, of, catchError } from 'rxjs';
import { API_BASE } from './api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
  avatar?: string;
  bio?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _isLoggedIn  = signal<boolean>(!!localStorage.getItem('token'));
  private _currentUser = signal<AuthUser | null>(this.loadUser());
  private _isAdmin     = signal<boolean>(localStorage.getItem('isAdmin') === 'true');

  readonly isLoggedIn  = this._isLoggedIn.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAdmin     = this._isAdmin.asReadonly();

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  // =========================
  // Load / Save User Session
  // =========================

  private loadUser(): AuthUser | null {
    const u = localStorage.getItem('currentUser');
    return u ? JSON.parse(u) : null;
  }

  private saveSession(res: any, email: string): void {
    const token = res.token || res.Token || '';

    const user: AuthUser = {
      id:     res.userId || res.UserId || res.id || 0,
      name:   res.username || res.userName || res.Username || email.split('@')[0],
      email:  res.email || res.Email || email,
      role:   (res.role || res.Role || 'user').toLowerCase(),
      token,
      avatar: res.profileImageUrl || res.avatar || '',
      bio:    res.bio || '',
    };

    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    this._isLoggedIn.set(true);
    this._currentUser.set(user);
  }

  // =========================
  // AUTH
  // =========================

  register(userName: string, email: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${API_BASE}/Auth/register`, {
      username: userName,
      email,
      password,
      confirmPassword
    }, { responseType: 'text' });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${API_BASE}/Auth/login`, { email, password }).pipe(
      tap(res => {
        this.saveSession(res, email);
        this.fetchAndUpdateAvatar();
      })
    );
  }

  fetchAndUpdateAvatar(): void {
    const token = localStorage.getItem('token') || '';
    if (!token) return;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });
    this.http.get<any>(`${API_BASE}/Profile`, { headers }).subscribe({
      next: (res) => {
        const updates: Partial<AuthUser> = {};
        if (res?.profileImageUrl) updates.avatar = res.profileImageUrl;
        const userId = this._currentUser()?.id;
        if (res?.profileImageUrl && userId) {
          localStorage.setItem(`avatar_${userId}`, res.profileImageUrl);
        }
        if (Object.keys(updates).length) {
          this.ngZone.run(() => this.updateCurrentUser(updates));
        }
        // ✅ مش هيعمل logout للأدمن
        if (res?.isBanned || res?.IsBanned) {
          const currentUser = this._currentUser();
          if (currentUser?.role !== 'admin') {
            this.ngZone.run(() => {
              this.logout();
            });
          }
        }
      },
      error: () => {}
    });
  }

adminLogin(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${API_BASE}/Auth/login`, {
    email,
    password
  }).pipe(
    // ✅ catchError الأول علشان يمسك الـ 401
    catchError(err => {
      const msg = err?.error?.message || err?.error?.Message || '';
      if (msg.toLowerCase().includes('banned')) {
        return throwError(() => ({ error: { message: msg } }));
      }
      return throwError(() => err);
    }),
    switchMap(res => {
      const role = (res.role || res.Role || '').toLowerCase();

      if (!role || !role.includes('admin')) {
        return throwError(() => new Error('no_admin'));
      }

      localStorage.setItem('isAdmin', 'true');
      this._isAdmin.set(true);
      this.saveSession(res, email);

      return of(res);
    })
  );
}

  // =========================
  // FORGOT PASSWORD FLOW
  // =========================

  sendResetCode(email: string): Observable<any> {
    return this.http.post(`${API_BASE}/ForgotPassword/send-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${API_BASE}/ForgotPassword/verify-otp`, { email, otp });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post(`${API_BASE}/ForgotPassword/reset-password`, {
      email,
      otp,
      newPassword
    });
  }

  // =========================
  // USER
  // =========================

  updateCurrentUser(data: Partial<AuthUser>): void {
    const updated = { ...this._currentUser(), ...data } as AuthUser;
    localStorage.setItem('currentUser', JSON.stringify(updated));
    this._currentUser.set(updated);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');

    this._isLoggedIn.set(false);
    this._isAdmin.set(false);
    this._currentUser.set(null);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }
}