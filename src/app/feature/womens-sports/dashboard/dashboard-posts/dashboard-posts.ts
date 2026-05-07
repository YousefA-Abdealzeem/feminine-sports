import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService, Post } from 'app/core/services/posts';

@Component({
  selector: 'app-dashboard-posts',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-posts.html',
  styleUrl: './dashboard-posts.css',
})
export class DashboardPosts {

  @ViewChild('imgInput') imgInput!: ElementRef<HTMLInputElement>;

  searchTerm   = '';
  showModal    = false;
  editMode     = false;
  editId: number | null = null;
  deleteTarget: Post | null = null;
  showUrlInput = false;

  form = this.emptyForm();

  constructor(public postsService: PostsService) {}

  get posts() { return this.postsService.posts; }

  get filteredPosts(): Post[] {
    const q = this.searchTerm.trim().toLowerCase();
    const all = this.postsService.getAllPosts();
    return q ? all.filter(p => p.title.toLowerCase().includes(q) || p.category.includes(q)) : all;
  }

  badgeClass(cat: string): string {
    const m: any = { 'كرة القدم':'rose','السباحة':'ice','السلة':'gold','الجري':'dark' };
    return m[cat] || '';
  }

  emptyForm() {
    return {
      title: '',
      category: 'كرة القدم',
      desc: '',
      img: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  openModal(post?: Post): void {
    this.showModal    = true;
    this.showUrlInput = false;
    if (post) {
      this.editMode = true;
      this.editId   = post.id;
      this.form     = { title: post.title, category: post.category, desc: post.desc, img: post.img, date: post.date };
    } else {
      this.editMode = false;
      this.editId   = null;
      this.form     = this.emptyForm();
    }
  }

  closeModal(): void { this.showModal = false; }

  /** يفتح الـ file picker */
  triggerImgInput(): void {
    this.imgInput?.nativeElement?.click();
  }

  /** يحول الصورة المختارة لـ base64 */
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // تحقق من الحجم (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، الحد الأقصى 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.form.img = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // نصفّر الـ input عشان يقدر يختار نفس الملف تاني
    (event.target as HTMLInputElement).value = '';
  }

  savePost(): void {
    if (!this.form.title || !this.form.desc) return;
    const imgFallback = this.form.img || '/assets/images/posts.jpg';
    const data = { ...this.form, img: imgFallback };

    if (this.editMode && this.editId) {
      this.postsService.updatePost(this.editId, data);
    } else {
      this.postsService.addPost(data);
    }
    this.closeModal();
  }

  confirmDelete(p: Post): void { this.deleteTarget = p; }

  doDelete(): void {
    if (this.deleteTarget) this.postsService.deletePost(this.deleteTarget.id);
    this.deleteTarget = null;
  }
}
