import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './App';

export interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
}

export const ROUTE_METADATA: Record<string, RouteMeta> = {
  '/': {
    title: 'MyLedgerLens — AI-Powered Financial Document Intelligence',
    description: 'MyLedgerLens helps businesses extract, validate, and review financial document data with AI-assisted processing and structured verification workflows.',
    canonical: 'https://myledgerlens.com/',
  },
  '/privacy': {
    title: 'Privacy Policy | MyLedgerLens',
    description: 'Read the MyLedgerLens Privacy Policy. Learn how we handle invoice documents, authentication data, AI extraction via Google Gemini, private storage, and workspace isolation.',
    canonical: 'https://myledgerlens.com/privacy',
  },
  '/terms': {
    title: 'Terms of Service | MyLedgerLens',
    description: 'Read the MyLedgerLens Terms of Service. Understand terms of use, human review requirements, limitations of AI extraction, data responsibilities, and proposed commercial terms.',
    canonical: 'https://myledgerlens.com/terms',
  },
  '/about': {
    title: 'About MyLedgerLens | AI-Powered Invoice Intelligence',
    description: 'Learn about MyLedgerLens, our mission to bring audit-grade precision to B2B invoice processing, our technical architecture, and our engineering roadmap.',
    canonical: 'https://myledgerlens.com/about',
  },
  '/pricing': {
    title: 'Pricing & Commercial Model | MyLedgerLens',
    description: 'Review the proposed commercial model and pricing tiers for MyLedgerLens invoice processing, validation, and review automation.',
    canonical: 'https://myledgerlens.com/pricing',
  },
};

export function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
  const meta = ROUTE_METADATA[url] || ROUTE_METADATA['/'];
  return { html, meta };
}
