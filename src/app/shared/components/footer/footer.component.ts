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
      @if (!uiService.chatOpen() && !showCvTooltip() && !isDismissed() && invitationMode() !== 'HIDDEN') {
        <div (click)="openChatFromInvitation()"
             class="relative px-4 py-2.5 rounded-2xl glass-card neo-border neo-shadow cursor-pointer max-w-[310px] flex items-center justify-between gap-2 select-none group hover:scale-[1.03] transition-transform shadow-md mb-1"
             [class.animate-pop-in]="invitationMode() === 'IN'"
             [class.animate-pop-out]="invitationMode() === 'OUT'"
             style="background: var(--card-bg); border: 2px solid var(--ink); transform-origin: bottom right;">
          <div class="font-[var(--font-body)] text-xs font-semibold text-[var(--ink)] leading-snug">
            {{ currentInvitation() }}
          </div>
          <button (click)="dismissInvitation($event)" title="Close"
                  class="text-[var(--ink-soft)] hover:text-[var(--ink)] p-0.5 text-xs opacity-60 hover:opacity-100 flex-shrink-0">
            ✕
          </button>

          <!-- Speech Bubble Pointer Tail (Triangular tail pointing to WALTER-AI button) -->
          <div class="absolute -bottom-[9px] right-6 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-[var(--ink)]"></div>
          <div class="absolute -bottom-[6.5px] right-[25px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[var(--card-bg)]"></div>
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
      <div class="relative flex items-center gap-1.5 px-3 py-2.5 rounded-full glass-card neo-border neo-shadow">
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
          <div class="relative flex items-center justify-center">
            <!-- Dynamic Email Copied Toast aligned directly above the Email button -->
            @if (isCopied()) {
              <div class="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 px-3.5 py-2 rounded-xl cursor-default animate-pop-in flex items-center gap-1.5 whitespace-nowrap select-none shadow-md z-[210]"
                   style="background: #C6FF6B; color: #15151A; border: 2.5px solid #15151A; box-shadow: 3px 3px 0 #15151A; font-family: 'Space Grotesk', sans-serif;">
                <ng-icon [svg]="icons.tablerCheck" size="15"></ng-icon>
                <span class="font-extrabold text-[12px] tracking-wide">{{ langService.t().emailCopied }}</span>
              </div>
            }
            <button (click)="copyEmail()" title="Copy email"
                    class="w-11.5 h-11.5 rounded-[14px] flex items-center justify-center bg-[var(--dock-idle)] text-[var(--ink)] hover:scale-110"
                    style="transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);">
              <ng-icon [svg]="isCopied() ? icons.tablerCheck : icons.tablerMail" size="18"></ng-icon>
            </button>
          </div>
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
  isDismissed = signal(false);

  invitationMode = signal<'HIDDEN' | 'IN' | 'OUT'>('HIDDEN');
  invitationIndex = signal(0);

  private cvTooltipTimeout: any;
  private invitationTimer: any;

  currentInvitation = computed(() => {
    const list = this.langService.t().agentInvitations || [];
    if (!list.length) return '';
    return list[this.invitationIndex() % list.length];
  });

  ngOnInit() {
    this.scheduleNextInvitation(5000);
  }

  ngOnDestroy() {
    if (this.invitationTimer) clearTimeout(this.invitationTimer);
    if (this.cvTooltipTimeout) clearTimeout(this.cvTooltipTimeout);
  }

  private scheduleNextInvitation(delayMs: number) {
    if (this.isDismissed()) return;

    this.invitationTimer = setTimeout(() => {
      if (this.isDismissed() || this.uiService.chatOpen()) {
        this.scheduleNextInvitation(5000);
        return;
      }

      // Step 1: Pop In animation
      this.invitationMode.set('IN');

      // Step 2: Stay visible for 5 seconds
      this.invitationTimer = setTimeout(() => {
        if (this.isDismissed()) {
          this.invitationMode.set('HIDDEN');
          return;
        }

        // Step 3: Trigger Pop Out animation
        this.invitationMode.set('OUT');

        // Step 4: After exit animation completes (380ms), hide element and schedule next run after 5s wait
        this.invitationTimer = setTimeout(() => {
          this.invitationMode.set('HIDDEN');
          this.invitationIndex.update(i => i + 1);
          this.scheduleNextInvitation(5000);
        }, 380);

      }, 5000);

    }, delayMs);
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
      setTimeout(() => this.isCopied.set(false), 2500);
    } catch {
      // Clipboard API fallback
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2500);
    }
  }

  triggerCvTooltip() {
    this.showCvTooltip.set(true);
    clearTimeout(this.cvTooltipTimeout);
    this.cvTooltipTimeout = setTimeout(() => this.showCvTooltip.set(false), 4000);
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
    this.isDismissed.set(true);
    this.invitationMode.set('HIDDEN');
    if (this.invitationTimer) clearTimeout(this.invitationTimer);
  }
}
