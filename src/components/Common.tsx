import { ExternalLink, Info, Radio } from 'lucide-react';
import type { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { copy } from '../data/i18n';

export function PageIntro({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children?: ReactNode }) {
  return <header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-subtitle">{subtitle}</p>{children}</header>;
}

export function SourceLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  const { locale } = useApp();
  return <a className={`source-link ${className}`} href={href} target="_blank" rel="noreferrer"><span>{children}</span><ExternalLink size={13} aria-label={locale === 'pt' ? 'abre em nova aba' : 'opens in a new tab'} /></a>;
}

export function DataState({ kind = 'verified', children }: { kind?: 'verified' | 'concept'; children: ReactNode }) {
  const { locale } = useApp();
  const label = kind === 'verified' ? copy[locale].common.verified : copy[locale].common.concept;
  return <span className={`data-state data-state-${kind}`}><span className="data-state-icon" aria-hidden="true">{kind === 'verified' ? <Radio size={12} /> : <Info size={12} />}</span><strong>{label}</strong><span>{children}</span></span>;
}
