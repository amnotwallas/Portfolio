import { Component, ElementRef, ViewChild, inject, AfterViewInit, ChangeDetectorRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowUp, tablerTerminal, tablerX } from '@ng-icons/tabler-icons';
import { ChatService } from '../../../core/services/chat.service';
import { CVService } from '../../../core/services/cv.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowUp, tablerTerminal, tablerX })],
  template: `
    <!-- Floating Trigger Button -->
    <button 
      (click)="toggleWidget()"
      class="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-2xl bg-retro-dark border-2 border-retro-yellow/30 text-retro-yellow shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:border-retro-yellow transition-all duration-300 group"
      [class.opacity-0]="isOpen()"
      [class.pointer-events-none]="isOpen()">
      <ng-icon name="tablerTerminal" size="28" class="group-hover:scale-110 transition-transform"></ng-icon>
      <span class="absolute -top-1 -right-1 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-retro-yellow opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-retro-yellow"></span>
      </span>
    </button>

    <!-- Widget Container -->
    <div 
      class="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 glass-effect border-2 border-retro-yellow/20 rounded-2xl shadow-2xl transition-all duration-500 origin-bottom-right overflow-hidden flex flex-col"
      [class.scale-0]="!isOpen()"
      [class.opacity-0]="!isOpen()"
      [class.pointer-events-none]="!isOpen()">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-white/10 bg-retro-yellow/5">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-retro-yellow animate-pulse"></div>
          <span class="font-mono text-[10px] font-bold text-retro-yellow uppercase tracking-widest">WALTER_AI // NEURAL_CORE</span>
        </div>
        <button (click)="toggleWidget()" class="text-retro-bright/40 hover:text-retro-yellow transition-colors">
          <ng-icon name="tablerX" size="18"></ng-icon>
        </button>
      </div>

      <!-- Chat Area -->
      <div class="flex-grow p-5 flex flex-col gap-4">
        <p #chatResponseEl class="font-mono text-xs text-retro-bright/80 min-h-[4em] leading-relaxed uppercase tracking-tight">
          {{cv.terminal.welcome_message}}
        </p>
        
        <!-- Input Area -->
        <form (submit)="onChatSubmit()" 
              class="flex items-center gap-2 border-b border-white/10 focus-within:border-retro-yellow transition-all pb-1 group"
              [class.animate-pulse-gold]="isProcessing()">
          <span class="font-mono text-retro-yellow text-[10px] font-bold whitespace-nowrap uppercase">
            >
          </span>
          <input 
            #chatInput
            type="text" 
            [(ngModel)]="userQuery" 
            name="query"
            autocomplete="off"
            placeholder="TYPE_CMD..."
            class="flex-grow bg-transparent border-none outline-none font-mono text-xs text-retro-bright placeholder:text-gray-700 tracking-wider"
          >
          <button 
            type="submit" 
            [disabled]="isProcessing() || !userQuery.trim()"
            class="text-retro-yellow/40 hover:text-retro-yellow disabled:opacity-30 transition-colors"
          >
            <ng-icon name="tablerArrowUp" size="16"></ng-icon>
          </button>
        </form>
      </div>

      <!-- Footer Info -->
      <div class="px-4 py-2 border-t border-white/5 bg-black/20">
        <p class="font-mono text-[8px] text-retro-yellow/30 uppercase tracking-[0.2em] text-center">
          CORE_STATUS: OPERATIONAL // V.2.1.0
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeChatComponent implements AfterViewInit {
  private chatService = inject(ChatService);
  private cvService = inject(CVService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('chatResponseEl') chatResponseEl!: ElementRef<HTMLElement>;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;

  userQuery = '';
  isProcessing = this.chatService.isProcessing;
  cv = this.cvService.cv;
  isOpen = signal(false);

  ngAfterViewInit() {
    // Initial focus handled by toggle
  }

  toggleWidget() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      setTimeout(() => this.chatInput?.nativeElement?.focus(), 300);
    }
  }

  private scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async onChatSubmit() {
    const query = this.userQuery.trim();
    if (!query || this.isProcessing()) return;

    this.userQuery = '';
    this.chatResponseEl.nativeElement.textContent = "[WALTER_AI]: PROCESSING_COMMAND...";

    // Static Commands
    const lowerQuery = query.toLowerCase();
    if (['experience', 'work', 'exec_cv'].includes(lowerQuery)) {
      this.chatResponseEl.nativeElement.textContent = "COMMAND_ACCEPTED: SCROLLING TO EXPERIENCE...";
      setTimeout(() => this.scrollToSection('experience'), 1000);
      return;
    }

    if (['projects', 'view_projects', 'show projects'].includes(lowerQuery)) {
      this.chatResponseEl.nativeElement.textContent = "COMMAND_ACCEPTED: SCROLLING TO PROJECTS...";
      setTimeout(() => this.scrollToSection('projects'), 1000);
      return;
    }

    this.chatResponseEl.nativeElement.textContent = "[WALTER_AI]: THINKING...";

    try {
      const body = await this.chatService.submitQuery(query);
      if (!body) return;

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.replace('data: ', '');
            fullText += content;
            this.chatResponseEl.nativeElement.textContent = fullText + "_";
            await new Promise(resolve => setTimeout(resolve, 15)); 
          }
        }
      }

      this.chatResponseEl.nativeElement.textContent = fullText;
      this.chatService.addToHistory('user', query);
      this.chatService.addToHistory('assistant', fullText);

      // Handle AI Navigation Tokens
      if (fullText.includes('[NAV:CV]') || fullText.includes('[NAV:EXPERIENCE]')) {
        setTimeout(() => this.scrollToSection('experience'), 2500);
      } else if (fullText.includes('[NAV:PROJECTS]')) {
        setTimeout(() => this.scrollToSection('projects'), 2500);
      }

    } catch (error: any) {
      if (error.message === 'TOO_MANY_REQUESTS') {
        this.chatResponseEl.nativeElement.textContent = "SYSTEM_OVERLOAD: TOO_MANY_REQUESTS. SLOW_DOWN.";
      } else {
        this.chatResponseEl.nativeElement.textContent = "CONNECTION_ERROR: UNABLE_TO_REACH_NEURAL_CORE.";
      }
    } finally {
      this.chatService.setProcessing(false);
      this.cdr.markForCheck();
    }
  }
}
