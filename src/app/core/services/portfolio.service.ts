import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PortfolioData } from '../../shared/models/portfolio.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private http = inject(HttpClient);

  public portfolioDataSignal = signal<PortfolioData | null>(null);

  get portfolio(): PortfolioData | null {
    return this.portfolioDataSignal();
  }

  get isLoaded(): boolean {
    return this.portfolioDataSignal() !== null;
  }

  /** Called by APP_INITIALIZER — loads data.json from assets (no API dependency) */
  async init() {
    try {
      const data = await firstValueFrom(
        this.http.get<PortfolioData>('/assets/data.json')
      );
      if (data) {
        this.portfolioDataSignal.set(data);
      }
    } catch (err) {
      console.error('PortfolioService: Failed to load assets/data.json', err);
    }
  }

  /**
   * Fetches an image by URL directly (images in data.json are public URLs or asset paths).
   * Returns the URL as-is for public URLs, or a resolved asset URL for local paths.
   */
  async getSecureImage(path: string): Promise<string> {
    // Public URL (http/https) — return directly, no auth header needed
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Local asset path — return as-is (Angular serves from /assets)
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