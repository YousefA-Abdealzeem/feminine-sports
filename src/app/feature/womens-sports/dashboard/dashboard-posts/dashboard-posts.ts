import { Component } from '@angular/core';
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

  searchTerm = '';
  showModal  = false;
  editMode   = false;
  editId: number | null = null;
  deleteTarget: Post | null = null;

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
    return { title:'', category:'كرة القدم', desc:'', img:'/assets/images/posts.jpg', date: new Date().toISOString().split('T')[0] };
  }

  openModal(post?: Post): void {
    this.showModal = true;
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

  savePost(): void {
    if (!this.form.title || !this.form.desc) return;
    if (this.editMode && this.editId) {
      this.postsService.updatePost(this.editId, this.form);
    } else {
      this.postsService.addPost(this.form);
    }
    this.closeModal();
  }

  confirmDelete(p: Post): void { this.deleteTarget = p; }

  doDelete(): void {
    if (this.deleteTarget) this.postsService.deletePost(this.deleteTarget.id);
    this.deleteTarget = null;
  }
}
