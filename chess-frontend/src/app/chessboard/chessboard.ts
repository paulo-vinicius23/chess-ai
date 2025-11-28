import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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

  @ViewChild('boardElement', { static: true, read: ElementRef })
  boardRef!: ElementRef;

  private boundOnDrop = (e: Event) => this.onDropNative(e as any);
  private boundOnPieceDrop = (e: Event) => this.onDropNative(e as any);

  private boundOnGrab = (e: Event) => this.onGrabNative(e as any);
  private boundOnDragStart = (e: Event) => this.onGrabNative(e as any);

  ngAfterViewInit(): void {
    this.errorService.message$.subscribe(msg => {
      const box = document.getElementById('error-box');
      if (!box) return;

      if (msg) {
        box.textContent = msg;
        box.classList.remove('hidden');
        box.classList.add('show');
      } else {
        box.classList.remove('show');
        setTimeout(() => box.classList.add('hidden'), 300);
      }
    });

    const el = this.boardRef?.nativeElement as HTMLElement;

    el.addEventListener('piece-drop', this.boundOnDrop, { capture: true });
    el.addEventListener('piece-grab', this.boundOnGrab, { capture: true });

    this.syncBoard();
  }

  ngOnDestroy(): void {
    const el = this.boardRef?.nativeElement as HTMLElement;
    if (!el) return;

    el.removeEventListener('drop', this.boundOnDrop, { capture: true } as any);
    el.removeEventListener('piece-drop', this.boundOnPieceDrop, { capture: true } as any);
    el.removeEventListener('piece-grab', this.boundOnGrab, { capture: true } as any);
    el.removeEventListener('piece-grabbed', this.boundOnGrab, { capture: true } as any);
    el.removeEventListener('dragstart', this.boundOnDragStart, { capture: true } as any);
    el.removeEventListener('mousedown', this.boundOnGrab, { capture: true } as any);
  }

  onDrop(e: any) {
    return this.onDropNative(e);
  }

  private onGrabNative(e: any) {
    try {
      const detail = e?.detail ?? {};
      const source = detail.source ?? detail.from ?? detail.oldSquare ?? null;

      if (!source) {
        this.syncBoard();
        return;
      }

      const pieceObj = this.game.get(source);
      if (!pieceObj) {
        e.preventDefault?.();
        this.syncBoard();
        return;
      }

      const currentTurn = this.game.turn();
      if (pieceObj.color !== currentTurn) {
        e.preventDefault?.();
        e.stopImmediatePropagation?.();
        this.showError("Não é sua vez!");
        this.syncBoard();
      }
    } catch {
      this.syncBoard();
    }
  }

  private onDropNative(e: any) {
    const detail = e?.detail ?? {};
    const from = detail.from ?? detail.source ?? detail.oldSquare;
    const to   = detail.to   ?? detail.target ?? detail.newSquare;

    if (!from || !to) {
      this.syncBoard();
      return;
    }

    try {
      const move = this.game.move({ from, to, promotion: "q" });
      
      if (move) {
        this.errorService.show(null as any);
        this.syncBoard();
    
        if (this.game.isCheckmate()) {
          this.showError("Cheque-mate!");
          setTimeout(() => {
            this.game.reset();
            this.syncBoard();
          }, 1200);
        }
        return;
      }

      // Jogada inválida → mostra erro e cancela
      this.handleInvalidMove(e);

    } catch {
      this.handleInvalidMove(e);
    }
  }

  private handleInvalidMove(e: any) {
    this.errorService.show("Jogada inválida");

    if (e.preventDefault) e.preventDefault();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    setTimeout(() => this.syncBoard(), 30);
  }

  private syncBoard() {
    const el = this.boardRef?.nativeElement as HTMLElement;
    if (!el) return;
    el.setAttribute('position', this.game.fen());
  }
}
