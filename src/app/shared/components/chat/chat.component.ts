import { Component, ElementRef, ViewChild, inject, AfterViewInit, ChangeDetectorRef, signal, ChangeDetectionStrategy, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowUp, tablerTerminal, tablerX } from '@ng-icons/tabler-icons';
import { ChatService } from '../../../core/services/chat.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { Router } from '@angular/router';
import { ChatResponse, ChatAction } from '../../models/portfolio.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowUp, tablerTerminal, tablerX })],
  template: `
    <!-- Proactive Tooltip -->
    <div 
      (click)="suggestQuery(currentSuggestion())"
      class="fixed bottom-40 right-4 md:right-8 z-50 group cursor-pointer transition-all duration-500 transform origin-right"
      [class.scale-0]="!showTooltip() || isOpen()"
      [class.opacity-0]="!showTooltip() || isOpen()"
      [class.translate-x-10]="!showTooltip() || isOpen()">
      <div class="relative bg-[#0A0A0A] border border-retro-yellow/30 px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(255,176,0,0.15)] backdrop-blur-md">
        <!-- Decoration bits -->
        <div class="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-retro-yellow/50"></div>
        <div class="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-retro-yellow/50"></div>
        
        <div class="flex items-center gap-3">
          <div class="flex flex-col">
            <span class="font-mono text-[9px] text-retro-yellow/50 uppercase tracking-widest mb-1">WALTER_AI // TIP</span>
            <p class="font-mono text-[11px] text-retro-font leading-tight uppercase">
              {{currentSuggestion().label}}
              <span class="inline-block w-1.5 h-3 bg-retro-yellow animate-pulse ml-0.5 align-middle"></span>
            </p>
          </div>
          <div class="w-8 h-8 rounded-lg bg-retro-yellow/10 flex items-center justify-center text-retro-yellow group-hover:bg-retro-yellow group-hover:text-retro-dark transition-colors">
            <ng-icon name="tablerArrowUp" size="16" class="rotate-45"></ng-icon>
          </div>
        </div>
        
        <!-- Tooltip Arrow -->
        <div class="absolute -bottom-2 right-6 w-4 h-4 bg-[#0A0A0A] border-r border-b border-retro-yellow/30 rotate-45"></div>
      </div>
    </div>

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
            INITIALIZING_NEURAL_LINK...
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
export class ChatComponent implements AfterViewInit, OnDestroy {
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
  
  showTooltip = signal(false);
  currentSuggestion = signal<{label: string, query: string}>({label: '', query: ''});
  private tooltipTimeout: any;
  private rotationInterval: any;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showTooltip.set(false);
    clearTimeout(this.tooltipTimeout);
    clearInterval(this.rotationInterval);

    if (this.isOpen()) return;

    this.tooltipTimeout = setTimeout(() => {
      this.checkSectionAndShowTooltip();
      this.startRotation();
    }, 1500);
  }

  ngAfterViewInit() {
    this.tooltipTimeout = setTimeout(() => {
      if (!this.isOpen()) {
        this.checkSectionAndShowTooltip();
        this.startRotation();
      }
    }, 3000);
  }

  ngOnDestroy() {
    clearTimeout(this.tooltipTimeout);
    clearInterval(this.rotationInterval);
  }

  private startRotation() {
    clearInterval(this.rotationInterval);
    this.rotationInterval = setInterval(() => {
      if (this.showTooltip() && !this.isOpen()) {
        this.showTooltip.set(false);
        this.cdr.markForCheck();
        
        setTimeout(() => {
          this.checkSectionAndShowTooltip(true);
        }, 600);
      }
    }, 10000);
  }

  private checkSectionAndShowTooltip(isRotation = false) {
    const experienceEl = document.getElementById('experience');
    const projectsEl = document.getElementById('projects');

    const phrases = {
      hero: [
        {
          label: '¿Qué hace Walter?',
          query: '¿Qué puedes hacer?'
        },
        {
          label: '¿Qué tecnologías usa?',
          query: 'Muéstrame tu stack técnico'
        },
        {
          label: '¿Trabaja con AI?',
          query: 'Cuéntame tu experiencia en AI'
        },
        {
          label: '¿Buscas un Backend Engineer?',
          query: '¿Por qué eres buen Backend Engineer?'
        }
      ],
      experience: [
        {
          label: '¿Te muestro mi experiencia?',
          query: 'Muéstrame tu experiencia'
        },
        {
          label: '¿Qué has logrado?',
          query: '¿Cuáles son tus mayores logros?'
        },
        {
          label: '¿Cómo ha sido tu trayectoria?',
          query: 'Cuéntame tu trayectoria'
        },
        {
          label: '¿Cuál es tu fuerte?',
          query: '¿Cuál es tu mayor fortaleza técnica?'
        }
      ],

      projects: [
        {
          label: '¿Quieres ver retos interesantes?',
          query: 'Cuéntame retos técnicos difíciles'
        },
        {
          label: '¿Cómo escalaste tus proyectos?',
          query: '¿Cómo escalaste tus aplicaciones?'
        },
        {
          label: '¿Qué tecnologías usas?',
          query: '¿Qué tecnologías usas normalmente?'
        },
        {
          label: '¿Te enseño arquitectura compleja?',
          query: 'Muéstrame arquitecturas complejas'
        }
      ],

      project_details: [
        {
          label: '¿Qué usaste aquí?',
          query: '¿Qué tecnologías usaste en este proyecto?'
        },
        {
          label: '¿Cuál fue el reto más difícil?',
          query: '¿Cuál fue el mayor reto de este proyecto?'
        },
        {
          label: '¿Quieres ver la arquitectura?',
          query: 'Explícame la arquitectura del proyecto'
        },
        {
          label: '¿Hubo bugs interesantes?',
          query: 'Cuéntame bugs interesantes de este proyecto'
        }
      ]
    };

    const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    if (!experienceEl && !projectsEl) {
      if (this.router.url.includes('/project/')) {
        this.currentSuggestion.set(getRandom(phrases.project_details));
        this.showTooltip.set(true);
        this.cdr.markForCheck();
      }
      return;
    }

    const scrollPos = window.scrollY + window.innerHeight / 2;
    let newSuggestion = { label: '', query: '' };

    if (projectsEl && scrollPos > projectsEl.offsetTop) {
      newSuggestion = getRandom(phrases.projects);
    } else if (experienceEl && scrollPos > experienceEl.offsetTop) {
      newSuggestion = getRandom(phrases.experience);
    } else {
      newSuggestion = getRandom(phrases.hero);
    }

    if (isRotation && newSuggestion.label === this.currentSuggestion().label) {
      this.checkSectionAndShowTooltip(true);
      return;
    }

    this.currentSuggestion.set(newSuggestion);
    this.showTooltip.set(true);
    this.cdr.markForCheck();
  }

  suggestQuery(suggestion: {label: string, query: string}) {
    this.showTooltip.set(false);
    if (!this.isOpen()) {
      this.toggleWidget();
    }
    this.userQuery = suggestion.query; // Enviamos el comando interno, no el label
    setTimeout(() => {
      this.onChatSubmit();
    }, 600);
  }

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
      // Si se abre, limpiar todo lo del tooltip
      this.showTooltip.set(false);
      clearTimeout(this.tooltipTimeout);
      clearInterval(this.rotationInterval);
      setTimeout(() => this.chatInput.nativeElement.focus(), 100);
    } else {
      // Si se cierra, re-activar la lógica de sugerencias proactivas
      this.onWindowScroll(); 
    }
  }

  async onChatSubmit() {
    const query = this.userQuery.trim();
    if (!query || this.isProcessing()) return;

    const context = this.getChatContext();
    this.userQuery = '';
    this.chatResponseEl.nativeElement.textContent = "[WALTER_AI]: PROCESSING_COMMAND...";

    try {
      const body = await this.chatService.submitQuery(query, context);
      if (!body) return;

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let partialLine = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done && !partialLine) break;
        
        const chunk = done ? "" : decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split('\n');
        partialLine = lines.pop() || "";
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmedLine.replace('data: ', '').trim();
            const data: ChatResponse = JSON.parse(jsonStr);
            
            if (data.message) {
              fullText += data.message;
              this.chatResponseEl.nativeElement.textContent = fullText + "_";
            }

            if (data.actions && data.actions.length > 0) {
              // Si hay múltiples acciones en un fragmento, procesarlas
              // Nota: handleAction ya maneja la lógica de prioridad
              data.actions.forEach(action => this.handleAction(action));
            }

            await new Promise(resolve => setTimeout(resolve, 15));
          } catch (e) {
            console.error('Error parsing chat stream line:', e, line);
          }
        }

        if (done) break;
      }

      // Final cleanup
      this.chatResponseEl.nativeElement.textContent = fullText;
      this.chatService.addToHistory('user', query);
      this.chatService.addToHistory('assistant', fullText);

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

  private handleAction(action: ChatAction) {
    switch (action.type) {
      case 'navigation':
        if (action.target) {
          // Pequeña optimización: no navegar si es redundante con un highlight inminente
          // (aunque triggerHighlight ya llama a navigate)
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
