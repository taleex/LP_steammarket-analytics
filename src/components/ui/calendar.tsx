import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.month || new Date());

  const handleMonthChange = React.useCallback((date: Date) => {
    console.log('Month change requested:', date);
    setCurrentMonth(date);
  }, []);

  // Debug: Log current month changes
  React.useEffect(() => {
    console.log('Current month state:', currentMonth);
  }, [currentMonth]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      captionLayout="dropdown"
      fromYear={2012}
      toYear={new Date().getFullYear() + 1}
      month={currentMonth}
      onMonthChange={handleMonthChange}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth, ...props }) => {
          const { goToMonth, previousMonth, nextMonth } = props as any;
          const [localMonth, setLocalMonth] = React.useState(displayMonth.getMonth());
          const [localYear, setLocalYear] = React.useState(displayMonth.getFullYear());

          // Sync local state with displayMonth changes
          React.useEffect(() => {
            setLocalMonth(displayMonth.getMonth());
            setLocalYear(displayMonth.getFullYear());
          }, [displayMonth]);

          const handleMonthChange = React.useCallback((value: string) => {
            const newMonthValue = Number(value);
            setLocalMonth(newMonthValue);
            const newDate = new Date(displayMonth.getFullYear(), newMonthValue, 1);
            goToMonth?.(newDate);
          }, [displayMonth, goToMonth]);

          const handleYearChange = React.useCallback((value: string) => {
            const newYearValue = Number(value);
            setLocalYear(newYearValue);
            const newDate = new Date(newYearValue, displayMonth.getMonth(), 1);
            goToMonth?.(newDate);
          }, [displayMonth, goToMonth]);

          return (
            <div className="flex items-center justify-center px-1 pt-1 relative h-10 gap-2">
              <button
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                )}
                onClick={() => previousMonth && goToMonth(previousMonth)}
                disabled={!previousMonth}
                type="button"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Select
                  value={String(localMonth)}
                  onValueChange={handleMonthChange}
                  aria-label="Select month"
                >
                  <SelectTrigger className="w-auto h-8 px-2 text-sm font-medium border-none bg-transparent hover:bg-accent/50 focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[120px] bg-popover border-border shadow-lg">
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={String(i)} className="text-sm hover:bg-accent/80 focus:bg-accent">
                        {new Date(2000, i).toLocaleDateString(undefined, { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(localYear)}
                  onValueChange={handleYearChange}
                  aria-label="Select year"
                >
                  <SelectTrigger className="w-auto h-8 px-2 text-sm font-medium border-none bg-transparent hover:bg-accent/50 focus:ring-2 focus:ring-primary/50">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[80px] bg-popover border-border shadow-lg">
                    {Array.from({ length: new Date().getFullYear() + 1 - 2012 + 1 }, (_, i) => (
                      <SelectItem key={i} value={String(2012 + i)} className="text-sm hover:bg-accent/80 focus:bg-accent">
                        {2012 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                )}
                onClick={() => nextMonth && goToMonth(nextMonth)}
                disabled={!nextMonth}
                type="button"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          );
        },
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex items-center justify-center px-1 pt-1 relative h-10 gap-2",
        caption_label: "hidden",
        caption_dropdowns: "flex items-center gap-2",
        dropdown_month: "relative inline-flex",
        dropdown_year: "relative inline-flex",
        dropdown: "absolute z-50 top-full mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };