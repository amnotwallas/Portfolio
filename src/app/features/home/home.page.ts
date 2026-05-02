import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CVService } from "../../core/services/cv.service";
import { HomeHeroComponent } from "./components/home-hero.component";
import { HomeStatusComponent } from "./components/home-status.component";
import { HomeLogsComponent } from "./components/home-logs.component";
import { HomeChatComponent } from "./components/home-chat.component";
import { HomeExperienceComponent } from './components/home-experience.component';
import { HomeProjectsComponent } from './components/home-projects.component';
import { interval, Subscription } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: 'home.page.html',
  imports: [
    CommonModule, 
    HomeHeroComponent, 
    HomeStatusComponent, 
    HomeLogsComponent, 
    HomeChatComponent,
    HomeExperienceComponent,
    HomeProjectsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit, OnDestroy {
  private cvService = inject(CVService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  cv = this.cvService.cv;
  firstName = this.cv.basics.name.split(' ')[0];
  
  activeTitle = this.cv.basics.label;
  uptime = '00:00:00';
  currentLogs: string[] = [...this.cv.terminal.boot_sequence];
  
  private titles = [
    'AI & Backend Engineer',
    'Building with LLMs & Python',
    'System Architecture & APIs',
    'Crafting Intelligent Solutions'
  ];
  
  private systemLogs = this.cv.terminal.command_suggestions.map((cmd: string) => `AVAILABLE_CMD: [${cmd}]`);
  private subscriptions = new Subscription();
  private startTime = this.cv.system.uptime_start ? new Date(this.cv.system.uptime_start).getTime() : Date.now();

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      // Title Rotation
      this.subscriptions.add(
        interval(4000).subscribe(() => {
          this.ngZone.run(() => {
            const currentIndex = this.titles.indexOf(this.activeTitle);
            this.activeTitle = this.titles[(currentIndex + 1) % this.titles.length];
            this.cdr.markForCheck();
          });
        })
      );

      // Uptime Calculation
      this.subscriptions.add(
        interval(1000).pipe(
          map(() => {
            const diff = Math.floor((Date.now() - this.startTime) / 1000);
            return `${Math.floor(diff/3600).toString().padStart(2,'0')}:${Math.floor((diff%3600)/60).toString().padStart(2,'0')}:${(diff%60).toString().padStart(2,'0')}`;
          })
        ).subscribe(u => {
          this.ngZone.run(() => {
            this.uptime = u;
            this.cdr.markForCheck();
          });
        })
      );

      // Logs Rotation
      this.subscriptions.add(
        interval(6000).subscribe(() => {
          this.ngZone.run(() => {
            let nextLog = this.systemLogs[Math.floor(Math.random() * this.systemLogs.length)];
            while (this.currentLogs.includes(nextLog)) {
              nextLog = this.systemLogs[Math.floor(Math.random() * this.systemLogs.length)];
            }
            this.currentLogs = [this.currentLogs[1], this.currentLogs[2], nextLog];
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
