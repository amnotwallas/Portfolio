import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBriefcase } from '@ng-icons/tabler-icons';
import { CVService } from '../../../core/services/cv.service';

@Component({
  selector: 'app-home-experience',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ tablerBriefcase })],
  template: `
    <section id="experience" class="w-full max-w-4xl mx-auto py-20 px-6 group animate-fade-in-up">
      <div class="flex items-center gap-3 mb-12">
        <ng-icon name="tablerBriefcase" class="text-retro-bright text-2xl"></ng-icon>
        <h2 class="text-lg font-bold uppercase tracking-[0.2em] text-retro-bright font-mono">Experience</h2>
        <div class="h-[1px] flex-grow bg-retro-muted group-hover:bg-retro-yellow/30 transition-colors"></div>
      </div>

      <div class="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-retro-muted">
        @for (item of cv.work; track $index) {
        <div class="relative pl-12 group/item">
          <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-retro-dark border border-retro-muted flex items-center justify-center z-10 group-hover/item:border-retro-yellow transition-colors overflow-hidden">
            @if (item.image) {
              <img [src]="item.image" class="w-full h-full object-cover opacity-80 group-hover/item:opacity-100 transition-opacity" [alt]="item.company">
            } @else {
              <div class="w-2 h-2 rounded-full bg-retro-yellow shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
            }
          </div>
          
          <div class="flex flex-col lg:flex-row lg:items-baseline justify-between mb-2 gap-2">
            <h3 class="text-xl font-bold text-gray-100 group-hover/item:text-retro-yellow transition-colors">{{item.role}}</h3>
            <span class="text-retro-yellow text-[10px] font-mono px-2 py-0.5 rounded bg-retro-yellow/10 border border-retro-yellow/20 self-start lg:self-auto uppercase tracking-wider">
              {{item.period}}
            </span>
          </div>
          <p class="text-retro-yellow/80 text-sm font-medium mb-4 uppercase tracking-widest font-mono">{{item.company}}</p>
          <p class="font-light text-base text-gray-400 leading-relaxed mb-6">{{item.summary}}</p>
          
          <div class="flex flex-wrap gap-2">
            @for (tech of item.highlights; track $index) {
              <span class="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg glass-effect text-gray-400 group-hover/item:text-retro-yellow/80 group-hover/item:border-retro-yellow/20 transition-all">
                {{tech}}
              </span>
            }
          </div>
        </div>
        }
      </div>
    </section>
  `
})
export class HomeExperienceComponent {
  private cvService = inject(CVService);
  cv = this.cvService.cv;
}
