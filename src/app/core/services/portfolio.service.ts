import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PortfolioData } from '../../shared/models/portfolio.model';
import { LanguageService } from './language.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private http = inject(HttpClient);
  private langService = inject(LanguageService);

  public rawPortfolioSignal = signal<PortfolioData | null>(null);

  /** Computed signal that returns localized portfolio data matching current language */
  public portfolioDataSignal = computed<PortfolioData | null>(() => {
    const raw = this.rawPortfolioSignal();
    if (!raw) return null;

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

  get portfolio(): PortfolioData | null {
    return this.portfolioDataSignal();
  }

  get isLoaded(): boolean {
    return this.portfolioDataSignal() !== null;
  }

  /** Called by APP_INITIALIZER — loads data.json from assets */
  async init() {
    try {
      const data = await firstValueFrom(
        this.http.get<PortfolioData>('/assets/data.json')
      );
      if (data) {
        this.rawPortfolioSignal.set(data);
      }
    } catch (err) {
      console.error('PortfolioService: Failed to load assets/data.json', err);
    }
  }

  async getSecureImage(path: string): Promise<string> {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
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