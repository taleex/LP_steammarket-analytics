import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      captionLayout="buttons"
      fromYear={2012}
      toYear={new Date().getFullYear() + 1}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex items-center justify-center px-1 pt-1 relative h-10",
        caption_label: "hidden",
        caption_dropdowns: "flex items-center gap-2",
        dropdown_month: "relative inline-flex",
        dropdown_year: "relative inline-flex",
        dropdown: "absolute z-50 top-full mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md",
        vhidden: "sr-only",
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
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth, ...props }) => {
          const { goToMonth, previousMonth, nextMonth } = props as any;
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
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <select
                  className="relative inline-flex appearance-none bg-transparent border-none p-0 font-medium text-sm cursor-pointer hover:bg-accent/50 rounded px-1"
                  value={displayMonth.getMonth()}
                  onChange={(e) => {
                    const newMonth = new Date(displayMonth);
                    newMonth.setMonth(Number(e.target.value));
                    goToMonth(newMonth);
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(2000, i).toLocaleDateString(undefined, { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  className="relative inline-flex appearance-none bg-transparent border-none p-0 font-medium text-sm cursor-pointer hover:bg-accent/50 rounded px-1"
                  value={displayMonth.getFullYear()}
                  onChange={(e) => {
                    const newMonth = new Date(displayMonth);
                    newMonth.setFullYear(Number(e.target.value));
                    goToMonth(newMonth);
                  }}
                >
                  {Array.from({ length: new Date().getFullYear() + 1 - 2012 + 1 }, (_, i) => (
                    <option key={i} value={2012 + i}>
                      {2012 + i}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                )}
                onClick={() => nextMonth && goToMonth(nextMonth)}
                disabled={!nextMonth}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
