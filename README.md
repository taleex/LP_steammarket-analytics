# 🎮 Steam Market Transaction Tracker

A powerful React-based web application for importing, analyzing, and visualizing your Steam Market transaction history. Upload your trading data via CSV and gain actionable insights into your market activity.

[![Author](https://img.shields.io/badge/Author-Taleex-blue)](https://taleex.netlify.app/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **CSV Import** | Drag-and-drop or click to upload Steam Market transaction history |
| 📊 **Transaction Table** | View all transactions with multi-select and shift-click range selection |
| 🔍 **Advanced Filtering** | Filter by game, type, date range, price range, and search terms |
| 💰 **Real-time Analytics** | Instant calculation of gains, spending, and net profit |
| 💾 **Local Persistence** | Data automatically saved to browser storage |
| 📱 **Responsive Design** | Optimized for desktop and mobile devices |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **CSV Parsing** | PapaParse |
| **Date Handling** | date-fns |
| **State** | React Hooks + localStorage |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── csv-import/                     # CSV upload functionality
│   │   ├── CSVUpload.tsx               # Main upload component with drag-drop
│   │   ├── UploadConfirmationDialog.tsx # Preview dialog before import
│   │   └── index.ts                    # Barrel export
│   │
│   ├── layout/                         # Layout components
│   │   ├── PageHeader.tsx              # App header with title and stats
│   │   ├── Footer.tsx                  # Footer with copyright
│   │   ├── LoadingSkeleton.tsx         # Loading state placeholder
│   │   └── index.ts
│   │
│   ├── transactions/                   # Transaction display components
│   │   ├── table/                      # Table sub-components
│   │   │   ├── TransactionTable.tsx    # Main table container
│   │   │   ├── TransactionTableHeader.tsx # Column headers
│   │   │   ├── TransactionRow.tsx      # Individual row (memoized)
│   │   │   └── index.ts
│   │   │
│   │   ├── EmptyState.tsx              # No data placeholder
│   │   ├── SummaryCards.tsx            # Gains/Spent/Net summary cards
│   │   ├── TransactionFilters.tsx      # Filter controls panel
│   │   └── index.ts
│   │
│   └── ui/                             # Reusable UI components
│
├── hooks/
│   ├── transactions/
│   │   ├── use-transactions.ts         # Transaction CRUD operations
│   │   ├── use-table-selection.ts      # Multi-select with shift-click
│   │   ├── use-transaction-filters.ts  # Filter state and logic
│   │   ├── use-transaction-totals.ts   # Calculate selected totals
│   │   └── index.ts
│   │
│   ├── use-debounce.ts                 # Debounce utility hook
│   ├── use-mobile.tsx                  # Mobile detection hook
│   └── index.ts
│
├── lib/
│   ├── csv/                            # CSV processing utilities
│   │   ├── parser.ts                   # CSV parsing with PapaParse
│   │   ├── validator.ts                # Data validation and conversion
│   │   └── index.ts
│   │
│   ├── constants.ts                    # Application constants
│   ├── date.ts                         # Date parsing (PT/EN formats)
│   ├── format.ts                       # Price formatting utilities
│   ├── storage.ts                      # localStorage utilities
│   └── utils.ts                        # General utilities
│
├── types/
│   ├── transaction.ts                  # Transaction interfaces
│   ├── filters.ts                      # Filter state interface
│   └── index.ts
│
├── pages/
│   ├── Index.tsx                       # Main application page
│   └── NotFound.tsx                    # 404 page
│
├── App.tsx                             # Router configuration
├── main.tsx                            # Application entry point
└── index.css                           # Global styles and design tokens
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or bun

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

## 📖 Usage Guide

### Importing Transactions

1. Click the upload area or drag-and-drop a CSV file
2. Required CSV columns:
   - `Item Name` - Name of the traded item
   - `Game Name` - Associated game
   - `Acted On` - Transaction date
   - `Price in Cents` - Price value in cents
   - `Type` - Either "sale" or "purchase"
3. Review the preview and confirm import
4. Data is automatically saved to your browser

### Filtering Data

- **Search**: Filter by item name using the search bar
- **Game Filter**: Select a specific game from the dropdown
- **Type Filter**: Choose between sales and purchases
- **Date Range**: Pick start and end dates with calendar pickers
- **Price Range**: Adjust the slider to filter by price

### Selecting Transactions

- **Single Select**: Click any row to toggle selection
- **Range Select**: Hold `Shift` and click to select a range
- **Bulk Operations**: Use "Select All" / "Deselect All" buttons
- **Live Summary**: Cards update in real-time based on selection

---

## 🏗️ Architecture

### Component Organization

Components are organized by **feature domain**, not by type:

```typescript
// Clean imports via barrel exports
import { CSVUpload } from "@/components/csv-import";
import { TransactionTable, TransactionFilters } from "@/components/transactions";
import { PageHeader, Footer } from "@/components/layout";
```

### Custom Hooks

| Hook | Responsibility |
|------|----------------|
| `useTransactions` | CRUD operations, localStorage sync |
| `useTableSelection` | Multi-select with shift-click support |
| `useTransactionFilters` | Filter state management and filtering logic |
| `useTransactionTotals` | Calculate gains/spent/net (O(1) Map lookups) |

### Data Flow

```
CSV Upload → Parse → Validate → Confirm → Store (localStorage)
                                              ↓
App Load ← Hydrate ← Load from localStorage ←┘
    ↓
Filters Applied → Filtered List → Table Display
    ↓
Selection → Totals Calculation → Summary Cards
```

### Type System

```typescript
type TransactionType = "sale" | "purchase";

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

---

## 🎨 Design System

The app uses a semantic token-based design system:

- **Colors**: HSL CSS variables (`--primary`, `--profit`, `--loss`)
- **Gradients**: Pre-defined gradient tokens for hero sections
- **Animations**: Custom keyframes for fade, slide, and glow effects
- **Dark Mode**: Full support with automatic theming

All components use Tailwind classes referencing design tokens for consistent theming.

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.ts` | Tailwind CSS customization |
| `tsconfig.json` | TypeScript configuration |
| `components.json` | shadcn/ui component settings |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Taleex**

- Portfolio: [https://taleex.netlify.app/](https://taleex.netlify.app/)

---

<p align="center">
  © 2025 Taleex. All rights reserved.
</p>
