import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.css',
})
export class LoadingScreen implements AfterViewInit {

  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;

    video.play().catch(err => {
      console.log('Video play failed:', err);
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}