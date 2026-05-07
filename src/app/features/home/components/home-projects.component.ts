import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerRocket, tablerBrandGithub, tablerChevronDown, tablerChevronUp } from '@ng-icons/tabler-icons';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { UiService } from '../../../core/services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-projects',
  standalone: true,
  imports: [CommonModule, NgIcon, RouterModule],
  providers: [provideIcons({ tablerRocket, tablerBrandGithub, tablerChevronDown, tablerChevronUp })],
  template: `
    <div class="w-full max-w-5xl mx-auto py-20 px-6 group">
      <div class="flex items-center gap-4 mb-14">
        <div class="section-header-block">SYSTEM // KEY_PROJECTS</div>
        <div class="h-[1px] flex-grow bg-retro-yellow/10 group-hover:bg-retro-yellow/30 transition-colors"></div>
      </div>

      @if (cvSignal(); as cv) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          @for (item of cv.projects; track $index; let projectIdx = $index) {
          <div 
            [id]="getProjectElementId(item.slug)"
            class="p-8 rounded-xl glass-effect group/project shadow-2xl relative overflow-hidden flex flex-col border transition-all duration-500"
            [class.animate-neural-highlight]="isHighlighted(item.slug)"
            [class.border-retro-yellow/40]="!isHighlighted(item.slug)"
            [class.scale-[1.02]]="isHighlighted(item.slug)"
            [class.z-20]="isHighlighted(item.slug)"
          >
            
            @if (isHighlighted(item.slug)) {
              <div class="absolute top-2 right-4 font-mono text-[8px] text-retro-yellow animate-pulse tracking-widest uppercase z-30">
                Neural_Focus_Active
              </div>
            }

            <!-- Project Image Container -->
            <div class="relative mb-8 aspect-[4/3] overflow-hidden rounded-lg border border-retro-yellow/20 bg-retro-dark shadow-inner"
                [style.view-transition-name]="'project-image-' + item.slug">
              
              @if (resolvedImages[item.image]) {
                <img [src]="resolvedImages[item.image]" 
                    loading="lazy"
                    width="600"
                    height="450"
                    (load)="onImageLoad(item.image)"
                    class="w-full h-full object-cover object-top transition-all duration-700"
                    [class.opacity-0]="!imagesLoaded[item.image]"
                    [class.opacity-70]="imagesLoaded[item.image]"
                    [class.group-hover/project:opacity-100]="imagesLoaded[item.image]"
                    [class.group-hover/project:scale-105]="imagesLoaded[item.image]"
                    [alt]="item.name">
                
                @if (!imagesLoaded[item.image]) {
                  <div class="absolute inset-0 skeleton"></div>
                }
              } @else {
                <div class="absolute inset-0 skeleton"></div>
              }
              
              <div class="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-retro-dark/90 via-transparent to-transparent"></div>
            </div>

            <div class="flex justify-between items-start mb-4 gap-4">
              <h3 class="text-2xl font-bold text-retro-font group-hover/project:text-retro-bright group-hover/project:text-glow-bright transition-all font-mono tracking-tight"
                  [class.text-retro-bright]="isHighlighted(item.slug)"
                  [class.text-glow-bright]="isHighlighted(item.slug)"
                  [style.view-transition-name]="'project-title-' + item.slug">{{item.name}}</h3>
              @if (item.links.github) {
                <a [href]="item.links.github" target="_blank" class="text-retro-yellow/40 hover:text-retro-bright transition-colors flex-shrink-0">
                  <ng-icon name="tablerBrandGithub" size="24"></ng-icon>
                </a>
              }
            </div>
            
            <div class="relative">
              <div class="grid transition-[grid-template-rows,margin-bottom] duration-300 ease-in-out"
                  [class.grid-rows-[1fr]]="expandedProjects[projectIdx]"
                  [class.grid-rows-[0fr]]="!expandedProjects[projectIdx]"
                  [class.mb-6]="expandedProjects[projectIdx]"
                  [class.mb-4]="!expandedProjects[projectIdx]">
                <div class="overflow-hidden">
                  <p class="font-light text-sm text-retro-font/70 leading-relaxed"
                    [class.line-clamp-2]="!expandedProjects[projectIdx]">
                    {{item.description}}
                  </p>
                </div>
              </div>
              
              <button (click)="toggleProject(projectIdx)" 
                      class="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-retro-yellow/60 hover:text-retro-yellow transition-colors mb-6">
                {{ expandedProjects[projectIdx] ? 'Contract Metadata' : 'Expand Metadata' }}
                <ng-icon [name]="expandedProjects[projectIdx] ? 'tablerChevronUp' : 'tablerChevronDown'" size="14"></ng-icon>
              </button>
            </div>

            <div class="flex flex-wrap gap-2 mb-10">
              @for (tech of item.stack; track $index) {
                <span class="text-[9px] font-mono px-2.5 py-1 rounded bg-retro-yellow/5 border border-retro-yellow/20 text-retro-yellow/80 uppercase tracking-widest">{{tech}}</span>
              }
            </div>
            
            <a [routerLink]="['/project', item.slug]" class="inline-flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-retro-yellow/50 hover:text-retro-yellow transition-all mt-auto border-t border-retro-yellow/10 pt-6 group/btn">
              <ng-icon name="tablerRocket" size="16" class="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"></ng-icon>
              <span>ACCESS_FULL_LOGS</span>
            </a>
          </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeProjectsComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);
  
  cvSignal = this.portfolioService.portfolioDataSignal;

  expandedProjects: { [key: number]: boolean } = {};
  imagesLoaded: { [key: string]: boolean } = {};
  resolvedImages: { [key: string]: string } = {};
  highlightedProjectId = signal<string | null>(null);
  private sub = new Subscription();

  constructor() {
    effect(() => {
      const data = this.cvSignal();
      if (data) {
        this.resolveAllImages(data);
      }
    });
  }

  ngOnInit() {
    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        if (event.type === 'PROJECT') {
          this.processHighlight(event.id);
        }
      })
    );
  }

  getProjectElementId(slug: string): string {
    return 'project-' + slug.toLowerCase().trim();
  }

  isHighlighted(slug: string): boolean {
    return this.highlightedProjectId() === this.getProjectElementId(slug);
  }

  private processHighlight(id: string) {
    const data = this.cvSignal();
    if (!data) {
      setTimeout(() => this.processHighlight(id), 500);
      return;
    }

    const targetId = id.toLowerCase().trim();
    const project = data.projects.find(p => 
      p.slug === targetId || 
      p.slug.includes(targetId) || 
      p.name.toLowerCase().includes(targetId) ||
      p.id === targetId
    );

    if (project) {
      const elementId = this.getProjectElementId(project.slug);
      
      // Reset first to force re-animation
      this.highlightedProjectId.set(null);
      this.cdr.markForCheck();

      setTimeout(() => {
        this.highlightedProjectId.set(elementId);
        this.cdr.markForCheck();

        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        setTimeout(() => {
          this.highlightedProjectId.set(null);
          this.cdr.markForCheck();
        }, 6000);
      }, 50);
    }
  }

  private async resolveAllImages(data: any) {
    const resolutionPromises = data.projects.map(async (project: any) => {
      if (!this.resolvedImages[project.image]) {
        const resolvedUrl = await this.portfolioService.getSecureImage(project.image);
        this.resolvedImages[project.image] = resolvedUrl;
        this.cdr.markForCheck();
      }
    });
    await Promise.all(resolutionPromises);
  }

  toggleProject(index: number) {
    this.expandedProjects[index] = !this.expandedProjects[index];
    this.cdr.markForCheck();
  }

  onImageLoad(url: string) {
    this.imagesLoaded[url] = true;
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
