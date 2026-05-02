import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrambleDirective } from '../../../shared/directives/scramble.directive';
import { CVService } from '../../../core/services/cv.service';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule, ScrambleDirective],
  template: `
    <div class="w-full flex flex-col items-center text-center">
      <!-- Welcome Line -->
      <div class="mb-4">
        <h1 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-none mb-2">
          <span class="font-extralight text-gray-400">Hi, I am </span>
          <br class="sm:hidden">
          <span class="font-mono font-light text-retro-bright text-glow cursor-blink animate-typing inline-block" 
                [style.width.ch]="firstName.length"
                [style.animation-timing-function]="'steps(' + firstName.length + ', end)'">
            {{firstName}}
          </span>
        </h1>
      </div>
      
      <!-- Dynamic Title -->
      <div class="h-8 mb-10 flex items-center justify-center">
        <span class="font-mono text-sm md:text-base mr-3" style="color: var(--color-retro-yellow); opacity: 0.4;">></span>
        <p [appScramble]="activeTitle" 
           class="font-mono font-medium uppercase tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-sm lg:text-base text-glow"
           style="color: var(--color-retro-yellow);">
        </p>
      </div>

      <!-- Professional Pitch -->
      <div class="max-w-2xl mx-auto px-4 border-l-2 border-retro-yellow/10 pl-6 py-2">
        <p class="font-light text-base md:text-lg leading-relaxed text-gray-400 text-left animate-fade-in-up delay-300">
          {{cv.basics.summary}}
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeHeroComponent {
  private cvService = inject(CVService);
  cv = this.cvService.cv;

  @Input() firstName: string = '';
  @Input() activeTitle: string = '';
}
