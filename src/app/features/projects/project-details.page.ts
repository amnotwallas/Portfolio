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
import { CVData, Project } from "../../shared/models/cv.model";
import { CVService } from "../../core/services/cv.service";
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
  private cvService = inject(CVService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('mainCont') mainCont!: ElementRef<HTMLElement>;

  cv = this.cvService.cv;
  project: Project | null = null;
  projectIndex: number = 0;
  imagesLoaded: { [key: string]: boolean } = {};
  private subscription = new Subscription();

  ngOnInit() {
    window.scrollTo(0, 0);
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.project = this.cvService.getProjectBySlug(slug || '') || null;
      if (!this.project) {
        this.router.navigate(['/home']);
        return;
      }
      this.startAutoPlay();
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
