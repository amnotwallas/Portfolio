import { Directive, ElementRef, Input, NgZone, OnDestroy, inject, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appScramble]',
  standalone: true
})
export class ScrambleDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private ngZone = inject(NgZone);

  @Input('appScramble') textToScramble: string = '';
  @Input() id: string = '';
  @Input() scrambleOnStart: boolean = true;
  @Input() scrambleDuration: number = 600;

  private chars = '!@$%&<>-_\\/[]{}—=+*^?#________';
  private frameRequest: number | null = null;

  ngAfterViewInit() {
    if (this.scrambleOnStart) {
      this.scramble(this.textToScramble || this.el.nativeElement.textContent || '');
    }
  }

  public scramble(newText: string) {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }

    let frame = 0;
    const targetEl = this.el.nativeElement;
    const oldText = targetEl.textContent || '';
    const length = Math.max(oldText.length, newText.length);

    const anim = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < length; i++) {
        const start = Math.floor(Math.random() * 3);
        const end = start + Math.floor(Math.random() * 6);
        if (frame >= end) {
          complete++;
          output += newText[i] || '';
        } else if (frame >= start) {
          output += this.chars[Math.floor(Math.random() * this.chars.length)];
        } else {
          output += oldText[i] || '';
        }
      }
      targetEl.textContent = output;
      
      if (complete < length) {
        frame++;
        this.frameRequest = requestAnimationFrame(anim);
      }
    };

    this.ngZone.runOutsideAngular(() => {
      this.frameRequest = requestAnimationFrame(anim);
    });
  }

  ngOnDestroy() {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
  }
}
