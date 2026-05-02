import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from './shared/components/footer/footer.component';
import { SpeedDialComponent } from './shared/components/speeddial/speeddial.component';
import { LanguageService } from './core/services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Footer, SpeedDialComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  langService = inject(LanguageService);
}
