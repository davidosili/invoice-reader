import React, { useEffect } from 'react';
import { Hero } from '../components/Hero';
import { ProblemSection } from '../components/ProblemSection';
import { ProductIntro } from '../components/ProductIntro';
import { ProductCapabilities } from '../components/ProductCapabilities';
import { WorkflowSection } from '../components/WorkflowSection';
import { DifferentiationSection } from '../components/DifferentiationSection';
import { CustomerSection } from '../components/CustomerSection';
import { BusinessValueSection } from '../components/BusinessValueSection';
import { EarlyAccessSection } from '../components/EarlyAccessSection';

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
      <BusinessValueSection />
      <EarlyAccessSection />
    </main>
  );
};
