import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses the stored theme when one exists, ignoring device preference', () => {
    localStorage.setItem('portfolio-theme', 'light');
    mockMatchMedia(true); // device prefers dark, but stored value wins
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
  });

  it('falls back to dark when nothing is stored and the device prefers dark', () => {
    mockMatchMedia(true);
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
  });

  it('falls back to light when nothing is stored and the device does not prefer dark', () => {
    mockMatchMedia(false);
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
  });
});
