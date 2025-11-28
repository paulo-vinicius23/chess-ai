import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private msgSubject = new BehaviorSubject<string | null>(null);
  message$ = this.msgSubject.asObservable();

  show(msg: string) {
    this.msgSubject.next(msg);

    setTimeout(() => {
      this.msgSubject.next(null);
    }, 1500);
  }
}
