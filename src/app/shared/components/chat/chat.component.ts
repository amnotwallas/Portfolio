import { Component, ElementRef, ViewChild, inject, AfterViewChecked, ChangeDetectorRef, signal, computed, effect, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowUp, tablerX, tablerSparkles } from '@ng-icons/tabler-icons';
import { ChatService } from '../../../core/services/chat.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { Router } from '@angular/router';
import { ChatResponse, ChatAction } from '../../models/portfolio.model';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowUp, tablerX, tablerSparkles })],
  template: `
    @if (uiService.chatOpen()) {
      <div class="fixed bottom-22 right-5.5 z-[199] w-[min(370px,92vw)] h-[480px] rounded-[22px] glass-card neo-border neo-shadow overflow-hidden flex flex-col animate-spring-up" style="backdrop-filter: blur(18px);">
        
        <!-- Header -->
        <div class="bg-[#15151A] text-[#FAFAF7] px-4.5 py-3.5 flex items-center justify-between border-b border-[#2A2A30]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white shadow-sm">
              <ng-icon name="tablerSparkles" size="16"></ng-icon>
            </div>
            <div>
              <div class="font-[var(--font-display)] font-bold text-sm tracking-wide flex items-center gap-2">
                {{ langService.t().chatTitle }}
                <span class="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse-dot"></span>
              </div>
              <div class="font-[var(--font-mono)] text-[10.5px] text-[var(--color-lime)] opacity-90">{{ langService.t().chatSubtitle }}</div>
            </div>
          </div>
          <button (click)="uiService.toggleChat()" class="w-7 h-7 rounded-full flex items-center justify-center text-[#FAFAF7] hover:bg-white/10 transition-colors">
            <ng-icon name="tablerX" size="16"></ng-icon>
          </button>
        </div>

        <!-- Messages Scroll Area -->
        <div #scrollContainer class="flex-1 p-4 overflow-y-auto chat-scroll flex flex-col gap-3">
          
          <!-- Empty State Greeting -->
          @if (messages().length === 0) {
            <div class="self-start max-w-[88%] p-3.5 rounded-[16px_16px_16px_4px] bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--ink)] shadow-xs animate-fade-up">
              <p class="font-[var(--font-body)] text-xs leading-relaxed m-0">
                👋 {{ langService.t().chatEmptyState }}
              </p>
            </div>
          }

          <!-- Message Bubbles -->
          @for (msg of messages(); track msg.id) {
            @if (msg.sender === 'user') {
              <div class="self-end max-w-[85%] px-3.5 py-2.5 rounded-[16px_16px_4px_16px] bg-[var(--color-accent)] text-white text-xs leading-relaxed font-medium shadow-xs animate-fade-up">
                {{ msg.text }}
              </div>
            } @else {
              <div class="self-start max-w-[88%] px-3.5 py-2.5 rounded-[16px_16px_16px_4px] bg-[var(--card-bg)] border border-[var(--ink)]/15 text-[var(--ink)] text-xs leading-relaxed neo-shadow-xs animate-fade-up">
                @if (msg.streaming && !msg.text) {
                  <span class="text-shimmer font-medium">{{ langService.t().chatThinking }}</span>
                } @else if (msg.streaming) {
                  <span class="text-shimmer whitespace-pre-wrap">{{ msg.text }}</span>
                } @else {
                  <span class="whitespace-pre-wrap">{{ msg.text }}</span>
                }
              </div>
            }
          }
        </div>

        <!-- Default Suggestion Chips -->
        @if (messages().length === 0 && defaultSuggestions().length) {
          <div class="px-3.5 py-2 flex flex-wrap gap-1.5 border-t border-[var(--glass-border)] bg-[var(--glass)]">
            @for (q of defaultSuggestions(); track q) {
              <button (click)="suggestQuery(q)" class="text-left font-[var(--font-mono)] text-[11px] px-2.5 py-1.5 rounded-full bg-[var(--chip-bg)] hover:bg-[var(--color-lime)] hover:text-[#15151A] hover:border-[var(--ink)] text-[var(--ink)] border border-[var(--chip-border)] transition-colors whitespace-nowrap">
                {{ q }}
              </button>
            }
          </div>
        }

        <!-- Input Form -->
        <form (submit)="onChatSubmit()" class="flex items-center gap-2 px-3.5 py-2.5 border-t border-[var(--glass-border)] bg-[var(--card-bg)]">
          <input #chatInput type="text" [(ngModel)]="userQuery" name="query" autocomplete="off"
                 [placeholder]="langService.t().chatPlaceholder"
                 class="flex-grow bg-transparent border-none outline-none font-[var(--font-body)] text-xs text-[var(--ink)] px-2">
          <button type="submit" [disabled]="isProcessing() || !userQuery.trim()"
                  class="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-transform flex-shrink-0">
            <ng-icon name="tablerArrowUp" size="16"></ng-icon>
          </button>
        </form>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements AfterViewChecked, OnDestroy {
  private chatService = inject(ChatService);
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  uiService = inject(UiService);
  langService = inject(LanguageService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;

  userQuery = '';
  isProcessing = this.chatService.isProcessing;

  messages = signal<ChatMessage[]>([]);

  defaultSuggestions = computed(() => this.langService.t().chatSuggestions);

  constructor() {
    effect(() => {
      if (this.uiService.chatOpen()) {
        setTimeout(() => {
          this.chatInput?.nativeElement?.focus();
        }, 150);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {}

  suggestQuery(query: string) {
    this.userQuery = query;
    setTimeout(() => this.onChatSubmit(), 100);
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private getChatContext() {
    const url = this.router.url;
    let page = 'home';
    let project_slug = null;
    if (url.includes('/project/')) {
      page = 'project_details';
      const parts = url.split('/');
      project_slug = parts[parts.indexOf('project') + 1]?.split('#')[0]?.split('?')[0] || null;
    }
    return { url, page, project_slug };
  }

  async onChatSubmit() {
    const query = this.userQuery.trim();
    if (!query || this.isProcessing()) return;

    const context = this.getChatContext();
    this.userQuery = '';

    const userMsgId = 'user-' + Date.now();
    const assistantMsgId = 'assistant-' + Date.now();

    this.messages.update(list => [
      ...list,
      { id: userMsgId, sender: 'user', text: query },
      { id: assistantMsgId, sender: 'assistant', text: '', streaming: true }
    ]);
    this.cdr.markForCheck();

    try {
      const body = await this.chatService.submitQuery(query, context);
      if (!body) {
        this.updateAssistantMessage(assistantMsgId, 'Unable to get response from server.', false);
        return;
      }

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let partialLine = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done && !partialLine) break;

        const chunk = done ? '' : decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split('\n');
        partialLine = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmedLine.replace('data: ', '').trim();
            const data: ChatResponse = JSON.parse(jsonStr);
            if (data.message) {
              fullText += data.message;
              this.updateAssistantMessage(assistantMsgId, fullText, true);
            }
            if (data.actions?.length) data.actions.forEach(action => this.handleAction(action));
          } catch (e) {
            console.error('Error parsing chat stream line:', e, line);
          }
        }

        if (done) break;
      }

      this.updateAssistantMessage(assistantMsgId, fullText || 'Done.', false);
      this.chatService.addToHistory('user', query);
      this.chatService.addToHistory('assistant', fullText);
    } catch (error: any) {
      const errorMsg = error?.message === 'TOO_MANY_REQUESTS'
        ? 'Rate limit exceeded. Please wait a moment.'
        : 'Chat service unreachable. Make sure backend is running.';
      this.updateAssistantMessage(assistantMsgId, errorMsg, false);
    } finally {
      this.chatService.setProcessing(false);
      this.cdr.markForCheck();
    }
  }

  private updateAssistantMessage(id: string, text: string, streaming: boolean) {
    this.messages.update(list => list.map(m => m.id === id ? { ...m, text, streaming } : m));
    this.cdr.markForCheck();
  }

  private handleAction(action: ChatAction) {
    switch (action.type) {
      case 'navigation':
        if (action.target) {
          this.uiService.navigate(action.target);
        }
        break;
      case 'highlight':
        if (action.element_type && action.item_id) {
          this.uiService.triggerHighlight(action.element_type, action.item_id);
        }
        break;
    }
  }
}
