import { Component, ChangeDetectionStrategy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HomeHeroComponent } from "./components/home-hero.component";
import { HomeExperienceComponent } from './components/home-experience.component';
import { HomeSkillsComponent } from './components/home-skills.component';
import { HomeProjectsComponent } from './components/home-projects.component';
import { HomeEducationComponent } from './components/home-education.component';
import { HomeContactComponent } from './components/home-contact.component';
import { MarqueeComponent } from '../../shared/components/marquee/marquee.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: 'home.page.html',
  imports: [
    CommonModule,
    HomeHeroComponent,
    MarqueeComponent,
    HomeExperienceComponent,
    HomeSkillsComponent,
    HomeProjectsComponent,
    HomeEducationComponent,
    HomeContactComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {}
