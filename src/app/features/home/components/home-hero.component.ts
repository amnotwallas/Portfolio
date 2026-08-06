import { Component, inject, signal, computed, effect, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full flex flex-col items-center text-center px-6">
      @if (cv(); as data) {
        <!-- heroPre label: fades up first -->
        <div class="inline-block text-left mb-2 animate-fade-up" style="animation-delay: 0ms; animation-fill-mode: both;">
          <div class="font-[var(--font-display)] text-xl font-medium text-[var(--ink-soft)] mb-2">{{ langService.t().heroPre }}</div>

          <!-- Name + splash badge: springs up second -->
          <div class="relative inline-block mb-5 animate-spring-up" style="animation-delay: 100ms; animation-fill-mode: both;">
            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(48px, 9vw, 104px); font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin: 0; color: var(--ink);">
              {{ displayName(data.basics.name) }}
            </h1>
            @if (data.basics.open_to_relocate || data.basics.label) {
              <div class="absolute -top-12 right-2 lg:-right-28 lg:-top-10 rotate-[-8deg] pointer-events-none z-30 scale-90 lg:scale-100">
                <span class="splash-text-mc">
                  OPEN TO WORK!
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Typewriter row: fades up third -->
        <div class="animate-fade-up"
             style="height: 40px; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; animation-delay: 220ms; animation-fill-mode: both;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: clamp(14px, 2.4vw, 20px); font-weight: 500; color: #3B4CF0; letter-spacing: 0.02em;">
            {{ scrambleDisplay() }}<span style="animation: blinkCursor 1s step-end infinite;">|</span>
          </span>
        </div>

        <!-- Summary: minimal text, springs up fourth -->
        <div class="max-w-[580px] w-full animate-spring-up"
             style="animation-delay: 340ms; animation-fill-mode: both;">
          <p class="m-0 text-[18px] leading-[1.7] text-center" style="color: var(--ink-soft);">{{ data.basics.summary }}</p>
        </div>

        <!-- CTA buttons: springs up last -->
        <div class="flex gap-3.5 mt-8 flex-wrap justify-center animate-spring-up"
             style="animation-delay: 460ms; animation-fill-mode: both;">
          <!-- Primary: lifts on hover, pushes into shadow on active -->
          <button (click)="scrollTo('projects')"
                  class="font-[var(--font-display)] font-bold text-[15px] bg-[var(--ink)] text-[var(--bg)] neo-border rounded-full px-6.5 py-3.5 neo-shadow-lime"
                  style="transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease; cursor: pointer;"
                  onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='6px 6px 0 var(--color-lime)';"
                  onmouseleave="this.style.transform=''; this.style.boxShadow='';"
                  onmousedown="this.style.transform='translateX(4px) translateY(4px)'; this.style.boxShadow='0px 0px 0 var(--color-lime)';"
                  onmouseup="this.style.transform='translateY(-3px)'; this.style.boxShadow='6px 6px 0 var(--color-lime)';">
            {{ langService.t().ctaPrimary }}
          </button>
          <!-- Secondary: lifts on hover, gains neo-shadow on active -->
          <button (click)="scrollTo('contact')"
                  class="font-[var(--font-display)] font-bold text-[15px] glass-card text-[var(--ink)] rounded-full px-6.5 py-3.5 neo-border"
                  style="transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease; cursor: pointer;"
                  onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='4px 4px 0 var(--ink)';"
                  onmouseleave="this.style.transform=''; this.style.boxShadow='';"
                  onmousedown="this.style.transform='translateX(4px) translateY(4px)'; this.style.boxShadow='0px 0px 0 var(--ink)';"
                  onmouseup="this.style.transform='translateY(-3px)'; this.style.boxShadow='4px 4px 0 var(--ink)';">
            {{ langService.t().ctaSecondary }}
          </button>
        </div>
      } @else {
        <div class="space-y-4 w-full max-w-lg">
          <div class="skeleton w-3/4 h-16 mx-auto rounded-xl"></div>
          <div class="skeleton w-1/2 h-6 mx-auto rounded-lg"></div>
          <div class="skeleton w-full h-24 rounded-2xl"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeHeroComponent implements OnDestroy {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  cv = this.portfolioService.portfolioDataSignal;
  scrambleDisplay = signal('');

  private phraseIndex = 0;
  private scrambleInterval: any;
  private scrambleTimeout: any;

  constructor() {
    effect(() => {
      const data = this.cv();
      if (data && data.skills.length && !this.scrambleInterval && !this.scrambleTimeout) {
        this.runScramble();
      }
    });
  }

  private runScramble() {
    const data = this.cv();
    if (!data) return;
    // Use hero_titles from data.json if defined, otherwise fallback to label and work roles
    const phrases: string[] = data.basics.hero_titles && data.basics.hero_titles.length > 0
      ? data.basics.hero_titles
      : [];

    if (phrases.length === 0) {
      if (data.basics.label) phrases.push(data.basics.label);
      data.work.forEach(job => {
        if (job.role && !phrases.includes(job.role)) phrases.push(job.role);
      });
    }
    if (phrases.length === 0) data.skills.forEach(s => phrases.push(s.category));

    const target = phrases[this.phraseIndex % phrases.length];
    let frame = 0;
    const totalFrames = 18;
    clearInterval(this.scrambleInterval);
    this.scrambleInterval = setInterval(() => {
      frame++;
      const reveal = Math.floor((frame / totalFrames) * target.length);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        if (target[i] === ' ') { out += ' '; continue; }
        out += i < reveal ? target[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      this.scrambleDisplay.set(out);
      if (frame >= totalFrames) {
        clearInterval(this.scrambleInterval);
        this.scrambleDisplay.set(target);
        this.phraseIndex++;
        this.scrambleTimeout = setTimeout(() => this.runScramble(), 2400);
      }
    }, 35);
  }

  /** Strip middle names: keep first word + last two words.
   *  'Walter Jahir Ambriz Reyna' → 'Walter Ambriz Reyna' */
  displayName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 3) return fullName;
    return `${parts[0]} ${parts.slice(-2).join(' ')}`;
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  }

  ngOnDestroy() {
    clearInterval(this.scrambleInterval);
    clearTimeout(this.scrambleTimeout);
  }
}
