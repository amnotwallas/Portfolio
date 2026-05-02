import { Component, ElementRef, ViewChild, inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowUp } from '@ng-icons/tabler-icons';
import { ChatService } from '../../../core/services/chat.service';
import { CVService } from '../../../core/services/cv.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowUp })],
  template: `
    <div class="w-full max-w-lg animate-fade-in-up delay-700 mt-20">
      <div class="flex flex-col gap-6">
        <!-- AI Response Area -->
        <p #chatResponseEl class="font-mono text-xs md:text-sm text-retro-bright/80 min-h-[1.5em] tracking-wide text-center px-4 uppercase">
          {{cv.terminal.welcome_message}}
        </p>
        
        <!-- Input Line -->
        <form (submit)="onChatSubmit()" 
              class="flex items-center gap-3 border-b-2 border-white/10 focus-within:border-retro-yellow transition-all duration-300 pb-2 mx-auto w-full max-w-md group"
              [class.animate-pulse-gold]="isProcessing()">
          <span class="font-mono text-retro-yellow text-xs md:text-sm font-bold whitespace-nowrap uppercase tracking-tight transition-all"
                [class.animate-pulse-gold]="isProcessing()">
            WALTER_AI >
          </span>
          <input 
            #chatInput
            type="text" 
            [(ngModel)]="userQuery" 
            name="query"
            autocomplete="off"
            placeholder="TYPE_COMMAND_HERE..."
            class="flex-grow bg-transparent border-none outline-none font-mono text-sm md:text-base text-retro-bright placeholder:text-gray-700 tracking-widest"
          >
          <button 
            type="submit" 
            [disabled]="isProcessing() || !userQuery.trim()"
            class="flex items-center justify-center bg-retro-yellow/5 border border-retro-yellow/20 rounded px-2 py-1 text-retro-yellow/60 hover:text-retro-yellow hover:bg-retro-yellow/10 hover:border-retro-yellow/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ng-icon name="tablerArrowUp" size="18"></ng-icon>
          </button>
        </form>
        <div class="flex items-center justify-center gap-2 md:gap-4 mt-6">
          <span class="hidden sm:block h-[1px] w-6 md:w-8 bg-white/10"></span>
          <p class="font-mono text-[8px] md:text-[10px] text-retro-yellow/60 uppercase tracking-[0.2em] md:tracking-[0.6em] whitespace-nowrap">
            WALTER_AI_INTERFACE // CORE_STABLE
          </p>
          <span class="hidden sm:block h-[1px] w-6 md:w-8 bg-white/10"></span>
        </div>
      </div>
    </div>
  `
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

  ngAfterViewInit() {
    setTimeout(() => this.chatInput?.nativeElement?.focus(), 600);
  }

  async onChatSubmit() {
    const query = this.userQuery.trim();
    if (!query || this.isProcessing()) return;

    this.userQuery = '';
    this.chatResponseEl.nativeElement.textContent = "[WALTER_AI]: PROCESSING_COMMAND...";

    // Static Commands
    const lowerQuery = query.toLowerCase();
    if (['cv', 'resume', 'exec_cv'].includes(lowerQuery)) {
      this.chatResponseEl.nativeElement.textContent = "COMMAND_ACCEPTED: REDIRECTING TO CV MODULE...";
      setTimeout(() => this.router.navigate(['/cv']), 1000);
      return;
    }

    if (['projects', 'view_projects', 'show projects'].includes(lowerQuery)) {
      this.chatResponseEl.nativeElement.textContent = "COMMAND_ACCEPTED: OPENING PROJECTS VIEW...";
      setTimeout(() => this.router.navigate(['/cv'], { fragment: 'PROJECTS' }), 1000);
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

      if (fullText.includes('[NAV:CV]')) {
        setTimeout(() => this.router.navigate(['/cv']), 2500);
      } else if (fullText.includes('[NAV:PROJECTS]')) {
        setTimeout(() => this.router.navigate(['/cv'], { fragment: 'PROJECTS' }), 2500);
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
