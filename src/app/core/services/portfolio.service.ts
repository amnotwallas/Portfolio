import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PortfolioData } from '../../shared/models/portfolio.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private http = inject(HttpClient);
  private readonly CACHE_KEY = 'portfolio_data_cache';
  
  // Cache for resolved Blob URLs to avoid redundant fetches and memory leaks
  private resolvedImagesCache = new Map<string, string>();
  
  public portfolioDataSignal = signal<PortfolioData | null>(this.getCachedData());

  get portfolio(): PortfolioData | null {
    return this.portfolioDataSignal();
  }

  get isLoaded(): boolean {
    return this.portfolioDataSignal() !== null;
  }

  /**
   * APP_INITIALIZER logic: Triggers fetch but doesn't block if we want to show skeletons.
   */
  init() {
    // We trigger the fetch in background to allow skeletons/cache to show immediately
    this.fetchRemoteData().catch(() => {});
  }

  private async fetchRemoteData() {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey || ''
    });

    try {
      const data = await firstValueFrom(
        this.http.get<PortfolioData>(`${environment.apiUrl}/data`, { headers })
      );
      if (data) {
        this.saveCache(data);
        this.portfolioDataSignal.set(data);
      }
    } catch (err) {
      console.error('PortfolioService: API unreachable.', err);
      if (!this.portfolioDataSignal()) {
        throw err; // Re-throw if we have absolutely no data to show
      }
    }
  }

  /**
   * Fetches an image with security headers and returns a Blob URL.
   */
  async getSecureImage(path: string): Promise<string> {
    if (this.resolvedImagesCache.has(path)) {
      return this.resolvedImagesCache.get(path)!;
    }

    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey || ''
    });

    try {
      const blob = await firstValueFrom(
        this.http.get(`${environment.apiUrl}${path}`, { 
          headers, 
          responseType: 'blob' 
        })
      );
      
      const objectUrl = URL.createObjectURL(blob);
      this.resolvedImagesCache.set(path, objectUrl);
      return objectUrl;
    } catch (err) {
      console.error(`PortfolioService: Failed to fetch secure image at ${path}`, err);
      return 'assets/fallback-image.png'; // Fallback
    }
  }

  private saveCache(data: PortfolioData) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('PortfolioService: Failed to save cache', e);
    }
  }

  private getCachedData(): PortfolioData | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
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