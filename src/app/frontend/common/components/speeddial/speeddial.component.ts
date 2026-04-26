import { CommonModule } from '@angular/common';
import { Component, signal, computed, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  tablerLayoutGrid,
  tablerCategory2,
  tablerSmartHome,
  tablerCompass,
  tablerNews,
  tablerPlus,
  tablerMenu2,
} from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-speed-dial',
  standalone: true,
  templateUrl: './speeddial.component.html',
  imports: [
    CommonModule, NgIcon,
    RouterModule
  ],
})
export class SpeedDialComponent {
  open = signal(false);

  radius = 80; // distancia desde el boton principal
  startAngle = 0;
  endAngle = 90;

  readonly excludedIcons = {
    tablerLayoutGrid,
    tablerCategory2,
    tablerCompass,
    tablerPlus,
    tablerMenu2,
  }


  readonly icons = new Map([
    ['home', { icon: tablerSmartHome, label: 'Inicio' }],
    ['cv', { icon: tablerNews, label: 'Mi CV' }],
    ['sep-1', { icon: '', label: '' }],
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
}
