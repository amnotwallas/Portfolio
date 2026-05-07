export interface SystemConfig {
  id: string;
  version: string;
  status: string;
  location: {
    city: string;
    coords: string;
    timezone: string;
  };
  uptime_start: string;
}

export interface TerminalConfig {
  welcome_message: string;
  command_suggestions: string[];
  boot_sequence: string[];
}

export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface Basics {
  name: string;
  label: string;
  system_label: string;
  summary: string;
  email: string;
  website: string;
  url: string;
  profiles: Profile[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface WorkExperience {
  company: string;
  role: string;
  period: string;
  summary: string;
  image?: string;
  highlights: string[];
}

export interface ProjectMetadata {
  status: string;
  role: string;
  complexity: string;
  challenges: string;
  solutions: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description: string;
  image: string;
  images: string[];
  stack: string[];
  period: string;
  links: {
    github: string;
    demo: string | null;
  };
  metadata: ProjectMetadata;
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface PortfolioData {
  system: SystemConfig;
  terminal: TerminalConfig;
  basics: Basics;
  skills: SkillCategory[];
  work: WorkExperience[];
  projects: Project[];
  education: Education[];
  languages: Language[];
}

export interface ChatAction {
  type: 'navigation' | 'highlight';
  target?: string;
  element_type?: 'PROJECT' | 'EXPERIENCE';
  item_id?: string;
}

export interface ChatResponse {
  message: string;
  actions: ChatAction[];
}
