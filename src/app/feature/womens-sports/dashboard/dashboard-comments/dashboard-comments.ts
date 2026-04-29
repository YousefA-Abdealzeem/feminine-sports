import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from 'app/core/services/posts';
import { UsersService } from 'app/core/services/users';
import { HateSpeechService } from 'app/core/services/hate-speech';

@Component({
  selector: 'app-dashboard-comments',
  imports: [CommonModule],
  templateUrl: './dashboard-comments.html',
  styleUrl: './dashboard-comments.css',
})
export class DashboardComments {

  constructor(
    public postsService: PostsService,
    public usersService: UsersService,
    private hs: HateSpeechService
  ) {}

  get flagged() { return this.postsService.flaggedComments; }

  highlight(text: string): string { return this.hs.highlight(text); }

  getUserViolations(uid: number): number {
    return this.usersService.getUserById(uid)?.violations ?? 0;
  }

  getUserStatus(uid: number): string {
    return this.usersService.getUserById(uid)?.status ?? 'active';
  }

  getStatusLabel(uid: number): string {
    const s = this.getUserStatus(uid);
    return s === 'active' ? 'نشط' : s === 'suspended' ? 'موقف' : 'محظور';
  }

  deleteComment(postId: number, commentId: number): void {
    this.postsService.deleteComment(postId, commentId);
  }

  suspendUser(uid: number, days: number): void {
    this.usersService.suspend(uid, days);
  }

  banUser(uid: number): void {
    this.usersService.ban(uid);
  }

  activateUser(uid: number): void {
    this.usersService.activate(uid);
  }
}
