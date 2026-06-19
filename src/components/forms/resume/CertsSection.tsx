import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Check,
  FileText,
  Flag,
  Globe,
  Star,
  Target,
  Terminal,
  Trophy,
} from 'lucide-react';
import type { ResumeState } from '../../../types';
import { AccordionSection } from '../../ui/AccordionSection';
import { AddItemButton } from '../../ui/AddItemButton';
import { BulletEditor } from '../../ui/BulletEditor';
import { ItemActionBar } from '../../ui/ItemActionBar';
import { ITEM_ANIM } from '../../../constants/animations';
import { inputCls, itemCardCls, labelBoldCls } from '../../../constants/formClasses';

const DEFAULT_CERT = {
  title: 'Project / Certification Name',
  desc: 'Description / Tech Stack / Issuer',
};

const CERT_ICON_OPTIONS = [
  { key: 'star', icon: Star },
  { key: 'award', icon: Award },
  { key: 'flag', icon: Flag },
  { key: 'check', icon: Check },
  { key: 'trophy', icon: Trophy },
  { key: 'target', icon: Target },
  { key: 'terminal', icon: Terminal },
  { key: 'globe', icon: Globe },
  { key: 'fileText', icon: FileText },
] as const;

interface CertsSectionProps {
  state: ResumeState;
  onChange: (newState: ResumeState | ((prev: ResumeState) => ResumeState)) => void;
  openSection: string;
  onToggle: (id: string) => void;
}

export const CertsSection: React.FC<CertsSectionProps> = ({
  state,
  onChange,
  openSection,
  onToggle,
}) => {
  const [openCertSettingsIdx, setOpenCertSettingsIdx] = useState<number | null>(null);

  const clean = (t: string) => t.replace(/\*\*|\*/g, '');

  const updCert = (idx: number, k: string, v: string) =>
    onChange((prev) => {
      const u = [...prev.resumeCerts];
      u[idx] = { ...u[idx], [k]: k === 'url' ? v : clean(v) };
      return { ...prev, resumeCerts: u };
    });

  const addCert = () =>
    onChange((prev) => ({
      ...prev,
      resumeCerts: [...prev.resumeCerts, { ...DEFAULT_CERT }],
    }));

  const removeCert = (idx: number) =>
    onChange((prev) => ({
      ...prev,
      resumeCerts: prev.resumeCerts.filter((_, i) => i !== idx),
    }));

  return (
    <AccordionSection
      id="certs"
      icon={Award}
      label="Projects & Certifications"
      badge={state.resumeCerts.length}
      openSection={openSection}
      onToggle={onToggle}
      bodyClassName="p-4 border-t border-border-color/40 space-y-3"
    >
      <AddItemButton label="Add Project / Certification" onClick={addCert} />
      <AnimatePresence>
        {state.resumeCerts.map((cert, idx) => (
          <motion.div key={idx} {...ITEM_ANIM} className={itemCardCls}>
            <ItemActionBar
              onSettings={() => setOpenCertSettingsIdx(openCertSettingsIdx === idx ? null : idx)}
              onDelete={() => removeCert(idx)}
              settingsActive={openCertSettingsIdx === idx}
              settingsTitle="Item Settings"
              deleteTitle="Delete Project / Cert"
            />
            <input
              value={cert.title}
              onChange={(e) => updCert(idx, 'title', e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-border-color/30 text-xs font-semibold text-text-main focus:outline-none w-full"
              placeholder="Project / Certification Name"
            />

            {openCertSettingsIdx === idx && (
              <div className="p-3 bg-slate-50/5 rounded-lg border border-border-color/50 space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Project Settings
                </div>
                <div>
                  <label className="block text-[9px] text-text-muted mb-1 font-semibold">
                    Project Link / Verification Link
                  </label>
                  <input
                    value={cert.url || ''}
                    onChange={(e) => updCert(idx, 'url', e.target.value)}
                    className={inputCls}
                    placeholder="https://myproject.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-text-muted font-semibold mb-1">
                    Project Icon
                  </label>
                  <div className="flex flex-wrap gap-1 items-center">
                    {CERT_ICON_OPTIONS.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSel = cert.icon === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => updCert(idx, 'icon', isSel ? '' : opt.key)}
                          title={opt.key}
                          className={`p-1 rounded border transition cursor-pointer flex items-center justify-center ${
                            isSel
                              ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                              : 'border-border-color/60 hover:border-brand-accent/40 text-text-muted hover:text-text-main'
                          }`}
                        >
                          <IconComponent className="w-3 h-3" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className={labelBoldCls}>Description / details</label>
              <BulletEditor
                value={cert.desc}
                onChange={(v) => updCert(idx, 'desc', v)}
                prefixId={`cert-bullet-${idx}`}
                placeholder="Description / Tech Stack / Issuer — e.g. Tech: React, Tailwind"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </AccordionSection>
  );
};
