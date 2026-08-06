import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, HostListener, signal, computed, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { 
  tablerArrowLeft, 
  tablerBrandGithub, 
  tablerExternalLink,
  tablerRocket,
  tablerCalendar,
  tablerAlertTriangle,
  tablerCircleCheck,
  tablerActivity,
  tablerWorld,
  tablerChevronLeft,
  tablerChevronRight,
  tablerLock,
  tablerMail,
  tablerX,
  tablerZoomIn
} from "@ng-icons/tabler-icons";
import { Project } from "../../shared/models/portfolio.model";
import { PortfolioService } from "../../core/services/portfolio.service";
import { LanguageService } from "../../core/services/language.service";
import { ScrollRevealDirective } from "../../shared/directives/scroll-reveal.directive";
import { interval, Subscription } from "rxjs";

@Component({
  standalone: true,
  selector: 'app-project-details-page',
  templateUrl: 'project-details.page.html',
  imports: [CommonModule, RouterModule, NgIcon, ScrollRevealDirective],
  providers: [provideIcons({ 
    tablerArrowLeft, 
    tablerBrandGithub, 
    tablerExternalLink,
    tablerRocket,
    tablerCalendar,
    tablerAlertTriangle,
    tablerCircleCheck,
    tablerActivity,
    tablerWorld,
    tablerChevronLeft,
    tablerChevronRight,
    tablerLock,
    tablerMail,
    tablerX,
    tablerZoomIn
  })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailsPage implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  langService = inject(LanguageService);

  @ViewChild('mainCont') mainCont!: ElementRef<HTMLElement>;

  cvSignal = this.portfolioService.portfolioDataSignal;
  slug = signal<string | null>(null);

  project = computed(() => {
    const s = this.slug();
    const data = this.cvSignal();
    if (s && data) {
      return data.projects.find(p => p.slug === s) || null;
    }
    return null;
  });

  adjacents = computed(() => {
    const p = this.project();
    const data = this.cvSignal();
    if (p && data) {
      const projects = data.projects;
      const index = projects.findIndex(item => item.slug === p.slug);
      return {
        prev: projects[index - 1] || null,
        next: projects[index + 1] || null
      };
    }
    return { prev: null, next: null };
  });

  projectIndex = 0;
  imagesLoaded: { [key: string]: boolean } = {};
  
  // Lightbox state
  showLightbox = false;
  isChanging = false;
  
  // Maps original paths to resolved Blob URLs
  resolvedImages: { [key: string]: string } = {};
  
  private subscription = new Subscription();
  private autoPlaySubscription: Subscription | null = null;

  constructor() {
    // React to project changes (data arrival or navigation)
    effect(() => {
      const p = this.project();
      if (p) {
        this.onProjectAvailable(p);
      }
    });
  }

  async ngOnInit() {
    this.subscription.add(
      this.route.paramMap.subscribe(params => {
        const s = params.get('slug');
        if (s) {
          this.isChanging = true;
          this.cdr.markForCheck();
          
          // Small delay to allow fade out
          setTimeout(() => {
            this.slug.set(s);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }, 300);
        } else {
          this.router.navigate(['/home']);
        }
      })
    );
  }

  private async onProjectAvailable(project: Project) {
    // Reset carousel and states
    this.projectIndex = 0;
    this.imagesLoaded = {};

    // Resolve secure images for the gallery
    const imagesToResolve = [...(project.images || [])];
    if (project.image && !imagesToResolve.includes(project.image)) {
      imagesToResolve.push(project.image);
    }
    
    const resolutionPromises = imagesToResolve.map(async (img) => {
      if (this.resolvedImages[img]) return; // Already resolved
      const resolvedUrl = await this.portfolioService.getSecureImage(img);
      this.resolvedImages[img] = resolvedUrl;
      this.cdr.markForCheck();
    });
    
    // Clear and restart autoplay
    this.stopAutoPlay();
    this.startAutoPlay();
    
    await Promise.all(resolutionPromises);
    
    // Finish transition
    this.isChanging = false;
    this.cdr.markForCheck();
  }

  private startAutoPlay() {
    const p = this.project();
    if (p && (p.images?.length ?? 0) > 1) {
      this.autoPlaySubscription = interval(5000).subscribe(() => {
        this.nextImage();
      });
    }
  }

  private stopAutoPlay() {
    this.autoPlaySubscription?.unsubscribe();
  }

  nextImage() {
    const p = this.project();
    if (p?.images?.length) {
      this.projectIndex = (this.projectIndex + 1) % p.images.length;
      this.cdr.markForCheck();
    }
  }

  prevImage() {
    const p = this.project();
    if (p?.images?.length) {
      this.projectIndex = (this.projectIndex - 1 + p.images.length) % p.images.length;
      this.cdr.markForCheck();
    }
  }

  setProjectIndex(idx: number) {
    this.projectIndex = idx;
    this.cdr.markForCheck();
  }

  onImageLoad(url: string) {
    this.imagesLoaded[url] = true;
    this.cdr.markForCheck();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showLightbox) {
      if (event.key === 'ArrowRight') this.nextImage();
      if (event.key === 'ArrowLeft') this.prevImage();
      if (event.key === 'Escape') this.closeLightbox();
    } else {
      if (event.key === 'ArrowRight') this.nextImage();
      if (event.key === 'ArrowLeft') this.prevImage();
    }
  }

  openLightbox() {
    this.showLightbox = true;
    this.stopAutoPlay();
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();
  }

  closeLightbox() {
    this.showLightbox = false;
    this.startAutoPlay();
    document.body.style.overflow = '';
    this.cdr.markForCheck();
  }

  goBack() {
    this.router.navigate(['/home'], { fragment: 'projects' });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.stopAutoPlay();
  }
}
