import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from 'app/core/services/posts';
import { FilterService } from 'app/core/services/filter';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit {

  posts: any[] = [];

  constructor(
    private postsService: PostsService,
    public filterService: FilterService
  ) {}

  ngOnInit() {
    this.posts = this.postsService.getAllPosts();
  }

  setCategory(cat: string) {
    this.filterService.setCategory(cat);
  }

  get selectedCategory(): string {
    return this.filterService.selectedCategory();
  }

  get filteredPosts() {
    const cat = this.filterService.selectedCategory();
    if (cat === 'all') return this.posts;
    return this.posts.filter(p => p.category === cat);
  }
}
