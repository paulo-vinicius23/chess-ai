import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorService {

  show(message: string) {
    const box = document.getElementById('error-box');
    if (!box) return;

    box.textContent = message;
    box.classList.remove('hidden');

    // esconder depois de 3 segundos
    setTimeout(() => {
      box.classList.add('hidden');
    }, 3000);
  }
}
