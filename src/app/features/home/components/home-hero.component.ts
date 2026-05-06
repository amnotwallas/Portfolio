import { Component, Input, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrambleDirective } from '../../../shared/directives/scramble.directive';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule, ScrambleDirective],
  template: `
    <div class="w-full flex flex-col items-center text-center px-6">
      <!-- Welcome Line -->
      <div class="mb-4 flex flex-col items-center">
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-9xl tracking-tighter leading-none mb-6 relative">
          <span class="font-extralight text-retro-font/40">Hi, I am </span>
          <br class="sm:hidden">
          
          <!-- Name Container: STABLE WRAPPER -->
          <span class="relative inline-block mt-2 sm:mt-0">
            @if (firstName) {
              <!-- Invisible placeholder to reserve full width -->
              <span class="font-mono font-light opacity-0 select-none pointer-events-none" aria-hidden="true">{{firstName}}</span>
              
              <!-- Animated Name (Absolute to avoid pushing layout) -->
              <span class="absolute left-0 top-0 flex items-baseline">
                <span class="font-mono font-light text-retro-bright text-glow-bright animate-typing inline-block" 
                      [style.width.ch]="firstName.length"
                      [style.animation-timing-function]="'steps(' + firstName.length + ', end)'">
                  {{firstName}}
                </span>
              </span>

              <!-- Minecraft Splash Text: Anchored to the STABLE wrapper -->
              <div class="absolute -bottom-6 right-0 sm:-bottom-2 sm:-right-16 md:-right-20 z-40 pointer-events-none origin-center">
                <span class="splash-text text-[10px] sm:text-xs md:text-sm lg:text-base tracking-widest uppercase">
                  {{ currentSplash }}
                </span>
              </div>
            } @else {
              <span class="skeleton skeleton-inline w-[8ch] h-[1em] opacity-30"></span>
            }
          </span>
        </h1>
      </div>
      
      <!-- Dynamic Title -->
      <div class="h-10 mb-10 flex items-center justify-center w-full overflow-hidden">
        <span class="font-mono text-base md:text-lg mr-4 text-retro-yellow/30">>></span>
        <div class="relative inline-flex items-center">
           <p class="font-mono font-medium uppercase tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm lg:text-xl opacity-0 select-none pointer-events-none whitespace-nowrap" aria-hidden="true">
             Crafting Intelligent Solutions
           </p>
           @if (activeTitle) {
             <p [appScramble]="activeTitle" 
                class="absolute left-0 top-0 w-full font-mono font-medium uppercase tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm lg:text-xl text-glow whitespace-nowrap"
                style="color: var(--color-retro-yellow);">
             </p>
           } @else {
             <div class="skeleton w-64 h-6"></div>
           }
        </div>
      </div>

      <!-- Professional Pitch -->
      <div class="max-w-3xl mx-auto px-8 sm:px-14 border-l-2 border-retro-yellow/20 py-3 text-left bg-white/2 rounded-r-2xl backdrop-blur-sm">
        @if (cv(); as data) {
          <p class="font-light text-base md:text-xl leading-relaxed text-retro-font/90">
            {{data.basics.summary}}
          </p>
        } @else {
          <div class="space-y-3">
            <div class="skeleton w-full h-4"></div>
            <div class="skeleton w-[90%] h-4"></div>
            <div class="skeleton w-[80%] h-4"></div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeHeroComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  cv = this.portfolioService.portfolioDataSignal;

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