import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, NgZone, ChangeDetectionStrategy, ChangeDetectorRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { 
  tablerUser, tablerBriefcase, tablerRocket, 
  tablerSchool, tablerTools, tablerLanguage,
  tablerBrandGithub, tablerExternalLink,
  tablerChevronLeft, tablerChevronRight
} from "@ng-icons/tabler-icons";
import cv from "../../../../assets/data.json";

@Component({
  standalone: true,
  selector: 'cv-page',
  templateUrl: 'cv.page.html',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ 
    tablerUser, tablerBriefcase, tablerRocket, 
    tablerSchool, tablerTools, tablerLanguage,
    tablerBrandGithub, tablerExternalLink,
    tablerChevronLeft, tablerChevronRight
  })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class cvpage implements OnInit, OnDestroy, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);

  @ViewChild('mainCont') mainCont!: ElementRef<HTMLElement>;
  
  readonly cv = cv;
  private ticking = false;
  private observer!: IntersectionObserver;
  
  // Carousel State
  projectIndices: { [key: string]: number } = {};
  private autoPlayInterval: any;

  ngOnInit() {
    this.cdr.markForCheck();
    this.initCarouselIndices();
    this.startAutoPlay();

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

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      this.initScrollObserver();
    });
  }

  private initScrollObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const title = entry.target.querySelector('h2');
          if (title) this.scrambleElement(title as HTMLElement);
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const sections = this.mainCont.nativeElement.querySelectorAll('section');
    sections.forEach(section => this.observer.observe(section));
  }

  private onMouseMove = (e: MouseEvent) => {
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

  private scrambleElement(el: HTMLElement) {
    let frame = 0;
    const finalText = el.textContent || '';
    const chars = '!<>-_\\/[]{}—=+*^?#________';

    const anim = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < finalText.length; i++) {
        const start = Math.floor(Math.random() * 3);
        const end = start + Math.floor(Math.random() * 6);
        if (frame >= end) { complete++; output += finalText[i]; }
        else if (frame >= start) { output += chars[Math.floor(Math.random() * chars.length)]; }
        else { output += ' '; }
      }
      el.textContent = output;
      if (complete < finalText.length) {
        frame++;
        requestAnimationFrame(anim);
      }
    };
    requestAnimationFrame(anim);
  }

  private initCarouselIndices() {
    this.cv.projects.forEach((_, index) => {
      this.projectIndices[index] = 0;
    });
  }

  private startAutoPlay() {
    this.ngZone.runOutsideAngular(() => {
      this.autoPlayInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.cv.projects.forEach((project, index) => {
            if (project.images && project.images.length > 1) {
              this.nextImage(index, project.images.length);
            }
          });
          this.cdr.markForCheck();
        });
      }, 5000);
    });
  }

  nextImage(projectIdx: number, total: number) {
    this.projectIndices[projectIdx] = (this.projectIndices[projectIdx] + 1) % total;
    this.cdr.markForCheck();
  }

  prevImage(projectIdx: number, total: number) {
    this.projectIndices[projectIdx] = (this.projectIndices[projectIdx] - 1 + total) % total;
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.onMouseMove);
    if (this.observer) this.observer.disconnect();
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
  }
}
