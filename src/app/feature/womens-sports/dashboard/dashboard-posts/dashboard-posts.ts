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

  readonly categoryMap: Record<string, string> = {
    'كرة القدم': 'كره القدم',
    'السباحة':   'السباحه',
    'السلة':     'السله',
    'الجري':     'الجري',
  };

  readonly categoryMapReverse: Record<string, string> = Object.fromEntries(
    Object.entries(this.categoryMap).map(([ar, en]) => [en, ar])
  );

  form: {
    title: string;
    category: string;
    desc: string;
    img: string;
    date: string;
    imageFile: File | null;
  } = this.emptyForm();

  constructor(public postsService: PostsService) {}

  get posts() { return this.postsService.posts; }

  get filteredPosts(): Post[] {
    const q = this.searchTerm.trim().toLowerCase();
    const all = this.postsService.getAllPosts();
    return q ? all.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : all;
  }

  displayCategory(cat: string): string {
    return this.categoryMapReverse[cat] || cat;
  }

  badgeClass(cat: string): string {
    const key = this.categoryMapReverse[cat] || cat;
    const m: any = { 'كرة القدم':'rose','السباحة':'ice','السلة':'gold','الجري':'dark' };
    return m[key] || '';
  }

  emptyForm() {
    return {
      title: '',
      category: 'كرة القدم',
      desc: '',
      img: '',
      date: new Date().toISOString().split('T')[0],
      imageFile: null as File | null
    };
  }

  openModal(post?: Post): void {
    this.showModal    = true;
    this.showUrlInput = false;
    if (post) {
      this.editMode = true;
      this.editId   = post.id;
      const catAr = this.categoryMapReverse[post.category] || post.category;
      this.form = { title: post.title, category: catAr, desc: post.desc, img: post.img, date: post.date, imageFile: null };
    } else {
      this.editMode = false;
      this.editId   = null;
      this.form     = this.emptyForm();
    }
  }

  closeModal(): void { this.showModal = false; }

  triggerImgInput(): void {
    this.imgInput?.nativeElement?.click();
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، الحد الأقصى 5MB');
      return;
    }
    this.form.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.form.img = e.target?.result as string; };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  savePost(): void {
    if (this.form.title.trim().length < 5 || !this.form.category) return;

    const categoryEn = this.categoryMap[this.form.category] || this.form.category;

    const data = {
      title: this.form.title,
      category: categoryEn,
      desc: this.form.desc,
      imageFile: this.form.imageFile
    };

    if (this.editMode && this.editId) {
      this.postsService.editPost(this.editId, data);
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