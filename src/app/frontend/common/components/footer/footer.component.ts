import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import cv from "../../../../../assets/data.json";
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
    <footer class="FOOTER_APP fixed bottom-8 right-8 flex gap-6 items-center px-6 py-3 bg-[var(--color-footer-bg)]/80 backdrop-blur-md rounded-full shadow-2xl print:hidden text-retro-bright z-50 border border-white/5">

      <a href="cv.pdf" target="_blank" rel="noopener" class="flex gap-2 items-center text-xs font-medium hover:text-retro-yellow transition-colors whitespace-nowrap">
        <ng-icon [svg]="icons.tablerCloudDownload" size="18" strokeWidth="2.5" />
        CV
      </a>

      <a class="flex gap-2 items-center text-xs font-medium hover:text-retro-yellow transition-colors" [href]="cv.basics.profiles[0].url" target="_blank">
        <ng-icon [svg]="icons.tablerBrandLinkedin" size="18" strokeWidth="2.5" />
        LinkedIn
      </a>

      <a class="flex gap-2 items-center text-xs font-medium hover:text-retro-yellow transition-colors" [href]="cv.basics.profiles[1].url" target="_blank">
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
  private routerSubscription: any;
  readonly cv = cv;
  readonly icons = {
    tablerMail,
    tablerBrandLinkedin,
    tablerBrandGithub,
    tablerCloudDownload,
    tablerHeartDollar,
    tablerCheck
  }

  isCopied = signal(false);
  private router = inject(Router);
  currentUrl = signal('');

  copyEmail() {
    if (this.isCopied()) return;

    navigator.clipboard.writeText(this.cv.basics.email).then(() => {
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
