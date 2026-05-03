import { Directive, ElementRef, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.el.nativeElement.classList.add('reveal-on-scroll');
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.el.nativeElement.classList.add('reveal-active');
            // Once revealed, we can stop observing if we want it to stay
            // this.observer?.unobserve(entry.target);
          } else {
            // Optional: remove to hide again when leaving
            this.el.nativeElement.classList.remove('reveal-active');
          }
        });
      }, {
        threshold: 0.2 // Trigger when 20% of the section is visible
      });

      this.observer.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
