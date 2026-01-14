import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing table row selection with shift-click range support
 */
export function useTableSelection<T extends { id: string }>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [isShiftHeld, setIsShiftHeld] = useState(false);

  // Track shift key state for visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftHeld(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(t => t.id)));
    }
  }, [selectedItems.size, items]);

  const handleClearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setLastClickedIndex(null);
  }, []);

  const handleRowClick = useCallback((index: number, id: string, e: React.MouseEvent) => {
    const isSelected = selectedItems.has(id);
    const shouldSelect = !isSelected;

    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      
      setSelectedItems(prev => {
        const newSelected = new Set(prev);
        for (let i = start; i <= end; i++) {
          const rangeId = items[i]?.id;
          if (rangeId !== undefined) {
            if (shouldSelect) newSelected.add(rangeId);
            else newSelected.delete(rangeId);
          }
        }
        return newSelected;
      });
    } else {
      handleSelectItem(id, shouldSelect);
    }

    setLastClickedIndex(index);

    // Clear any text selection caused by shift-click
    if (e.shiftKey) {
      try {
        window.getSelection()?.removeAllRanges();
      } catch {}
    }
  }, [selectedItems, lastClickedIndex, items, handleSelectItem]);

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;
  const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < items.length;

  return {
    selectedItems,
    lastClickedIndex,
    isShiftHeld,
    isAllSelected,
    isPartiallySelected,
    handleSelectItem,
    handleSelectAll,
    handleClearSelection,
    handleRowClick,
  };
}
