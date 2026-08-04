import { Component, computed, inject, signal } from "@angular/core";
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from "@angular/common";
import { PortfolioData, Profile } from "../../models/portfolio.model";
import { PortfolioService } from "../../../core/services/portfolio.service";
import { UiService } from "../../../core/services/ui.service";
import { LanguageService } from "../../../core/services/language.service";
import { tablerBrandGithub, tablerBrandLinkedin, tablerMail, tablerCheck, tablerMessageCircle } from "@ng-icons/tabler-icons";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIcon, CommonModule],
  template: `
    <div class="fixed bottom-5.5 right-5.5 z-[200] flex items-center gap-1.5 px-3 py-2.5 rounded-full glass-card neo-border neo-shadow">
      @if (getProfileUrl('GitHub'); as gh) {
        <a [href]="gh" target="_blank" rel="noopener" title="GitHub"
           class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[var(--dock-idle)] text-[var(--ink)] hover:scale-110"
           style="transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);">
          <ng-icon [svg]="icons.tablerBrandGithub" size="18"></ng-icon>
        </a>
      }
      @if (getProfileUrl('LinkedIn'); as li) {
        <a [href]="li" target="_blank" rel="noopener" title="LinkedIn"
           class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[var(--dock-idle)] text-[var(--ink)] hover:scale-110"
           style="transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);">
          <ng-icon [svg]="icons.tablerBrandLinkedin" size="18"></ng-icon>
        </a>
      }
      @if (portfolio?.basics?.email) {
        <button (click)="copyEmail()" title="Copy email"
                class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[var(--dock-idle)] text-[var(--ink)] hover:scale-110"
                style="transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);">
          <ng-icon [svg]="isCopied() ? icons.tablerCheck : icons.tablerMail" size="18"></ng-icon>
        </button>
      }
      <a href="https://amnotwallas.github.io/Portfolio/" target="_blank" rel="noopener" title="CV"
         class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center font-[var(--font-mono)] font-bold text-xs hover:scale-110"
         style="background: var(--dock-cv-bg); color: var(--dock-cv-text); border: 2px solid var(--dock-cv-border); transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);">
        CV
      </a>
      <button (click)="uiService.toggleChat()" [title]="langService.t().chatTitle"
              class="relative w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[#15151A] text-[#FAFAF7] hover:scale-110"
              style="transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);">
        <ng-icon [svg]="icons.tablerMessageCircle" size="18"></ng-icon>
        <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4ADE80] border-2 border-[var(--bg)] animate-pulse-dot"></span>
      </button>
    </div>
  `
})
export class Footer {
  private portfolioService = inject(PortfolioService);
  uiService = inject(UiService);
  langService = inject(LanguageService);

  get portfolio(): PortfolioData | null { return this.portfolioService.portfolio; }

  readonly icons = { tablerBrandGithub, tablerBrandLinkedin, tablerMail, tablerCheck, tablerMessageCircle };

  isCopied = signal(false);

  getProfileUrl(network: string): string | null {
    const profiles = this.portfolio?.basics.profiles || [];
    return profiles.find((p: Profile) => p.network === network)?.url || null;
  }

  async copyEmail() {
    if (this.isCopied()) return;
    const email = this.portfolio?.basics.email;
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    } catch {
      // Clipboard API unavailable — silently ignore, matches prior fallback intent without inventing new UI copy.
    }
  }
}
