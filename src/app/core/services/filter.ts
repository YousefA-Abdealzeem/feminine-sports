import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  selectedCategory = signal<string>('all');

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }
}
