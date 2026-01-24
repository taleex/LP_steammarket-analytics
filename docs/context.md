# Steam Market Analytics App - Context and Architecture Review

## Overview

This is a React-based web application called "Steam Market Transaction Tracker" that allows users to import, view, and analyze their Steam Market transaction history from CSV files. The app provides filtering, multi-selection, and real-time summary calculations of trading activity.

## Core Functionality

### Primary Features
- **CSV Import**: Upload Steam Market transaction history from CSV files with validation and confirmation
- **Transaction Display**: Table view of all transactions with multi-select capabilities (including shift-click range selection)
- **Advanced Filtering**: Filter by item name search, game, transaction type, date range, and price range
- **Summary Analytics**: Real-time calculation of gains, spending, and net profit for selected transactions
- **Local Persistence**: Data stored in browser localStorage for session persistence
- **Responsive Design**: Works on desktop and mobile devices

### Data Model
- **Transaction Type**: `sale` | `purchase`
- **Transaction Fields**:
  - `id`: Unique identifier (UUID)
  - `item`: Item name (string)
  - `game`: Game name (string)
  - `date`: Transaction date (ISO string)
  - `price_cents`: Price in cents (number)
  - `type`: Transaction type (string)
  - `created_at`/`updated_at`: Timestamps (ISO strings)

## Technical Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **CSV Processing**: PapaParse for parsing, custom validation logic
- **Date Handling**: date-fns for date manipulation and formatting
- **State Management**: React hooks with localStorage persistence
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts (available but not currently used in main features)

### Project Structure
```
src/
├── components/           # Feature-organized components
│   ├── csv-import/       # CSV upload and validation UI
│   ├── transactions/     # Transaction table, filters, summaries
│   ├── layout/          # Header, footer, loading states
│   └── ui/              # shadcn/ui component library
├── hooks/               # Custom business logic hooks
│   ├── transactions/    # Transaction CRUD, filtering, selection
│   └── shared/          # Debounce, mobile detection, toast
├── lib/                 # Utility functions and business logic
│   ├── csv/             # CSV parsing and validation
│   ├── date.ts          # Date parsing (supports PT/EN formats)
│   ├── format.ts        # Price formatting with currency
│   ├── storage.ts       # localStorage wrapper
│   └── constants.ts     # App-wide configuration
├── types/               # TypeScript interfaces
└── pages/               # Route components
```

### Component Organization
- **Feature-based**: Components grouped by business domain (csv-import, transactions) rather than type
- **Barrel exports**: Each feature has an index.ts for clean imports
- **Separation of concerns**: UI components separated from business logic hooks

### Key Custom Hooks
- `useTransactions`: CRUD operations with localStorage sync
- `useTableSelection`: Multi-select with shift-click range selection
- `useTransactionFilters`: Filter state management and logic
- `useTransactionTotals`: Calculate gains/spent/net for selections

### CSV Processing Pipeline
1. **File Upload**: Accepts .csv files with type validation
2. **Parsing**: PapaParse with header normalization using CSV_HEADER_MAP
3. **Validation**: Multi-pass validation including:
   - Required field checks
   - Price parsing (supports European decimal format)
   - Date parsing with year inference
   - Type validation (sale/purchase)
4. **Confirmation**: Preview dialog before insertion
5. **Storage**: Persisted to localStorage with timestamps

### Data Flow
1. CSV uploaded → parsed → validated → confirmed → inserted
2. Transactions loaded from localStorage on app start
3. Filters applied client-side with real-time updates
4. Selections trigger summary calculations
5. All changes persisted to localStorage

## Design System

### Styling Approach
- **Tailwind CSS**: Utility-first with custom design tokens
- **Semantic tokens**: CSS variables for colors, gradients, animations
- **Gradient backgrounds**: Used for cards and hero sections
- **Animations**: Custom keyframes for fade, slide, and glow effects
- **Responsive**: Mobile-first approach with breakpoint utilities

### Key Design Elements
- Gradient hero background
- Card-based layout with backdrop blur
- Steam-themed color scheme (blues, accent colors)
- Consistent spacing and typography
- Accessible form controls and navigation

## Business Logic Details

### Price Handling
- Stored internally as cents (number) to avoid floating-point issues
- Display formatted as euros with proper decimal places
- Supports European number format input (comma as decimal separator)

### Date Handling
- Parsed from multiple formats (Steam exports may vary)
- Year inference for dates without years (based on reasonable bounds)
- Display formatted as dd/MM/yy
- Calendar pickers for filter ranges

### Filtering System
- **Real-time**: Updates as user types/selects
- **Multi-criteria**: Search term, game, type, date range, price range
- **Debounced**: Search input debounced to prevent excessive filtering
- **Stateful**: Filter state maintained across sessions

### Selection System
- **Multi-select**: Individual clicks and shift-click ranges
- **Bulk operations**: Select all/deselect all functionality
- **Real-time summaries**: Totals update based on current selection
- **Visual feedback**: Selected rows highlighted

## Current Limitations and Areas for Enhancement

### Data Management
- No server-side persistence (localStorage only)
- No export functionality for processed data
- No transaction editing/deletion (only bulk clear)

### Analytics
- Basic summary cards (gains/spent/net)
- No advanced analytics (charts, trends, statistics)
- No categorization or tagging of items

### User Experience
- No data backup/restore functionality
- No pagination for large datasets
- No sorting options in table

### Technical Debt
- Some components could be further broken down
- Test coverage not visible in codebase
- No error boundaries for production robustness

## Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn

### Commands
- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run preview`: Preview production build
- `npm run lint`: ESLint checking

### Build Configuration
- Vite with React SWC plugin
- TypeScript with strict mode
- ESLint with React rules
- PostCSS with Tailwind and Autoprefixer

## Conclusion

This is a well-structured React application with clear separation of concerns, comprehensive TypeScript typing, and a focus on user experience for Steam market traders. The codebase demonstrates good practices in component organization, custom hook usage, and utility function design. The app successfully handles the core use case of importing and analyzing Steam transaction data, though there are opportunities for expansion into more advanced analytics and data management features.