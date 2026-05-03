import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBriefcase, tablerChevronDown, tablerChevronUp } from '@ng-icons/tabler-icons';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-home-experience',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ tablerBriefcase, tablerChevronDown, tablerChevronUp })],
  template: `
    <div class="w-full max-w-4xl mx-auto py-24 px-6 group animate-fade-in-up"
         style="content-visibility: auto; contain-intrinsic-size: 500px;">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-16">
        <ng-icon name="tablerBriefcase" class="text-retro-bright text-2xl"></ng-icon>
        <h2 class="text-lg font-bold uppercase tracking-[0.2em] text-retro-bright font-mono">Experience</h2>
        <div class="h-[1px] flex-grow bg-retro-muted group-hover:bg-retro-yellow/30 transition-colors"></div>
      </div>
      <div class="relative space-y-10">
        <!-- Vertical Line (Only if more than 1 item) -->
        @if (cv.work.length > 1) {
          <div class="absolute left-[11px] top-7 bottom-7 w-[2px] bg-[#FFB000] z-0 opacity-30"></div>
        }

        @for (item of cv.work; track $index) {
          <div class="relative pl-14 sm:pl-20">
            <!-- Timeline Dot -->
            <div class="absolute left-0 top-7 w-6 h-6 flex items-center justify-center -translate-x-[1px] z-10 bg-[#0D0D0D]">
              <div class="w-3.5 h-3.5 rounded-full bg-[#0D0D0D] border-2 transition-all duration-300"
                   [class.border-retro-yellow]="isExpanded($index)"
                   [class.border-retro-muted]="!isExpanded($index)">
                @if (isExpanded($index)) {
                  <div class="absolute inset-0 rounded-full bg-retro-yellow animate-ping opacity-20"></div>
                  <div class="absolute inset-[3px] rounded-full bg-retro-yellow shadow-[0_0_10px_rgba(250,204,21,0.6)]"></div>
                }
              </div>
            </div>

            <!-- Accordion Item -->
            <div class="glass-effect rounded-xl border transition-all duration-300 overflow-hidden transform-gpu"
                 [class.border-retro-yellow/30]="isExpanded($index)"
                 [class.border-white/5]="!isExpanded($index)">
              
              <!-- Header -->
              <div (click)="toggleItem($index)" 
                   class="p-5 sm:p-6 cursor-pointer flex justify-between items-center gap-4 group/header">
                
                <div class="flex items-center gap-4 flex-grow">
                  <!-- Company Logo/Icon -->
                  <div class="hidden sm:flex w-10 h-10 rounded-lg bg-retro-dark border border-white/10 items-center justify-center overflow-hidden flex-shrink-0 group-hover/header:border-retro-yellow/30 transition-colors">
                    @if (item.image) {
                      <img [src]="item.image" class="w-full h-full object-cover opacity-60 group-hover/header:opacity-100 transition-opacity" [alt]="item.company">
                    } @else {
                      <ng-icon name="tablerBriefcase" class="text-retro-bright/20" size="20"></ng-icon>
                    }
                  </div>

                  <div class="flex-grow">
                    <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                      <h3 class="text-lg font-bold transition-colors"
                          [class.text-retro-yellow]="isExpanded($index)"
                          [class.text-gray-100]="!isExpanded($index)">
                        {{item.role}}
                      </h3>
                      <span class="text-[10px] font-mono text-retro-bright/40 uppercase tracking-widest hidden sm:block">/</span>
                      <p class="text-sm font-mono uppercase tracking-widest"
                         [class.text-retro-yellow/80]="isExpanded($index)"
                         [class.text-retro-bright/60]="!isExpanded($index)">
                        {{item.company}}
                      </p>
                    </div>
                    <div class="sm:hidden text-[10px] font-mono text-retro-yellow/60 uppercase tracking-wider mt-1">
                      {{item.period}}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <span class="hidden sm:block text-[10px] font-mono text-retro-yellow/60 uppercase tracking-widest whitespace-nowrap">
                    {{item.period}}
                  </span>
                  <ng-icon [name]="isExpanded($index) ? 'tablerChevronUp' : 'tablerChevronDown'" 
                           class="text-retro-bright/30 group-hover/header:text-retro-yellow transition-colors"
                           size="20"></ng-icon>
                </div>
              </div>

              <!-- Optimized Expansion using CSS Grid -->
              <div class="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                   [class.grid-rows-[1fr]]="isExpanded($index)"
                   [class.grid-rows-[0fr]]="!isExpanded($index)"
                   [class.opacity-100]="isExpanded($index)"
                   [class.opacity-0]="!isExpanded($index)">
                <div class="overflow-hidden">
                  <div class="px-5 pb-6 sm:px-6 sm:pb-8 border-t border-white/5 pt-6">
                    <p class="font-light text-base text-gray-400 leading-relaxed mb-8">
                      {{item.summary}}
                    </p>
                    
                    <div class="flex flex-wrap gap-2">
                      @for (tech of item.highlights; track $index) {
                        <span class="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg bg-black/40 text-gray-400 border border-white/5 hover:border-retro-yellow/20 hover:text-retro-yellow/80 transition-all cursor-default">
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeExperienceComponent {
  private portfolioService = inject(PortfolioService);
  cv = this.portfolioService.portfolio;

  expandedIndex = signal<number | null>(0);

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
}
