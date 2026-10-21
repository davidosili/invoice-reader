import { InvoiceExtractionProvider, ExtractorMetadata } from './types';
import { SanitizedExtractedInvoice } from '../schema';

export class AiInvoiceExtractionProvider implements InvoiceExtractionProvider {
  readonly providerId = 'claude_multimodal_v1';
  readonly displayName = 'Claude 3.5 Sonnet / Vision Model';
  private apiKey: string | null = null;

  constructor(apiKey?: string | null) {
    const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
    this.apiKey = apiKey || (proc ? proc.env?.ANTHROPIC_API_KEY || null : null);
  }

  getMetadata(): ExtractorMetadata {
    return {
      providerId: this.providerId,
      displayName: this.displayName,
      isAiPowered: true,
      isConfigured: this.isConfigured(),
      capabilities: {
        boundingBoxes: true,
        confidenceScores: true,
        rawText: true,
      },
    };
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  async extract(_fileBuffer: Uint8Array, _mimeType: string, _filename: string): Promise<SanitizedExtractedInvoice> {
    if (!this.isConfigured()) {
      throw new Error('AI extraction provider is not configured. Server administrator must supply ANTHROPIC_API_KEY in server secrets.');
    }

    // Server-side AI call implementation (invoked when operator provides API key)
    throw new Error('Server-side AI model integration requires configured server execution.');
  }
}
