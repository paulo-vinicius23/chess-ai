import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import 'chessboard-element';

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
});
