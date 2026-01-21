import Papa from "papaparse";
import { CSV_HEADER_MAP } from "@/lib/constants";

/**
 * Normalizes CSV headers to internal field names
 */
export const normalizeHeader = (header: string): string => {
  const normalized = header.toLowerCase().trim();
  return CSV_HEADER_MAP[normalized] || normalized;
};

/**
 * Parse a CSV file and return the data with normalized headers
 */
export const parseCSVFile = (
  file: File
): Promise<{ data: Record<string, unknown>[]; errors: Papa.ParseError[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      transformHeader: normalizeHeader,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data as Record<string, unknown>[],
          errors: results.errors,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
