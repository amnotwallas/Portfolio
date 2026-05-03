import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from "@angular/core";
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
  tablerChevronRight
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
    tablerChevronRight
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
  projectIndex: number = 0;
  imagesLoaded: { [key: string]: boolean } = {};
  
  // Maps original paths to resolved Blob URLs
  resolvedImages: { [key: string]: string } = {};
  
  private subscription = new Subscription();

  async ngOnInit() {
    window.scrollTo(0, 0);
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.project = this.portfolioService.getProjectBySlug(slug || '') || null;
      if (!this.project) {
        this.router.navigate(['/home']);
        return;
      }
      
      // Resolve secure images for the gallery
      const imagesToResolve = [...(this.project.images || [])];
      if (this.project.image && !imagesToResolve.includes(this.project.image)) {
        imagesToResolve.push(this.project.image);
      }
      
      const resolutionPromises = imagesToResolve.map(async (img) => {
        const resolvedUrl = await this.portfolioService.getSecureImage(img);
        this.resolvedImages[img] = resolvedUrl;
        this.cdr.markForCheck();
      });
      
      this.startAutoPlay();
      await Promise.all(resolutionPromises);
    } else {
      this.router.navigate(['/home']);
    }
    this.cdr.markForCheck();
  }

  private startAutoPlay() {
    if ((this.project?.images?.length ?? 0) > 1) {
      this.subscription.add(
        interval(5000).subscribe(() => {
          this.nextImage();
        })
      );
    }
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

  goBack() {
    this.router.navigate(['/home'], { fragment: 'projects' });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
