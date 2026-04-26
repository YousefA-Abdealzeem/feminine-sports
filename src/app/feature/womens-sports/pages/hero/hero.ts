import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from 'app/core/services/posts';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit {

  selectedCategory = 'all';
  posts: any[] = [];

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.posts = this.postsService.getAllPosts();
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
  }

  get filteredPosts() {
    if (this.selectedCategory === 'all') {
      return this.posts;
    }
    return this.posts.filter(p => p.category === this.selectedCategory);
  }
}