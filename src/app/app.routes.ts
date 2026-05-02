import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home.page').then(m => m.HomePage) },
  { path: 'project/:slug', loadComponent: () => import('./features/projects/project-details.page').then(m => m.ProjectDetailsPage) },
];
