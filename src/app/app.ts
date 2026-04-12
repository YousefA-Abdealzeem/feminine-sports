import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './feature/womens-sports/shared/navbar/navbar';
import { Footer } from './feature/womens-sports/shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , Navbar , Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('womens-sport');
}
