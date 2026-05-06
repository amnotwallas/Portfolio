import { Directive, ElementRef, HostListener, Input, inject, NgZone, OnInit } from '@angular/core';

@Directive({
  selector: '[appMagnetic]',
  standalone: true
})
export class MagneticDirective implements OnInit {
  private el = inject(ElementRef);
  private ngZone = inject(NgZone);
  
  @Input() magneticStrength = 0.5; // How much it follows the mouse (0 to 1)
  @Input() magneticRadius = 80;   // Pixels within which the effect activates

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.el.nativeElement.addEventListener('mousemove', (event: MouseEvent) => {
        const rect = this.el.nativeElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distanceX = event.clientX - centerX;
        const distanceY = event.clientY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < this.magneticRadius) {
          const moveX = distanceX * this.magneticStrength;
          const moveY = distanceY * this.magneticStrength;
          
          this.el.nativeElement.style.transform = `translate(${moveX}px, ${moveY}px)`;
          this.el.nativeElement.style.transition = 'transform 0.1s ease-out';
        } else {
          this.reset();
        }
      });

      this.el.nativeElement.addEventListener('mouseleave', () => {
        this.reset();
      });
    });
  }

  private reset() {
    this.el.nativeElement.style.transform = `translate(0px, 0px)`;
    this.el.nativeElement.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
  }
}
