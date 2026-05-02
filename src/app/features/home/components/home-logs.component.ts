import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrambleDirective } from '../../../shared/directives/scramble.directive';

@Component({
  selector: 'app-home-logs',
  standalone: true,
  imports: [CommonModule, ScrambleDirective],
  template: `
    <div class="fixed bottom-12 left-12 font-mono text-[9px] text-gray-600 space-y-1 hidden md:block opacity-60 animate-fade-in-up delay-500 z-10 p-4 glass-effect rounded-xl">
      <p *ngFor="let log of logs" class="flex items-center gap-2">
        <span class="w-1 h-1 bg-retro-yellow/50 rounded-full animate-pulse"></span>
        <span [appScramble]="log">{{log}}</span>
      </p>
    </div>
  `
})
export class HomeLogsComponent {
  @Input() logs: string[] = [];
}
