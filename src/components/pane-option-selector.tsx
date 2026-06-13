"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaneOptionSelectorProps = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export function PaneOptionSelector({
  options,
  selected,
  onSelect,
}: PaneOptionSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant={selected === option ? "default" : "outline"}
          className={cn(
            "h-auto min-h-9 w-full justify-start px-3 py-2 text-left whitespace-normal",
            selected === option && "ring-2 ring-ring/30"
          )}
          onClick={() => onSelect(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
