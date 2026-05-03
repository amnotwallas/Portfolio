import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from "@angular/core";
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
import { PortfolioData, Project } from "../../shared/models/portfolio.model";
import { PortfolioService } from "../../core/services/portfolio.service";
import { interval, Subscription } from "rxjs";

@Component({
  standalone: true,
  selector: 'app-project-details-page',
  templateUrl: 'project-details.page.html',
  imports: [CommonModule, RouterModule, NgIcon],
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

  @ViewChild('mainCont') mainCont!: ElementRef<HTMLElement>;

  cv = this.portfolioService.portfolio;
  project: Project | null = null;
  prevProject: Project | null = null;
  nextProject: Project | null = null;
  projectIndex: number = 0;
  imagesLoaded: { [key: string]: boolean } = {};
  
  // Lightbox state
  showLightbox = false;
  isChanging = false;
  
  // Maps original paths to resolved Blob URLs
  resolvedImages: { [key: string]: string } = {};
  
  private subscription = new Subscription();
  private autoPlaySubscription: Subscription | null = null;

  async ngOnInit() {
    this.subscription.add(
      this.route.paramMap.subscribe(params => {
        const slug = params.get('slug');
        if (slug) {
          this.isChanging = true;
          this.cdr.markForCheck();
          
          // Small delay to allow fade out
          setTimeout(() => {
            this.loadProject(slug);
          }, 300);
        } else {
          this.router.navigate(['/home']);
        }
      })
    );
  }

  private async loadProject(slug: string) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.project = this.portfolioService.getProjectBySlug(slug) || null;
    
    if (!this.project) {
      this.router.navigate(['/home']);
      return;
    }

    // Reset carousel and states
    this.projectIndex = 0;
    this.imagesLoaded = {};
    const adjacents = this.portfolioService.getAdjacentProjects(slug);
    this.prevProject = adjacents.prev;
    this.nextProject = adjacents.next;

    // Resolve secure images for the gallery
    const imagesToResolve = [...(this.project.images || [])];
    if (this.project.image && !imagesToResolve.includes(this.project.image)) {
      imagesToResolve.push(this.project.image);
    }
    
    const resolutionPromises = imagesToResolve.map(async (img) => {
      if (this.resolvedImages[img]) return; // Already resolved
      const resolvedUrl = await this.portfolioService.getSecureImage(img);
      this.resolvedImages[img] = resolvedUrl;
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
    if ((this.project?.images?.length ?? 0) > 1) {
      this.autoPlaySubscription = interval(5000).subscribe(() => {
        this.nextImage();
      });
    }
  }

  private stopAutoPlay() {
    this.autoPlaySubscription?.unsubscribe();
  }

  nextImage() {
    if (this.project?.images?.length) {
      this.projectIndex = (this.projectIndex + 1) % this.project.images.length;
      this.cdr.markForCheck();
    }
  }

  prevImage() {
    if (this.project?.images?.length) {
      this.projectIndex = (this.projectIndex - 1 + this.project.images.length) % this.project.images.length;
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
