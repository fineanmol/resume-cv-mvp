import type { ResumeState } from '../types';

export const DEFAULT_RESUME_STATE: ResumeState = {
  name: "Jonathan Doe",
  subtitle: "Senior Software Engineer | Full-Stack Developer | Cloud Architect",
  phone: "+1 (555) 019-2834",
  email: "jonathan.doe@example.com",
  linkedin: "linkedin.com/in/johndoe",
  location: "San Francisco, CA",
  avatar: "/profile_picture.jpg",

  resumeSummary: "Innovative and results-driven Senior Software Engineer with over 5 years of professional experience in designing, building, and deploying scalable web applications. Expert in React, TypeScript, Node.js, and cloud systems, with a passion for writing clean, maintainable code and optimizing system architectures.",
  
  resumeSkills: "React, TypeScript, Node.js, Next.js, Cloud Architectures, Amazon Web Services (AWS), Docker, PostgreSQL, REST APIs, GraphQL, System Design, CI/CD, Agile Methodologies, Git, Tailwind CSS, Python, Go, Unit Testing, Performance Tuning",
  
  resumeExperience: [
    {
      title: "Senior Software Engineer",
      company: "TechFlow Solutions",
      dates: "08/2023 - Present",
      location: "San Francisco, CA",
      bullets: "Led the architecture and migration of a legacy monolithic platform into microservices, improving deployment speed by 35%.\nMentored 6 junior and mid-level developers, establishing engineering best practices for testing, code reviews, and CI/CD pipelines.\nCollaborated closely with product managers and UX designers to deliver new client-facing dashboards, raising user retention by 22%.",
      url: "https://techflow.example.com"
    },
    {
      title: "Software Engineer",
      company: "Apex Software Systems",
      dates: "05/2021 - 07/2023",
      location: "San Jose, CA",
      bullets: "Developed and optimized high-throughput REST APIs handling over 10 million daily requests with average response times under 50ms.\nImplemented automated testing suites achieving 90%+ code coverage, reducing production bugs by 15%.\nConfigured containerized deployments using Docker and Kubernetes to ensure high availability and horizontal scaling.",
      url: "https://apexsystems.example.com"
    }
  ],

  resumeEducation: [
    {
      degree: "B.S. in Computer Science",
      school: "State University",
      dates: "09/2017 - 05/2021",
      location: "Austin, TX",
      bullets: "Graduated with Honors. Specialization in Software Engineering and Distributed Systems."
    }
  ],

  resumeCerts: [
    {
      title: "AWS Certified Solutions Architect - Associate",
      desc: "Gained expertise in architecting secure, robust, and scalable systems on AWS.",
      url: "https://aws.amazon.com/verification"
    },
    {
      title: "Certified ScrumMaster (CSM)",
      desc: "Trained in agile project facilitation, sprint planning, and backlog management."
    }
  ],

  resumeAchievements: [
    {
      title: "Outstanding Contribution Award (2024)",
      desc: "Recognized for exceptional leadership in migrating the core platform architecture.",
      icon: "flag"
    },
    {
      title: "First Place at State Hackathon (2020)",
      desc: "Designed and built an AI-driven logistics tracker in 36 hours.",
      icon: "star"
    }
  ],

  resumeLanguages: [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Conversational" }
  ],

  layoutSettings: {
    fontSize: 10,
    paddingTopBottom: 12,
    paddingLeftRight: 12,
    sectionSpacing: 10,
    lineHeight: 1.4,
    columnGap: 16,
    template: 'navy',
    brandColor: '#314855',
    accentColor2: '#0284c7',
    fontFamily: 'inter',
    headingFont: 'inter',
    headerStyle: 'centered',
    showPhoto: true,
    bulletStyle: 'disc',
  }
};
