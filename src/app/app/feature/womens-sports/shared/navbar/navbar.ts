import { Component, HostListener, ChangeDetectorRef, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FilterService } from 'app/core/services/filter';
import { AuthService } from 'app/core/services/auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [RouterLink, RouterLinkActive, CommonModule]
})
export class Navbar implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    public filterService: FilterService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  private intervalRef: any;
  isOpen = false;
  isFilterOpen = false;

  categories = [
    { value: 'all',       label: 'الجميع' },
    { value: 'كرة القدم', label: 'كرة القدم' },
    { value: 'السلة',     label: 'كرة السلة' },
    { value: 'السباحة',   label: 'السباحة' },
    { value: 'الجري',     label: 'الجري' },
  ];

  ngOnInit(): void {
    this.intervalRef = setInterval(() => {
      this.ngZone.run(() => this.cdr.detectChanges());
    }, 300);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalRef);
  }

  get userImage(): string {
    return this.authService.currentUser()?.avatar || '';
  }

  get userName(): string {
    return this.authService.currentUser()?.name || '';
  }

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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-wrapper')) this.isFilterOpen = false;
    if (this.isOpen && !target.closest('.menu') && !target.closest('.toggle')) this.isOpen = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.querySelector('.navbar-main');
    if (window.scrollY > 50) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  }
}
