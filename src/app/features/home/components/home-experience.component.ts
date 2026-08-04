import { Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="experience" class="w-full max-w-[900px] mx-auto py-12 px-6">
      <div class="flex items-center gap-3 mb-11">
        <span class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)]">{{ langService.t().experienceEyebrow }}</span>
        <div class="flex-grow h-0.5 bg-[var(--ink)] opacity-15"></div>
      </div>
      <h2 class="font-[var(--font-display)] font-bold mb-12 text-[var(--ink)]" style="font-size: clamp(28px, 4vw, 42px); letter-spacing: -0.02em;">{{ langService.t().experienceTitle }}</h2>

      @if (cvSignal(); as cv) {
        @for (job of cv.work; track $index) {
          <div [id]="getItemElementId(job.company)" class="grid grid-cols-[64px_1fr] gap-5 mb-9 items-start">
            <div class="flex flex-col items-center">
              <div class="w-14 h-14 rounded-[14px] neo-border bg-[var(--card-bg)] overflow-hidden flex items-center justify-center neo-shadow">
                @if (job.image) {
                  <img [src]="job.image" [alt]="job.company" class="w-full h-full object-contain p-1.5" />
                }
              </div>
              <div class="w-0.5 flex-grow bg-[var(--ink)] opacity-10 mt-2 min-h-[40px]"></div>
            </div>
            <div class="p-6 rounded-[18px] glass-card transition-all duration-500"
                 [class.animate-pulse]="isHighlighted(job.company)">
              <div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <h3 class="font-[var(--font-display)] text-xl font-bold m-0 text-[var(--ink)]">{{ job.role }}</h3>
                <span class="font-[var(--font-mono)] text-xs text-[var(--ink-soft)]">{{ job.period }}</span>
              </div>
              <div class="font-[var(--font-display)] text-sm font-semibold text-[var(--color-accent)] mb-3">{{ job.company }}</div>
              <p class="text-[15px] leading-relaxed text-[var(--ink-soft)] mb-3.5">{{ job.summary }}</p>
              @if (job.highlights?.length) {
                <div class="flex flex-col gap-2 mb-3.5">
                  @for (ach of job.highlights; track $index) {
                    <div class="flex gap-2.5 text-sm leading-relaxed text-[var(--ink-soft)]">
                      <span class="text-[var(--color-accent)] font-bold flex-shrink-0">&#9642;</span>{{ ach }}
                    </div>
                  }
                </div>
              }
              @if (job.tags?.length) {
                <div class="flex flex-wrap gap-2">
                  @for (tag of job.tags; track $index) {
                    <span class="font-[var(--font-mono)] text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--ink)]">{{ tag }}</span>
                  }
                </div>
              }
              @if (job.metrics?.length) {
                <div class="flex flex-wrap gap-2.5 mt-4">
                  @for (m of job.metrics; track $index) {
                    <span class="font-[var(--font-display)] text-[13px] font-bold px-3 py-1.5 rounded-full bg-[var(--color-lime)] text-[#15151A] neo-border">{{ m }}</span>
                  }
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeExperienceComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);
  langService = inject(LanguageService);

  cvSignal = this.portfolioService.portfolioDataSignal;
  highlightedExpId: string | null = null;
  private sub = new Subscription();

  ngOnInit() {
    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        if (event.type === 'EXPERIENCE') this.processHighlight(event.id);
      })
    );
  }

  getItemElementId(company: string): string {
    return 'exp-' + company.toLowerCase().trim().replace(/\s+/g, '-');
  }

  isHighlighted(company: string): boolean {
    return this.highlightedExpId === this.getItemElementId(company);
  }

  private processHighlight(id: string) {
    const data = this.cvSignal();
    if (!data) { setTimeout(() => this.processHighlight(id), 500); return; }

    const targetId = id.toLowerCase().trim();
    const match = data.work.find(w => {
      const company = w.company.toLowerCase().trim();
      return company === targetId || company.includes(targetId) || targetId.includes(company);
    });

    if (match) {
      const elementId = this.getItemElementId(match.company);
      this.highlightedExpId = null;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.highlightedExpId = elementId;
        this.cdr.markForCheck();
        const el = document.getElementById(elementId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { this.highlightedExpId = null; this.cdr.markForCheck(); }, 6000);
      }, 50);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
