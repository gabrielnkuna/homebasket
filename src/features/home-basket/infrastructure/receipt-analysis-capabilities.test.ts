import { describe, expect, it } from 'vitest';

import {
  getAdvancedReceiptTranscriptionMessage,
  getReceiptAnalysisCapabilities,
} from '@/features/home-basket/infrastructure/receipt-analysis-capabilities';

describe('receipt analysis capabilities', () => {
  it('describes the reserved flagship transcription path', () => {
    const capabilities = getReceiptAnalysisCapabilities({
      standardReadAvailable: true,
    });

    expect(capabilities).toEqual([
      {
        id: 'standard-read',
        label: 'Standard receipt read',
        status: 'available',
        description:
          'Reads merchant names, likely totals, and clear line items from a receipt on web.',
      },
      {
        id: 'advanced-transcription',
        label: 'Advanced transcription',
        status: 'reserved',
        description:
          'Reserved for future flagship API AI models to handle difficult slips, weak photos, denser line items, and more reliable total extraction.',
      },
    ]);
  });

  it('keeps a short reserved-mode explanation for fallback messaging', () => {
    expect(getAdvancedReceiptTranscriptionMessage()).toBe(
      'Advanced receipt transcription for difficult slips is reserved for a future flagship AI integration.'
    );
  });
});
