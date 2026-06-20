import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { PostsService } from 'app/core/services/posts';
import { UsersService } from 'app/core/services/users';
import { API_BASE } from 'app/core/services/api';

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit {

  today = new Date().toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  stats: any = null;

  private catColors = ['cat-pink','cat-blue','cat-green','cat-orange','cat-purple','cat-red'];

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

  ngOnInit(): void {
    this.postsService.loadPosts();
    this.usersService.loadUsers();

    this.http.get<any>(`${API_BASE}/Admin/stats`, { headers: this.headers }).pipe(
      catchError(() => of(null))
    ).subscribe(res => { this.stats = res; });
  }

get totalPosts()    { return this.postsService.getAllPosts().length; }
get totalUsers()    { return this.usersService.getAll().length; }
get totalComments() { return this.postsService.getAllPosts().reduce((s, p) => s + (p.commentCount ?? p.comments.length), 0); }
get bannedUsers()   { return this.usersService.getAll().filter(u => u.status === 'banned').length; }
get totalLikes()    { return this.postsService.getAllPosts().reduce((s, p) => s + p.likeCount, 0); }
get recentPosts()   { return this.postsService.getAllPosts().slice(0, 4); }

  get categories() {
    const all   = this.postsService.getAllPosts();
    const total = all.length || 1;
    const map   = new Map<string, number>();
    all.forEach(p => map.set(p.category, (map.get(p.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, count], i) => ({
      name, count,
      pct: Math.round((count / total) * 100),
      color: this.catColors[i % this.catColors.length]
    })).sort((a, b) => b.count - a.count);
  }
}