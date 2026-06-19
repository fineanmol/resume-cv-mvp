import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  Mail, 
  ArrowRight, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  X,
  CheckCircle
} from 'lucide-react';
import { TemplateLayoutPreview } from './TemplateLayoutPreview';
import { TEMPLATE_CATALOG } from '../config/templates';
import type { TemplateId } from '../types';
import { Auth } from './Auth';
import type { User } from 'firebase/auth';

type AuthUser = User | { email: string; isLocal: boolean };

interface LandingPageProps {
  onAuthSuccess: (user: AuthUser | null) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Interactive preview gallery state
  const [previewDocType, setPreviewDocType] = useState<'resume' | 'coverletter'>('resume');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId>('navy');

  const previewCatalogEntry = TEMPLATE_CATALOG.find((t) => t.id === previewTemplate) ?? TEMPLATE_CATALOG[0];

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-editor text-text-main font-sans overflow-x-hidden selection:bg-brand-accent selection:text-editor scroll-smooth">
      {/* 1. Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-editor/95 backdrop-blur border-b border-border-color/60 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-card border border-border-color rounded text-brand-accent">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-text-main">
            Candidate Suite
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-text-muted">
          <a href="#features" className="hover:text-brand-accent transition">Key Features</a>
          <a href="#previews" className="hover:text-brand-accent transition">Templates Gallery</a>
          <a href="#security" className="hover:text-brand-accent transition">Data Control</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setShowAuthModal(true);
            }} 
            className="px-4 py-2 hover:bg-card border border-transparent hover:border-border-color rounded-lg text-xs font-bold transition text-text-muted hover:text-text-main cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={handleGetStarted}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-editor font-extrabold rounded-lg shadow-md hover:shadow-brand-accent/10 transition text-xs cursor-pointer"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center relative">
        <div className="absolute inset-0 bg-radial-gradient from-brand-accent/5 to-transparent pointer-events-none blur-3xl rounded-full" />
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 border border-brand-accent/25 rounded-full text-brand-accent text-[10px] font-extrabold uppercase tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
          AI-Powered Recruitment Toolkit
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-main max-w-4xl leading-tight"
        >
          Build Tailored CVs &amp; Cover Letters That Beat the ATS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-text-muted max-w-2xl mt-6 leading-relaxed"
        >
          Bypass applicant tracking filters, score your compliance frequency in real-time, and inject missing skills naturally using Gemini AI. Export print-ready PDFs with pixel-perfect layouts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto"
        >
          <button
            onClick={handleGetStarted}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-accent hover:bg-brand-accent-hover text-editor font-bold rounded-xl shadow-lg hover:shadow-brand-accent/10 transition text-sm cursor-pointer"
          >
            Create Your Free Account
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#previews"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-card hover:bg-card/85 border border-border-color text-text-main font-semibold rounded-xl transition text-sm"
          >
            Explore Previews
          </a>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl w-full">
          <div className="p-4 bg-sidebar/50 border border-border-color/50 rounded-xl text-left">
            <span className="block text-xl font-bold text-brand-accent mb-0.5">100% Free</span>
            <span className="text-[10px] text-text-muted block">No subscriptions or credit cards required</span>
          </div>
          <div className="p-4 bg-sidebar/50 border border-border-color/50 rounded-xl text-left">
            <span className="block text-xl font-bold text-brand-accent mb-0.5">Gemini AI</span>
            <span className="text-[10px] text-text-muted block">Natural phrase integration &amp; experiences improver</span>
          </div>
          <div className="p-4 bg-sidebar/50 border border-border-color/50 rounded-xl text-left">
            <span className="block text-xl font-bold text-brand-accent mb-0.5">ATS Weighted</span>
            <span className="text-[10px] text-text-muted block">Score compliance based on keyword repetitions</span>
          </div>
          <div className="p-4 bg-sidebar/50 border border-border-color/50 rounded-xl text-left">
            <span className="block text-xl font-bold text-brand-accent mb-0.5">Dual Mode</span>
            <span className="text-[10px] text-text-muted block">Local guest sandbox or cloud Firebase sync</span>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-sidebar/30 border-y border-border-color/40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold">Comprehensive Product Features</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2">
              Everything you need to write structured, highly optimized job applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-sidebar border border-border-color/60 rounded-2xl space-y-4">
              <div className="p-3 bg-card border border-border-color text-brand-accent w-fit rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">Weighted ATS Score</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Calculates compatibility percentages prioritising highly repeating terms in the Job Description. Handles complex syntax boundaries (`C++`, `.NET`).
              </p>
              <ul className="text-[11px] text-text-muted space-y-2 pt-2 border-t border-border-color/40">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-brand-accent" /> Special character handling</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-brand-accent" /> Frequency weighted indexing</li>
              </ul>
            </div>

            <div className="p-6 bg-sidebar border border-border-color/60 rounded-2xl space-y-4">
              <div className="p-3 bg-card border border-border-color text-brand-accent w-fit rounded-xl">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">Natural Keyword Injections</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Click missing keywords to trigger targeted Gemini instructions. AI naturally incorporates terminology into experience bullets and summaries.
              </p>
              <ul className="text-[11px] text-text-muted space-y-2 pt-2 border-t border-border-color/40">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-brand-accent" /> Contextual inline additions</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-brand-accent" /> Single-click trigger flow</li>
              </ul>
            </div>

            <div className="p-6 bg-sidebar border border-border-color/60 rounded-2xl space-y-4">
              <div className="p-3 bg-card border border-border-color text-brand-accent w-fit rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">AI Spacing &amp; Bullet Improver</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Refine sentences in-place to follow action-verb rules. Scale sheet margins to fit exactly one page and auto-clamp to print boundaries.
              </p>
              <ul className="text-[11px] text-text-muted space-y-2 pt-2 border-t border-border-color/40">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-brand-accent" /> Sentence optimization slider</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-brand-accent" /> A4 viewport fitting check</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Previews Gallery Section */}
      <section id="previews" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">Premium Layout Templates Gallery</h2>
          <p className="text-xs sm:text-sm text-text-muted mt-2">
            Switch styles beforehand with simulated mock data to review the exact layouts.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex bg-sidebar border border-border-color p-1 rounded-xl">
            <button
              onClick={() => setPreviewDocType('resume')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                previewDocType === 'resume' ? 'bg-brand-accent text-editor' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <FileText className="w-4 h-4" />
              Resume Templates
            </button>
            <button
              onClick={() => setPreviewDocType('coverletter')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                previewDocType === 'coverletter' ? 'bg-brand-accent text-editor' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Mail className="w-4 h-4" />
              Cover Letter Templates
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {(['navy', 'serif', 'sidebar', 'tech'] as const).map((t) => {
              const label = TEMPLATE_CATALOG.find((entry) => entry.id === t)?.name ?? t;
              return (
                <button
                  key={t}
                  onClick={() => setPreviewTemplate(t)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    previewTemplate === t 
                      ? 'border-brand-accent bg-brand-accent/15 text-brand-accent' 
                      : 'border-border-color bg-card/25 hover:bg-card text-text-muted hover:text-text-main'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Mock Render Sheet (scaled down) */}
        <div className="bg-sidebar/20 border border-border-color/60 rounded-2xl p-8 flex flex-col items-center justify-center relative min-h-[500px] overflow-hidden">
          <div className="absolute top-4 right-4 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[9px] font-mono px-2 py-0.5 rounded">
            Interactive Preview Canvas (Scale: 65%)
          </div>

          <div className="transform scale-[0.65] origin-top my-4 shadow-2xl flex justify-center">
            <div className="bg-white shadow-2xl rounded-sm overflow-hidden w-[320px] h-[452px]">
              <TemplateLayoutPreview
                templateId={previewTemplate}
                accent={previewCatalogEntry.accent}
              />
            </div>
          </div>
          
          <div className="w-full mt-4 text-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-editor font-extrabold rounded-lg text-xs transition cursor-pointer shadow-md shadow-brand-accent/10"
            >
              Use This {previewTemplate.toUpperCase()} Layout
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Data Privacy & Control Section */}
      <section id="security" className="py-20 bg-sidebar/30 border-t border-border-color/40 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="p-4 bg-card border border-border-color rounded-2xl text-brand-accent flex-shrink-0">
            <ShieldCheck className="w-14 h-14" />
          </div>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[10px] font-bold text-brand-accent flex items-center gap-1 uppercase tracking-wider"
            >
              100% Privacy Sandbox
            </motion.div>
            <h2 className="text-2xl font-bold">You Control Your Credentials &amp; Data</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              We operate on a zero-vendor-lock philosophy. Run candidate suites entirely inside your local browser using localStorage (guest mode), or save drafts securely to your personal Firebase database. Use your own Gemini API key for zero artificial markups.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-border-color/60 py-10 px-6 bg-editor">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-card border border-border-color rounded text-brand-accent">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Candidate Suite</span>
          </div>

          <div className="text-[11px] text-text-muted flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} Candidate Suite. Built with React &amp; Tailwind.</span>
          </div>
        </div>
      </footer>

      {/* 7. Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-editor/80 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-sidebar border border-border-color rounded-2xl shadow-2xl p-1"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute right-6 top-6 p-1.5 text-text-muted hover:text-text-main hover:bg-card border border-transparent hover:border-border-color rounded-lg transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>

              <Auth onAuthSuccess={(usr: AuthUser | null) => {
                setShowAuthModal(false);
                onAuthSuccess(usr);
              }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
