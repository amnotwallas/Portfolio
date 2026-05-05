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
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.el.nativeElement.classList.add('reveal-active');
            // Keep it revealed once seen to prevent flickers when scrolling back up
            // this.observer?.unobserve(entry.target);
          } else if (entry.boundingClientRect.top > window.innerHeight) {
            // Only hide if it goes back BELOW the viewport
            this.el.nativeElement.classList.remove('reveal-active');
          }
        });
      }, {
        threshold: 0.1
      });

      const rect = this.el.nativeElement.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        // If visible, just show it immediately without the translateY(40px) jump
        this.el.nativeElement.classList.add('reveal-active');
      } else {
        // If not visible, apply the hidden state
        this.el.nativeElement.classList.add('reveal-on-scroll');
      }

      this.observer.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
