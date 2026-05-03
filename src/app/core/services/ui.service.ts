import { Injectable, signal, inject } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';

export interface HighlightEvent {
  type: 'PROJECT' | 'EXPERIENCE';
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private router = inject(Router);
  // ReplaySubject(1) ensures that if a component loads after the event (e.g. via @defer), 
  // it still receives the most recent highlight command.
  private highlightSubject = new ReplaySubject<HighlightEvent>(1);
  highlight$ = this.highlightSubject.asObservable();

  triggerHighlight(type: 'PROJECT' | 'EXPERIENCE', id: string) {
    this.highlightSubject.next({ type, id });
  }

  navigate(target: string) {
    const id = target.toLowerCase();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/'], { fragment: id });
    }
  }
}
