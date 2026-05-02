import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<Language>('en');

  translations = {
    en: {
      available: 'Available for new projects',
      aboutMe: 'About Me',
      experience: 'Experience',
      projects: 'Key Projects',
      languages: 'Languages',
      seeMore: 'See More',
      seeLess: 'See Less',
      aiReady: "[WALTER_AI]: SYSTEM_READY. TRY_COMMANDS: 'VIEW_PROJECTS' OR 'EXPERIENCE'_",
      aiThinking: "[WALTER_AI]: THINKING...",
      aiCommand: "COMMAND_ACCEPTED: SCROLLING...",
      placeholder: 'TYPE_COMMAND_HERE...',
    },
    es: {
      available: 'Disponible para nuevos proyectos',
      aboutMe: 'Sobre Mí',
      experience: 'Experiencia',
      projects: 'Proyectos Clave',
      languages: 'Idiomas',
      seeMore: 'Ver Más',
      seeLess: 'Ver Menos',
      aiReady: "[WALTER_AI]: SISTEMA_LISTO. PRUEBA: 'VIEW_PROJECTS' O 'EXPERIENCE'_",
      aiThinking: "[WALTER_AI]: PENSANDO...",
      aiCommand: "COMANDO_ACEPTADO: DESPLAZANDO...",
      placeholder: 'ESCRIBE_UN_COMANDO...',
      viewProjects: 'VER_PROYECTOS'
    }
  };

  toggleLanguage() {
    this.currentLang.update(lang => lang === 'en' ? 'es' : 'en');
  }

  get t() {
    return this.translations[this.currentLang()];
  }
}
