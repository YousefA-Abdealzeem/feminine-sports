import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from 'app/core/services/posts';

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit {
  posts: any[] = [];
  today = new Date().toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    this.posts = this.postsService.getAllPosts();
  }

  get totalPosts() { return this.posts.length; }
  get totalLikes() { return this.posts.reduce((s, p) => s + p.likeCount, 0); }
  get totalComments() { return this.posts.reduce((s, p) => s + p.comments.length, 0); }
  get recentPosts() { return this.posts.slice(0, 4); }

  get categories() {
    const cats = ['كرة القدم','السباحة','السلة','الجري'];
    const icons: any = { 'كرة القدم':'السباحة','السلة':'الجري' };
    const colors: any = { 'كرة القدم':'rose','السباحة':'ice','السلة':'gold','الجري':'dark' };
    const total = this.posts.length || 1;
    return cats.map(c => {
      const count = this.posts.filter(p => p.category === c).length;
      return { name: c, count, pct: Math.round((count / total) * 100), icon: icons[c], color: colors[c] };
    });
  }
}
