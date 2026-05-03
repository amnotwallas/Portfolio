import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withHashLocation, withViewTransitions } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { PortfolioService } from './app/core/services/portfolio.service';


bootstrapApplication(AppComponent, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation(), withViewTransitions()),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (portfolioService: PortfolioService) => () => portfolioService.init(),
      deps: [PortfolioService],
      multi: true
    }
  ]
})
.catch((err) => console.error(err));
