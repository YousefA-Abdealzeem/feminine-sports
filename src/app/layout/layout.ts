import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../feature/womens-sports/shared/navbar/navbar';
import { Footer } from '../feature/womens-sports/shared/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [CommonModule,RouterOutlet, Navbar,Footer],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class Layout {}
