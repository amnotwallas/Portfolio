import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, NgZone, ChangeDetectionStrategy, inject, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { tablerArrowUp } from "@ng-icons/tabler-icons";
import { environment } from "../../../../environments/environment";
import cv from "../../../../assets/data.json";

@Component({
  standalone: true,
  selector: 'homepage',
  templateUrl: 'home.page.html',
  imports: [CommonModule, FormsModule, NgIcon],
  providers: [provideIcons({ tablerArrowUp })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class homepage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('uptimeEl') uptimeEl!: ElementRef<HTMLElement>;
  @ViewChild('titleEl') titleEl!: ElementRef<HTMLElement>;
  @ViewChild('chatResponseEl') chatResponseEl!: ElementRef<HTMLElement>;
  @ViewChild('logEl1') logEl1!: ElementRef<HTMLElement>;
  @ViewChild('logEl2') logEl2!: ElementRef<HTMLElement>;
  @ViewChild('logEl3') logEl3!: ElementRef<HTMLElement>;
  @ViewChild('mainCont') mainCont!: ElementRef<HTMLElement>;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;
  
  private mouse = { x: -1000, y: -1000 };
  private dpr = 1;
  private ticking = false;
  private sessionId = crypto.randomUUID();
  private apiUrl = `${environment.apiUrl}/chat/stream`;

  readonly cv = cv;
  firstName = cv.basics.name.split(' ')[0];
  firstNameLength = this.firstName.length;

  userQuery = '';
  isProcessing = false;
  systemMood: 'idle' | 'processing' | 'success' | 'error' = 'idle';
  private chatHistory: {role: string, content: string}[] = [];
  private activeTitleStr = '';
  
  private titleInterval: any;
  private uptimeInterval: any;
  private logInterval: any;
  private startTime = Date.now();

  private systemLogs = [
    "LLM_ORCHESTRATOR_ACTIVE: [TASK_DELEGATION]",
    "AGENT_NODE_REASONING... [DONE]",
    "FASTAPI_WORKERS_ONLINE: [UVICORN]",
    "VECTOR_DB_SYNC: [READY]",
    "PROMPT_INJECTION_SHIELD: [ENABLED]",
    "RAG_PIPELINE_LATENCY: 120ms",
    "NEURAL_CONTEXT_WINDOW: 128K_TOKENS",
    "STREAMING_SSE_CONNECTION: STABLE",
    "MODEL_EVAL_METRICS: [98%_ACCURACY]",
    "JWT_AUTH_TOKEN_VERIFIED: [RBAC_OK]"
  ];
  private currentLogs = ["INITIALIZING_MODULES...", "CONNECTING_TO_LLM_GATEWAY... [OK]", "DATA_STREAM_STABLE"];

  constructor(private ngZone: NgZone, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.titleInterval = setInterval(() => {
      const titles = [
        'AI & Backend Engineer',
        'Building with LLMs & Python',
        'System Architecture & APIs',
        'Crafting Intelligent Solutions'
      ];
      const next = titles[(titles.indexOf(this.activeTitleStr) + 1) % titles.length];
      this.scramble(next || titles[0], this.titleEl);
    }, 4000);

    this.uptimeInterval = setInterval(() => {
      const diff = Math.floor((Date.now() - this.startTime) / 1000);
      const uptimeStr = `${Math.floor(diff/3600).toString().padStart(2,'0')}:${Math.floor((diff%3600)/60).toString().padStart(2,'0')}:${(diff%60).toString().padStart(2,'0')}`;
      if (this.uptimeEl) this.uptimeEl.nativeElement.textContent = uptimeStr;
    }, 1000);

    this.logInterval = setInterval(() => {
      let nextLog = this.systemLogs[Math.floor(Math.random() * this.systemLogs.length)];
      while (this.currentLogs.includes(nextLog)) {
        nextLog = this.systemLogs[Math.floor(Math.random() * this.systemLogs.length)];
      }
      this.currentLogs[0] = this.currentLogs[1];
      this.currentLogs[1] = this.currentLogs[2];
      this.currentLogs[2] = nextLog;
      this.scramble(this.currentLogs[0], this.logEl1);
      this.scramble(this.currentLogs[1], this.logEl2);
      this.scramble(this.currentLogs[2], this.logEl3);
    }, 6000);
  }

  ngAfterViewInit() {
    this.dpr = window.devicePixelRatio || 1;
    setTimeout(() => this.chatInput?.nativeElement?.focus(), 600);
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
      this.scramble(cv.basics.label, this.titleEl);
    });
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        if (this.mainCont) {
          this.mainCont.nativeElement.style.setProperty('--x', `${e.clientX}px`);
          this.mainCont.nativeElement.style.setProperty('--y', `${e.clientY}px`);
        }
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

async initNeuralCore() {
  try {
    await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': environment.apiKey
      },
      body: JSON.stringify({
        action: 'init',
        session_id: this.sessionId
      })
    });
    console.log("WALTER_AI: NEURAL_CORE_ESTABLISHED");
  } catch (e) {
    console.error("WALTER_AI: CORE_OFFLINE");
  }
}

async onChatSubmit(overrideCommand?: string) {
  const rawQuery = overrideCommand || this.userQuery;
  if (!rawQuery.trim() || this.isProcessing) return;

  this.isProcessing = true;
  this.systemMood = 'processing';
  const query = rawQuery.trim().toLowerCase();
  this.userQuery = '';
  this.cdr.markForCheck();
  
  if (this.chatResponseEl) {
    this.chatResponseEl.nativeElement.textContent = "[WALTER_AI]: PROCESSING_COMMAND...";
  }

  if (query === 'cv' || query === 'resume' || query === 'exec_cv') {
    this.systemMood = 'success';
    this.scramble("COMMAND_ACCEPTED: REDIRECTING TO CV MODULE...", this.chatResponseEl);
    this.cdr.markForCheck();
    setTimeout(() => {
      this.router.navigate(['/cv']);
      this.isProcessing = false;
      this.systemMood = 'idle';
      this.cdr.markForCheck();
    }, 1000);
    return;
  }

  if (query === 'projects' || query === 'view_projects' || query === 'show projects') {
    this.systemMood = 'success';
    this.scramble("COMMAND_ACCEPTED: OPENING PROJECTS VIEW...", this.chatResponseEl);
    this.cdr.markForCheck();
    setTimeout(() => {
      this.router.navigate(['/cv'], { fragment: 'PROJECTS' });
      this.isProcessing = false;
      this.systemMood = 'idle';
      this.cdr.markForCheck();
    }, 1000);
    return;
  }

  if (this.chatResponseEl) {
    this.chatResponseEl.nativeElement.textContent = "[WALTER_AI]: THINKING...";
  }

  try {    
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': environment.apiKey
      },
      body: JSON.stringify({ 
        query: rawQuery,
        session_id: this.sessionId, 
        action: 'chat'
      })
    });

    if (response.status === 429) {
      this.systemMood = 'error';
      this.scramble("SYSTEM_OVERLOAD: TOO_MANY_REQUESTS. SLOW_DOWN.", this.chatResponseEl);
      this.cdr.markForCheck();
      return;
    }

    if (!response.ok) throw new Error('API_UNAVAILABLE');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (this.chatResponseEl) this.chatResponseEl.nativeElement.textContent = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.replace('data: ', '');
          fullText += content;
          if (this.chatResponseEl) {
            this.chatResponseEl.nativeElement.textContent = fullText + "_";
            // Efecto de scroll automático si es necesario
            await new Promise(resolve => setTimeout(resolve, 15)); 
          }
        }
      }
    }

    if (this.chatResponseEl) this.chatResponseEl.nativeElement.textContent = fullText;
    this.systemMood = 'idle';
    this.cdr.markForCheck();

    // Actualizamos historial local (opcional, para visualización persistente en UI)
    this.chatHistory.push({ role: 'user', content: rawQuery });
    this.chatHistory.push({ role: 'assistant', content: fullText });
    if (this.chatHistory.length > 10) this.chatHistory.shift();

    // --- LOGICA DE NAVEGACION DINÁMICA (AI Triggered) ---
    if (fullText.includes('[NAV:CV]')) {
      this.systemMood = 'success';
      this.cdr.markForCheck();
      setTimeout(() => this.router.navigate(['/cv']), 2500);
    } 
    else if (fullText.includes('[NAV:PROJECTS]')) {
      this.systemMood = 'success';
      this.cdr.markForCheck();
      setTimeout(() => this.router.navigate(['/cv'], { fragment: 'PROJECTS' }), 2500);
    }

  } catch (error) {
    this.systemMood = 'error';
    this.scramble("CONNECTION_ERROR: UNABLE_TO_REACH_NEURAL_CORE.", this.chatResponseEl);
    this.cdr.markForCheck();
    console.error("Neural Core Error:", error);
  } finally {
    this.isProcessing = false;
    this.cdr.markForCheck();
  }
}


  private scramble(newText: string, elementRef?: ElementRef<HTMLElement>) {
    let frame = 0;
    const targetEl = elementRef?.nativeElement;
    const oldText = targetEl?.textContent || '';
    const length = Math.max(oldText.length, newText.length);
    const chars = '!@$%&<>-_\\/[]{}—=+*^?#________';

    const anim = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < length; i++) {
        const start = Math.floor(Math.random() * 3);
        const end = start + Math.floor(Math.random() * 6);
        if (frame >= end) { complete++; output += newText[i] || ''; }
        else if (frame >= start) { output += chars[Math.floor(Math.random() * chars.length)]; }
        else { output += oldText[i] || ''; }
      }
      if (targetEl) targetEl.textContent = output;
      if (elementRef === this.titleEl) this.activeTitleStr = output;
      if (complete < length) {
        frame++;
        requestAnimationFrame(anim);
      }
    };
    this.ngZone.runOutsideAngular(() => requestAnimationFrame(anim));
  }

  ngOnDestroy() {
    clearInterval(this.titleInterval);
    clearInterval(this.uptimeInterval);
    clearInterval(this.logInterval);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }
}
