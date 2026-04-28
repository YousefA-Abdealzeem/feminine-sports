import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FilterService } from 'app/core/services/filter';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [RouterLink, RouterLinkActive, CommonModule]
})
export class Navbar {

  constructor(private router: Router, public filterService: FilterService) {}

  isOpen = false;
  isFilterOpen = false;

  categories = [
    { value: 'all',       label: 'الجميع' },
    { value: 'كرة القدم', label: 'كرة القدم' },
    { value: 'السلة',     label: 'كرة السلة' },
    { value: 'السباحة',   label: 'السباحة', },
    { value: 'الجري',     label: 'الجري' },
  ];

  userImage: string = 'https://i.pravatar.cc/150?img=3';

  toggleNavbar(): void {
    this.isOpen = !this.isOpen;
    if (this.isFilterOpen) this.isFilterOpen = false;
  }

  toggleFilter(event: Event): void {
    event.stopPropagation();
    this.isFilterOpen = !this.isFilterOpen;
  }

  setCategory(cat: string): void {
    this.filterService.setCategory(cat);
    this.isFilterOpen = false;
  }

  get selectedLabel(): string {
    return this.categories.find(c => c.value === this.filterService.selectedCategory())?.label || 'فلتر';
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-wrapper')) {
      this.isFilterOpen = false;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.querySelector('.navbar-main');
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }
}
