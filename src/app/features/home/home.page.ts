import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PortfolioService } from "../../core/services/portfolio.service";
import { HomeHeroComponent } from "./components/home-hero.component";
import { HomeExperienceComponent } from './components/home-experience.component';
import { HomeProjectsComponent } from './components/home-projects.component';
import { interval, Subscription } from "rxjs";

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: 'home.page.html',
  imports: [
    CommonModule, 
    HomeHeroComponent, 
    HomeExperienceComponent,
    HomeProjectsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  cvSignal = this.portfolioService.portfolioDataSignal;
  
  firstName = computed(() => {
    const data = this.cvSignal();
    return data ? data.basics.name.split(' ')[0] : '';
  });
  
  activeTitle = ''; // Managed by interval
  
  private titles = [
    'AI & Backend Engineer',
    'Building with LLMs & Python',
    'System Architecture & APIs',
    'Crafting Intelligent Solutions'
  ];
  
  private subscriptions = new Subscription();

  ngOnInit() {
    // Initial active title
    const data = this.cvSignal();
    if (data) {
      this.activeTitle = data.basics.label;
    } else {
      this.activeTitle = this.titles[0];
    }

    this.ngZone.runOutsideAngular(() => {
      // Title Rotation (Used in Hero)
      this.subscriptions.add(
        interval(4000).subscribe(() => {
          this.ngZone.run(() => {
            const currentIndex = this.titles.indexOf(this.activeTitle);
            this.activeTitle = this.titles[(currentIndex + 1) % this.titles.length];
            this.cdr.markForCheck();
          });
        })
      );
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
