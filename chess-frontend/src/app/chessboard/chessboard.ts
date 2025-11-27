import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { Chess } from 'chess.js';
import { ErrorService } from '../services/error';

@Component({
  selector: 'app-chessboard',
  standalone: true,
  templateUrl: './chessboard.html',
  styleUrls: ['./chessboard.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChessboardComponent implements AfterViewInit, OnDestroy {

  constructor(public errorService: ErrorService) {}

  private showError(message: string) {
    this.errorService.show(message);
  }

  game = new Chess();

  // Referência para o <chess-board #boardElement ...>
  @ViewChild('boardElement', { static: true, read: ElementRef }) boardRef!: ElementRef;

  // Bound handlers para poder remover depois
  private boundOnDrop = (e: Event) => this.onDropNative(e as any);
  private boundOnPieceDrop = (e: Event) => this.onDropNative(e as any);

  // Interceptadores para impedir início do drag quando não for permitido
  private boundOnGrab = (e: Event) => this.onGrabNative(e as any);
  private boundOnDragStart = (e: Event) => this.onGrabNative(e as any);

  ngAfterViewInit(): void {
    const el = this.boardRef?.nativeElement as HTMLElement | undefined;
    if (!el) {
      console.error('Board element not found');
      return;
    }

    // Captura os eventos NA FASE DE CAPTURA para interceptar antes do handler interno do web component
    el.addEventListener('drop', this.boundOnDrop, { capture: true });
    el.addEventListener('piece-drop', this.boundOnPieceDrop, { capture: true });

    // Intercepta os eventos que iniciam o drag/pickup da peça (dependendo da versão):
    // tentamos várias opções: 'piece-grab', 'piece-grabbed', 'dragstart', 'mousedown' (algumas versões)
    el.addEventListener('piece-grab', this.boundOnGrab, { capture: true });
    el.addEventListener('piece-grabbed', this.boundOnGrab, { capture: true });
    el.addEventListener('dragstart', this.boundOnDragStart, { capture: true });
    el.addEventListener('mousedown', this.boundOnGrab, { capture: true });

    // garante sincronização inicial
    this.syncBoard();
  }

  ngOnDestroy(): void {
    const el = this.boardRef?.nativeElement as HTMLElement | undefined;
    if (!el) return;
    el.removeEventListener('drop', this.boundOnDrop, { capture: true } as any);
    el.removeEventListener('piece-drop', this.boundOnPieceDrop, { capture: true } as any);

    el.removeEventListener('piece-grab', this.boundOnGrab, { capture: true } as any);
    el.removeEventListener('piece-grabbed', this.boundOnGrab, { capture: true } as any);
    el.removeEventListener('dragstart', this.boundOnDragStart, { capture: true } as any);
    el.removeEventListener('mousedown', this.boundOnGrab, { capture: true } as any);
  }

  // Método chamado a partir do template também (backup)
  onDrop(e: any) {
    return this.onDropNative(e);
  }

  // ---------- Intercepta o start do "pegar" a peça
  private onGrabNative(e: any) {
    try {
      const detail = e?.detail ?? {};
      // Algumas versões passam source/oldSquare/from
      const source = detail.source ?? detail.from ?? detail.oldSquare ?? null;

      // Se não souber a origem, nada fazemos (por segurança sincronizamos)
      if (!source) {
        this.syncBoard();
        return;
      }

      // Usar chess.js para obter a peça naquele quadrado (retorna {type, color} ou null)
      const pieceObj = this.game.get(source); // ex: { type: 'p', color: 'w' } ou null

      // Se não houver peça, bloquear
      if (!pieceObj) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        this.syncBoard();
        return;
      }

      const currentTurn = this.game.turn(); // 'w' ou 'b'

      // Se a peça não for da cor do turno atual, impede o início do drag
      if (pieceObj.color !== currentTurn) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        // também tenta parar a propagação para evitar handlers internos
        if (typeof (e as any).stopImmediatePropagation === 'function') {
          (e as any).stopImmediatePropagation();
        }
        this.syncBoard();
        return;
      }

      // se passou nas checagens, permite o drag continuar normalmente
    } catch (err) {
      console.error('onGrabNative error', err);
      this.syncBoard();
    }
  }

  // ---------- Handler de drop robusto (valida jogada e sincroniza)
  private onDropNative(e: any) {
    try {
      const detail = e?.detail ?? {};
      const source = detail.source ?? detail.from ?? detail.oldSquare;
      const target = detail.target ?? detail.to ?? detail.newSquare;

      if (!source || !target) {
        this.syncBoard();
        return;
      }

      // tenta aplicar a jogada no engine (chess.js)
      const move = this.game.move({ from: source, to: target, promotion: 'q' });

      // se movido com sucesso:
      if (move) {
        // atualiza o tabuleiro visual com a FEN do engine (e o turno já foi invertido dentro do chess.js)
        this.syncBoard();
        return;
      }

      // movimento inválido
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof (e as any).stopImmediatePropagation === 'function') {
        (e as any).stopImmediatePropagation();
      }
      this.showError("Movimento inválido");
      this.syncBoard();
      return;
      
    } catch (err: any) {
      // chess.js pode lançar "Invalid move: {...}" — tratamos e sincronizamos
      console.warn('onDropNative caught', err?.message ?? err);
      if (typeof e.preventDefault === 'function') e.preventDefault();
      this.syncBoard();
    }
  }

  // força o position do chess-board com o FEN atual do game
  private syncBoard() {
    const el = this.boardRef?.nativeElement as HTMLElement | undefined;
    if (!el) return;
    el.setAttribute('position', this.game.fen());
  }
}
