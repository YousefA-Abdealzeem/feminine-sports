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

  constructor(
    public postsService: PostsService,
    public filterService: FilterService
  ) {}

  ngOnInit() {
    this.postsService.loadPosts();
  }

  get selectedCategory() {
    return this.filterService.selectedCategory();
  }

  setCategory(category: string) {
    this.filterService.setCategory(category);
  }

get filteredPosts() {
  const cat = this.filterService.selectedCategory();
  const all = this.postsService.getAllPosts();
  if (cat === 'all') return all;

  const categoryMap: Record<string, string> = {
    'كرة القدم': 'كره القدم',
    'السباحة':   'السباحه',
    'السلة':     'السله',
    'الجري':     'الجري',
  };

  const mappedCat = categoryMap[cat] || cat;

  return all.filter(p =>
    p.category?.toLowerCase().trim() === mappedCat?.toLowerCase().trim()
  );
}
}