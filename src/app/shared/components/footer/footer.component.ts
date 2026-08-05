import { Component, computed, inject, signal, OnInit, OnDestroy } from "@angular/core";
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
      
      <!-- Dynamic Rotating Agent Invitation Bubble -->
      @if (!uiService.chatOpen() && !showCvTooltip() && showInvitation()) {
        <div (click)="openChatFromInvitation()"
             class="px-4 py-2.5 rounded-2xl glass-card neo-border neo-shadow cursor-pointer max-w-[310px] animate-spring-up flex items-center justify-between gap-2 select-none group hover:scale-[1.02] transition-transform"
             style="background: var(--card-bg); border: 2px solid var(--ink);">
          <div class="font-[var(--font-body)] text-xs font-semibold text-[var(--ink)] leading-snug">
            {{ currentInvitation() }}
          </div>
          <button (click)="dismissInvitation($event)" title="Close"
                  class="text-[var(--ink-soft)] hover:text-[var(--ink)] p-0.5 text-xs opacity-60 hover:opacity-100 flex-shrink-0">
            ✕
          </button>
        </div>
      }

      <!-- Dynamic CV Tooltip Toast -->
      @if (showCvTooltip()) {
        <div (click)="openChatFromTooltip()"
             class="px-4.5 py-3.5 rounded-2xl cursor-pointer max-w-[340px] animate-spring-up flex flex-col gap-1.5 select-none"
             style="background: #C6FF6B; color: #15151A; border: 2.5px solid #15151A; box-shadow: 5px 5px 0 #15151A; font-family: 'Space Grotesk', sans-serif;">
          <div class="flex items-center gap-2 font-extrabold text-[13px] leading-snug">
            <span>💡 {{ langService.t().cvUnavailableTooltip }}</span>
          </div>
          <div class="font-[var(--font-mono)] text-[11px] font-bold tracking-wide text-[#15151A] bg-white/80 border border-[#15151A] rounded-lg px-2.5 py-1 w-max flex items-center gap-1.5 mt-1 hover:bg-white transition-colors">
            <span>✨ {{ langService.t().chatTitle }}</span>
            <span>&rarr;</span>
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
export class Footer implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  uiService = inject(UiService);
  langService = inject(LanguageService);

  get portfolio(): PortfolioData | null { return this.portfolioService.portfolio; }

  readonly icons = { tablerBrandGithub, tablerBrandLinkedin, tablerMail, tablerCheck, tablerSparkles };

  isCopied = signal(false);
  showCvTooltip = signal(false);
  showInvitation = signal(true);
  invitationIndex = signal(0);
  
  private tooltipTimeout: any;
  private rotationInterval: any;

  currentInvitation = computed(() => {
    const list = this.langService.t().agentInvitations || [];
    if (!list.length) return '';
    return list[this.invitationIndex() % list.length];
  });

  ngOnInit() {
    this.rotationInterval = setInterval(() => {
      this.invitationIndex.update(i => i + 1);
    }, 10000);
  }

  ngOnDestroy() {
    if (this.rotationInterval) clearInterval(this.rotationInterval);
    if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
  }

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

  openChatFromInvitation() {
    if (!this.uiService.chatOpen()) {
      this.uiService.toggleChat();
    }
  }

  dismissInvitation(event: MouseEvent) {
    event.stopPropagation();
    this.showInvitation.set(false);
  }
}
