import { InvoiceExtractionProvider, ExtractorMetadata } from './types';
import { SanitizedExtractedInvoice } from '../schema';
import { GeminiInvoiceExtractionProvider } from './geminiProvider';

/**
 * Primary AI Invoice Extraction Provider Adapter.
 *
 * Active Model: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
 * Credentials: GEMINI_API_KEY (stored server-side in environment secrets)
 * Fallback: HeuristicOcrProvider (deterministic rule-based extractor)
 */
export class AiInvoiceExtractionProvider implements InvoiceExtractionProvider {
  readonly providerId = 'gemini-2.5-flash';
  readonly displayName = 'Google Gemini 2.5 Flash Vision';
  private delegate: GeminiInvoiceExtractionProvider;

  constructor(apiKey?: string | null) {
    this.delegate = new GeminiInvoiceExtractionProvider(apiKey);
  }

  getMetadata(): ExtractorMetadata {
    return this.delegate.getMetadata();
  }

  isConfigured(): boolean {
    return this.delegate.isConfigured();
  }

  async extract(fileBuffer: Uint8Array, mimeType: string, filename: string): Promise<SanitizedExtractedInvoice> {
    return this.delegate.extract(fileBuffer, mimeType, filename);
  }
}

export { GeminiInvoiceExtractionProvider };
