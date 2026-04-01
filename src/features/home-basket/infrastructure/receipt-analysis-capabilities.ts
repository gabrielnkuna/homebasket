export type ReceiptAnalysisCapabilityStatus = 'available' | 'manual' | 'reserved';

export type ReceiptAnalysisCapability = {
  id: 'standard-read' | 'advanced-transcription';
  label: string;
  status: ReceiptAnalysisCapabilityStatus;
  description: string;
};

export function getReceiptAnalysisCapabilities(options: {
  standardReadAvailable: boolean;
}): ReceiptAnalysisCapability[] {
  return [
    {
      id: 'standard-read',
      label: 'Standard receipt read',
      status: options.standardReadAvailable ? 'available' : 'manual',
      description: options.standardReadAvailable
        ? 'Reads merchant names, likely totals, and clear line items from a receipt on web.'
        : 'Receipt proof still uploads on this device, but totals and line items stay manual for now.',
    },
    {
      id: 'advanced-transcription',
      label: 'Advanced transcription',
      status: 'reserved',
      description:
        'Reserved for future flagship API AI models to handle difficult slips, weak photos, denser line items, and more reliable total extraction.',
    },
  ];
}

export function getAdvancedReceiptTranscriptionMessage() {
  return 'Advanced receipt transcription for difficult slips is reserved for a future flagship AI integration.';
}
