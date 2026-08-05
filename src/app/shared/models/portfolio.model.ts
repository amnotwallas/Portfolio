export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface Basics {
  name: string;
  label: string;
  hero_titles?: string[];
  summary: string;
  summary_es?: string;
  email: string;
  website: string;
  url: string;
  location?: string;
  open_to_relocate?: boolean;
  open_to?: string;
  profiles: Profile[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface WorkExperience {
  company: string;
  role: string;
  role_es?: string;
  period: string;
  summary: string;
  summary_es?: string;
  image?: string;
  highlights?: string[];   // used as tech tags
  achievements?: string[]; // bullet points
  achievements_es?: string[];
  tags?: string[];
  metrics?: string[];
}

export interface ProjectMetadata {
  status: string;
  role: string;
  complexity: string;
  challenges: string;
  challenges_es?: string;
  solutions: string;
  solutions_es?: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  description_es?: string;
  long_description: string;
  long_description_es?: string;
  image: string;
  images: string[];
  stack: string[];
  period: string;
  highlights?: string[];
  highlights_es?: string[];
  links: {
    github: string;
    demo?: string | null;
  };
  metadata: ProjectMetadata;
}

export interface Education {
  institution: string;
  degree: string;
  degree_es?: string;
  period: string;
  note?: string;
  note_es?: string;
}

export interface Language {
  name: string;
  name_es?: string;
  level: string;
  level_es?: string;
}

export interface PortfolioData {
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
