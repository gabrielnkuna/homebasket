import { Platform } from 'react-native';

import { normalizeReceiptAnalysis } from '@/features/home-basket/application/normalize-receipt-analysis';
import { ReceiptAnalysis } from '@/features/home-basket/domain/models';
import { getFirebaseApp } from '@/features/home-basket/infrastructure/firebase/firebase-config';

type ReceiptAnalyzerInput = {
  base64: string;
  mimeType: string;
};

export const canAnalyzeReceipts = Platform.OS === 'web';

const receiptAnalysisPrompt = `
You are reading a household shopping receipt.
Receipts may come from any country, retailer, currency, and tax system.

Return JSON only.
Extract:
- merchantName: the store name if visible
- totalSpend: the final amount paid as a decimal number if you can normalize it confidently
- totalSpendText: the printed final amount text if visible
- totalCandidates: up to 5 likely grand-total amount strings or lines, ordered best first
- items: a concise list of purchased line items

Rules:
- Prefer grand total, total due, amount due, sale total, amount paid, or paid.
- Ignore subtotal, VAT, GST, HST, sales tax, discounts, loyalty messages, payment lines, balance lines, and change lines.
- Receipts can use comma decimals, period decimals, spaces, or apostrophes as separators.
- If you can normalize the final amount confidently, return totalSpend as a plain decimal number like 1234.56 with no currency symbol.
- If you cannot normalize it confidently, omit totalSpend and still return totalSpendText and totalCandidates when visible.
- For quantity, use a short human-readable string like "1", "2", "500 g", or "6".
- For category, prefer one of: Produce, Pantry, Dairy, Meat, Cleaning, Toiletries, Other.
- If a better globally useful category is obvious and helpful, you may use it, for example Gardening, Beverages, Frozen, Pets, Baby, Pharmacy, or Hardware.
- Keep item names short and human-readable. Remove payment-only lines, tax-only lines, and line-item prices from the item name.
- If the receipt is unclear, omit uncertain items instead of inventing them.
`;

export async function analyzeReceiptImage(input: ReceiptAnalyzerInput): Promise<ReceiptAnalysis> {
  if (!canAnalyzeReceipts) {
    throw new Error(
      'Automatic receipt reading is currently available on web. On Android and iPhone, you can still upload the receipt image and enter the total manually.'
    );
  }

  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    throw new Error('Receipt analysis needs Firebase to be configured for this app.');
  }

  try {
    const { getAI, getGenerativeModel, GoogleAIBackend, Schema } = await import('firebase/ai');
    const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
    const receiptAnalysisSchema = Schema.object({
      properties: {
        merchantName: Schema.string(),
        totalSpend: Schema.number(),
        totalSpendText: Schema.string(),
        totalCandidates: Schema.array({
          items: Schema.string(),
        }),
        items: Schema.array({
          items: Schema.object({
            properties: {
              name: Schema.string(),
              quantity: Schema.string(),
              category: Schema.string(),
            },
            optionalProperties: ['quantity', 'category'],
          }),
        }),
      },
      optionalProperties: ['merchantName', 'totalSpend', 'totalSpendText', 'totalCandidates', 'items'],
    });
    const model = getGenerativeModel(ai, {
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: receiptAnalysisSchema,
        temperature: 0.1,
      },
    });
    const result = await model.generateContent([
      receiptAnalysisPrompt,
      {
        inlineData: {
          data: input.base64,
          mimeType: input.mimeType,
        },
      },
    ]);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('No structured receipt data was returned.');
    }

    return normalizeReceiptAnalysis(JSON.parse(responseText) as Record<string, unknown>);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Home Basket could not analyze that receipt yet.';

    if (message.includes('Firebase AI SDK requires the Firebase AI API')) {
      throw new Error(
        'Enable Firebase AI Logic in the Firebase Console for this project, then try reading the receipt again.'
      );
    }

    throw new Error(message);
  }
}
