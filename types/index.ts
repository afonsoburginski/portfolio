export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  github?: string;
  tags: string[];
  featured?: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: "frontend" | "backend" | "tools" | "other";
  icon?: string;
  level?: number;
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: React.ReactNode;
}

export interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactElement;
}

