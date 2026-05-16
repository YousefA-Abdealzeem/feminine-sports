import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.css',
})
export class LoadingScreen implements AfterViewInit, OnDestroy {

  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    video.muted = true;
    video.play().catch(() => {});
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.pause();
      this.videoRef.nativeElement.src = '';
    }
  }
}