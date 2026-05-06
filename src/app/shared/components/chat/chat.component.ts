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
      class="fixed bottom-24 right-4 md:right-8 z-50 flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0A0A0A] border border-white/10 text-retro-yellow shadow-2xl hover:border-retro-yellow/40 transition-all duration-300 group"
      [class.opacity-0]="isOpen()"
      [class.pointer-events-none]="isOpen()">
      <ng-icon name="tablerTerminal" size="28" class="group-hover:scale-110 transition-transform"></ng-icon>
      <span class="absolute -top-1 -right-1 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-minecraft opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-minecraft shadow-[0_0_8px_rgba(85,255,85,0.6)]"></span>
      </span>
    </button>

    <!-- Widget Container -->
    <div 
      class="fixed bottom-24 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl transition-all duration-500 origin-bottom-right overflow-hidden flex flex-col"
      [class.scale-0]="!isOpen()"
      [class.opacity-0]="!isOpen()"
      [class.pointer-events-none]="!isOpen()">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-white/5 bg-[#121212]">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-minecraft animate-pulse shadow-[0_0_10px_rgba(85,255,85,0.8)]"></div>
          <span class="font-mono text-[10px] font-bold text-retro-font/60 uppercase tracking-[0.2em]">WALTER_AI // NEURAL_CORE</span>
        </div>
        <button (click)="toggleWidget()" class="text-retro-font/20 hover:text-retro-yellow transition-colors">
          <ng-icon name="tablerX" size="18"></ng-icon>
        </button>
      </div>

      <!-- Chat Area -->
      <div class="flex-grow p-6 flex flex-col gap-6">
        <p #chatResponseEl class="font-mono text-xs text-retro-font/90 min-h-[5em] leading-relaxed uppercase tracking-tight">
          @if (cvSignal(); as cv) {
            {{cv.terminal.welcome_message}}
          } @else {
            INITIALIZING_NEURAL_LINK...
          }
        </p>
        
        <!-- Input Area -->
        <form (submit)="onChatSubmit()" 
              class="flex items-center gap-3 border-b border-white/10 focus-within:border-retro-yellow/40 transition-all pb-2 group"
              [class.animate-pulse-gold]="isProcessing()">
          <span class="font-mono text-retro-yellow text-[10px] font-bold whitespace-nowrap uppercase opacity-40">
            >
          </span>
          <input 
            #chatInput
            type="text" 
            [(ngModel)]="userQuery" 
            name="query"
            autocomplete="off"
            placeholder="TYPE_CMD..."
            class="flex-grow bg-transparent border-none outline-none font-mono text-xs text-retro-font placeholder:text-white/10 tracking-wider"
          >
          <button 
            type="submit" 
            [disabled]="isProcessing() || !userQuery.trim()"
            class="p-2.5 rounded-xl bg-retro-yellow text-retro-dark shadow-[0_0_15px_rgba(255,176,0,0.3)] hover:bg-retro-bright hover:shadow-[0_0_20px_rgba(255,176,0,0.5)] transition-all flex items-center justify-center disabled:bg-white/5 disabled:text-white/20 disabled:shadow-none disabled:border border-white/5"
            title="Execute Command"
          >
            <ng-icon name="tablerArrowUp" size="20" class="font-bold"></ng-icon>
          </button>
        </form>
      </div>

      <!-- Footer Info -->
      <div class="px-4 py-3 border-t border-white/5 bg-black/40">
        <p class="font-mono text-[8px] text-white/10 uppercase tracking-[0.3em] text-center">
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
  cvSignal = this.portfolioService.portfolioDataSignal;
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

      const NAV_REGEX = /\[NAV:(.+?)\]/g;
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
