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
      skills: 'Competencies',
      languages: 'Languages',
      seeMore: 'See More',
      seeLess: 'See Less',
      aiReady: "[WALTER_AI]: SYSTEM_READY. TRY_COMMANDS: 'EXEC_CV' OR 'VIEW_PROJECTS'_",
      aiThinking: "[WALTER_AI]: THINKING...",
      aiCommand: "COMMAND_ACCEPTED: REDIRECTING...",
      placeholder: 'TYPE_COMMAND_HERE...',
    },
    es: {
      available: 'Disponible para nuevos proyectos',
      aboutMe: 'Sobre Mí',
      experience: 'Experiencia',
      projects: 'Proyectos Clave',
      skills: 'Competencias',
      languages: 'Idiomas',
      seeMore: 'Ver Más',
      seeLess: 'Ver Menos',
      aiReady: "[WALTER_AI]: SISTEMA_LISTO. PRUEBA: 'EXEC_CV' O 'VIEW_PROJECTS'_",
      aiThinking: "[WALTER_AI]: PENSANDO...",
      aiCommand: "COMANDO_ACEPTADO: REDIRIGIENDO...",
      placeholder: 'ESCRIBE_UN_COMANDO...',
      execCv: 'VER_CV',
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
