import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import { PortfolioData, Profile } from "../../models/portfolio.model";
import { PortfolioService } from "../../../core/services/portfolio.service";
import { tablerBrandGithub,
  tablerBrandLinkedin,
  tablerCloudDownload,
  tablerHeartDollar,
  tablerMail,
  tablerCheck
} from "@ng-icons/tabler-icons";
import { filter } from "rxjs/operators";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    NgIcon,
    CommonModule
  ],
  template: `
    <footer class="FOOTER_APP fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-10 md:bottom-10 flex items-center justify-center md:justify-start gap-1 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-[#161616] shadow-2xl rounded-xl print:hidden text-retro-font z-[100] border border-white/5 group/footer w-fit">

      <!-- CV Button -->
      <div class="relative group/item flex items-center justify-center px-2 py-1">
        <button 
          (click)="handleCvClick()"
          class="flex items-center gap-2 text-[13px] font-mono font-bold hover:text-retro-yellow transition-all cursor-pointer outline-none border-none bg-transparent whitespace-nowrap"
        >
          <ng-icon [svg]="icons.tablerCloudDownload" size="18" strokeWidth="2.5" class="text-retro-yellow/80 group-hover/item:text-retro-yellow transition-all" />
          <span class="tracking-widest uppercase hidden md:inline">CV</span>
        </button>

        <div *ngIf="showCvTooltip()" class="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-[110] pointer-events-none">
          <div class="px-4 py-2 bg-[#0A0A0A] text-retro-yellow text-[11px] font-mono font-bold rounded-xl border border-retro-yellow/30 animate-tooltip whitespace-nowrap shadow-2xl">
            STATUS: NOT_LINKED
          </div>
        </div>
      </div>

      <div class="w-px h-3 bg-white/10 mx-1"></div>

      <!-- LinkedIn -->
      <div class="relative group/item flex items-center justify-center px-2 py-1">
        <a class="flex items-center gap-2 text-[13px] font-mono font-bold hover:text-retro-yellow transition-all whitespace-nowrap" [href]="getProfileUrl('LinkedIn')" target="_blank">
          <ng-icon [svg]="icons.tablerBrandLinkedin" size="18" strokeWidth="2.5" class="text-retro-yellow/80 group-hover/item:text-retro-yellow transition-all" />
          <span class="tracking-widest hidden md:inline">LINKEDIN</span>
        </a>
      </div>

      <div class="w-px h-3 bg-white/10 mx-1"></div>

      <!-- GitHub -->
      <div class="relative group/item flex items-center justify-center px-2 py-1">
        <a class="flex items-center gap-2 text-[13px] font-mono font-bold hover:text-retro-yellow transition-all whitespace-nowrap" [href]="getProfileUrl('GitHub')" target="_blank">
          <ng-icon [svg]="icons.tablerBrandGithub" size="18" strokeWidth="2.5" class="text-retro-yellow/80 group-hover/item:text-retro-yellow transition-all" />
          <span class="tracking-widest hidden md:inline">GITHUB</span>
        </a>
      </div>

      <div class="w-px h-3 bg-white/10 mx-1"></div>

      <!-- Contact Button -->
      <div class="relative group/item flex items-center justify-center px-2 py-1">
        <button 
          (click)="copyEmail()"
          class="flex items-center gap-2 text-[13px] font-mono font-bold hover:text-retro-yellow transition-all cursor-pointer outline-none border-none bg-transparent whitespace-nowrap"
        >
          <ng-icon [svg]="isCopied() ? icons.tablerCheck : icons.tablerMail" size="18" strokeWidth="2.5" class="text-retro-yellow/80 transition-all group-hover/item:text-retro-yellow" />
          <span class="tracking-widest uppercase hidden md:inline">{{ isCopied() ? 'COPIED' : 'CONTACT' }}</span>
        </button>

        <div *ngIf="isCopied()" class="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-[110] pointer-events-none">
          <div class="px-4 py-2 bg-[#0A0A0A] text-retro-yellow text-[11px] font-mono font-bold rounded-xl border border-retro-yellow/20 animate-tooltip whitespace-nowrap shadow-2xl">
            LOG: EMAIL_COPIED
          </div>
        </div>
      </div>

    </footer>
  `
})
export class Footer implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private routerSubscription: any;
  
  get portfolio(): PortfolioData | null { return this.portfolioService.portfolio; }
  
  readonly icons = {
    tablerMail,
    tablerBrandLinkedin,
    tablerBrandGithub,
    tablerCloudDownload,
    tablerHeartDollar,
    tablerCheck
  }

  isCopied = signal(false);
  cvAvailable = signal(false);
  showCvTooltip = signal(false);
  private router = inject(Router);
  currentUrl = signal('');

  getProfileUrl(network: string): string {
    const profiles = this.portfolio?.basics.profiles || [];
    return profiles.find((p: Profile) => p.network === network)?.url || '#';
  }

  handleCvClick() {
    if (this.cvAvailable()) {
      window.open('cv.pdf', '_blank');
    } else {
      if (this.showCvTooltip()) return;
      this.showCvTooltip.set(true);
      setTimeout(() => {
        this.showCvTooltip.set(false);
      }, 2000);
    }
  }

  async copyEmail() {
    if (this.isCopied()) return;
    const email = this.portfolio?.basics.email;
    if (!email) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
        this.handleCopySuccess();
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      this.fallbackCopyText(email);
    }
  }

  private fallbackCopyText(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) this.handleCopySuccess();
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    
    document.body.removeChild(textArea);
  }

  private handleCopySuccess() {
    this.isCopied.set(true);
    setTimeout(() => {
      this.isCopied.set(false);
    }, 2000);
  }

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }
}