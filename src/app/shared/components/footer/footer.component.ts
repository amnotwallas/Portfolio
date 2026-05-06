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
    <footer class="FOOTER_APP fixed bottom-4 right-4 md:bottom-8 md:right-8 flex gap-2 md:gap-3.5 items-center px-3 py-1.5 md:px-4 md:py-2 bg-[#0F0F0F]/90 backdrop-blur-xl rounded-xl shadow-2xl print:hidden text-retro-font z-50 border border-white/5 group/footer">

      <div class="relative flex items-center">
        <button 
          (click)="handleCvClick()"
          class="flex gap-1.5 items-center text-xs font-mono font-bold hover:text-retro-yellow transition-all cursor-pointer outline-none border-none bg-transparent whitespace-nowrap group/btn"
        >
          <ng-icon [svg]="icons.tablerCloudDownload" size="16" strokeWidth="2.5" class="text-retro-yellow/40 group-hover/btn:text-retro-yellow transition-all" />
          <span class="tracking-tight border-b border-transparent group-hover/btn:border-retro-yellow/40">CV</span>
        </button>

        <!-- Tooltip -->
        <div 
          *ngIf="showCvTooltip()"
          class="absolute bottom-full mb-10 inset-x-0 flex justify-center z-[60] pointer-events-none"
        >
          <div class="px-3 py-1.5 bg-[#1A1A1A] text-retro-yellow text-[9px] font-mono font-bold rounded-md border border-retro-yellow/20 animate-tooltip whitespace-nowrap shadow-2xl">
            STATUS: NOT_LINKED
          </div>
        </div>
      </div>

      <div class="w-px h-3 bg-white/10 mx-1"></div>

      <a class="flex gap-1.5 items-center text-xs font-mono font-bold hover:text-retro-yellow transition-all group/link" [href]="getProfileUrl('LinkedIn')" target="_blank">
        <ng-icon [svg]="icons.tablerBrandLinkedin" size="16" strokeWidth="2.5" class="text-retro-yellow/40 group-hover/link:text-retro-yellow transition-all" />
        <span class="tracking-tight">LINKEDIN</span>
      </a>

      <a class="flex gap-1.5 items-center text-xs font-mono font-bold hover:text-retro-yellow transition-all group/link" [href]="getProfileUrl('GitHub')" target="_blank">
        <ng-icon [svg]="icons.tablerBrandGithub" size="16" strokeWidth="2.5" class="text-retro-yellow/40 group-hover/link:text-retro-yellow transition-all" />
        <span class="tracking-tight">GITHUB</span>
      </a>

      <div class="w-px h-3 bg-white/10 mx-1"></div>

      <!-- Botón de Mail -->
      <div class="relative flex items-center">
        <button 
          (click)="copyEmail()"
          class="flex gap-1.5 items-center text-xs font-mono font-bold hover:text-retro-yellow transition-all cursor-pointer outline-none border-none bg-transparent group/btn"
        >
          <ng-icon [svg]="isCopied() ? icons.tablerCheck : icons.tablerMail" size="16" strokeWidth="2.5" class="text-retro-yellow/40 group-hover/btn:text-retro-yellow transition-all" />
          <span class="tracking-tight">{{ isCopied() ? 'COPIED' : 'CONTACT' }}</span>
        </button>

        <!-- Tooltip -->
        <div 
          *ngIf="isCopied()"
          class="absolute bottom-full mb-10 inset-x-0 flex justify-center z-[60] pointer-events-none"
        >
          <div class="px-3 py-1.5 bg-[#1A1A1A] text-retro-yellow text-[9px] font-mono font-bold rounded-md border border-retro-yellow/20 animate-tooltip whitespace-nowrap shadow-2xl">
            LOG: EMAIL_SAVED
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

  copyEmail() {
    if (this.isCopied()) return;
    const email = this.portfolio?.basics.email;
    if (!email) return;

    navigator.clipboard.writeText(email).then(() => {
      this.isCopied.set(true);
      setTimeout(() => {
        this.isCopied.set(false);
      }, 2000);
    });
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