import { SanitizedExtractedInvoice } from '../schema';

export interface ExtractorMetadata {
  providerId: string;
  displayName: string;
  isAiPowered: boolean;
  isConfigured: boolean;
  capabilities: {
    boundingBoxes: boolean;
    confidenceScores: boolean;
    rawText: boolean;
  };
}

export interface InvoiceExtractionProvider {
  readonly providerId: string;
  readonly displayName: string;
  getMetadata(): ExtractorMetadata;
  isConfigured(): boolean;
  extract(fileBuffer: Uint8Array, mimeType: string, filename: string): Promise<SanitizedExtractedInvoice>;
}
