import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m=>m.homepage) },
  { path: 'cv', loadComponent: () => import('./pages/cv/cv.page').then(m=>m.cvpage) },
  { path: 'project/:slug', loadComponent: () => import('./pages/project-details/project-details.page').then(m => m.ProjectDetailsPage) },
];
