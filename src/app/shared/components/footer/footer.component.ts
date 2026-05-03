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
    <footer class="FOOTER_APP fixed bottom-4 right-4 md:bottom-8 md:right-8 flex gap-4 md:gap-6 items-center px-4 py-2 md:px-6 md:py-3 bg-[var(--color-footer-bg)]/80 backdrop-blur-md rounded-full shadow-2xl print:hidden text-retro-bright z-50 border border-white/5">

      <div class="relative flex items-center">
        <button 
          (click)="handleCvClick()"
          class="flex gap-2 items-center text-xs font-medium hover:text-retro-yellow transition-colors cursor-pointer outline-none border-none bg-transparent whitespace-nowrap"
        >
          <ng-icon [svg]="icons.tablerCloudDownload" size="18" strokeWidth="2.5" />
          <span>CV</span>
        </button>

        <!-- Tooltip CV No Disponible -->
        <div 
          *ngIf="showCvTooltip()"
          class="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-retro-bright text-retro-dark text-[10px] font-bold rounded uppercase tracking-widest shadow-xl animate-fade-in-up whitespace-nowrap border border-retro-yellow/30"
        >
          Not available yet!
          <!-- Pequeña flecha del tooltip -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-retro-bright"></div>
        </div>
      </div>

      <a class="flex gap-2 items-center text-xs font-medium hover:text-retro-yellow transition-colors" [href]="getProfileUrl('LinkedIn')" target="_blank">
        <ng-icon [svg]="icons.tablerBrandLinkedin" size="18" strokeWidth="2.5" />
        LinkedIn
      </a>

      <a class="flex gap-2 items-center text-xs font-medium hover:text-retro-yellow transition-colors" [href]="getProfileUrl('GitHub')" target="_blank">
        <ng-icon [svg]="icons.tablerBrandGithub" size="18" strokeWidth="2.5" />
        GitHub
      </a>

      <!-- Botón de Mail con Copiado al Portapapeles -->
      <div class="relative flex items-center">
        <button 
          (click)="copyEmail()"
          class="flex gap-2 items-center text-xs font-medium hover:text-retro-yellow transition-colors cursor-pointer outline-none border-none bg-transparent"
        >
          <ng-icon [svg]="isCopied() ? icons.tablerCheck : icons.tablerMail" size="18" strokeWidth="2.5" class="transition-all" />
          <span>Mail</span>
        </button>

        <!-- Tooltip -->
        <div 
          *ngIf="isCopied()"
          class="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-retro-bright text-retro-dark text-[10px] font-bold rounded uppercase tracking-widest shadow-xl animate-fade-in-up whitespace-nowrap border border-retro-yellow/30"
        >
          Email Copied!
          <!-- Pequeña flecha del tooltip -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-retro-bright"></div>
        </div>
      </div>

    </footer>
  `
})
export class Footer implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private routerSubscription: any;
  
  get portfolio(): PortfolioData { return this.portfolioService.portfolio; }
  
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
    return this.portfolio.basics.profiles.find((p: Profile) => p.network === network)?.url || '#';
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

    navigator.clipboard.writeText(this.portfolio.basics.email).then(() => {
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