import { Component, signal, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Footer } from './shared/components/footer/footer.component';
import { NavComponent } from './shared/components/nav/nav.component';
import { ChatComponent } from './shared/components/chat/chat.component';
import { LanguageService } from './core/services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavComponent, Footer, ChatComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private router = inject(Router);
  langService = inject(LanguageService);

  isProjectRoute = signal(false);

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((e) => {
      this.isProjectRoute.set(e.urlAfterRedirects.includes('/project/'));
    });
  }
}
