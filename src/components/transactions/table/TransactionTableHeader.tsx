import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X, CheckSquare, Square } from "lucide-react";

interface TransactionTableHeaderProps {
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  isShiftHeld: boolean;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

/**
 * Header section for the transaction table with selection controls
 */
export const TransactionTableHeader = memo(function TransactionTableHeader({
  isAllSelected,
  isPartiallySelected,
  isShiftHeld,
  selectedCount,
  onSelectAll,
  onClearSelection,
}: TransactionTableHeaderProps) {
  return (
    <div className="p-6 border-b border-border/50 bg-muted/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
          <p className="text-sm text-muted-foreground">
            {isShiftHeld ? (
              <span className="text-steam-blue">Hold Shift + Click to select range</span>
            ) : (
              "Click to select • Shift+Click for range"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll} className="text-xs">
            {isAllSelected ? (
              <>
                <Square className="h-3 w-3 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-3 w-3 mr-1" />
                Select All
              </>
            )}
          </Button>
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear ({selectedCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

interface TableColumnsHeaderProps {
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onSelectAll: () => void;
}

/**
 * Column headers for the transaction table
 */
export const TableColumnsHeader = memo(function TableColumnsHeader({
  isAllSelected,
  isPartiallySelected,
  onSelectAll,
}: TableColumnsHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-border/50 bg-muted/10">
        <th className="text-left p-4 font-semibold text-foreground w-12">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) {
                const input = el.querySelector("button");
                if (input) {
                  (input as HTMLButtonElement & { indeterminate?: boolean }).indeterminate =
                    isPartiallySelected;
                }
              }
            }}
            className={isPartiallySelected ? "data-[state=checked]:bg-primary/50" : ""}
            onCheckedChange={onSelectAll}
          />
        </th>
        <th className="text-left p-4 font-semibold text-foreground">Item</th>
        <th className="text-left p-4 font-semibold text-foreground">Game</th>
        <th className="text-left p-4 font-semibold text-foreground">Date</th>
        <th className="text-left p-4 font-semibold text-foreground">Type</th>
        <th className="text-left p-4 font-semibold text-foreground">Price</th>
      </tr>
    </thead>
  );
});
