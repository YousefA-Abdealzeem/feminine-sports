import { AfterViewInit, Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [RouterLink , RouterLinkActive]

})
export class Navbar implements AfterViewInit {

  constructor(private router: Router) {}

  activeIndex = 1;

  // 👇 دي الصورة الافتراضية
  userImage: string = 'https://i.pravatar.cc/150?img=3';

  navItems = [
    { label: 'Hero', icon: 'fas fa-home-alt', link: '/hero' },
    { label: 'About', icon: 'far fa-address-book', link: '/about' },
    { label: 'Contact', icon: 'far fa-address-card', link: '/contact' },
    { label: 'Terms', icon: 'far fa-clone', link: '/terms' }
  ];

  ngAfterViewInit(): void {
    setTimeout(() => this.updateSelector());
  }

  setActive(index: number): void {
    this.activeIndex = index;
    this.router.navigate([this.navItems[index].link]);

    setTimeout(() => this.updateSelector());
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  updateSelector(): void {
    const tabs = document.getElementById('navbarSupportedContent');
    const activeItem = tabs?.querySelectorAll('li')[this.activeIndex] as HTMLElement;

    const horiSelector = document.querySelector('.hori-selector') as HTMLElement;

    if (!activeItem || !horiSelector) return;

    horiSelector.style.top = activeItem.offsetTop + 'px';
    horiSelector.style.left = activeItem.offsetLeft + 'px';
    horiSelector.style.height = activeItem.offsetHeight + 'px';
    horiSelector.style.width = activeItem.offsetWidth + 'px';
  }

  @HostListener('window:resize')
  onResize() {
    setTimeout(() => this.updateSelector(), 500);
  }

isOpen = false;

toggleNavbar(): void {
  this.isOpen = !this.isOpen;
}
}