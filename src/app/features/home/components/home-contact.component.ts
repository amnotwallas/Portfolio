import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { LanguageService } from '../../../core/services/language.service';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-home-contact',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    @if (cv(); as data) {
      <section id="contact" class="relative z-[1] text-center bg-[#15151A] text-[#FAFAF7] overflow-hidden"
               style="padding: 90px 24px 160px; border-top: 3px solid var(--glass-border);">

        <!-- Decorative: lime diamond top-left -->
        <div class="absolute pointer-events-none z-0" aria-hidden="true"
             style="top: -48px; left: -48px; width: 160px; height: 160px;
                    background: #C6FF6B; opacity: 0.12; transform: rotate(45deg); border-radius: 20px;">
        </div>

        <!-- Decorative: lime diamond bottom-right -->
        <div class="absolute pointer-events-none z-0" aria-hidden="true"
             style="bottom: -64px; right: -64px; width: 220px; height: 220px;
                    background: #C6FF6B; opacity: 0.08; transform: rotate(45deg); border-radius: 24px;">
        </div>

        <!-- Decorative: radial lime spotlight behind CTAs -->
        <div class="absolute pointer-events-none z-0" aria-hidden="true"
             style="top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 600px; height: 300px;
                    background: radial-gradient(ellipse, rgba(198,255,107,0.08) 0%, transparent 70%);
                    filter: blur(2px);">
        </div>

        <!-- Content -->
        <div class="relative z-10">
          <h2 class="font-bold m-0 mb-[18px]"
              scrollReveal="spring-up"
              style="font-size: clamp(30px, 5vw, 54px); letter-spacing: -0.02em; font-family: var(--font-display);">
            {{ langService.t().contactTitle }}
          </h2>
          @if (langService.t().footerTag) {
            <p style="font-size: 16px; color: rgba(250,250,247,0.6); max-width: 480px; margin: 0 auto 32px; line-height: 1.6; font-family: var(--font-body);">
              {{ langService.t().footerTag }}
            </p>
          }
          <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 50px;" scrollReveal="spring-up" [revealDelay]="120">
            @if (data.basics.email) {
              <button (click)="copyEmail(data.basics.email)"
                class="cursor-pointer"
                style="font-family: var(--font-display); font-weight: 700; font-size: 15px;
                       background: #C6FF6B; color: #15151A;
                       border: 2px solid #C6FF6B; border-radius: 9999px;
                       padding: 13px 26px; box-shadow: 4px 4px 0 #FAFAF7;
                       transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;"
                onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='6px 6px 0 #FAFAF7';"
                onmouseleave="this.style.transform=''; this.style.boxShadow='4px 4px 0 #FAFAF7';"
                onmousedown="this.style.transform='translateX(4px) translateY(4px)'; this.style.boxShadow='0px 0px 0 #FAFAF7';"
                onmouseup="this.style.transform='translateY(-3px)'; this.style.boxShadow='6px 6px 0 #FAFAF7';">
                @if (copied()) {
                  ✓ {{ langService.t().emailCopied }}
                } @else {
                  {{ data.basics.email }}
                }
              </button>
            }
            @for (profile of data.basics.profiles; track profile.network) {
              <a [href]="profile.url" target="_blank" rel="noopener"
                style="font-family: var(--font-display); font-weight: 700; font-size: 15px;
                       color: #FAFAF7; border: 2px solid #FAFAF7; border-radius: 9999px;
                       padding: 13px 26px; display: inline-block;
                       transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;"
                onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='4px 4px 0 #FAFAF7';"
                onmouseleave="this.style.transform=''; this.style.boxShadow='';"
                onmousedown="this.style.transform='translateX(4px) translateY(4px)'; this.style.boxShadow='0px 0px 0 #FAFAF7';"
                onmouseup="this.style.transform='translateY(-3px)'; this.style.boxShadow='4px 4px 0 #FAFAF7';">
                {{ profile.network }}
              </a>
            }
          </div>
          <div style="font-family: var(--font-mono); font-size: 11.5px; color: rgba(250,250,247,0.35);">
            &copy; {{ currentYear }} {{ data.basics.name }}
            @if (data.basics.location) { &middot; {{ data.basics.location }} }
          </div>
        </div>
      </section>


      <!-- Toast notification -->
      @if (copied()) {
        <div style="position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
                    background: #15151A; color: #C6FF6B; border: 2px solid #C6FF6B;
                    border-radius: 999px; padding: 10px 20px;
                    font-family: var(--font-mono); font-size: 13px; font-weight: 700;
                    z-index: 9999; animation: fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both;">
          ✓ {{ langService.t().emailCopied }}
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeContactComponent {
  private portfolioService = inject(PortfolioService);
  langService = inject(LanguageService);

  cv = this.portfolioService.portfolioDataSignal;
  currentYear = new Date().getFullYear();
  copied = signal(false);

  async copyEmail(email: string) {
    if (this.copied()) return;
    try {
      await navigator.clipboard.writeText(email);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

}
