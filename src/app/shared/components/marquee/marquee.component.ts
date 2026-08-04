import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (words().length) {
      <div class="relative z-[1] bg-[#15151A] py-4 overflow-hidden -rotate-1 -mx-1"
           style="border-top: 3px solid #15151A; border-bottom: 3px solid #15151A;">
        <div class="flex w-max" style="animation: marquee 26s linear infinite;">
          @for (word of words(); track $index) {
            <span class="font-[var(--font-display)] font-bold text-xl text-[#FAFAF7] px-5.5 whitespace-nowrap inline-flex items-center gap-5.5">
              {{ word }} <span class="text-[var(--color-lime)]">&#9670;</span>
            </span>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarqueeComponent {
  private portfolioService = inject(PortfolioService);

  words = computed(() => {
    const data = this.portfolioService.portfolioDataSignal();
    if (!data) return [];
    const items = data.skills.flatMap(s => s.items);
    return [...items, ...items];
  });
}
