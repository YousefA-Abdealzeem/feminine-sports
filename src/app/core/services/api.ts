import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_BASE = 'https://womensports-api.runasp.net/api';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient) {}

  // للـ JSON requests
  getHeaders(requiresAuth = true): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(requiresAuth && token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // للـ FormData requests — بدون Content-Type علشان Angular يحطه تلقائي مع الـ boundary
  getFormHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${API_BASE}${path}`, { headers: this.getHeaders() });
  }

  post<T>(path: string, body: any, requiresAuth = true): Observable<T> {
    return this.http.post<T>(`${API_BASE}${path}`, body, { headers: this.getHeaders(requiresAuth) });
  }

  postForm<T>(path: string, body: FormData): Observable<T> {
    return this.http.post<T>(`${API_BASE}${path}`, body, { headers: this.getFormHeaders() });
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${API_BASE}${path}`, body, { headers: this.getHeaders() });
  }

  putForm<T>(path: string, body: FormData): Observable<T> {
    return this.http.put<T>(`${API_BASE}${path}`, body, { headers: this.getFormHeaders() });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_BASE}${path}`, { headers: this.getHeaders() });
  }
}
