import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
  imports: [RouterLink]
})
export class Footer {

  constructor(private router: Router) {}

  userImage: string = 'https://i.pravatar.cc/150?img=3';

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}