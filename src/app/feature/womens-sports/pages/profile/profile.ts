import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { AuthService } from 'app/core/services/auth';
import { API_BASE } from 'app/core/services/api';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  user: any = null;
  isEditMode = signal(false);
  loading    = false;
  successMsg = '';
  errorMsg   = '';

  editName = '';
  editBio  = '';

  // ✅ فاضي مش unsplash
  coverImage  = '';
  avatarImage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  private get uploadHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.loadProfile();
  }

  loadProfile(): void {
    this.http.get<any>(`${API_BASE}/Profile`, { headers: this.headers }).pipe(
      catchError(() => of(null))
    ).subscribe(res => {
      if (res) {
        this.user = {
          id:         res.id || res.Id,
          name:       res.username || res.userName || res.UserName || '',
          email:      res.email || res.Email || '',
          bio:        res.bio || res.Bio || '',
          avatar:     res.profileImageUrl || res.avatar || '',
          violations: res.violationCount || res.violations || 0,
          isBanned:   res.isBanned || false,
        };
        this.editName    = this.user.name;
        this.editBio     = this.user.bio;
        this.avatarImage = this.user.avatar || '';
        this.authService.updateCurrentUser({ name: this.user.name, email: this.user.email, avatar: this.user.avatar });

        this.http.get<any>(`${API_BASE}/Profile/cover`, { headers: this.headers }).pipe(
          catchError(() => of(null))
        ).subscribe(coverRes => {
          const cover = coverRes?.coverUrl || coverRes?.CoverUrl || coverRes?.coverImageUrl;
          if (cover) {
            this.coverImage = cover;
            if (this.user?.id) localStorage.setItem(`cover_${this.user.id}`, cover);
          } else {
            const savedCover = localStorage.getItem(`cover_${this.user.id}`);
            if (savedCover) this.coverImage = savedCover;
          }
          this.cdr.detectChanges();
        });

      } else {
        this.user        = this.authService.currentUser();
        this.editName    = this.user?.name || '';
        this.editBio     = this.user?.bio  || '';
        this.avatarImage = this.user?.avatar || '';
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit(): void { this.isEditMode.set(!this.isEditMode()); }

  selectedFile: File | null = null;
  selectedCoverFile: File | null = null;

  saveChanges(): void {
    this.loading    = true;
    this.errorMsg   = '';
    this.successMsg = '';

    const formData = new FormData();
    if (this.editName) formData.append('Username', this.editName);
    if (this.editBio)  formData.append('Bio', this.editBio);
    if (this.selectedFile) formData.append('image', this.selectedFile);

    this.http.put<any>(`${API_BASE}/Profile`, formData, { headers: this.uploadHeaders }).pipe(
      catchError(err => {
        this.loading  = false;
        this.errorMsg = err?.error?.message || err?.error?.Message || 'حدث خطأ، حاول مرة أخرى';
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe(res => {
      if (res !== null) {
        this.loading = false;
        const newAvatar = res?.profileImageUrl || res?.ProfileImageUrl || this.avatarImage;

        this.user = { ...this.user, name: this.editName, bio: this.editBio, avatar: newAvatar };
        this.avatarImage  = newAvatar;
        this.selectedFile = null;
        this.authService.updateCurrentUser({ name: this.editName, bio: this.editBio, avatar: newAvatar });

        if (this.selectedCoverFile) {
          const coverFormData = new FormData();
          coverFormData.append('file', this.selectedCoverFile);

          this.http.put<any>(`${API_BASE}/Profile/update-cover`, coverFormData, { headers: this.uploadHeaders }).pipe(
            catchError(() => of(null))
          ).subscribe(coverRes => {
            const newCover = coverRes?.coverUrl || coverRes?.CoverUrl || coverRes?.coverImageUrl || this.coverImage;
            this.coverImage        = newCover;
            this.selectedCoverFile = null;
            if (this.user?.id) localStorage.setItem(`cover_${this.user.id}`, newCover);
            this.cdr.detectChanges();
          });
        }

        this.isEditMode.set(false);
        this.successMsg = 'تم تحديث الملف الشخصي بنجاح';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      }
    });
  }

  logout(): void    { this.authService.logout(); this.router.navigate(['/login']); }
  goToFeed(): void  { this.router.navigate(['/hero']); }
  goToPosts(): void { this.router.navigate(['/posts']); }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarImage = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onCoverChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedCoverFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.coverImage = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }
}