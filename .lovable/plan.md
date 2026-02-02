

# Fix Calendar UI Layout

## Problem Analysis

The calendar header layout is broken because of how react-day-picker v8 structures its HTML. The navigation buttons (`<` and `>`) are wrapped together inside a single `.rdp-nav` container, while the month/year dropdowns are in a separate `.rdp-caption_dropdowns` container.

**Current HTML structure:**
```text
.rdp-caption
├── .rdp-nav
│   ├── nav_button_previous (<)
│   └── nav_button_next (>)
└── .rdp-caption_dropdowns
    ├── dropdown_month
    └── dropdown_year
```

The Tailwind `order-first` and `order-last` classes on individual nav buttons don't work because they only affect ordering within the `.rdp-nav` container, not relative to the dropdowns container.

**Expected layout:** `[<] [Month ▼] [Year ▼] [>]`

---

## Solution

Override the calendar layout using CSS flexbox with proper ordering on the **container level**, not the button level. The fix requires:

1. **Remove conflicting styles** from both `calendar-styles.css` and `index.css` (duplicate/conflicting CSS rules)
2. **Apply correct CSS structure** using flexbox ordering on the containers
3. **Split navigation buttons visually** using CSS to position them on opposite ends

---

## Technical Implementation

### Step 1: Update `src/components/ui/calendar-styles.css`

Completely rewrite the CSS to properly handle the layout:

```css
/* Hide the visually hidden elements */
.rdp-vhidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  border: 0 !important;
}

/* Caption container: use flexbox with space-between */
.rdp-caption {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 !important;
  height: 40px !important;
  position: relative !important;
}

/* Navigation container: absolute position, split to both ends */
.rdp-nav {
  display: contents !important;  /* Remove nav wrapper from layout */
}

/* Previous button: position on the left */
.rdp-nav_button_previous {
  order: 1 !important;
}

/* Dropdowns container: centered in the middle */
.rdp-caption_dropdowns {
  order: 2 !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  margin: 0 auto !important;
}

/* Next button: position on the right */
.rdp-nav_button_next {
  order: 3 !important;
}

/* Dropdown selects styling */
.rdp-caption_dropdowns select { ... }
```

The key insight is using `display: contents` on the `.rdp-nav` container. This makes the nav wrapper "disappear" from the layout while keeping its children, allowing us to use flexbox ordering on the buttons directly relative to the dropdowns container.

### Step 2: Update `src/index.css`

Remove all the duplicate rdp styles from `index.css` (lines 122-266) to prevent conflicts. All calendar-specific styles will be in `calendar-styles.css` only.

### Step 3: Update `src/components/ui/calendar.tsx`

Simplify the classNames - remove the `order-first` and `order-last` from Tailwind classes since CSS will handle this:

```tsx
classNames={{
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  month: "space-y-4",
  caption: "rdp-caption",  // Let CSS handle layout
  caption_label: "hidden",
  caption_dropdowns: "",   // Let CSS handle layout
  dropdown_month: "",
  dropdown_year: "",
  dropdown: "",
  vhidden: "sr-only",
  nav: "",                 // Let CSS handle layout
  nav_button: cn(buttonVariants({ variant: "ghost" }), "h-7 w-7 p-0"),
  nav_button_previous: "", // CSS handles order
  nav_button_next: "",     // CSS handles order
  // ... rest unchanged
}}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/calendar-styles.css` | Complete rewrite with proper flexbox layout using `display: contents` |
| `src/index.css` | Remove duplicate rdp styles (lines 122-266) |
| `src/components/ui/calendar.tsx` | Simplify classNames, let CSS control layout |

---

## Expected Result

```text
┌─────────────────────────────────┐
│ [<]  [Month ▼]  [Year ▼]  [>]  │
├─────────────────────────────────┤
│  Su  Mo  Tu  We  Th  Fr  Sa    │
│  ...calendar days...            │
└─────────────────────────────────┘
```

- Previous button on far left
- Month and Year dropdowns centered
- Next button on far right
- Functionality remains unchanged (dropdowns update the calendar grid)

