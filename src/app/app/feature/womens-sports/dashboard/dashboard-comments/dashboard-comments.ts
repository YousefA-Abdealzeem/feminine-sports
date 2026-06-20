import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { PostsService } from 'app/core/services/posts';
import { UsersService } from 'app/core/services/users';
import { API_BASE } from 'app/core/services/api';

@Component({
  selector: 'app-dashboard-comments',
  imports: [CommonModule],
  templateUrl: './dashboard-comments.html',
  styleUrl: './dashboard-comments.css',
})
export class DashboardComments implements OnInit {

  serverFlagged: any[] = [];
  loading = true;

  constructor(
    public postsService: PostsService,
    public usersService: UsersService,
    private http: HttpClient
  ) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      Authorization: `Bearer ${token}`
    });
  }
private mapFlagged(data: any[]): any[] {
  return (data || []).map(c => ({
    id:         c.id,
    text:       c.content || c.rawText || '',
    rawText:    c.content || c.rawText || '', // ✅ أضف السطر ده
    user:       c.username || '',
    userId:     c.userId,
    postId:     c.postId,
    postTitle:  c.postTitle || '',
    img:        c.img || '',
    date:       c.date || '',
    flagged:    true,
    score:      c.hateSpeechScore || 0,
    violations: c.violationCount || c.violations || 0,
  }));
}

  private loadFlagged(): void {
    this.http.get<any[]>(`${API_BASE}/Admin/hate-speech`, { headers: this.headers })
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.serverFlagged = this.mapFlagged(data);
        this.loading = false;
      });
  }

  ngOnInit(): void {
    this.loadFlagged();
  }

  get flagged(): any[] {
    return this.allFlagged;
  }

  get allFlagged(): any[] {
    return this.serverFlagged;
  }

  highlight(text: string): string {
    if (!text) return '';
    return text.replace(/(bad|hate|abuse)/gi, '<mark>$1</mark>');
  }

  getUserStatus(uid: number): string {
    return this.usersService.getUserById(uid)?.status ?? 'active';
  }

  getStatusLabel(uid: number): string {
    const s = this.getUserStatus(uid);
    return s === 'active' ? 'نشط' : s === 'suspended' ? 'موقف' : 'محظور';
  }

  getUserViolations(uid: number): number {
    // ✅ جيب من الـ serverFlagged الأول
    const fromServer = this.serverFlagged.find(c => c.userId === uid);
    if (fromServer?.violations) return fromServer.violations;
    return this.usersService.getUserById(uid)?.violations ?? 0;
  }

deleteComment(postId: number, commentId: number): void {
  if (commentId > 2147483647) {
    this.postsService.removeLocalFlagged(commentId);
    this.serverFlagged = this.serverFlagged.filter(c => c.id !== commentId);
    // ✅ حدث الـ signal فوراً
    this.postsService.flaggedCountFromServer.set(this.serverFlagged.length);
    return;
  }

  this.postsService.deleteComment(postId, commentId);
  this.serverFlagged = this.serverFlagged.filter(c => c.id !== commentId);
  // ✅ حدث الـ signal فوراً
  this.postsService.flaggedCountFromServer.set(this.serverFlagged.length);

  setTimeout(() => this.loadFlagged(), 500);
}

  suspendUser(uid: number, days: number = 3): void {
    this.usersService.suspend(uid, days);
  }

  banUser(uid: number): void {
    this.usersService.ban(uid);
  }

  unbanUser(uid: number): void {
    this.usersService.unban(uid);
  }

  activateUser(uid: number): void {
    this.usersService.unban(uid);
  }
}