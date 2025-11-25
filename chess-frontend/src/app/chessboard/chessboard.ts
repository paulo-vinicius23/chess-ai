import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Chess } from 'chess.js';

@Component({
  selector: 'app-chessboard',
  standalone: true,
  templateUrl: './chessboard.html',
  styleUrls: ['./chessboard.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChessboardComponent {
  game = new Chess();

  onDrop(e: any) {
    const { source, target } = e.detail;

    const move = this.game.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    const board = document.getElementById('board');

    if (move) {
      // Movimento válido
      board?.setAttribute('position', this.game.fen());
    } else {
      // Movimento inválido → voltar peça para o lugar
      e.preventDefault(); // ISSO é que bloqueia o movimento
      board?.setAttribute('position', this.game.fen());
    }
  }
}
