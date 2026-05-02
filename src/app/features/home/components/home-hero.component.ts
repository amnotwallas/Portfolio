import { Component, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrambleDirective } from '../../../shared/directives/scramble.directive';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule, ScrambleDirective],
  template: `
    <div class="mb-16">
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight whitespace-nowrap overflow-visible mb-2">
        <span class="font-extralight text-gray-400">Hi, I am </span>
        <span class="font-mono font-light text-retro-bright text-glow cursor-blink animate-typing inline-block" 
              [style.width.ch]="firstName.length"
              [style.animation-timing-function]="'steps(' + firstName.length + ', end)'">
          {{firstName}}
        </span>
      </h1>
      
      <div class="h-6 mt-4 md:mt-6">
        <p [appScramble]="activeTitle" 
           class="font-extralight text-retro-yellow uppercase tracking-[0.2em] md:tracking-[0.3em] lg:tracking-[0.4em] text-[9px] md:text-xs">
        </p>
      </div>
    </div>
  `
})
export class HomeHeroComponent {
  @Input() firstName: string = '';
  @Input() activeTitle: string = '';
}
