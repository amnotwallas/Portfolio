import { Directive, ElementRef, Input, NgZone, OnDestroy, inject, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appScramble]',
  standalone: true
})
export class ScrambleDirective implements AfterViewInit, OnChanges, OnDestroy {
  private el = inject(ElementRef);
  private ngZone = inject(NgZone);

  @Input('appScramble') textToScramble: string = '';
  @Input() id: string = '';
  @Input() scrambleOnStart: boolean = true;
  @Input() scrambleDuration: number = 600;

  private chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/X_';
  private frameRequest: number | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['textToScramble'] && !changes['textToScramble'].firstChange) {
      this.scramble(changes['textToScramble'].currentValue);
    }
  }

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

    const maxFrames = 100; 

    const anim = () => {
      let output = '';
      let complete = 0;

      for (let i = 0; i < length; i++) {
        const targetChar = newText[i] || '';

        // Randomize when each character "settles" - wider range for longer effect
        const settleFrame = Math.floor(Math.random() * maxFrames);

        if (frame >= settleFrame) {
          // Increased flicker chance to 10% and extended duration
          if (frame < maxFrames + 10 && Math.random() < 0.10) {
            output += this.chars[Math.floor(Math.random() * this.chars.length)];
          } else {
            complete++;
            output += targetChar;
          }
        } else {
          // Noise phase
          output += this.chars[Math.floor(Math.random() * this.chars.length)];
        }
      }

      targetEl.textContent = output;

      if (complete < length || frame < maxFrames + 10) {
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
