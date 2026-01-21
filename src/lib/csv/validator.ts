import { parseTransactionDate, inferYearsForDates } from "@/lib/date";
import { TRANSACTION_TYPES } from "@/lib/constants";
import { NewTransaction } from "@/types/transaction";

interface ParsedRow {
  row: Record<string, unknown>;
  index: number;
  parsedDate: ReturnType<typeof parseTransactionDate>;
}

/**
 * Parse price from various formats to cents
 */
const parsePriceToCents = (
  price: string | number | undefined,
  priceCents: string | number | undefined
): number | null => {
  if (typeof price === "string") {
    // Handle European format with comma as decimal separator
    const priceStr = price.replace(/[€$\s]/g, "").replace(",", ".");
    const cents = Math.round(parseFloat(priceStr) * 100);
    return isNaN(cents) ? null : cents;
  }

  if (typeof priceCents === "string") {
    const cents = parseInt(priceCents);
    return isNaN(cents) ? null : cents;
  }

  const cents = Math.round(Number(price || priceCents || 0));
  return isNaN(cents) ? null : cents;
};

/**
 * Validates and converts raw CSV data to NewTransaction[]
 */
export const validateAndConvertData = (
  data: Record<string, unknown>[]
): NewTransaction[] => {
  if (!data || data.length === 0) {
    throw new Error("CSV file is empty");
  }

  // First pass: parse all dates and collect valid rows
  const rowsWithParsedDates: ParsedRow[] = [];

  data.forEach((row, index) => {
    const item = row.item as string | undefined;
    const game = row.game as string | undefined;
    const date = row.date as string | undefined;
    const type = row.type as string | undefined;

    if (!item || !game || !date || !type) {
      console.warn(`Row ${index + 1} is missing required fields:`, row);
      return;
    }

    const parsedDate = parseTransactionDate(date);
    if (!parsedDate.date && !parsedDate.needsYearInference) {
      console.warn(`Row ${index + 1} has invalid date:`, date);
      return;
    }

    rowsWithParsedDates.push({ row, index, parsedDate });
  });

  // Second pass: infer years for dates without years
  const parsedDates = rowsWithParsedDates.map((r) => r.parsedDate);
  const inferredDates = inferYearsForDates(parsedDates);

  // Third pass: build validated transactions
  const validatedData: NewTransaction[] = [];

  rowsWithParsedDates.forEach(({ row, index }, arrayIndex) => {
    const item = row.item as string;
    const game = row.game as string;
    const type = row.type as string;
    const inferredDate = inferredDates[arrayIndex];

    const priceCents = parsePriceToCents(
      row.price as string | number | undefined,
      row.price_cents as string | number | undefined
    );

    if (priceCents === null) {
      console.warn(`Row ${index + 1} has invalid price:`, row.price || row.price_cents);
      return;
    }

    const normalizedType = type.toLowerCase();
    if (
      normalizedType !== TRANSACTION_TYPES.PURCHASE &&
      normalizedType !== TRANSACTION_TYPES.SALE
    ) {
      console.warn(`Row ${index + 1} has invalid type:`, type);
      return;
    }

    validatedData.push({
      item: String(item).trim(),
      game: String(game).trim(),
      date: inferredDate.toISOString(),
      price_cents: priceCents,
      type: normalizedType,
    });
  });

  return validatedData;
};
