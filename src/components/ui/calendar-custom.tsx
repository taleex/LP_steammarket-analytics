import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps, useNavigation } from "react-day-picker";
import { format } from "date-fns";

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

// Custom caption component with proper [←] [Month] [Year] [→] layout
function CustomCaption({ displayMonth }: CaptionProps) {
  const { goToMonth, previousMonth, nextMonth } = useNavigation();
  
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  
  // Generate year range
  const fromYear = 2012;
  const toYear = new Date().getFullYear() + 1;
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);
  
  // Month names
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2024, i, 1), "MMMM"),
  }));
  
  const handleMonthChange = (value: string) => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(parseInt(value));
    goToMonth(newDate);
  };
  
  const handleYearChange = (value: string) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(parseInt(value));
    goToMonth(newDate);
  };

  return (
    <div className="flex items-center justify-between gap-1 px-1 py-2">
      {/* Previous Button */}
      <button
        type="button"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 opacity-100 disabled:opacity-30"
        )}
        aria-label="Go to previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Month/Year Dropdowns */}
      <div className="flex items-center gap-1">
        <Select value={String(currentMonth)} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-7 w-[110px] text-sm font-medium border-input/60 bg-background focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {months.map((month) => (
              <SelectItem key={month.value} value={String(month.value)}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(currentYear)} onValueChange={handleYearChange}>
          <SelectTrigger className="h-7 w-[80px] text-sm font-medium border-input/60 bg-background focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Next Button */}
      <button
        type="button"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 opacity-100 disabled:opacity-30"
        )}
        aria-label="Go to next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function CalendarCustom({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      components={{
        Caption: CustomCaption,
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "",
        caption_label: "hidden",
        nav: "hidden",
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
CalendarCustom.displayName = "CalendarCustom";

export { CalendarCustom };
