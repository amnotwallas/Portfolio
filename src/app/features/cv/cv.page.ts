import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, NgZone, ChangeDetectionStrategy, ChangeDetectorRef, inject, QueryList, ViewChildren } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { 
  tablerUser, tablerBriefcase, tablerRocket, 
  tablerSchool, tablerTools, tablerLanguage,
  tablerBrandGithub, tablerExternalLink,
  tablerChevronDown, tablerChevronUp
} from "@ng-icons/tabler-icons";
import { CVService } from "../../core/services/cv.service";
import { ScrambleDirective } from "../../shared/directives/scramble.directive";

@Component({
  standalone: true,
  selector: 'app-cv-page',
  templateUrl: 'cv.page.html',
  imports: [CommonModule, NgIcon, RouterModule, ScrambleDirective],
  providers: [provideIcons({ 
    tablerUser, tablerBriefcase, tablerRocket, 
    tablerSchool, tablerTools, tablerLanguage,
    tablerBrandGithub, tablerExternalLink,
    tablerChevronDown, tablerChevronUp
  })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvPage implements OnInit, OnDestroy, AfterViewInit {
  private cvService = inject(CVService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);

  @ViewChild('mainCont') mainCont!: ElementRef<HTMLElement>;
  @ViewChildren(ScrambleDirective) scrambleDirectives!: QueryList<ScrambleDirective>;
  
  cv = this.cvService.cv;
  private observer!: IntersectionObserver;
  
  expandedProjects: { [key: number]: boolean } = {};
  imagesLoaded: { [key: string]: boolean } = {};

  ngOnInit() {
    this.route.fragment.subscribe(frag => {
      if (frag) {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            const el = document.getElementById(frag);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 1000);
        });
      }
    });
  }

  getProjectSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  ngAfterViewInit() {
    this.initScrollObserver();
  }

  private initScrollObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const directive = this.scrambleDirectives.find(d => (d as any).id === sectionId);
          if (directive) {
            directive.scramble(directive.textToScramble);
          }
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const sections = this.mainCont.nativeElement.querySelectorAll('section');
    sections.forEach(section => this.observer.observe(section));
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
    if (this.observer) this.observer.disconnect();
  }
}
