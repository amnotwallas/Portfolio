import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerChevronLeft, tablerChevronRight } from '@ng-icons/tabler-icons';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-projects',
  standalone: true,
  imports: [CommonModule, NgIcon, RouterModule],
  providers: [provideIcons({ tablerChevronLeft, tablerChevronRight })],
  template: `
    <div id="projects" class="w-full max-w-[980px] mx-auto py-5 px-6 pb-28">
      <div class="flex items-center gap-3 mb-11">
        <span class="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)]">{{ langService.t().projectsEyebrow }}</span>
        <div class="flex-grow h-0.5 bg-[var(--ink)] opacity-15"></div>
      </div>
      <div class="flex items-baseline justify-between mb-8 flex-wrap gap-3">
        <h2 class="font-[var(--font-display)] font-bold m-0 text-[var(--ink)]" style="font-size: clamp(28px, 4vw, 42px); letter-spacing: -0.02em;">{{ langService.t().projectsTitle }}</h2>
        <div class="flex gap-2.5">
          <button (click)="prev()" class="w-10.5 h-10.5 rounded-full neo-border bg-[var(--card-bg)] flex items-center justify-center hover:scale-110" style="box-shadow: 2px 2px 0 var(--ink); transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);"><ng-icon name="tablerChevronLeft" size="16"></ng-icon></button>
          <button (click)="next()" class="w-10.5 h-10.5 rounded-full neo-border bg-[var(--card-bg)] flex items-center justify-center hover:scale-110" style="box-shadow: 2px 2px 0 var(--ink); transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);"><ng-icon name="tablerChevronRight" size="16"></ng-icon></button>
        </div>
      </div>

      @if (cvSignal(); as cv) {
        <div class="overflow-hidden rounded-[24px]">
          <div class="flex" style="transition: transform 0.55s cubic-bezier(0.22,1,0.36,1);" [style.transform]="'translateX(-' + (index() * 100) + '%)'">
            @for (item of cv.projects; track item.slug) {
              <div [id]="getProjectElementId(item.slug)" class="min-w-full p-1">
                <div class="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] rounded-[22px] neo-border-thick overflow-hidden glass-card" style="box-shadow: 6px 6px 0 var(--ink);" [class.animate-pulse]="isHighlighted(item.slug)">
                  <div class="relative min-h-[300px] w-full h-full flex items-center justify-center border-r-2.5 border-[var(--ink)] overflow-hidden bg-[var(--card-bg)]">
                    @if (resolvedImages[item.image]) {
                      <img [src]="resolvedImages[item.image]" [alt]="item.name" class="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105" />
                    }
                  </div>
                  <div class="p-7.5 flex flex-col gap-3.5">
                    <h3 class="font-[var(--font-display)] text-2xl font-bold m-0 text-[var(--ink)]">{{ item.name }}</h3>
                    <p class="text-[14.5px] leading-relaxed text-[var(--ink-soft)] m-0">{{ item.description }}</p>
                    <div class="flex flex-wrap gap-1.5">
                      @for (s of item.stack; track s) {
                        <span class="font-[var(--font-mono)] text-[10.5px] px-2.5 py-1 rounded-md bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--ink)]">{{ s }}</span>
                      }
                    </div>
                    <div class="flex gap-2.5 mt-1.5 flex-wrap items-center">
                      <a [routerLink]="['/project', item.slug]"
                         style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13.5px;
                                background: #C6FF6B; color: #15151A; border: 2px solid var(--ink);
                                border-radius: 9999px; padding: 10px 18px; box-shadow: 3px 3px 0 var(--ink);"
                         class="hover:scale-[1.03] transition-transform inline-block">
                        {{ langService.t().viewCaseLabel }}
                      </a>
                      @if (item.links.github) {
                        <a [href]="item.links.github" target="_blank" rel="noopener"
                           style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13.5px;
                                  background: var(--glass); color: var(--ink); border: 2px solid var(--ink);
                                  border-radius: 9999px; padding: 10px 18px;"
                           class="hover:scale-[1.03] transition-transform inline-block">
                          GitHub
                        </a>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="flex justify-center gap-2 mt-5">
          @for (item of cv.projects; track item.slug; let i = $index) {
            <button (click)="goTo(i)" class="h-2 rounded-full neo-border transition-all"
                    [style.width]="i === index() ? '26px' : '8px'"
                    [style.background]="i === index() ? 'var(--ink)' : 'var(--card-bg)'"></button>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeProjectsComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);
  langService = inject(LanguageService);

  cvSignal = this.portfolioService.portfolioDataSignal;
  index = signal(0);
  resolvedImages: { [key: string]: string } = {};
  highlightedProjectId: string | null = null;
  private sub = new Subscription();

  constructor() {
    effect(() => {
      const data = this.cvSignal();
      if (data) this.resolveAllImages(data);
    });
  }

  ngOnInit() {
    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        if (event.type === 'PROJECT') this.processHighlight(event.id);
      })
    );
  }

  getProjectElementId(slug: string): string {
    return 'project-' + slug.toLowerCase().trim();
  }

  isHighlighted(slug: string): boolean {
    return this.highlightedProjectId === this.getProjectElementId(slug);
  }

  private processHighlight(id: string) {
    const data = this.cvSignal();
    if (!data) { setTimeout(() => this.processHighlight(id), 500); return; }
    const targetId = id.toLowerCase().trim();
    const idx = data.projects.findIndex(p => p.slug === targetId || p.slug.includes(targetId) || p.name.toLowerCase().includes(targetId) || p.id === targetId);
    if (idx !== -1) {
      const project = data.projects[idx];
      this.index.set(idx);
      const elementId = this.getProjectElementId(project.slug);
      this.highlightedProjectId = null;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.highlightedProjectId = elementId;
        this.cdr.markForCheck();
        const el = document.getElementById(elementId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { this.highlightedProjectId = null; this.cdr.markForCheck(); }, 6000);
      }, 50);
    }
  }

  private async resolveAllImages(data: any) {
    await Promise.all(data.projects.map(async (project: any) => {
      if (!this.resolvedImages[project.image]) {
        this.resolvedImages[project.image] = await this.portfolioService.getSecureImage(project.image);
        this.cdr.markForCheck();
      }
    }));
  }

  prev() {
    const total = this.cvSignal()?.projects.length ?? 1;
    this.index.update(i => (i - 1 + total) % total);
  }

  next() {
    const total = this.cvSignal()?.projects.length ?? 1;
    this.index.update(i => (i + 1) % total);
  }

  goTo(i: number) {
    this.index.set(i);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
