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

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}