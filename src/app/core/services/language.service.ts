import { Injectable, computed, signal } from '@angular/core';

export type Language = 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<Language>('en');

  translations = {
    en: {
      nav: { home: 'Home', experience: 'Experience', skills: 'Skills', projects: 'Work', contact: 'Contact' },
      heroPre: "Hi, I'm",
      ctaPrimary: 'See my work',
      ctaSecondary: 'Get in touch',
      resumeLabel: 'Resume',
      experienceEyebrow: 'Career',
      experienceTitle: 'Experience',
      skillsEyebrow: 'Toolkit',
      skillsTitle: 'Skills & Tools',
      projectsEyebrow: 'Selected work',
      projectsTitle: 'Projects',
      viewCaseLabel: 'View case study',
      educationEyebrow: 'Education',
      languagesEyebrow: 'Languages',
      contactTitle: "Let's build something",
      chatTitle: 'WALTER_AI',
      chatSubtitle: 'ask me anything',
      chatPlaceholder: 'Type a message...',
      chatEmptyState: "Ask me about Walter's experience, skills, or projects.",
      backToPortfolio: 'Back to portfolio',
      overviewLabel: 'Overview',
      stackLabel: 'Stack',
      highlightsLabel: 'Highlights',
      challengeLabel: 'Challenge',
      solutionLabel: 'Solution'
    },
    es: {
      nav: { home: 'Inicio', experience: 'Experiencia', skills: 'Habilidades', projects: 'Proyectos', contact: 'Contacto' },
      heroPre: 'Hola, soy',
      ctaPrimary: 'Ver proyectos',
      ctaSecondary: 'Contactar',
      resumeLabel: 'CV',
      experienceEyebrow: 'Trayectoria',
      experienceTitle: 'Experiencia',
      skillsEyebrow: 'Herramientas',
      skillsTitle: 'Habilidades y Herramientas',
      projectsEyebrow: 'Trabajo seleccionado',
      projectsTitle: 'Proyectos',
      viewCaseLabel: 'Ver caso de estudio',
      educationEyebrow: 'Educación',
      languagesEyebrow: 'Idiomas',
      contactTitle: 'Construyamos algo juntos',
      chatTitle: 'WALTER_AI',
      chatSubtitle: 'pregúntame lo que sea',
      chatPlaceholder: 'Escribe un mensaje...',
      chatEmptyState: 'Pregúntame sobre la experiencia, habilidades o proyectos de Walter.',
      backToPortfolio: 'Volver al portafolio',
      overviewLabel: 'Resumen',
      stackLabel: 'Stack',
      highlightsLabel: 'Destacados',
      challengeLabel: 'Reto',
      solutionLabel: 'Solución'
    }
  };

  toggleLanguage() {
    this.currentLang.update(lang => lang === 'en' ? 'es' : 'en');
  }

  t = computed(() => this.translations[this.currentLang()]);
}
