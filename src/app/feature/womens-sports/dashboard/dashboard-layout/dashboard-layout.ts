import { Component, HostListener, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostsService } from 'app/core/services/posts';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit, AfterViewInit {
  collapsed  = false;   // desktop: icon-only
  mobileOpen = false;   // mobile/tablet: sidebar open
  isMobile   = false;

  @ViewChild('sidebar', { static: true }) sidebarRef!: ElementRef<HTMLElement>;

  constructor(private router: Router, public postsService: PostsService) {}

  ngOnInit(): void {
    if (!localStorage.getItem('isAdmin')) this.router.navigate(['/login-dashboard']);
    this.onResize();
  }

  ngAfterViewInit(): void {
    const sidebar = this.sidebarRef.nativeElement;
    sidebar.addEventListener('wheel', (e: WheelEvent) => {
      const el = sidebar;
      const atTop    = el.scrollTop === 0 && e.deltaY < 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight && e.deltaY > 0;
      if (atTop || atBottom) e.preventDefault();
    }, { passive: false });

    sidebar.addEventListener('touchmove', (e: TouchEvent) => {
      e.stopPropagation();
    }, { passive: true });
  }

  /** هل يظهر النص بجانب الأيقونة؟ */
  get showLabels(): boolean {
    if (this.isMobile) return this.mobileOpen;
    return !this.collapsed;
  }

  get flaggedCount(): number { return this.postsService.flaggedComments.length; }

  /** Desktop: toggle collapse */
  toggleDesktop(): void { this.collapsed = !this.collapsed; }

  /** Mobile/Tablet: toggle sidebar drawer */
  toggleSidebar(): void { this.mobileOpen = !this.mobileOpen; }

  /** عند الضغط على أي لينك في الموبايل يقفل الـ drawer */
  onNavClick(): void {
    if (this.isMobile) this.mobileOpen = false;
  }

  logout(): void {
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/login-dashboard']);
  }

  @HostListener('window:resize')
  onResize(): void {
    const w = window.innerWidth;
    const wasMobile = this.isMobile;
    this.isMobile = w <= 900;
    // لو رجع desktop نغلق الـ drawer
    if (wasMobile && !this.isMobile) this.mobileOpen = false;
  }
}
