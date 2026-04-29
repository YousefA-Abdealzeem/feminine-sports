import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostsService } from 'app/core/services/posts';
import { UsersService } from 'app/core/services/users';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css'
})
export class PostDetails implements OnInit {

  private route        = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private usersService = inject(UsersService);
  private router       = inject(Router);

  post: any = null;
  newComment = '';
  flaggedWarning = false;

  // المستخدم الحالي (id=2 = سارة كمثال)
  currentUserId = 2;

  ngOnInit() {
    this.usersService.checkSuspensions();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.post = this.postsService.getPostById(id);
  }

  get visibleComments() {
    return this.post?.comments?.filter((c: any) => !c.hidden) ?? [];
  }

  get currentUser() {
    return this.usersService.getUserById(this.currentUserId);
  }

  get isBlocked(): boolean {
    const u = this.currentUser;
    return !u || u.status === 'banned' || u.status === 'suspended';
  }

  get blockMessage(): string {
    const u = this.currentUser;
    if (!u) return '';
    if (u.status === 'banned') return 'تم حظرك نهائياً من التعليق.';
    if (u.status === 'suspended') return `حسابك موقف لمدة ${this.usersService.daysLeft(u)} يوم.`;
    return '';
  }

  likePost() {
    if (!this.post) return;
    this.post.liked = !this.post.liked;
    this.post.likeCount += this.post.liked ? 1 : -1;
  }

  addComment() {
    if (!this.post || !this.newComment.trim() || this.isBlocked) return;
    const u = this.currentUser!;
    const flagged = this.postsService.addComment(
      this.post.id, this.newComment, u.name, u.id, u.avatar
    );
    if (flagged) {
      this.usersService.recordViolation(u.id);
      this.flaggedWarning = true;
      setTimeout(() => this.flaggedWarning = false, 4000);
    }
    // نحدث المرجع
    this.post = this.postsService.getPostById(this.post.id);
    this.newComment = '';
  }
}
