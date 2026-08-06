import { Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { Subscription } from 'rxjs';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-home-experience',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <div id="experience" class="w-full max-w-[900px] mx-auto py-12 px-6">
      <div class="flex items-center gap-3 mb-11" scrollReveal="fade-up">
        <span class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)]">{{ langService.t().experienceEyebrow }}</span>
        <div class="flex-grow h-0.5 bg-[var(--ink)] opacity-15"></div>
      </div>
      <h2 class="font-[var(--font-display)] font-bold mb-12 text-[var(--ink)]" scrollReveal="spring-up" [revealDelay]="80" style="font-size: clamp(28px, 4vw, 42px); letter-spacing: -0.02em;">{{ langService.t().experienceTitle }}</h2>

      @if (cvSignal(); as cv) {
        @for (job of cv.work; track job.company; let i = $index) {
          <div [id]="getItemElementId(job.company)" class="grid grid-cols-[64px_1fr] gap-5 mb-7 items-start" scrollReveal="spring-up" [revealDelay]="i * 80">
            <div class="flex flex-col items-center">
              <div class="w-14 h-14 rounded-[14px] neo-border bg-[var(--card-bg)] overflow-hidden flex items-center justify-center neo-shadow flex-shrink-0 cursor-pointer"
                   (click)="toggleExpand(job.company)">
                @if (job.image) {
                  <img [src]="job.image" [alt]="job.company" class="w-full h-full object-contain p-1.5" />
                }
              </div>
              <div class="w-0.5 flex-grow bg-[var(--ink)] opacity-10 mt-2 min-h-[30px]"></div>
            </div>

            <div class="rounded-[18px] glass-card transition-all duration-300 overflow-hidden"
                 [class.neo-border]="isExpanded(job.company)"
                 [class.animate-pulse]="isHighlighted(job.company)">

              <!-- Header row: clickable to toggle accordion -->
              <div class="p-6 cursor-pointer flex flex-wrap items-center justify-between gap-2 select-none"
                   (click)="toggleExpand(job.company)">
                <div>
                  <div class="flex items-center gap-3">
                    <h3 class="font-[var(--font-display)] text-xl font-bold m-0 text-[var(--ink)]">{{ job.role }}</h3>
                    @if ($first) {
                      <span class="font-[var(--font-mono)] text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-lime)] text-[#15151A] neo-border">
                        CURRENT
                      </span>
                    }
                  </div>
                  <div class="font-[var(--font-display)] text-sm font-semibold text-[var(--color-accent)] mt-1">{{ job.company }}</div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="font-[var(--font-mono)] text-xs text-[var(--ink-soft)]">{{ job.period }}</span>
                  <div class="w-7 h-7 rounded-full border border-[var(--ink)] flex items-center justify-center text-xs font-bold"
                       style="transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);"
                       [class.rotate-180]="isExpanded(job.company)">
                    ▼
                  </div>
                </div>
              </div>

              <!-- Collapsible Content -->
              @if (isExpanded(job.company)) {
                <div class="px-6 pb-6 pt-0 border-t border-[var(--glass-border)] animate-spring-up">
                  <p class="text-[15px] leading-relaxed text-[var(--ink-soft)] my-3.5">{{ job.summary }}</p>

                  @if (job.achievements?.length) {
                    <div class="flex flex-col gap-2 mb-4">
                      @for (ach of job.achievements; track $index) {
                        <div class="flex gap-2.5 text-sm leading-relaxed text-[var(--ink-soft)]">
                          <span class="text-[var(--color-accent)] font-bold flex-shrink-0">&#9642;</span>{{ ach }}
                        </div>
                      }
                    </div>
                  }

                  @if (job.highlights?.length) {
                    <div class="flex flex-wrap gap-2">
                      @for (tag of job.highlights; track $index) {
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
  expandedCompany = signal<string | null>(null);

  private sub = new Subscription();

  ngOnInit() {
    // Set initial expanded job to the first one (current job)
    const data = this.cvSignal();
    if (data && data.work.length > 0) {
      this.expandedCompany.set(data.work[0].company);
    }

    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        if (event.type === 'EXPERIENCE') this.processHighlight(event.id);
      })
    );
  }

  isExpanded(company: string): boolean {
    // Default expand first job if none set
    if (this.expandedCompany() === null && this.cvSignal()?.work[0]?.company === company) {
      return true;
    }
    return this.expandedCompany() === company;
  }

  toggleExpand(company: string) {
    if (this.isExpanded(company)) {
      this.expandedCompany.set(null);
    } else {
      this.expandedCompany.set(company);
    }
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
      this.expandedCompany.set(match.company);
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
