import { Component, Input, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrambleDirective } from '../../../shared/directives/scramble.directive';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule, ScrambleDirective],
  template: `
    <div class="w-full flex flex-col items-center text-center">
      <!-- Welcome Line -->
      <div class="mb-4 flex flex-col items-center">
        <h1 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-none mb-2 relative">
          <span class="font-extralight text-gray-400">Hi, I am </span>
          <br class="sm:hidden">
          
          <!-- Name Container with space reservation -->
          <span class="relative inline-block">
            <!-- Invisible placeholder to reserve full width from start -->
            <span class="font-mono font-light opacity-0 select-none pointer-events-none" aria-hidden="true">{{firstName}}</span>
            
            <!-- Real animated name -->
            <span class="glitch-wrapper absolute left-0 top-0 w-full">
              <span class="font-mono font-light text-retro-bright text-glow cursor-blink animate-typing inline-block glitch-text" 
                    [attr.data-text]="firstName"
                    [style.width.ch]="firstName.length"
                    [style.animation-timing-function]="'steps(' + firstName.length + ', end)'">
                {{firstName}}
              </span>
            </span>

            <!-- Minecraft Splash Text: Now truly stable -->
            <div class="absolute -bottom-2 -right-8 sm:-right-12 md:-right-16 z-40 pointer-events-none origin-center">
              <span class="splash-text text-[10px] sm:text-xs md:text-sm lg:text-base uppercase">
                {{ currentSplash }}
              </span>
            </div>
          </span>
        </h1>
      </div>
      
      <!-- Dynamic Title -->
      <div class="h-8 mb-4 flex items-center justify-center w-full overflow-hidden">
        <span class="font-mono text-sm md:text-base mr-3" style="color: var(--color-retro-yellow); opacity: 0.4;">></span>
        <div class="relative inline-flex items-center">
           <!-- Reserve space for the longest title to prevent layout shaking -->
           <p class="font-mono font-medium uppercase tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-sm lg:text-base opacity-0 select-none pointer-events-none whitespace-nowrap" aria-hidden="true">
             Crafting Intelligent Solutions
           </p>
           <p [appScramble]="activeTitle" 
              class="absolute left-0 top-0 w-full font-mono font-medium uppercase tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-sm lg:text-base text-glow whitespace-nowrap"
              style="color: var(--color-retro-yellow);">
           </p>
        </div>
      </div>

      <!-- Professional Pitch: Clean & Minimalist -->
      <div class="max-w-2xl mx-auto px-6 border-l border-retro-yellow/20 py-1 text-left opacity-0 animate-fade-in delay-300">
        <p class="font-light text-base md:text-lg leading-relaxed text-gray-400">
          {{cv.basics.summary}}
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeHeroComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  cv = this.portfolioService.portfolio;

  @Input() firstName: string = '';
  @Input() activeTitle: string = '';

  splashPhrases = [
    'Available for work!',
  ];
  currentSplash = '';

  ngOnInit() {
    this.currentSplash = this.splashPhrases[Math.floor(Math.random() * this.splashPhrases.length)];
  }
}