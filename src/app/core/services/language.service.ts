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
      footerTag: 'Backend & AI Engineer based in Guadalajara, México — open to remote, hybrid, or full-time roles.',
      emailCopied: 'Email copied!',
      chatTitle: 'WALTER-AI',
      chatSubtitle: 'ask me anything',
      chatPlaceholder: 'Type a message...',
      chatEmptyState: "Ask me about Walter's experience, skills, or projects.",
      backToPortfolio: 'Back to portfolio',
      overviewLabel: 'Overview',
      stackLabel: 'Stack',
      highlightsLabel: 'Highlights',
      challengeLabel: 'Challenge',
      solutionLabel: 'Solution',
      chatSuggestions: [
        'What skills do you have?',
        'Tell me about CaseLens',
        'What is WALTER-AI?'
      ],
      cvUnavailableTooltip: "CV unavailable. Ask WALTER-AI about Walter's experience!",
      agentInvitations: [
        '👋 Hi! Ask WALTER-AI anything about my work & skills',
        '🚀 Curious about my stack? Chat with WALTER-AI!',
        '💡 Want to know about CaseLens or IBICARE? Ask WALTER-AI',
        '⚡ Need a quick summary? Talk to WALTER-AI'
      ]
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
      footerTag: 'Ingeniero Backend e IA en Guadalajara, México — disponible para roles remotos, híbridos o de tiempo completo.',
      emailCopied: '¡Email copiado!',
      chatTitle: 'WALTER-AI',
      chatSubtitle: 'pregúntame lo que sea',
      chatPlaceholder: 'Escribe un mensaje...',
      chatEmptyState: 'Pregúntame sobre la experiencia, habilidades o proyectos de Walter.',
      backToPortfolio: 'Volver al portafolio',
      overviewLabel: 'Resumen',
      stackLabel: 'Stack',
      highlightsLabel: 'Destacados',
      challengeLabel: 'Reto',
      solutionLabel: 'Solución',
      chatSuggestions: [
        '¿Qué habilidades tienes?',
        'Cuéntame sobre CaseLens',
        '¿Qué es WALTER-AI?'
      ],
      cvUnavailableTooltip: 'CV no disponible. ¡Pregúntale a WALTER-AI sobre la trayectoria de Walter!',
      agentInvitations: [
        '👋 ¡Hola! Pregúntale a WALTER-AI sobre mi experiencia y proyectos',
        '🚀 ¿Curioso sobre mi stack? ¡Chatea con WALTER-AI!',
        '💡 ¿Quieres saber sobre CaseLens o IBICARE? Pregúntale a WALTER-AI',
        '⚡ ¿Buscas un resumen rápido? Habla con WALTER-AI'
      ]
    }
  };

  isTransitioning = signal(false);

  toggleLanguage() {
    this.currentLang.update(lang => lang === 'en' ? 'es' : 'en');
    this.isTransitioning.set(true);
    setTimeout(() => this.isTransitioning.set(false), 350);
  }

  t = computed(() => this.translations[this.currentLang()]);
}
