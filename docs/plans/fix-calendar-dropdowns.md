# Plan: Fix Calendar Dropdown Selection Issue

## Overview
Fix the calendar component where clicking on month/year dropdown options doesn't properly update the visual selection in the dropdowns. The dropdowns should reflect the currently displayed month/year and update when navigation occurs.

## Current Issue
- Month and year dropdowns show correct initial values
- Clicking prev/next buttons updates the calendar correctly
- **PROBLEM**: Clicking on month/year dropdown options changes the calendar view but the dropdown visual selection doesn't update
- The `value` props are set correctly to `displayMonth.getMonth()` and `displayMonth.getFullYear()`
- The `onChange` handlers call `goToMonth()` but the dropdowns don't reflect the change

## Root Cause Analysis
The issue appears to be that while `goToMonth()` updates the calendar's internal state, the dropdown select elements are not re-rendering with the updated `displayMonth` value. This could be due to:

1. React re-rendering not triggering properly
2. State management issue in react-day-picker
3. Component lifecycle issue with custom Caption component

## Investigation Steps

### Phase 1: Debug Current Implementation
#### 1.1 Add Debug Logging
- [ ] **Add console.log** to track `displayMonth` changes in Caption component
- [ ] **Log onChange events** to verify handlers are called
- [ ] **Log goToMonth calls** to ensure they're executed

#### 1.2 Test Navigation Methods
- [ ] **Test prev/next buttons** - do they update dropdowns correctly?
- [ ] **Test direct month/year selection** - does calendar change but dropdowns don't?
- [ ] **Test date selection** - does it affect dropdown state?

### Phase 2: Component State Analysis
#### 2.1 React DevTools Inspection
- [ ] **Check component re-renders** when dropdowns are clicked
- [ ] **Verify displayMonth prop** updates in Caption component
- [ ] **Monitor select element values** during interactions

#### 2.2 State Flow Verification
- [ ] **Trace goToMonth function** - what does it update?
- [ ] **Check react-day-picker state** management
- [ ] **Verify prop drilling** from DayPicker to Caption

### Phase 3: Implementation Fixes
#### 3.1 Component Optimization
- [ ] **Add React.memo** to Caption component if needed
- [ ] **Use useCallback** for event handlers
- [ ] **Add key props** to force re-renders if necessary

#### 3.2 State Management Fix
- [ ] **Implement local state** for month/year if needed
- [ ] **Use useEffect** to sync local state with displayMonth
- [ ] **Force component updates** with state changes

#### 3.3 Alternative Implementation
- [ ] **Replace select elements** with proper UI components
- [ ] **Use controlled components** with explicit state
- [ ] **Implement custom dropdown** using shadcn/ui Select

### Phase 4: Testing & Verification
#### 4.1 Manual Testing
- [ ] **Test all navigation methods** (prev/next, dropdown, date selection)
- [ ] **Verify dropdown selections** update correctly
- [ ] **Test edge cases** (year boundaries, month transitions)

#### 4.2 Integration Testing
- [ ] **Test in TransactionFilters** component
- [ ] **Verify popover behavior** with calendar
- [ ] **Check mobile responsiveness**

## Potential Solutions

### Solution A: Force Re-render
```typescript
// Add state to force updates
const [forceUpdate, setForceUpdate] = useState(0);
const handleMonthChange = useCallback((e) => {
  const newMonth = new Date(displayMonth);
  newMonth.setMonth(Number(e.target.value));
  goToMonth(newMonth);
  setForceUpdate(prev => prev + 1);
}, [displayMonth, goToMonth]);
```

### Solution B: Local State Management
```typescript
// Manage month/year locally
const [currentMonth, setCurrentMonth] = useState(displayMonth.getMonth());
const [currentYear, setCurrentYear] = useState(displayMonth.getFullYear());

useEffect(() => {
  setCurrentMonth(displayMonth.getMonth());
  setCurrentYear(displayMonth.getFullYear());
}, [displayMonth]);
```

### Solution C: Replace with shadcn/ui Select
```typescript
// Use proper Select components instead of native select
<Select value={String(displayMonth.getMonth())} onValueChange={handleMonthChange}>
  <SelectTrigger>...</SelectTrigger>
  <SelectContent>...</SelectContent>
</Select>
```

## Implementation Plan

### Priority Order
1. **Debug current implementation** - understand why it's not working
2. **Try force re-render solution** - quickest fix if state is the issue
3. **Implement local state** - if prop updates aren't triggering re-renders
4. **Replace with UI components** - most robust long-term solution

### Timeline
- **Phase 1**: 15-30 minutes (Debug and analysis)
- **Phase 2**: 15-30 minutes (Component inspection)
- **Phase 3**: 30-60 minutes (Implementation and fixes)
- **Phase 4**: 15-30 minutes (Testing and verification)

## Success Criteria
- [ ] Month dropdown shows current displayed month
- [ ] Year dropdown shows current displayed year
- [ ] Clicking dropdown options updates both calendar and dropdowns
- [ ] Prev/next buttons work correctly
- [ ] Date selection doesn't break dropdown state
- [ ] All navigation methods are consistent

## Rollback Plan
- Keep original react-day-picker dropdown implementation as backup
- Commit changes in separate branch for easy rollback
- Document all changes for quick reversion if needed

---

## Implementation Summary ✅ **COMPLETED**
- **Solution Implemented**: Local state management with useEffect synchronization + UI improvements
- **Technical Details**:
  - Added `currentMonth` and `currentYear` state to Caption component
  - Used `useEffect` to sync local state with `displayMonth` prop changes
  - Implemented `useCallback` handlers for month and year changes
  - Added proper TypeScript types for event handlers
  - **Replaced ugly native select elements with shadcn/ui Select components**
  - **Custom styling to match app design**: transparent background, hover effects, proper sizing

## UI Improvements Made:
- ✅ **Replaced native HTML selects** with proper shadcn/ui Select components
- ✅ **Transparent background** that matches calendar design
- ✅ **Hover effects** with accent color background
- ✅ **Compact sizing** (h-8) to fit calendar header
- ✅ **Proper dropdown content** with consistent styling
- ✅ **Check icons** for selected items
- ✅ **Smooth animations** and proper z-index layering

## Next Steps
- [ ] **Test the fix** - verify dropdown selections and UI work correctly
- [ ] **Update plan status** - mark implementation as complete
- [ ] **Commit changes** - save the calendar UI improvements
