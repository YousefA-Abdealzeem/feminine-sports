import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostsService } from 'app/core/services/posts';
import { UsersService } from 'app/core/services/users';
import { AuthService } from 'app/core/services/auth';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css'
})
export class PostDetails implements OnInit, OnDestroy {

  private route        = inject(ActivatedRoute);
  private postsService = inject(PostsService);
  private usersService = inject(UsersService);
  private authService  = inject(AuthService);
  private router       = inject(Router);
  private cdr          = inject(ChangeDetectorRef);

  private postsIntervalRef: any;
  post: any        = null;
  newComment       = '';
  commentStatus: 'ok' | 'blocked' | 'warning' | 'banned' | null = null;
  submitting       = false;
  flaggedWarning   = false;
  banWarning       = false;

  ngOnInit() {
    this.usersService.checkSuspensions();
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // جيب البوست دايماً من الـ API علشان الكومنتات تكون محدثة
    this.postsService.loadPost(id);
    this.postsService.loadComments(id);

    // لو البوست موجود محلياً اعرضه فوراً
    this.post = this.postsService.getPostById(id);

    // استنى لحد ما البوست يتحمل
    if (!this.post) {
      const interval = setInterval(() => {
        this.post = this.postsService.getPostById(id);
        if (this.post) {
          clearInterval(interval);
          this.cdr.detectChanges();
        }
      }, 200);
    }

    // تابع تحديثات الكومنتات
    this.postsIntervalRef = setInterval(() => {
  const updated = this.postsService.getPostById(id);
  if (updated) {
    this.post = updated;
    this.cdr.detectChanges();
  }
}, 1000);

    this.checkUserStatus();
  }

  private checkUserStatus(): void {
    const u = this.authService.currentUser();
    if (!u) return;
    this.usersService.loadUser(u.id);
  }

  get visibleComments() {
    return this.post?.comments ?? [];
  }

  get currentUser() {
    const u = this.authService.currentUser();
    if (!u) return null;
    return this.usersService.getUserById(u.id) || {
      id: u.id, name: u.name,
      avatar: u.avatar || '',
      status: 'active',
    };
  }

  get isBlocked(): boolean {
    const u = this.currentUser as any;
    return u?.status === 'banned' || u?.status === 'suspended';
  }

  get blockMessage(): string {
    const u = this.currentUser as any;
    if (!u) return '';
    if (u.status === 'banned')     return 'تم حظرك نهائياً من التعليق.';
    if (u.status === 'suspended')  return `حسابك موقف لمدة ${this.usersService.daysLeft(u)} يوم.`;
    return '';
  }

  likePost() {
    if (!this.post) return;
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.postsService.likePost(this.post.id);
    this.post.liked = !this.post.liked;
    this.post.likeCount += this.post.liked ? 1 : -1;
  }

  async addComment() {
    if (!this.post || !this.newComment.trim() || this.submitting) return;
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    if (this.isBlocked) return;

    const u = this.currentUser as any;
    this.submitting     = true;
    this.commentStatus  = null;
    this.flaggedWarning = false;
    this.banWarning     = false;
    this.cdr.detectChanges();

    const result = await this.postsService.addComment(
      this.post.id, this.newComment, u.name, u.id, u.avatar || ''
    );

    this.submitting    = false;
    this.commentStatus = result;
    this.newComment    = '';

    if (result === 'warning') {
      this.flaggedWarning = true;
      // أعد تحميل بيانات الـ user علشان تشوف لو اتحظر
      this.usersService.loadUser(u.id);
      setTimeout(() => {
        const updated = this.usersService.getUserById(u.id);
        if (updated?.status === 'banned' || updated?.status === 'suspended') {
          this.banWarning = true;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 3000);
        }
        this.cdr.detectChanges();
      }, 1000);
    } else if (result === 'banned') {
      this.banWarning = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }, 3000);
    }

    this.cdr.detectChanges();

    if (result === 'ok') {
      this.post = this.postsService.getPostById(this.post.id);
      setTimeout(() => { this.commentStatus = null; this.cdr.detectChanges(); }, 3000);
    } else if (result !== 'banned') {
      setTimeout(() => { this.commentStatus = null; this.flaggedWarning = false; this.cdr.detectChanges(); }, 5000);
    }
  }

  ngOnDestroy(): void {
    if (this.postsIntervalRef) clearInterval(this.postsIntervalRef);
  }
}