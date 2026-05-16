import { Component, HostListener, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { PostsService } from 'app/core/services/posts';
import { AuthService } from 'app/core/services/auth';
import { API_BASE } from 'app/core/services/api';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit, AfterViewInit {
  collapsed  = false;
  mobileOpen = false;
  isMobile   = false;

  @ViewChild('sidebar', { static: true }) sidebarRef!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    public postsService: PostsService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private http: HttpClient
  ) {}

  get adminAvatar(): string {
    return this.authService.currentUser()?.avatar || 'https://i.pravatar.cc/150?img=10';
  }

  // ✅ getter واحد بس من الـ signal
  get flaggedCount(): number {
    return this.postsService.flaggedCountFromServer();
  }

  private intervalRef: any;

  ngOnInit(): void {
    if (!localStorage.getItem('isAdmin')) this.router.navigate(['/login-dashboard']);
    this.onResize();
    this.authService.fetchAndUpdateAvatar();
    this.loadFlaggedCount();
    this.intervalRef = setInterval(() => {
      this.ngZone.run(() => this.cdr.detectChanges());
    }, 300);
  }

  private loadFlaggedCount(): void {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      Authorization: `Bearer ${token}`
    });
    this.http.get<any[]>(`${API_BASE}/Admin/hate-speech`, { headers }).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      // ✅ حدث الـ signal مش الـ property
      this.postsService.flaggedCountFromServer.set((data || []).length);
      this.cdr.detectChanges();
    });
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

  get showLabels(): boolean {
    if (this.isMobile) return this.mobileOpen;
    return !this.collapsed;
  }

  toggleDesktop(): void { this.collapsed = !this.collapsed; }
  toggleSidebar(): void { this.mobileOpen = !this.mobileOpen; }

  onNavClick(): void {
    if (this.isMobile) this.mobileOpen = false;
  }

  logout(): void {
    clearInterval(this.intervalRef);
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/login-dashboard']);
  }

  @HostListener('window:resize')
  onResize(): void {
    const w = window.innerWidth;
    const wasMobile = this.isMobile;
    this.isMobile = w <= 900;
    if (wasMobile && !this.isMobile) this.mobileOpen = false;
  }
}