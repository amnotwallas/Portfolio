import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { 
  tablerArrowLeft, 
  tablerBrandGithub, 
  tablerExternalLink,
  tablerRocket,
  tablerCalendar
} from "@ng-icons/tabler-icons";
import cv from "../../../../assets/data.json";

@Component({
  standalone: true,
  selector: 'project-details-page',
  templateUrl: 'project-details.page.html',
  imports: [CommonModule, RouterModule, NgIcon],
  providers: [provideIcons({ 
    tablerArrowLeft, 
    tablerBrandGithub, 
    tablerExternalLink,
    tablerRocket,
    tablerCalendar
  })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  project: any = null;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.project = cv.projects.find(p => this.getProjectSlug(p.name) === slug);
      if (!this.project) {
        this.router.navigate(['/cv']);
      }
    } else {
      this.router.navigate(['/cv']);
    }
    this.cdr.markForCheck();
  }

  getProjectSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  goBack() {
    this.router.navigate(['/cv'], { fragment: 'PROJECTS' });
  }
}
