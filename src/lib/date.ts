interface ParsedDate {
  date: Date | null;
  hasTime: boolean;
}

// Portuguese month names for parsing
const PT_MONTHS: { [key: string]: number } = {
  'jan': 0, 'janeiro': 0,
  'fev': 1, 'fevereiro': 1,
  'mar': 2, 'março': 2,
  'abr': 3, 'abril': 3,
  'mai': 4, 'maio': 4,
  'jun': 5, 'junho': 5,
  'jul': 6, 'julho': 6,
  'ago': 7, 'agosto': 7,
  'set': 8, 'setembro': 8,
  'out': 9, 'outubro': 9,
  'nov': 10, 'novembro': 10,
  'dez': 11, 'dezembro': 11
};

// English month names for parsing
const EN_MONTHS: { [key: string]: number } = {
  'jan': 0, 'january': 0,
  'feb': 1, 'february': 1,
  'mar': 2, 'march': 2,
  'apr': 3, 'april': 3,
  'may': 4,
  'jun': 5, 'june': 5,
  'jul': 6, 'july': 6,
  'aug': 7, 'august': 7,
  'sep': 8, 'september': 8,
  'oct': 9, 'october': 9,
  'nov': 10, 'november': 10,
  'dec': 11, 'december': 11
};

export function parseTransactionDate(dateString: string): ParsedDate {
  if (!dateString || typeof dateString !== 'string') {
    return { date: null, hasTime: false };
  }

  const cleaned = dateString.trim();
  
  // Check if it's already a valid ISO date
  if (cleaned.includes('T') || cleaned.includes('Z')) {
    const date = new Date(cleaned);
    return { 
      date: isNaN(date.getTime()) ? null : date, 
      hasTime: true 
    };
  }

  // Check for numeric formats: DD/MM/YYYY, DD/MM/YY, MM/DD/YYYY, etc.
  if (cleaned.includes('/')) {
    return parseNumericDate(cleaned);
  }

  // Check for month name formats: "20 Aug", "Aug 20", "20 August 2024", etc.
  if (/[a-zA-Z]/.test(cleaned)) {
    return parseNamedMonthDate(cleaned);
  }

  // Try parsing as-is as fallback
  const date = new Date(cleaned);
  return { 
    date: isNaN(date.getTime()) ? null : date, 
    hasTime: cleaned.includes(':') 
  };
}

function parseNumericDate(dateString: string): ParsedDate {
  // Split by common separators
  const parts = dateString.split(/[\/\s,]+/);
  
  if (parts.length < 3) {
    return { date: null, hasTime: false };
  }

  let day = parseInt(parts[0]);
  let month = parseInt(parts[1]) - 1; // Month is 0-indexed
  let year = parseInt(parts[2]);
  let hasTime = false;

  // Handle 2-digit years - assume Steam Market dates are from 2000 onwards
  if (year < 100) {
    if (year <= 50) {
      year += 2000;
    } else {
      year += 1900;
    }
  }

  // Try DD/MM/YYYY format first
  let date = new Date(year, month, day);
  
  // If the date components don't match, try MM/DD/YYYY
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    date = new Date(year, day - 1, month + 1); // Swap day and month
  }

  // Handle time if present
  if (parts.length >= 4 && parts[3].includes(':')) {
    const timeParts = parts[3].split(':');
    if (timeParts.length >= 2) {
      date.setHours(parseInt(timeParts[0]) || 0);
      date.setMinutes(parseInt(timeParts[1]) || 0);
      if (timeParts.length >= 3) {
        date.setSeconds(parseInt(timeParts[2]) || 0);
      }
      hasTime = true;
    }
  }

  return { 
    date: isNaN(date.getTime()) ? null : date, 
    hasTime 
  };
}

function parseNamedMonthDate(dateString: string): ParsedDate {
  // Handle formats like "20 Aug", "Aug 20", "20 August 2024", etc.
  const cleaned = dateString.toLowerCase().replace(/[,]/g, '');
  const parts = cleaned.split(/\s+/);
  
  if (parts.length < 2) {
    return { date: null, hasTime: false };
  }

  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;
  let hasTime = false;

  // Look for month name in parts
  for (const part of parts) {
    const monthNum = PT_MONTHS[part] ?? EN_MONTHS[part];
    if (monthNum !== undefined) {
      month = monthNum;
      break;
    }
  }

  if (month === null) {
    return { date: null, hasTime: false };
  }

  // Extract day and year from remaining parts
  for (const part of parts) {
    const num = parseInt(part);
    if (!isNaN(num)) {
      if (num >= 1 && num <= 31 && day === null) {
        day = num;
      } else if (num >= 1900 || (num >= 0 && num <= 99)) {
        year = num;
      }
    }
  }

  // If no year provided, assume current year, but adjust if date would be in future
  if (year === null) {
    const currentYear = new Date().getFullYear();
    const testDate = new Date(currentYear, month, day || 1);
    const now = new Date();
    
    // If date would be more than 1 day in the future, use previous year
    if (testDate.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
      year = currentYear - 1;
    } else {
      year = currentYear;
    }
  } else if (year < 100) {
    // Handle 2-digit years
    if (year <= 30) {
      year += 2000;
    } else {
      year += 1900;
    }
  }

  if (day === null) {
    day = 1; // Default to first day of month if not specified
  }

  const date = new Date(year, month, day);
  
  return { 
    date: isNaN(date.getTime()) ? null : date, 
    hasTime 
  };
}

export function formatForPT(date: Date, hasTime: boolean): string {
  if (!date || isNaN(date.getTime())) {
    return 'Data inválida';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}