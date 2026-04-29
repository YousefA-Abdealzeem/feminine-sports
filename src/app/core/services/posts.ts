import { Injectable, signal } from '@angular/core';
import { HateSpeechService } from './hate-speech';

export interface Comment {
  id: number;
  user: string;
  userId: number;
  text: string;
  rawText: string;         // النص الأصلي (للداشبورد)
  date: string;
  img: string;
  flagged: boolean;        // هل يحتوي hate speech؟
  hidden: boolean;         // مخفي من الموقع العادي
}

export interface Post {
  id: number;
  category: string;
  title: string;
  date: string;
  desc: string;
  img: string;
  likeCount: number;
  liked: boolean;
  comments: Comment[];
}

@Injectable({ providedIn: 'root' })
export class PostsService {

  constructor(private hs: HateSpeechService) {}

  private _posts = signal<Post[]>([
    { id: 1, category: 'كرة القدم', title: 'تحطيم الأرقام القياسية',   date: '2023-10-15', desc: 'شهدت بطولة كرة القدم النسائية حدثًا تاريخيًا بتحقيق أرقام قياسية جديدة.', img: '/assets/images/posts.jpg',    likeCount: 12, liked: false, comments: [
      { id: 1, user: 'سارة', userId: 2, text: 'رائع جداً!', rawText: 'رائع جداً!', date: '2024-01-10', img: 'https://i.pravatar.cc/50?img=47', flagged: false, hidden: false },
      { id: 2, user: 'منى',  userId: 3, text: '***',         rawText: 'أنتي غبي وفاشل',  date: '2024-01-11', img: 'https://i.pravatar.cc/50?img=45', flagged: true,  hidden: true  },
    ]},
    { id: 2, category: 'السباحة',   title: 'أرقام قياسية جديدة',        date: '2024-01-20', desc: 'تم تسجيل أسرع زمن جديد في البطولة العالمية للسباحة.',                      img: '/assets/images/swimming.jpg', likeCount: 8,  liked: false, comments: [] },
    { id: 3, category: 'السلة',     title: 'نهائي مثير في بطولة السلة', date: '2024-03-01', desc: 'نهائي قوي في بطولة السلة بين أفضل اللاعبات عالميًا.',                      img: '/assets/images/baskt.jpg',    likeCount: 5,  liked: false, comments: [] },
    { id: 4, category: 'الجري',     title: 'أرقام قياسية في البطولة العالمية للجري', date: '2024-04-15', desc: 'تم تسجيل أسرع زمن جديد في البطولة العالمية للجري.', img: '/assets/images/running.jpg',   likeCount: 3,  liked: false, comments: [] },
  ]);

  readonly posts = this._posts;

  getAllPosts(): Post[] { return this._posts(); }

  getPostById(id: number): Post | undefined {
    return this._posts().find(p => p.id === id);
  }

  // ======= CRUD Posts =======

  addPost(data: Omit<Post, 'id' | 'likeCount' | 'liked' | 'comments'>): void {
    const id = Math.max(0, ...this._posts().map(p => p.id)) + 1;
    this._posts.update(ps => [...ps, { ...data, id, likeCount: 0, liked: false, comments: [] }]);
  }

  updatePost(id: number, data: Partial<Omit<Post, 'id' | 'comments'>>): void {
    this._posts.update(ps => ps.map(p => p.id === id ? { ...p, ...data } : p));
  }

  deletePost(id: number): void {
    this._posts.update(ps => ps.filter(p => p.id !== id));
  }

  // ======= Comments =======

  addComment(postId: number, text: string, user: string, userId: number, img: string): boolean {
    const flagged = this.hs.containsHateSpeech(text);
    const comment: Comment = {
      id: Date.now(),
      user, userId,
      rawText: text,
      text: flagged ? text.replace(/./g, '*').slice(0, 3) + ' [محتوى محظور]' : text,
      date: new Date().toLocaleDateString('ar-EG'),
      img,
      flagged,
      hidden: flagged,
    };
    this._posts.update(ps => ps.map(p =>
      p.id === postId ? { ...p, comments: [comment, ...p.comments] } : p
    ));
    return flagged; // يرجع true لو فيه hate speech
  }

  /** كل الكومنتات المُبلَّغ عنها من كل البوستات */
  get flaggedComments(): Array<Comment & { postId: number; postTitle: string }> {
    const result: any[] = [];
    this._posts().forEach(p =>
      p.comments.filter(c => c.flagged).forEach(c =>
        result.push({ ...c, postId: p.id, postTitle: p.title })
      )
    );
    return result;
  }

  deleteComment(postId: number, commentId: number): void {
    this._posts.update(ps => ps.map(p =>
      p.id === postId
        ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
        : p
    ));
  }

  restoreComment(postId: number, commentId: number): void {
    this._posts.update(ps => ps.map(p =>
      p.id === postId
        ? { ...p, comments: p.comments.map(c => c.id === commentId ? { ...c, hidden: false } : c) }
        : p
    ));
  }
}
