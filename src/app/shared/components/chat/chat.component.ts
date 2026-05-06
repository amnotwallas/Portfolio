import { Component, ElementRef, ViewChild, inject, AfterViewInit, ChangeDetectorRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowUp, tablerTerminal, tablerX } from '@ng-icons/tabler-icons';
import { ChatService } from '../../../core/services/chat.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowUp, tablerTerminal, tablerX })],
  template: `
    <!-- Floating Trigger Button -->
    <button 
      (click)="toggleWidget()"
      class="fixed bottom-24 right-4 md:right-8 z-50 flex items-center justify-center w-14 h-14 rounded-2xl bg-retro-dark border-2 border-retro-yellow/30 text-retro-yellow shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:border-retro-yellow transition-all duration-300 group"
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
      class="fixed bottom-24 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-retro-dark/95 border-2 border-retro-yellow/20 rounded-2xl shadow-2xl transition-all duration-500 origin-bottom-right overflow-hidden flex flex-col"
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
export class ChatComponent implements AfterViewInit {
  private chatService = inject(ChatService);
  private portfolioService = inject(PortfolioService);
  private uiService = inject(UiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('chatResponseEl') chatResponseEl!: ElementRef<HTMLElement>;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;

  userQuery = '';
  isProcessing = this.chatService.isProcessing;
  cv = this.portfolioService.portfolio;
  isOpen = signal(false);

  private processedTokens = new Set<string>();

  ngAfterViewInit() {}

  private getChatContext() {
    const url = this.router.url;
    let page = 'home';
    let project_slug = null;

    if (url.includes('/project/')) {
      page = 'project_details';
      // Extraer slug: /project/nombre-proyecto -> nombre-proyecto
      const parts = url.split('/');
      project_slug = parts[parts.indexOf('project') + 1] || null;
      // Limpiar posibles fragmentos o query params
      if (project_slug) {
        project_slug = project_slug.split('#')[0].split('?')[0];
      }
    }

    return { url, page, project_slug };
  }

  toggleWidget() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      setTimeout(() => this.chatInput.nativeElement.focus(), 100);
    }
  }

  async onChatSubmit() {
    const query = this.userQuery.trim();
    if (!query || this.isProcessing()) return;

    const context = this.getChatContext();
    this.userQuery = '';
    this.processedTokens.clear();
    this.chatResponseEl.nativeElement.textContent = "[WALTER_AI]: PROCESSING_COMMAND...";

    try {
      const body = await this.chatService.submitQuery(query, context);
      if (!body) return;

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      const NAV_REGEX = /\[NAV:(EXPERIENCE|PROJECTS)\]/g;
      const HIGHLIGHT_REGEX = /\[HIGHLIGHT:(PROJECT|EXPERIENCE):(.+?)\]/g;
      const PARTIAL_TOKEN_REGEX = /\[[^\]]*$/; // Oculta cualquier corchete no cerrado al final

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.replace('data: ', '');
            fullText += content;
            
            // 1. Process Highlights
            const hMatch = fullText.match(HIGHLIGHT_REGEX);
            if (hMatch) {
              for (const fullToken of hMatch) {
                if (!this.processedTokens.has(fullToken)) {
                  const match = fullToken.match(/:(.+?):(.+?)\]/);
                  if (match) {
                    const [_, type, id] = match;
                    this.uiService.triggerHighlight(type as any, id);
                    this.processedTokens.add(fullToken);
                  }
                }
              }
            }

            // 2. Process Navigation
            const nMatch = fullText.match(NAV_REGEX);
            if (nMatch) {
              for (const fullToken of nMatch) {
                if (!this.processedTokens.has(fullToken)) {
                  const match = fullToken.match(/:(.+?)\]/);
                  if (match) {
                    const target = match[1];
                    this.uiService.navigate(target);
                    this.processedTokens.add(fullToken);
                  }
                }
              }
            }

            // 3. Silent Cleaning for UI (proactivo con fragmentos)
            const displayText = fullText
              .replace(HIGHLIGHT_REGEX, '')
              .replace(NAV_REGEX, '')
              .replace(PARTIAL_TOKEN_REGEX, '')
              .trim();

            this.chatResponseEl.nativeElement.textContent = displayText + "_";
            await new Promise(resolve => setTimeout(resolve, 15)); 
          }
        }
      }

      // Final cleanup
      const finalContent = fullText
        .replace(HIGHLIGHT_REGEX, '')
        .replace(NAV_REGEX, '')
        .trim();
      
      this.chatResponseEl.nativeElement.textContent = finalContent;
      this.chatService.addToHistory('user', query);
      this.chatService.addToHistory('assistant', finalContent);

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
