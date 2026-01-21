# Steam Market Transaction Tracker

A React-based web application for importing, viewing, and analyzing Steam Market transaction history. Upload your transaction data via CSV and gain insights into your trading activity with filtering, selection, and summary calculations.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Architecture](#architecture)

---

## Features

- **CSV Import** – Upload Steam Market transaction history from CSV files
- **Transaction Table** – View all transactions with sorting and multi-select capabilities
- **Filtering** – Filter transactions by type, game, date range, price range, and search terms
- **Summary Cards** – Real-time calculation of gains, spending, and net profit
- **Multi-Selection** – Select multiple rows with shift-click range selection
- **Local Persistence** – Data is saved to localStorage for session persistence
- **Responsive Design** – Works on desktop and mobile devices

---

## Tech Stack

| Category       | Technology                          |
|----------------|-------------------------------------|
| Framework      | React 18 + TypeScript               |
| Build Tool     | Vite                                |
| Styling        | Tailwind CSS                        |
| UI Components  | shadcn/ui (Radix UI primitives)     |
| CSV Parsing    | PapaParse                           |
| Date Handling  | date-fns                            |
| State          | React Hooks + localStorage          |

---

## Project Structure

```
src/
├── components/
│   ├── csv-import/                    # CSV upload functionality
│   │   ├── CSVUpload.tsx              # Main upload component
│   │   ├── UploadConfirmationDialog.tsx
│   │   └── index.ts                   # Barrel export
│   │
│   ├── layout/                        # Layout components
│   │   ├── PageHeader.tsx             # App header with title and stats
│   │   ├── Footer.tsx                 # Footer with copyright
│   │   ├── LoadingSkeleton.tsx        # Loading state placeholder
│   │   └── index.ts
│   │
│   ├── transactions/                  # Transaction display components
│   │   ├── table/                     # Table sub-components
│   │   │   ├── TransactionTable.tsx   # Main table container
│   │   │   ├── TransactionTableHeader.tsx
│   │   │   ├── TransactionRow.tsx     # Individual row (memoized)
│   │   │   └── index.ts
│   │   │
│   │   ├── EmptyState.tsx             # No data placeholder
│   │   ├── SummaryCards.tsx           # Gains/Spent/Net summary
│   │   ├── TransactionFilters.tsx     # Filter controls
│   │   └── index.ts
│   │
│   └── ui/                            # shadcn/ui components
│
├── hooks/
│   ├── transactions/
│   │   ├── use-transactions.ts        # Transaction CRUD operations
│   │   ├── use-table-selection.ts     # Multi-select with shift-click
│   │   ├── use-transaction-filters.ts # Filter state and logic
│   │   ├── use-transaction-totals.ts  # Calculate selected totals
│   │   └── index.ts
│   │
│   ├── use-debounce.ts                # Debounce utility hook
│   ├── use-mobile.tsx                 # Mobile detection hook
│   ├── use-toast.ts                   # Toast notifications
│   └── index.ts                       # Central hook exports
│
├── lib/
│   ├── csv/                           # CSV processing utilities
│   │   ├── parser.ts                  # CSV parsing with PapaParse
│   │   ├── validator.ts               # Data validation and conversion
│   │   └── index.ts
│   │
│   ├── constants.ts                   # Application constants
│   ├── date.ts                        # Date parsing (PT/EN formats)
│   ├── format.ts                      # Price formatting utilities
│   ├── storage.ts                     # localStorage utilities
│   ├── utils.ts                       # General utilities (cn, etc.)
│   └── index.ts                       # Central lib exports
│
├── types/
│   ├── transaction.ts                 # Transaction interfaces
│   ├── filters.ts                     # Filter state interface
│   └── index.ts                       # Central type exports
│
├── pages/
│   ├── Index.tsx                      # Main application page
│   └── NotFound.tsx                   # 404 page
│
├── App.tsx                            # Router configuration
├── main.tsx                           # Application entry point
└── index.css                          # Global styles and design tokens
```

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd steam-market-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## Usage

### Importing Transactions

1. Click the upload button or drag-and-drop a CSV file
2. The CSV should contain columns: Item Name, Game Name, Acted On, Price in Cents, Type
3. Review and confirm the import in the preview dialog
4. Transactions are automatically saved to localStorage

### Filtering Data

- Use the search bar to filter by item name
- Click "Filters" to access advanced options:
  - Select a specific game (searchable dropdown)
  - Choose transaction type (sale/purchase)
  - Set date range with calendar pickers
  - Adjust price range with slider

### Selecting Transactions

- Click any row to select/deselect it
- Hold **Shift** and click to select a range of rows
- Use "Select All" / "Deselect All" buttons for bulk operations
- Summary cards update in real-time based on selection

---

## Architecture

### Component Organization

Components are organized by **feature**, not by type:

- `csv-import/` – CSV uploading and validation
- `transactions/` – Transaction display, filtering, and selection
- `layout/` – Shared layout components (header, footer, loading states)

Each feature folder contains an `index.ts` barrel file for clean imports:

```typescript
// Clean imports via barrel exports
import { CSVUpload } from "@/components/csv-import";
import { TransactionTable, TransactionFilters } from "@/components/transactions";
```

### Custom Hooks

Business logic is extracted into focused, single-responsibility hooks:

| Hook                     | Purpose                                      |
|--------------------------|----------------------------------------------|
| `useTransactions`        | Transaction state, CRUD, localStorage sync   |
| `useTableSelection`      | Multi-select with shift-click support        |
| `useTransactionFilters`  | Filter state and filtering logic             |
| `useTransactionTotals`   | Calculate gains/spent/net for selection      |

### Utility Modules

Shared utilities are centralized in `src/lib/`:

| Module         | Purpose                                    |
|----------------|---------------------------------------------|
| `csv/`         | CSV parsing and data validation             |
| `constants.ts` | Application-wide constants                  |
| `date.ts`      | Multi-format date parsing (PT/EN formats)   |
| `format.ts`    | Price formatting with currency symbols      |
| `storage.ts`   | localStorage wrapper functions              |
| `utils.ts`     | Tailwind class merging (cn helper)          |

### Type Safety

All data flows through typed interfaces in `src/types/`:

```typescript
// Transaction types
interface Transaction {
  id: string;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: TransactionType;
  created_at: string;
  updated_at: string;
}

// Filter state type
interface FilterState {
  searchTerm: string;
  selectedGame: string;
  selectedType: string;
  minPrice: string;
  maxPrice: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}
```

### Design System

The app uses a semantic token-based design system defined in `src/index.css`:

- **Colors**: Defined as HSL CSS variables (`--primary`, `--profit`, `--loss`, etc.)
- **Gradients**: Pre-defined gradient tokens (`--gradient-primary`, `--gradient-hero`)
- **Animations**: Custom keyframes for fade, slide, and glow effects

All components use Tailwind classes that reference these tokens, ensuring consistent theming.

---

## License

MIT
