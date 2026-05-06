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
      <!-- Header -->
      <div class="flex items-center gap-4 mb-12">
        <div class="section-header-block">JOURNAL // EXPERIENCE</div>
        <div class="h-[1px] flex-grow bg-retro-yellow/10 group-hover:bg-retro-yellow/30 transition-colors"></div>
      </div>
      
      @if (cvSignal(); as cv) {
        <div class="relative space-y-8">
          <!-- Vertical Line (Only if more than 1 item) -->
          @if (cv.work.length > 1) {
            <div class="absolute left-[11px] top-7 bottom-7 w-[2px] bg-retro-yellow z-0 opacity-20 shadow-[0_0_10px_rgba(255,176,0,0.1)]"></div>
          }

          @for (item of cv.work; track $index) {
            <div class="relative pl-14 sm:pl-24" 
                [id]="'experience-' + (item.company | lowercase)">
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
              <div class="glass-effect rounded-xl border overflow-hidden transform-gpu transition-all duration-500"
                  [class.border-retro-yellow/40]="isExpanded($index)"
                  [class.border-retro-yellow/5]="!isExpanded($index)"
                  [class.shadow-[0_0_30px_rgba(255,176,0,0.05)]]="isExpanded($index)">
                
                <!-- Header -->
                <div (click)="toggleItem($index)" 
                    class="p-5 sm:p-7 cursor-pointer flex justify-between items-center gap-6 group/header">
                  
                  <div class="flex items-center gap-6 flex-grow">
                    <!-- Company Logo/Icon -->
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
                            [class.text-retro-bright]="isExpanded($index)"
                            [class.text-glow-bright]="isExpanded($index)"
                            [class.text-retro-font]="!isExpanded($index)">
                          {{item.role}}
                        </h3>
                        <span class="text-[10px] font-mono text-retro-yellow/20 uppercase tracking-widest hidden sm:block">::</span>
                        <p class="text-xs font-mono uppercase tracking-[0.2em] font-medium"
                          [class.text-retro-yellow]="isExpanded($index)"
                          [class.text-retro-yellow/40]="!isExpanded($index)">
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

                <!-- Expansion Content -->
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
      } @else {
        <!-- Skeletons if no data -->
        <div class="relative space-y-8">
          @for (i of [1,2,3]; track i) {
            <div class="relative pl-14 sm:pl-24">
              <div class="absolute left-0 top-7 w-6 h-6 flex items-center justify-center -translate-x-[1px] z-10 bg-retro-dark">
                <div class="w-4 h-4 rounded-full border-2 border-retro-yellow/10"></div>
              </div>
              <div class="glass-effect rounded-xl border border-retro-yellow/5 p-7">
                <div class="h-6 w-64 skeleton mb-4"></div>
                <div class="h-4 w-3/4 skeleton"></div>
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
  highlightedExp: string | null = null;
  private sub = new Subscription();

  ngOnInit() {
    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        const data = this.cvSignal();
        if (event.type === 'EXPERIENCE' && data) {
          let targetId = event.id.toLowerCase();
          
          // Find index by exact match or partial match
          let index = data.work.findIndex(w => w.company.toLowerCase() === targetId);
          
          if (index === -1) {
            // Try fuzzy match (contains)
            index = data.work.findIndex(w => w.company.toLowerCase().includes(targetId));
          }

          if (index !== -1) {
            const actualCompanyId = data.work[index].company.toLowerCase();
            this.highlightedExp = actualCompanyId;
            this.expandedIndex.set(index);
            this.cdr.markForCheck();

            setTimeout(() => {
              const el = document.getElementById('experience-' + actualCompanyId);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);

            setTimeout(() => {
              this.highlightedExp = null;
              this.cdr.markForCheck();
            }, 5000);
          }
        }
      })
    );
  }

  toggleItem(index: number) {
    if (this.expandedIndex() === index) {
      this.expandedIndex.set(null);
    } else {
      this.expandedIndex.set(index);
    }
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex() === index;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
