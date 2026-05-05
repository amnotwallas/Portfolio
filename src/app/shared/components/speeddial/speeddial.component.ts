import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, signal, computed, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  tablerSmartHome,
  tablerNews,
  tablerMenu2,
  tablerRocket,
} from '@ng-icons/tabler-icons';

import { MagneticDirective } from '../../directives/magnetic.directive';

@Component({
  selector: 'app-speed-dial',
  standalone: true,
  templateUrl: './speeddial.component.html',
  imports: [
    CommonModule, NgIcon,
    RouterModule, MagneticDirective
  ],
})
export class SpeedDialComponent {
  private router = inject(Router);
  private scroller = inject(ViewportScroller);
  open = signal(false);
  isTouch = false;

  radius = 90;
  startAngle = 0;
  endAngle = 90;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    }
  }

  readonly excludedIcons = {
    tablerMenu2,
  }

  readonly icons = new Map([
    ['home', { icon: tablerSmartHome, label: 'Top', fragment: '' }],
    ['sep-1', { icon: '', label: '', fragment: '' }],
    ['home#experience', { icon: tablerNews, label: 'Experience', fragment: 'experience' }],
    ['sep-2', { icon: '', label: '', fragment: '' }],
    ['home#projects', { icon: tablerRocket, label: 'Projects', fragment: 'projects' }],
    ['sep-3', { icon: '', label: '', fragment: '' }],
  ]);

  positions = computed(() => {
    const step = (this.endAngle - this.startAngle) / (this.icons.size - 1);

    return Array.from(this.icons.keys()).map((_, i) => {
      const angle = (this.startAngle + step * i) * (Math.PI / 180);
      const x = Math.cos(angle) * this.radius;
      const y = Math.sin(angle) * this.radius;
      return { x, y };
    });
  });

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.open()) {
      this.open.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-speed-dial') && this.open()) {
      this.open.set(false);
    }
  }

  toggle() {
    this.open.update(v => !v);
  }

  onMouseEnter() {
    if (!this.isTouch) {
      this.open.set(true);
    }
  }

  onMouseLeave() {
    if (!this.isTouch) {
      this.open.set(false);
    }
  }

  navigateTo(item: any) {
    this.open.set(false);
    if (!item) return;

    if (item.fragment) {
      if (this.router.url.includes('/home')) {
        this.scroller.scrollToAnchor(item.fragment);
        this.router.navigate([], { fragment: item.fragment, replaceUrl: true });
      } else {
        this.router.navigate(['/home'], { fragment: item.fragment });
      }
    } else {
      this.scroller.scrollToPosition([0, 0]);
      this.router.navigate(['/home'], { fragment: undefined });
    }
  }
}
