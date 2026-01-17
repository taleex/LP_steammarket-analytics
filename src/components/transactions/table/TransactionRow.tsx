import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { parseTransactionDate, formatForPT } from "@/lib/date";
import { Transaction } from "@/types/transaction";

interface TransactionRowProps {
  transaction: Transaction;
  index: number;
  isSelected: boolean;
  isShiftHeld: boolean;
  hasLastClickedIndex: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onRowClick: (index: number, id: string, e: React.MouseEvent) => void;
}

const formatDate = (dateString: string): string => {
  const parsed = parseTransactionDate(dateString);
  if (!parsed.date) {
    console.warn("Invalid date format:", dateString);
    return dateString;
  }
  return formatForPT(parsed.date, parsed.hasTime);
};

export const TransactionRow = ({
  transaction,
  index,
  isSelected,
  isShiftHeld,
  hasLastClickedIndex,
  onSelect,
  onRowClick,
}: TransactionRowProps) => {
  const isSale = transaction.type === "sale";

  return (
    <tr
      className={`
        border-b border-border/30 
        transition-all duration-150 ease-out
        cursor-pointer select-none
        ${
          isSelected
            ? "bg-primary/10 border-l-2 border-l-primary shadow-sm"
            : "hover:bg-muted/30 border-l-2 border-l-transparent"
        }
        ${isShiftHeld && hasLastClickedIndex ? "hover:bg-steam-blue/10" : ""}
      `}
      style={{ animationDelay: `${Math.min(index * 20, 500)}ms` }}
      onMouseDown={(e) => {
        if (e.shiftKey && e.button === 0) e.preventDefault();
      }}
      onClick={(e) => onRowClick(index, transaction.id, e)}
    >
      <td className="p-4 w-12" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(transaction.id, checked as boolean)}
          className="transition-transform duration-150 hover:scale-110"
        />
      </td>
      <td className="p-4 text-foreground font-medium max-w-xs">
        <div className="truncate" title={transaction.item}>
          {transaction.item}
        </div>
      </td>
      <td className="p-4 text-muted-foreground font-mono text-sm">{transaction.game}</td>
      <td className="p-4 text-muted-foreground font-mono text-sm">
        {formatDate(transaction.date)}
      </td>
      <td className="p-4">
        <Badge
          variant={isSale ? "default" : "secondary"}
          className={
            isSale
              ? "bg-profit/20 text-profit border-profit/30 hover:bg-profit/30"
              : "bg-loss/20 text-loss border-loss/30 hover:bg-loss/30"
          }
        >
          {isSale ? "Sale" : "Purchase"}
        </Badge>
      </td>
      <td className={`p-4 font-bold font-mono ${isSale ? "text-profit" : "text-loss"}`}>
        {formatPrice(transaction.price_cents)}
      </td>
    </tr>
  );
};
