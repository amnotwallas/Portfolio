import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-12 right-12 text-right font-mono text-[9px] text-retro-yellow/40 space-y-1 hidden md:block z-10 p-4 glass-effect rounded-xl">
      <p class="tracking-widest">SYSTEM_ID: {{systemId}}</p>
      <p class="tracking-widest">LOC: {{location}}</p>
      <p class="tracking-widest">STATUS: <span class="text-retro-yellow/80 uppercase">{{status}}</span></p>
      <p class="tracking-widest">UPTIME: <span>{{uptime}}</span></p>
    </div>
  `
})
export class HomeStatusComponent {
  @Input() systemId: string = '';
  @Input() location: string = '';
  @Input() status: string = '';
  @Input() uptime: string = '00:00:00';
}
