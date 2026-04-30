import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/frontend/pages/wrapper/app';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation, withViewTransitions } from '@angular/router';
import { routes } from './app/frontend/app.routes';


bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation(), withViewTransitions())
  ]
})
.catch((err) => console.error(err));
