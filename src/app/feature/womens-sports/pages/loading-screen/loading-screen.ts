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

    // الطريقة 1: لو الفيديو جاهز — اشغّله فوراً
    if (video.readyState >= 3) {
      this.tryPlay(video);
      return;
    }

    // الطريقة 2: استنّى لحد ما يتحمل كافي
    video.addEventListener('canplay', () => {
      this.tryPlay(video);
    }, { once: true });

    // الطريقة 3: لو استنينا 3 ثواني ومشتغلش — خليه يحاول تاني
    setTimeout(() => {
      if (video.paused) {
        this.tryPlay(video);
      }
    }, 3000);

    // تأكد إن الفيديو بيحاول يتحمل
    video.load();
  }

private tryPlay(video: HTMLVideoElement): void {
  video.play()
    .then(() => {
      video.classList.add('playing'); // ✅ يظهر الفيديو بس لما يشتغل فعلاً
    })
    .catch(err => {
      video.classList.add('playing'); // يظهر الـ poster على الأقل مش سودا
      console.warn('Autoplay blocked:', err);
    });
}

  goLogin() {
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    // وقف الفيديو لما الكومبوننت يتشال
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.pause();
      this.videoRef.nativeElement.src = '';
    }
  }
}