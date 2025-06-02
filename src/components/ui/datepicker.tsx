"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  selected: DateRange | undefined;
  onSelect: (from: Date | undefined, to: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function DatePickerWithRange({
  className,
  selected,
  onSelect,
  disabled,
}: DatePickerWithRangeProps) {
  const handleSelect = (dateRange: DateRange | undefined) => {
    onSelect(dateRange?.from, dateRange?.to);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected?.from ? (
              selected?.to ? (
                <>
                  {format(selected.from, "dd LLL, y")} -{" "}
                  {format(selected.to, "dd LLL, y")}
                </>
              ) : (
                format(selected.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={selected?.from}
            selected={selected}
            onSelect={handleSelect}
            disabled={disabled}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
