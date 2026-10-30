import React, { useEffect } from 'react';
import { Hero } from '../components/Hero';
import { ProblemSection } from '../components/ProblemSection';
import { ProductIntro } from '../components/ProductIntro';
import { ProductCapabilities } from '../components/ProductCapabilities';
import { WorkflowSection } from '../components/WorkflowSection';
import { DifferentiationSection } from '../components/DifferentiationSection';
import { CustomerSection } from '../components/CustomerSection';
import { TractionSection } from '../components/TractionSection';
import { BusinessValueSection } from '../components/BusinessValueSection';
import { GetStartedSection } from '../components/EarlyAccessSection';

export const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = "MyLedgerLens — AI-Powered Financial Document Intelligence";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'MyLedgerLens helps businesses extract, validate, and review financial document data with AI-assisted processing and structured verification workflows.'
      );
    }
  }, []);

  return (
    <main className="w-full">
      <Hero />
      <ProblemSection />
      <ProductIntro />
      <ProductCapabilities />
      <WorkflowSection />
      <DifferentiationSection />
      <CustomerSection />
      <TractionSection />
      <BusinessValueSection />
      <GetStartedSection />
    </main>
  );
};
