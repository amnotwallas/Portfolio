import { Component, ElementRef, ViewChild, inject, AfterViewInit, ChangeDetectorRef, computed, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowUp, tablerX } from '@ng-icons/tabler-icons';
import { ChatService } from '../../../core/services/chat.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { LanguageService } from '../../../core/services/language.service';
import { Router } from '@angular/router';
import { ChatResponse, ChatAction } from '../../models/portfolio.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowUp, tablerX })],
  template: `
    @if (uiService.chatOpen()) {
      <div class="fixed bottom-22 right-5.5 z-[199] w-[min(360px,90vw)] rounded-[20px] glass-card neo-border neo-shadow overflow-hidden flex flex-col" style="animation: fadeUp 0.35s ease;">
        <div class="bg-[#15151A] text-[#FAFAF7] px-4 py-3.5 flex items-center justify-between">
          <div>
            <div class="font-[var(--font-display)] font-bold text-[13.5px]">{{ langService.t().chatTitle }}</div>
            <div class="font-[var(--font-mono)] text-[10px] text-[var(--color-lime)]">{{ langService.t().chatSubtitle }}</div>
          </div>
          <button (click)="uiService.toggleChat()" class="w-6 h-6 flex items-center justify-center text-[#FAFAF7]">
            <ng-icon name="tablerX" size="14"></ng-icon>
          </button>
        </div>

        <div class="p-4 max-h-64 overflow-y-auto flex flex-col gap-2.5">
          <p #chatResponseEl class="font-[var(--font-body)] text-[13px] text-[var(--ink)] leading-relaxed m-0 min-h-[3em]">
            {{ langService.t().chatEmptyState }}
          </p>
        </div>

        @if (suggestions().length) {
          <div class="px-3.5 pb-2.5 flex flex-col gap-1.5 border-t border-[var(--glass-border)] pt-2.5">
            @for (q of suggestions(); track q) {
              <button (click)="suggestQuery(q)" class="text-left font-[var(--font-mono)] text-[11.5px] px-3 py-2 rounded-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/25">
                {{ q }}
              </button>
            }
          </div>
        }

        <form (submit)="onChatSubmit()" class="flex items-center gap-2.5 px-4 py-3 border-t border-[var(--glass-border)]">
          <input #chatInput type="text" [(ngModel)]="userQuery" name="query" autocomplete="off"
                 [placeholder]="langService.t().chatPlaceholder"
                 class="flex-grow bg-transparent border-none outline-none font-[var(--font-body)] text-[13px] text-[var(--ink)]">
          <button type="submit" [disabled]="isProcessing() || !userQuery.trim()"
                  class="p-2.5 rounded-full bg-[var(--color-accent)] text-white disabled:opacity-30">
            <ng-icon name="tablerArrowUp" size="18"></ng-icon>
          </button>
        </form>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  private chatService = inject(ChatService);
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  uiService = inject(UiService);
  langService = inject(LanguageService);

  @ViewChild('chatResponseEl') chatResponseEl!: ElementRef<HTMLElement>;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;

  userQuery = '';
  isProcessing = this.chatService.isProcessing;
  cvSignal = this.portfolioService.portfolioDataSignal;

  suggestions = computed(() => this.cvSignal()?.terminal?.command_suggestions ?? []);

  ngAfterViewInit() {}
  ngOnDestroy() {}

  suggestQuery(query: string) {
    this.userQuery = query;
    setTimeout(() => this.onChatSubmit(), 200);
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
    this.chatResponseEl.nativeElement.textContent = '...';

    try {
      const body = await this.chatService.submitQuery(query, context);
      if (!body) return;

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
              this.chatResponseEl.nativeElement.textContent = fullText + '_';
            }
            if (data.actions?.length) data.actions.forEach(action => this.handleAction(action));
          } catch (e) {
            console.error('Error parsing chat stream line:', e, line);
          }
        }

        if (done) break;
      }

      this.chatResponseEl.nativeElement.textContent = fullText;
      this.chatService.addToHistory('user', query);
      this.chatService.addToHistory('assistant', fullText);
    } catch (error: any) {
      this.chatResponseEl.nativeElement.textContent = error?.message === 'TOO_MANY_REQUESTS'
        ? 'TOO_MANY_REQUESTS'
        : 'API_UNAVAILABLE';
    } finally {
      this.chatService.setProcessing(false);
      this.cdr.markForCheck();
    }
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
