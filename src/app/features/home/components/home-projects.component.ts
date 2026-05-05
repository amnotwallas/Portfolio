import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
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
      <div class="flex items-center gap-3 mb-12">
        <ng-icon name="tablerRocket" class="text-retro-bright text-2xl"></ng-icon>
        <h2 class="text-lg font-bold uppercase tracking-[0.2em] text-retro-bright font-mono">Key Projects</h2>
        <div class="h-[1px] flex-grow bg-retro-muted group-hover:bg-retro-yellow/30 transition-colors"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        @for (item of cv.projects; track $index; let projectIdx = $index) {
        <div 
          [id]="'project-' + item.slug"
          class="p-6 rounded-xl glass-effect hover-lift group/project shadow-xl relative overflow-hidden flex flex-col border border-white/5 hover:border-retro-yellow/20 transition-all duration-500 animate-fade-in-up"
          [style.animation-delay]="($index * 100) + 'ms'"
          [class.animate-pulse-gold]="highlightedProject === item.slug"
          [class.highlight-active]="highlightedProject === item.slug"
        >
          
          <!-- Project Image -->
          <div class="relative mb-6 aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-retro-dark shadow-inner"
               [style.view-transition-name]="'project-image-' + item.slug">
            <div class="relative w-full h-full">
              <!-- SKELETON: Shown while image is loading -->
              @if (!imagesLoaded[item.image]) {
                <div class="absolute inset-0 z-10 skeleton bg-retro-yellow/5"></div>
              }
              
              <img *ngIf="resolvedImages[item.image]"
                   [src]="resolvedImages[item.image]" 
                   loading="lazy"
                   width="600"
                   height="450"
                   (load)="onImageLoad(item.image)"
                   class="w-full h-full object-cover object-top transition-all duration-700"
                   [class.opacity-0]="!imagesLoaded[item.image]"
                   [class.opacity-80]="imagesLoaded[item.image]"
                   [class.group-hover/project:opacity-100]="imagesLoaded[item.image]"
                   [class.group-hover/project:scale-105]="imagesLoaded[item.image]"
                   [alt]="item.name">
              
              <div class="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-retro-dark/80 via-transparent to-transparent"></div>
            </div>
          </div>

          <div class="flex justify-between items-start mb-4 gap-4">
            <h3 class="text-xl font-bold text-gray-100 group-hover/project:text-retro-yellow transition-colors font-mono tracking-tight"
                [style.view-transition-name]="'project-title-' + item.slug">{{item.name}}</h3>
            @if (item.links.github) {
              <a [href]="item.links.github" target="_blank" class="text-retro-bright/30 hover:text-retro-yellow transition-colors flex-shrink-0">
                <ng-icon name="tablerBrandGithub" size="22"></ng-icon>
              </a>
            }
          </div>
          
          <div class="relative">
            <p class="font-light text-sm text-gray-400 leading-relaxed transition-all duration-300"
               [class.line-clamp-2]="!expandedProjects[projectIdx]"
               [class.mb-4]="expandedProjects[projectIdx]"
               [class.mb-2]="!expandedProjects[projectIdx]">
              {{item.description}}
            </p>
            
            <button (click)="toggleProject(projectIdx)" 
                    class="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-retro-yellow/60 hover:text-retro-yellow transition-colors mb-4">
              {{ expandedProjects[projectIdx] ? 'See Less' : 'See More' }}
              <ng-icon [name]="expandedProjects[projectIdx] ? 'tablerChevronUp' : 'tablerChevronDown'" size="14"></ng-icon>
            </button>
          </div>

          <div class="flex flex-wrap gap-2 mb-8">
            @for (tech of item.stack; track $index) {
              <span class="text-[9px] font-mono px-2 py-1 rounded bg-retro-yellow/5 border border-retro-yellow/10 text-retro-yellow/70 uppercase tracking-wider">{{tech}}</span>
            }
          </div>
          
          <a [routerLink]="['/project', item.slug]" class="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-retro-yellow/40 hover:text-retro-yellow transition-all mt-auto border-t border-white/5 pt-4 group/btn">
            <ng-icon name="tablerRocket" size="14" class="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"></ng-icon>
            <span>SEE PROJECT</span>
          </a>
        </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeProjectsComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private uiService = inject(UiService);
  private cdr = inject(ChangeDetectorRef);
  cv = this.portfolioService.portfolio;

  expandedProjects: { [key: number]: boolean } = {};
  imagesLoaded: { [key: string]: boolean } = {};
  
  // Maps original paths to resolved Blob URLs
  resolvedImages: { [key: string]: string } = {};

  highlightedProject: string | null = null;
  private sub = new Subscription();

  async ngOnInit() {
    // Listen for AI highlights
    this.sub.add(
      this.uiService.highlight$.subscribe(event => {
        if (event.type === 'PROJECT') {
          let targetId = event.id;
          let el = document.getElementById('project-' + targetId);

          // Fallback: If exact slug not found, try finding a project that contains the string
          if (!el) {
            const matchedProject = this.cv.projects.find(p => p.slug.includes(targetId));
            if (matchedProject) {
              targetId = matchedProject.slug;
              el = document.getElementById('project-' + targetId);
            }
          }

          if (el) {
            this.highlightedProject = targetId;
            this.cdr.markForCheck();
            
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Auto-remove highlight after 5 seconds
            setTimeout(() => {
              this.highlightedProject = null;
              this.cdr.markForCheck();
            }, 5000);
          }
        }
      })
    );

    // Start resolving all images
    const resolutionPromises = this.cv.projects.map(async (project) => {
      const resolvedUrl = await this.portfolioService.getSecureImage(project.image);
      this.resolvedImages[project.image] = resolvedUrl;
      this.cdr.markForCheck();
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
