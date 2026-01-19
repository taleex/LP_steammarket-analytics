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
- **Filtering** – Filter transactions by type, game, date range, and search terms
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
│   ├── csv-import/              # CSV upload functionality
│   │   ├── CSVUpload.tsx        # Main upload component with drag-drop
│   │   ├── UploadConfirmationDialog.tsx
│   │   └── index.ts             # Barrel export
│   │
│   ├── layout/                  # Layout components
│   │   ├── PageHeader.tsx       # App header with title and stats
│   │   ├── LoadingSkeleton.tsx  # Loading state placeholder
│   │   └── index.ts
│   │
│   ├── transactions/            # Transaction display components
│   │   ├── table/               # Table sub-components
│   │   │   ├── TransactionTable.tsx      # Main table container
│   │   │   ├── TransactionTableHeader.tsx
│   │   │   ├── TransactionRow.tsx        # Individual row component
│   │   │   └── index.ts
│   │   │
│   │   ├── EmptyState.tsx       # No data placeholder
│   │   ├── SummaryCards.tsx     # Gains/Spent/Net summary
│   │   ├── TransactionFilters.tsx
│   │   └── index.ts
│   │
│   └── ui/                      # shadcn/ui components (auto-generated)
│
├── hooks/
│   ├── transactions/
│   │   ├── use-transactions.ts  # Transaction CRUD operations
│   │   ├── use-table-selection.ts # Multi-select with shift-click
│   │   └── index.ts
│   │
│   ├── use-debounce.ts          # Debounce utility hook
│   ├── use-mobile.tsx           # Mobile detection hook
│   ├── use-toast.ts             # Toast notifications
│   └── index.ts                 # Central hook exports
│
├── lib/
│   ├── date.ts                  # Date parsing utilities (PT/EN formats)
│   ├── format.ts                # Price formatting utilities
│   └── utils.ts                 # General utilities (cn, etc.)
│
├── types/
│   └── transaction.ts           # TypeScript interfaces
│
├── pages/
│   ├── Index.tsx                # Main application page
│   └── NotFound.tsx             # 404 page
│
├── App.tsx                      # Router configuration
├── main.tsx                     # Application entry point
└── index.css                    # Global styles and Tailwind config
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

1. Click the upload area or drag-and-drop a CSV file
2. The CSV should contain columns for: item name, game, date, price, and transaction type
3. Confirm the import in the dialog
4. Transactions are automatically saved to localStorage

### Filtering Data

- Use the search bar to filter by item name
- Select a specific game from the dropdown
- Choose transaction type (sale/purchase)
- Set date range filters

### Selecting Transactions

- Click any row to select/deselect it
- Hold **Shift** and click to select a range of rows
- Use "Select All" / "Deselect All" buttons for bulk operations
- Summary cards update in real-time based on selection

---

## Architecture

### Component Organization

Components are organized by **feature**, not by type:

- `csv-import/` – Everything related to CSV uploading
- `transactions/` – Everything related to displaying transactions
- `layout/` – Shared layout components

Each feature folder contains an `index.ts` barrel file for clean imports:

```typescript
// Clean import
import { CSVUpload } from "@/components/csv-import";

// Instead of
import { CSVUpload } from "@/components/csv-import/CSVUpload";
```

### Custom Hooks

Business logic is extracted into custom hooks:

- **`useTransactions`** – Manages transaction state, localStorage sync, and CRUD operations
- **`useTableSelection`** – Handles multi-select logic with shift-click support

### Type Safety

All transaction data flows through typed interfaces in `src/types/transaction.ts`:

```typescript
interface Transaction {
  id: string;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: 'sale' | 'purchase';
  created_at: string;
  updated_at: string;
}
```

### Utility Functions

Shared utilities are centralized in `src/lib/`:

- **`format.ts`** – Price formatting with currency symbols
- **`date.ts`** – Multi-format date parsing (supports PT and EN formats)
- **`utils.ts`** – Tailwind class merging and general utilities

---

## License

MIT
