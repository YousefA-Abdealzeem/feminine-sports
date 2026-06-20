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
    public PostsService: PostsService,
    public FilterService: FilterService
  ) {}

  ngOnInit() {
    this.PostsService.loadPosts();
  }

  get selectedCategory() {
    return this.FilterService.selectedCategory();
  }

  setCategory(category: string) {
    this.FilterService.selectedCategory.set(category);
  }

get filteredPosts() {
  const cat = this.FilterService.selectedCategory();
  const all = this.PostsService.getAllPosts();
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