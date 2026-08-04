import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';
import { Profile } from '../../../shared/models/portfolio.model';

@Component({
  selector: 'app-home-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cv(); as data) {
      <section id="contact" class="relative z-[1] py-22.5 px-6 pb-40 text-center bg-[#15151A] text-[#FAFAF7]">
        <h2 class="font-[var(--font-display)] font-bold m-0 mb-4.5" style="font-size: clamp(30px, 5vw, 54px); letter-spacing: -0.02em;">{{ langService.t().contactTitle }}</h2>
        <div class="flex gap-3.5 justify-center flex-wrap mb-12.5">
          @if (data.basics.email) {
            <a [href]="'mailto:' + data.basics.email" class="font-[var(--font-display)] font-bold text-[15px] bg-[var(--color-lime)] text-[#15151A] neo-border rounded-full px-6.5 py-3.5 shadow-[4px_4px_0_#FAFAF7]">{{ data.basics.email }}</a>
          }
          @for (profile of data.basics.profiles; track profile.network) {
            <a [href]="profile.url" target="_blank" rel="noopener" class="font-[var(--font-display)] font-bold text-[15px] text-[#FAFAF7] border-2 border-[#FAFAF7] rounded-full px-6.5 py-3.5">{{ profile.network }}</a>
          }
        </div>
        <div class="font-[var(--font-mono)] text-[11.5px] text-white/35">
          &copy; {{ currentYear }} {{ data.basics.name }} @if (data.system.location.city) { &middot; {{ data.system.location.city }} }
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeContactComponent {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  cv = this.portfolioService.portfolioDataSignal;
  currentYear = new Date().getFullYear();
}
