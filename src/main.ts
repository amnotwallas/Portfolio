import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withHashLocation, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { PortfolioService } from './app/core/services/portfolio.service';


bootstrapApplication(AppComponent, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes, 
      withHashLocation(), 
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          // Disable view transitions only for fragment-only navigation on the SAME page to prevent flickering
          // Comparing routeConfig is a reliable way to know if it's the same route definition
          if (from.routeConfig === to.routeConfig && to.fragment) {
            transition.skipTransition();
          }
        }
      }),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
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
