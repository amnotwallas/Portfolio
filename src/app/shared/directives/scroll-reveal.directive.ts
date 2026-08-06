import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

export type RevealAnimation = 'fade-up' | 'spring-up' | 'spring-pop' | 'fade';

const ANIMATION_CLASSES: Record<RevealAnimation, string> = {
  'fade-up':    'animate-fade-up',
  'spring-up':  'animate-spring-up',
  'spring-pop': 'animate-spring-pop',
  'fade':       'animate-fade-up',
};

/**
 * Usage:
 *   <div scrollReveal>...</div>
 *   <div scrollReveal="spring-up" [revealDelay]="150">...</div>
 *   <div scrollReveal="spring-pop" [revealThreshold]="0.2">...</div>
 */
@Directive({
  selector: '[scrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private el    = inject(ElementRef);
  private zone  = inject(NgZone);

  /** Animation preset. Defaults to 'fade-up'. */
  @Input('scrollReveal') animation: RevealAnimation | '' = '';

  /** Delay in ms before class is added after intersection. */
  @Input() revealDelay = 0;

  /** IntersectionObserver threshold (0–1). */
  @Input() revealThreshold = 0.12;

  private observer?: IntersectionObserver;

  ngOnInit() {
    const host = this.el.nativeElement as HTMLElement;

    // Start invisible — will be revealed on scroll
    host.style.opacity = '0';

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          const animClass = ANIMATION_CLASSES[(this.animation as RevealAnimation) || 'fade-up'];

          const apply = () => {
            host.style.opacity = '';
            host.classList.add(animClass);
            this.observer?.disconnect();
          };

          if (this.revealDelay > 0) {
            setTimeout(apply, this.revealDelay);
          } else {
            apply();
          }
        },
        { threshold: this.revealThreshold }
      );

      this.observer.observe(host);
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
