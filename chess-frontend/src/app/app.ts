import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChessboardComponent } from './chessboard/chessboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ChessboardComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('chess-frontend');
}
