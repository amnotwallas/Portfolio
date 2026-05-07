import { Component, inject, signal, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBriefcase, tablerChevronDown, tablerChevronUp } from '@ng-icons/tabler-icons';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-experience',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ tablerBriefcase, tablerChevronDown, tablerChevronUp })],
  template: `
    <div class="w-full max-w-4xl mx-auto py-12 px-6 group">
      <div class="flex items-center gap-4 mb-12">
        <div class="section-header-block">JOURNAL // EXPERIENCE</div>
        <div class="h-[1px] flex-grow bg-retro-yellow/10 group-hover:bg-retro-yellow/30 transition-colors"></div>
      </div>
      
      @if (cvSignal(); as cv) {
        <div class="relative space-y-8">
          @if (cv.work.length > 1) {
            <div class="absolute left-[11px] top-7 bottom-7 w-[2px] bg-retro-yellow z-0 opacity-20 shadow-[0_0_10px_rgba(255,176,0,0.1)]"></div>
          }

          @for (item of cv.work; track $index) {
            <div class="relative pl-14 sm:pl-24" [id]="getItemElementId(item.company)">
              <!-- Timeline Dot -->
              <div class="absolute left-0 top-7 w-6 h-6 flex items-center justify-center -translate-x-[1px] z-10 bg-retro-dark">
                <div class="w-4 h-4 rounded-full bg-retro-dark border-2 transition-all duration-300"
                    [class.border-retro-bright]="isExpanded($index)"
                    [class.border-retro-yellow/30]="!isExpanded($index)">
                  @if (isExpanded($index)) {
                    <div class="absolute inset-[3px] rounded-full bg-retro-bright shadow-[0_0_15px_rgba(255,213,79,0.8)]"></div>
                  }
                </div>
              </div>

              <!-- Accordion Item -->
              <div class="glass-effect rounded-xl border overflow-hidden transform-gpu transition-all duration-500 relative"
                  [class.animate-neural-highlight]="isHighlighted(item.company)"
                  [class.border-retro-yellow/40]="isExpanded($index) && !isHighlighted(item.company)"
                  [class.border-retro-yellow/5]="!isExpanded($index) && !isHighlighted(item.company)"
                  [class.shadow-[0_0_30px_rgba(255,176,0,0.05)]]="isExpanded($index)"
                  [class.scale-[1.02]]="isHighlighted(item.company)"
                  [class.z-20]="isHighlighted(item.company)">
                
                @if (isHighlighted(item.company)) {
                  <div class="absolute top-2 right-4 font-mono text-[8px] text-retro-yellow animate-pulse tracking-widest uppercase">
                    Neural_Focus_Active
                  </div>
                }

                <!-- Header -->
                <div (click)="toggleItem($index)" 
                    class="p-5 sm:p-7 cursor-pointer flex justify-between items-center gap-6 group/header">
                  
                  <div class="flex items-center gap-6 flex-grow">
                    <div class="hidden sm:flex w-12 h-12 rounded-lg bg-retro-dark border border-retro-yellow/10 items-center justify-center overflow-hidden flex-shrink-0 group-hover/header:border-retro-yellow/40 transition-all">
                      @if (item.image) {
                        <img [src]="item.image" class="w-full h-full object-cover opacity-40 group-hover/header:opacity-100 transition-opacity" [alt]="item.company">
                      } @else {
                        <ng-icon name="tablerBriefcase" class="text-retro-yellow/20" size="24"></ng-icon>
                      }
                    </div>

                    <div class="flex-grow">
                      <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-1">
                        <h3 class="text-lg font-bold transition-colors font-mono tracking-tight"
                            [class.text-retro-bright]="isExpanded($index) || isHighlighted(item.company)"
                            [class.text-glow-bright]="isExpanded($index) || isHighlighted(item.company)">
                          {{item.role}}
                        </h3>
                        <span class="text-[10px] font-mono text-retro-yellow/20 uppercase tracking-widest hidden sm:block">::</span>
                        <p class="text-xs font-mono uppercase tracking-[0.2em] font-medium"
                          [class.text-retro-yellow]="isExpanded($index) || isHighlighted(item.company)">
                          {{item.company}}
                        </p>
                      </div>
                      <div class="sm:hidden text-[9px] font-mono text-retro-yellow/50 uppercase tracking-widest">
                        {{item.period}}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-6">
                    <span class="hidden sm:block text-[10px] font-mono text-retro-yellow/30 uppercase tracking-[0.2em] whitespace-nowrap">
                      {{item.period}}
                    </span>
                    <ng-icon [name]="isExpanded($index) ? 'tablerChevronUp' : 'tablerChevronDown'" 
                            class="text-retro-yellow/20 group-hover/header:text-retro-yellow transition-all duration-300"
                            size="20"></ng-icon>
                  </div>
                </div>

                <div class="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
                    [class.grid-rows-[1fr]]="isExpanded($index)"
                    [class.grid-rows-[0fr]]="!isExpanded($index)"
                    [class.opacity-100]="isExpanded($index)"
                    [class.opacity-0]="!isExpanded($index)">
                  <div class="overflow-hidden">
                    <div class="px-5 pb-8 sm:px-10 sm:pb-10 border-t border-retro-yellow/10 pt-8">
                      <p class="font-light text-base text-retro-font/80 leading-relaxed mb-8 max-w-2xl">
                        {{item.summary}}
                      </p>
                      <div class="flex flex-wrap gap-2">
                        @for (tech of item.highlights; track $index) {
                          <span class="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg bg-retro-yellow/5 text-retro-yellow/70 border border-retro-yellow/10 hover:border-retro-yellow/30 hover:text-retro-yellow transition-all cursor-default">
                            {{tech}}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeExperienceComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);
  
  cvSignal = this.portfolioService.portfolioDataSignal;
  expandedIndex = signal<number | null>(0);
  highlightedExpId = signal<string | null>(null);
  private sub = new Subscription();

  ngOnInit() {
    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        if (event.type === 'EXPERIENCE') {
          this.processHighlight(event.id);
        }
      })
    );
  }

  getItemElementId(company: string): string {
    return 'exp-' + company.toLowerCase().trim().replace(/\s+/g, '-');
  }

  isHighlighted(company: string): boolean {
    return this.highlightedExpId() === this.getItemElementId(company);
  }

  private processHighlight(id: string) {
    const data = this.cvSignal();
    if (!data) {
      setTimeout(() => this.processHighlight(id), 500);
      return;
    }

    const targetId = id.toLowerCase().trim();
    let index = data.work.findIndex(w => {
      const company = w.company.toLowerCase().trim();
      return company === targetId || 
             company.includes(targetId) || 
             targetId.includes(company) ||
             company.replace(/\s+/g, '') === targetId.replace(/\s+/g, '');
    });

    if (index !== -1) {
      const elementId = this.getItemElementId(data.work[index].company);
      
      // Reset first to force re-animation if same ID
      this.highlightedExpId.set(null);
      this.cdr.markForCheck();

      setTimeout(() => {
        this.highlightedExpId.set(elementId);
        this.expandedIndex.set(index);
        this.cdr.markForCheck();

        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        // Duración de la animación: 6 segundos para que sea muy visible
        setTimeout(() => {
          this.highlightedExpId.set(null);
          this.cdr.markForCheck();
        }, 6000);
      }, 50);
    }
  }

  toggleItem(index: number) {
    this.expandedIndex.update(v => v === index ? null : index);
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex() === index;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
