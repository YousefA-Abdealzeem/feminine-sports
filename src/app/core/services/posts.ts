import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { API_BASE, ApiService } from './api';

export interface Comment {
  id: number;
  user: string;
  userId: number;
  text: string;
  date: string;
  img: string;
  flagged: boolean;
}

export interface Post {
  id: number;
  title: string;
  category: string;
  date: string;
  desc: string;
  img: string;
  likeCount: number;
  liked: boolean;
  commentCount: number;
  comments: Comment[];
}

@Injectable({ providedIn: 'root' })
export class PostsService {

  private _posts = signal<Post[]>([]);
  readonly posts = this._posts.asReadonly();

  // ✅ signal مشترك للـ flagged count
  flaggedCountFromServer = signal<number>(0);

  private _flaggedComments = signal<Array<Comment & { postId: number; postTitle: string }>>(
    JSON.parse(localStorage.getItem('flaggedComments') || '[]')
  );

  private saveFlagged(): void {
    localStorage.setItem('flaggedComments', JSON.stringify(this._flaggedComments()));
  }

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.loadPosts();
  }

  // =========================
  // HEADERS
  // =========================

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // =========================
  // POSTS
  // =========================

  loadPosts(): void {
    this.http.get<any>(`${API_BASE}/Posts?page=1&pageSize=100`, {
      headers: this.headers
    }).pipe(
      catchError(() => of([]))
    ).subscribe(res => {
      const data: any[] = Array.isArray(res) ? res : (res?.items || res?.data || res?.posts || []);
      const posts = data.map(p => this.mapPost(p));
      this._posts.set(posts);
      posts.forEach(p => this.loadComments(p.id));
    });
  }

  loadPost(id: number): void {
    this.http.get<any>(`${API_BASE}/Posts/${id}`, {
      headers: this.headers
    }).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (!res) return;
      const updated = this.mapPost(res);
      this._posts.update(ps => {
        const exists = ps.find(p => p.id === id);
        if (!exists) return [updated, ...ps];
        return ps.map(p => {
          if (p.id !== id) return p;
          return {
            ...updated,
            comments: updated.comments.length > 0 ? updated.comments : p.comments,
            commentCount: updated.comments.length > 0 ? updated.commentCount : p.commentCount,
          };
        });
      });
    });
  }

  // =========================
  // IMAGE FIX
  // =========================

  private fixImage(img: string): string {
    if (!img) return '/assets/images/posts.jpg';
    if (!img.startsWith('http') && !img.startsWith('data')) {
      return `/assets/images/${img}`;
    }
    return img;
  }

  // =========================
  // MAP POST
  // =========================

  private mapPost(p: any): Post {
    return {
      id: p.id || 0,
      title: p.title || p.Title || 'بدون عنوان',
      category: p.category || p.Category || '',
      date: p.createdAt || p.date || new Date().toISOString(),
      desc: p.content || p.desc || '',
      img: this.fixImage(p.imageUrl || p.ImageUrl || p.img),
      likeCount: p.likesCount ?? p.likeCount ?? 0,
      liked: p.isLiked ?? p.liked ?? false,
      commentCount: p.commentCount ?? p.CommentCount ?? (p.comments?.length ?? 0),
      comments: (p.comments || []).map((c: any) => this.mapComment(c)),
    };
  }

  // =========================
  // MAP COMMENT
  // =========================

  private mapComment(c: any): Comment {
    const userId = c.userId || c.UserId || 0;
    const savedAvatar = localStorage.getItem(`avatar_${userId}`) || '';
    const img = c.profileImageUrl || c.userProfileImage || c.avatar || savedAvatar || '';
    if (img && userId) localStorage.setItem(`avatar_${userId}`, img);

    return {
      id:      c.id || c.Id || 0,
      user:    c.username || c.userName || c.UserName || c.user || '',
      userId,
      text:    c.content || c.Content || c.text || '',
      date:    c.createdAt || c.CreatedAt || c.date || '',
      img,
      flagged: c.flagged || c.isFlagged || false,
    };
  }

  // =========================
  // SYNC COMMENT COUNT
  // =========================

  private syncCommentCount(postId: number): void {
    this.http.get<any[]>(`${API_BASE}/Comments/${postId}`, {
      headers: this.headers
    }).pipe(
      catchError(() => of([]))
    ).subscribe(res => {
      const count = Array.isArray(res) ? res.length : 0;
      this._posts.update(ps => ps.map(p =>
        p.id === postId
          ? { ...p, commentCount: count }
          : p
      ));
    });
  }

  // =========================
  // COMMENTS
  // =========================

  loadComments(postId: number): void {
    this.http.get<any[]>(`${API_BASE}/Comments/${postId}`, {
      headers: this.headers
    }).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      if (!data) return;
      const comments = data.map((c: any) => this.mapComment(c));
      this._posts.update(ps => ps.map(p =>
        p.id === postId
          ? { ...p, comments, commentCount: comments.length }
          : p
      ));
    });
  }

  addComment(
    postId: number,
    text: string,
    user: string,
    userId: number,
    img: string
  ): Promise<'ok' | 'blocked' | 'warning' | 'banned'> {

    return new Promise(resolve => {

      this.http.post<any>(
        `${API_BASE}/Comments`,
        { content: text, postId },
        { headers: this.headers }
      ).pipe(
        catchError(err => {
          const msg = (err?.error?.message || err?.error?.Message || '').toLowerCase();
          const status = err?.status || 0;

          if (msg.includes('ban') || status === 403) {
            resolve('banned');
          } else if (
            msg.includes('hate') || msg.includes('flagged') ||
            msg.includes('inappropriate') || msg.includes('warn') ||
            status === 400
          ) {
            const post = this._posts().find(p => p.id === postId);
            const flaggedComment: Comment & { postId: number; postTitle: string } = {
              id: Date.now(), user, userId, text,
              date: new Date().toLocaleDateString('ar-EG'),
              img, flagged: true,
              postId, postTitle: post?.title || ''
            };
            this._flaggedComments.update(fc => [flaggedComment, ...fc]);
            this.saveFlagged();
            const violKey = `violations_${userId}`;
            const current = parseInt(localStorage.getItem(violKey) || '0', 10);
            localStorage.setItem(violKey, String(current + 1));
            resolve('warning');
          } else {
            resolve('blocked');
          }
          return of(null);
        })
      ).subscribe(res => {
        if (res !== null) {
          const isFlagged = res?.isFlagged || res?.flagged || false;
          const commentImg = res?.profileImageUrl || res?.userProfileImage || img || localStorage.getItem(`avatar_${userId}`) || '';

          if (commentImg && userId) localStorage.setItem(`avatar_${userId}`, commentImg);

          const comment: Comment = {
            id:      res?.id || 0,
            user, userId, text,
            date:    new Date().toLocaleDateString('ar-EG'),
            img:     commentImg,
            flagged: isFlagged,
          };

          this._posts.update(ps => ps.map(p =>
            p.id === postId
              ? { ...p, comments: [comment, ...p.comments], commentCount: p.commentCount + 1 }
              : p
          ));

          this.loadComments(postId);

          if (isFlagged) {
            const post = this._posts().find(p => p.id === postId);
            this._flaggedComments.update(fc => [
              { ...comment, postId, postTitle: post?.title || '' },
              ...fc.filter(c => c.id !== comment.id)
            ]);
            this.saveFlagged();
            const violKey = `violations_${userId}`;
            const current = parseInt(localStorage.getItem(violKey) || '0', 10);
            localStorage.setItem(violKey, String(current + 1));
            resolve('warning');
          } else {
            resolve('ok');
          }
        }
      });

    });
  }

  deleteComment(postId: number, commentId: number): void {
    this.http.delete(`${API_BASE}/Admin/comment/${commentId}`, {
      headers: this.headers
    }).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this._posts.update(ps => ps.map(p =>
        p.id === postId
          ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
          : p
      ));
      this.syncCommentCount(postId);
    });
  }

  // =========================
  // LIKES
  // =========================

  likePost(postId: number): void {
    this.http.post(`${API_BASE}/Likes/${postId}`, {}, {
      headers: this.headers
    }).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._posts.update(ps => ps.map(p => {
      if (p.id !== postId) return p;
      const liked = !p.liked;
      return { ...p, liked, likeCount: p.likeCount + (liked ? 1 : -1) };
    }));
  }

  // =========================
  // ADD POST
  // =========================

  addPost(data: { title: string; category: string; desc: string; imageFile?: File | null }): void {

    const formData = new FormData();
    formData.append('Title', data.title);
    formData.append('Category', data.category);
    formData.append('Content', data.desc);

    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    this.http.post(`${API_BASE}/Posts`, formData, {
      headers: this.apiService.getFormHeaders()
    }).pipe(
      catchError(() => of(null))
    ).subscribe(() => this.loadPosts());
  }

  // =========================
  // EDIT POST
  // =========================

  editPost(
    id: number,
    data: { title: string; category: string; desc: string; imageFile?: File | null }
  ): void {

    const formData = new FormData();
    formData.append('Title', data.title);
    formData.append('Category', data.category);
    formData.append('Content', data.desc);

    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    this.http.put(`${API_BASE}/Posts/${id}`, formData, {
      headers: this.apiService.getFormHeaders()
    }).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.loadPost(id);
    });

    this._posts.update(ps => ps.map(p =>
      p.id === id
        ? {
            ...p,
            title: data.title,
            category: data.category,
            desc: data.desc
          }
        : p
    ));
  }

  // =========================
  // DELETE POST
  // =========================

  deletePost(id: number): void {
    this.http.delete(`${API_BASE}/Posts/${id}`, {
      headers: this.headers
    }).pipe(
      catchError(() => of(null))
    ).subscribe();

    this._posts.update(ps => ps.filter(p => p.id !== id));
  }

  // =========================
  // GETTERS
  // =========================

  getAllPosts(): Post[] {
    return this._posts();
  }

  getPostById(id: number): Post | undefined {
    return this._posts().find(p => p.id === id);
  }

  get flaggedComments(): Array<Comment & { postId: number; postTitle: string }> {
    const fromServer: any[] = [];
    this._posts().forEach(p =>
      p.comments.filter(c => c.flagged).forEach(c =>
        fromServer.push({ ...c, postId: p.id, postTitle: p.title })
      )
    );
    const local = this._flaggedComments();
    const serverIds = new Set(fromServer.map(c => c.id));
    const localOnly = local.filter(c => !serverIds.has(c.id));
    return [...fromServer, ...localOnly];
  }

  removeLocalFlagged(commentId: number): void {
    this._flaggedComments.update(fc => fc.filter(c => c.id !== commentId));
    this.saveFlagged();
  }
}