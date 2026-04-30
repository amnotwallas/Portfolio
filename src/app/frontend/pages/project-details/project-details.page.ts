import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
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
import cv from "../../../../assets/data.json";

@Component({
  standalone: true,
  selector: 'project-details-page',
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  @ViewChild('mainCont') mainCont!: ElementRef<HTMLElement>;

  project: any = null;
  projectIndex: number = 0;
  imagesLoaded: { [key: string]: boolean } = {};
  private autoPlayInterval: any;

  ngOnInit() {
    window.scrollTo(0, 0);
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.project = cv.projects.find(p => this.getProjectSlug(p.name) === slug);
      if (!this.project) {
        this.router.navigate(['/cv']);
        return;
      }
      this.startAutoPlay();
    } else {
      this.router.navigate(['/cv']);
    }
    this.cdr.markForCheck();
  }

  private startAutoPlay() {
    if (this.project?.images?.length > 1) {
      this.ngZone.runOutsideAngular(() => {
        this.autoPlayInterval = setInterval(() => {
          this.ngZone.run(() => {
            this.nextImage();
            this.cdr.markForCheck();
          });
        }, 5000);
      });
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

  getProjectSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  goBack() {
    this.router.navigate(['/cv'], { fragment: '' });
  }

  ngOnDestroy() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }
}
