import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-home-education',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cv(); as data) {
      @if (data.education.length || data.languages.length) {
        <section class="max-w-[980px] mx-auto px-6 pb-24 grid grid-cols-[1.4fr_1fr] gap-5">
          @if (education(); as edu) {
            <div class="p-6.5 rounded-[18px] glass-card">
              <div class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-2.5">{{ langService.t().educationEyebrow }}</div>
              <h3 class="font-[var(--font-display)] text-[19px] font-bold m-0 mb-1.5 text-[var(--ink)]">{{ edu.degree }}</h3>
              <div class="text-sm text-[var(--ink-soft)] mb-2">{{ edu.institution }} &middot; {{ edu.period }}</div>
            </div>
          }
          @if (data.languages.length) {
            <div class="p-6.5 rounded-[18px] bg-[#15151A] text-[#FAFAF7] neo-border neo-shadow-lime">
              <div class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-lime)] mb-2.5">{{ langService.t().languagesEyebrow }}</div>
              <div class="flex flex-col gap-2.5">
                @for (lg of data.languages; track lg.name) {
                  <div class="flex justify-between text-sm">
                    <span class="font-semibold">{{ lg.name }}</span><span class="opacity-70">{{ lg.level }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </section>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeEducationComponent {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  cv = this.portfolioService.portfolioDataSignal;
  education = computed(() => this.cv()?.education[0] ?? null);
}
