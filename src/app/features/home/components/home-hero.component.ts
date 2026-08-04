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
        <div class="inline-block text-left mb-2">
          <div class="font-[var(--font-display)] text-xl font-medium text-[var(--ink-soft)] mb-2">{{ langService.t().heroPre }}</div>
          <div class="relative inline-block mb-5">
            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(48px, 9vw, 104px); font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin: 0; color: var(--ink);">
              {{ displayName(data.basics.name) }}
            </h1>
            @if (data.basics.open_to_relocate || data.basics.label) {
              <div class="absolute -top-4.5 -right-17 rotate-[-8deg]" style="animation: splashPop 1.6s ease-in-out infinite;">
                <span class="font-bold text-xs tracking-wide bg-[var(--color-lime)] text-[#15151A] neo-border rounded-lg px-2.5 py-1.5 neo-shadow whitespace-nowrap inline-block"
                      style="font-family: 'Space Grotesk', sans-serif;">
                  OPEN TO WORK
                </span>
              </div>
            }
          </div>
        </div>

        <div style="height: 40px; display: flex; align-items: center; justify-content: center; margin-bottom: 30px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: clamp(14px, 2.4vw, 20px); font-weight: 500; color: #3B4CF0; letter-spacing: 0.02em;">
            {{ scrambleDisplay() }}<span style="animation: blinkCursor 1s step-end infinite;">|</span>
          </span>
        </div>

        <div class="max-w-[640px] px-7 py-5.5 rounded-[20px] glass-card border-l-4 border-l-[var(--ink)]">
          <p class="m-0 text-[17px] leading-relaxed text-[var(--ink-soft)]">{{ data.basics.summary }}</p>
        </div>

        <div class="flex gap-3.5 mt-8 flex-wrap justify-center">
          <button (click)="scrollTo('projects')"
                  class="font-[var(--font-display)] font-bold text-[15px] bg-[var(--ink)] text-[var(--bg)] neo-border rounded-full px-6.5 py-3.5 neo-shadow-lime">
            {{ langService.t().ctaPrimary }}
          </button>
          <button (click)="scrollTo('contact')"
                  class="font-[var(--font-display)] font-bold text-[15px] glass-card text-[var(--ink)] rounded-full px-6.5 py-3.5">
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
