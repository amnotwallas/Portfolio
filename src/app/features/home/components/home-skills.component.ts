import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';

const SPANS = [3, 3, 2, 2, 2, 4];
const BENTO_VARS = ['--bento-1', '--bento-2', '--bento-3', '--bento-4', '--bento-5', '--bento-6'];

@Component({
  selector: 'app-home-skills',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="skills" class="w-full max-w-[980px] mx-auto py-5 px-6 pb-24">
      <div class="flex items-center gap-3 mb-11">
        <span class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)]">{{ langService.t().skillsEyebrow }}</span>
        <div class="flex-grow h-0.5 bg-[var(--ink)] opacity-15"></div>
      </div>
      <h2 class="font-[var(--font-display)] font-bold mb-8 text-[var(--ink)]" style="font-size: clamp(28px, 4vw, 42px); letter-spacing: -0.02em;">{{ langService.t().skillsTitle }}</h2>

      <div class="grid grid-cols-6 gap-4" style="grid-auto-rows: minmax(120px, auto);">
        @for (cat of categories(); track cat.name) {
          <div class="p-5.5 rounded-[18px] neo-border flex flex-col gap-3"
               [style.grid-column]="'span ' + cat.span"
               [style.background]="'var(' + cat.bg + ')'"
               [style.box-shadow]="'4px 4px 0 rgba(0,0,0,0.12)'"
               [style.color]="'var(--bento-text)'">
            <div class="font-[var(--font-display)] font-bold text-base">{{ cat.name }}</div>
            <div class="flex flex-wrap gap-2">
              @for (item of cat.items; track item) {
                <span class="font-[var(--font-mono)] text-[11.5px] font-semibold px-2.5 py-1 rounded-[7px] bg-[var(--chip-bg)] text-[var(--chip-text)] border border-[var(--chip-border)] backdrop-blur-xs">{{ item }}</span>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeSkillsComponent {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  categories = computed(() => {
    const data = this.portfolioService.portfolioDataSignal();
    if (!data) return [];
    return data.skills.map((s, i) => ({
      name: s.category,
      items: s.items,
      span: SPANS[i % SPANS.length],
      bg: BENTO_VARS[i % BENTO_VARS.length]
    }));
  });
}
