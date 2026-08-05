import { Injectable, signal, computed, inject } from '@angular/core';
import { PortfolioData } from '../../shared/models/portfolio.model';
import { LanguageService } from './language.service';
import portfolioDataJson from '../../../assets/data.json';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private langService = inject(LanguageService);

  public rawPortfolioSignal = signal<PortfolioData>(portfolioDataJson as PortfolioData);

  /** Computed signal that returns localized portfolio data matching current language */
  public portfolioDataSignal = computed<PortfolioData>(() => {
    const raw = this.rawPortfolioSignal();
    const isEs = this.langService.currentLang() === 'es';
    if (!isEs) return raw;

    return {
      ...raw,
      basics: {
        ...raw.basics,
        summary: raw.basics.summary_es || raw.basics.summary
      },
      work: raw.work.map(w => ({
        ...w,
        role: w.role_es || w.role,
        summary: w.summary_es || w.summary,
        achievements: w.achievements_es || w.achievements
      })),
      projects: raw.projects.map(p => ({
        ...p,
        description: p.description_es || p.description,
        long_description: p.long_description_es || p.long_description,
        highlights: p.highlights_es || p.highlights,
        metadata: {
          ...p.metadata,
          challenges: p.metadata.challenges_es || p.metadata.challenges,
          solutions: p.metadata.solutions_es || p.metadata.solutions
        }
      })),
      education: raw.education.map(e => ({
        ...e,
        degree: e.degree_es || e.degree,
        note: e.note_es || e.note
      })),
      languages: raw.languages.map(l => ({
        ...l,
        name: l.name_es || l.name,
        level: l.level_es || l.level
      }))
    };
  });

  get portfolio(): PortfolioData {
    return this.portfolioDataSignal();
  }

  get isLoaded(): boolean {
    return true;
  }

  /** Data is directly bundled into JavaScript bundle — zero HTTP network requests needed! */
  async init() {}

  async getSecureImage(path: string): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    if (path.startsWith('/')) {
      return path.substring(1);
    }
    return path;
  }

  getProjectBySlug(slug: string) {
    return this.portfolio?.projects?.find(p => p.slug === slug);
  }

  getAdjacentProjects(slug: string) {
    const projects = this.portfolio?.projects || [];
    const index = projects.findIndex(p => p.slug === slug);
    if (index === -1) return { prev: null, next: null };
    return {
      prev: projects[index - 1] || null,
      next: projects[index + 1] || null
    };
  }
}