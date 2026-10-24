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
    document.title = "LedgerLens AI | Intelligent Business Document Processing";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Explore LedgerLens AI, an AI-native document intelligence platform designed to extract, validate, and organize information from invoices and business paperwork.'
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
