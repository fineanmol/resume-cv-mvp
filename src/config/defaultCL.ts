import type { CoverLetterState } from '../types';

export const DEFAULT_CL_STATE: CoverLetterState = {
  name: "Jonathan Doe",
  subtitle: "Senior Software Engineer | Full-Stack Developer | Cloud Architect",
  phone: "+1 (555) 019-2834",
  email: "jonathan.doe@example.com",
  linkedin: "linkedin.com/in/johndoe",
  location: "San Francisco, CA",
  avatar: "/profile_picture.jpg",
  customContacts: [],

  companyName: "Acme Tech",
  jobTitle: "Senior Software Engineer",
  salutation: "Dear Hiring Team,",
  
  p1: "I am writing to express my strong interest in the {{role}} position at {{company}}. With over 5 years of professional experience in building scalable web applications and designing robust cloud systems, I am excited about the opportunity to contribute to your engineering goals and collaborate with your talented team.",
  
  p2: "In my previous role at TechFlow Solutions, I led the redesign of our core dashboard architectures, improving application loading performance by 40% and enhancing user engagement. I have extensive experience in TypeScript, React, Node.js, and deploying containerized applications to AWS. I thrive in collaborative environments where writing clean code, peer mentoring, and implementing agile practices are core values.",
  
  p3: "What draws me to {{company}} is your commitment to technical excellence and user-focused product development. I am eager to apply my system optimization background and problem-solving skills to help scale your systems and deliver high-impact features.",
  
  p4: "Thank you for your time and consideration. I welcome the opportunity to discuss how my experience and technical background align with your team's needs. I look forward to hearing from you.",
  
  highlights: [
    {
      category: "Frontend Engineering",
      text: "Modern React, TypeScript, Next.js, responsive layouts, Tailwind CSS, global state management, and performance optimization."
    },
    {
      category: "Backend Systems",
      text: "Node.js, Express, RESTful and GraphQL APIs, databases (PostgreSQL, MongoDB), caching (Redis), and system design."
    },
    {
      category: "Cloud & DevOps",
      text: "AWS (S3, EC2, Lambda), Docker, CI/CD pipelines, horizontal scaling, and infrastructure monitoring."
    },
    {
      category: "Engineering Practices",
      text: "Agile Scrum, unit and integration testing, code reviews, technical documentation, and cross-functional collaboration."
    }
  ],

  layoutSettings: {
    fontSize: 12.0,
    paddingTopBottom: 15,
    paddingLeftRight: 15,
    sectionSpacing: 18,
    lineHeight: 1.55,
    template: 'navy',
    brandColor: '#314855',
    accentColor2: '#0284c7',
    fontFamily: 'inter',
    headingFont: 'inter',
    headerStyle: 'centered',
    showPhoto: true,
    roundPhoto: true,
    showPhone: true,
    showEmail: true,
    showLocation: true,
    showLinkedin: true,
    showTitle: true,
    uppercaseName: false,
  }
};
