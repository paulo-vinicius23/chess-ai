import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Chess } from 'chess.js';

@Component({
  selector: 'app-chessboard',
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChessboardComponent {
  game = new Chess();

  onMove(event: any) {
    const move = this.game.move({
      from: event.detail.from,
      to: event.detail.to,
      promotion: 'q'
    });

    console.log(move);
  }
}
