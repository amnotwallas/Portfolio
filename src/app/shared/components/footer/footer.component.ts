import { Component, computed, inject, signal } from "@angular/core";
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from "@angular/common";
import { PortfolioData, Profile } from "../../models/portfolio.model";
import { PortfolioService } from "../../../core/services/portfolio.service";
import { UiService } from "../../../core/services/ui.service";
import { LanguageService } from "../../../core/services/language.service";
import { tablerBrandGithub, tablerBrandLinkedin, tablerMail, tablerCheck, tablerSparkles } from "@ng-icons/tabler-icons";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIcon, CommonModule],
  template: `
    <div class="fixed bottom-5.5 right-5.5 z-[200] flex flex-col items-end gap-2">
      
      <!-- Dynamic CV Tooltip Toast -->
      @if (showCvTooltip()) {
        <div (click)="openChatFromTooltip()"
             class="px-4 py-3 rounded-2xl glass-card neo-border neo-shadow cursor-pointer max-w-[320px] animate-spring-up"
             style="background: var(--ink); color: var(--bg); border: 2px solid var(--ink);">
          <div class="font-[var(--font-display)] font-bold text-xs leading-relaxed flex items-center gap-2">
            <span>💡 {{ langService.t().cvUnavailableTooltip }}</span>
          </div>
          <div class="font-[var(--font-mono)] text-[10.5px] text-[var(--color-lime)] mt-1.5 font-semibold underline">
            {{ langService.t().chatTitle }} &rarr;
          </div>
        </div>
      }

      <!-- Floating Dock -->
      <div class="flex items-center gap-1.5 px-3 py-2.5 rounded-full glass-card neo-border neo-shadow">
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
        
        <!-- CV Button (Triggers Tooltip & Invites to WALTER-AI) -->
        <button (click)="triggerCvTooltip()" title="CV"
                class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center font-[var(--font-mono)] font-bold text-xs hover:scale-110"
                style="background: var(--dock-cv-bg); color: var(--dock-cv-text); border: 2px solid var(--dock-cv-border); transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);">
          CV
        </button>

        <!-- WALTER-AI Agent Dock Button -->
        <button (click)="uiService.toggleChat()" [title]="langService.t().chatTitle"
                class="relative px-3.5 h-11.5 rounded-[14px] flex items-center gap-2 bg-[#15151A] text-[#FAFAF7] font-[var(--font-mono)] font-bold text-xs neo-border hover:scale-105"
                style="transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);">
          <ng-icon [svg]="icons.tablerSparkles" size="15" class="text-[var(--color-lime)]"></ng-icon>
          <span>WALTER-AI</span>
          <span class="w-2 h-2 rounded-full bg-[#4ADE80] border border-[var(--bg)] animate-pulse-dot"></span>
        </button>
      </div>
    </div>
  `
})
export class Footer {
  private portfolioService = inject(PortfolioService);
  uiService = inject(UiService);
  langService = inject(LanguageService);

  get portfolio(): PortfolioData | null { return this.portfolioService.portfolio; }

  readonly icons = { tablerBrandGithub, tablerBrandLinkedin, tablerMail, tablerCheck, tablerSparkles };

  isCopied = signal(false);
  showCvTooltip = signal(false);
  private tooltipTimeout: any;

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
      // Clipboard API unavailable
    }
  }

  triggerCvTooltip() {
    this.showCvTooltip.set(true);
    clearTimeout(this.tooltipTimeout);
    this.tooltipTimeout = setTimeout(() => this.showCvTooltip.set(false), 4000);
  }

  openChatFromTooltip() {
    this.showCvTooltip.set(false);
    if (!this.uiService.chatOpen()) {
      this.uiService.toggleChat();
    }
  }
}
