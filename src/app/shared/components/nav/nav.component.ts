import { Component, signal, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerSun, tablerMoon } from '@ng-icons/tabler-icons';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';

interface NavItem { id: string; label: string; }

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ tablerSun, tablerMoon })],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6 pt-4 pointer-events-none">
      <div class="pointer-events-auto w-full max-w-[1020px] flex items-center justify-between gap-2 pl-5 pr-2 py-2 rounded-full neo-border transition-shadow"
           [class.glass-card]="true"
           [class.shadow-[0_6px_0_rgba(0,0,0,0.1)]]="scrolled()">
        <button (click)="scrollToTop()" class="font-[var(--font-display)] font-bold text-lg tracking-tight flex items-center gap-2 text-[var(--ink)]">
          <span class="w-2.5 h-2.5 rounded-[3px] bg-[var(--color-accent)] rotate-45 inline-block"></span>
          WA
        </button>

        <div class="flex items-center gap-0.5">
          @for (item of items; track item.id) {
            <button (click)="scrollTo(item.id)"
                    class="relative px-3.5 py-2 rounded-full text-[13px] font-[var(--font-display)] font-medium transition-colors"
                    [class.bg-[var(--ink)]]="active() === item.id"
                    [class.text-[var(--bg)]]="active() === item.id"
                    [class.text-[var(--ink)]]="active() !== item.id">
              {{ item.label }}
            </button>
          }
        </div>

        <div class="flex items-center gap-2">
          <button (click)="themeService.toggle()" title="Toggle theme"
                  class="w-8.5 h-8.5 rounded-full neo-border bg-[var(--card-bg)] flex items-center justify-center">
            <ng-icon [name]="themeService.isDark() ? 'tablerMoon' : 'tablerSun'" size="15"></ng-icon>
          </button>
          <button (click)="langService.toggleLanguage()"
                  class="font-[var(--font-mono)] text-[11px] font-bold tracking-wide neo-border rounded-full px-2.5 py-1.5 bg-[var(--card-bg)] flex gap-1.5">
            <span [class.opacity-100]="langService.currentLang() === 'en'" [class.opacity-35]="langService.currentLang() !== 'en'">EN</span>
            <span class="opacity-30">/</span>
            <span [class.opacity-100]="langService.currentLang() === 'es'" [class.opacity-35]="langService.currentLang() !== 'es'">ES</span>
          </button>
          <a href="https://amnotwallas.github.io/Portfolio/" target="_blank" rel="noopener"
             class="font-[var(--font-display)] font-bold text-[13px] text-[#15151A] bg-[var(--color-lime)] neo-border rounded-full px-4 py-2 neo-shadow whitespace-nowrap">
            {{ langService.t().resumeLabel }}
          </a>
        </div>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent implements OnInit, OnDestroy {
  langService = inject(LanguageService);
  themeService = inject(ThemeService);

  scrolled = signal(false);
  active = signal('home');
  private observer?: IntersectionObserver;

  get items(): NavItem[] {
    const t = this.langService.t().nav;
    return [
      { id: 'home', label: t.home },
      { id: 'experience', label: t.experience },
      { id: 'skills', label: t.skills },
      { id: 'projects', label: t.projects },
      { id: 'contact', label: t.contact }
    ];
  }

  ngOnInit() {
    window.addEventListener('scroll', this.onScroll);
    setTimeout(() => {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) this.active.set(e.target.id); });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      ['home', 'experience', 'skills', 'projects', 'contact'].forEach(id => {
        const el = document.getElementById(id);
        if (el) this.observer!.observe(el);
      });
    }, 200);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    this.observer?.disconnect();
  }

  private onScroll = () => this.scrolled.set(window.scrollY > 40);

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
