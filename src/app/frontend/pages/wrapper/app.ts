import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from '../../common/components/footer/footer.component';
import { SpeedDialComponent } from '../../common/components/speeddial/speeddial.component';
import { LanguageService } from '../../common/services/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Footer, SpeedDialComponent, CommonModule],
  templateUrl: './app.html',
})
export class App {
  langService = inject(LanguageService);
}
