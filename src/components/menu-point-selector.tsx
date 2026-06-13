"use client";

import { Button } from "@/components/ui/button";
import { getMenuLabel } from "@/lib/menu-utils";
import { cn } from "@/lib/utils";
import type { PracticeSession } from "@/types/menu";

type MenuPointSelectorProps = {
  sessions: PracticeSession[];
  selectedId: string;
  expandedId: string;
  onSelect: (sessionId: string) => void;
};

export function MenuPointSelector({
  sessions,
  selectedId,
  expandedId,
  onSelect,
}: MenuPointSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {sessions.map((session) => {
        const isSelected = selectedId === session.id;
        const isExpanded = expandedId === session.id;

        return (
          <div key={session.id}>
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto min-h-9 w-full justify-start px-3 py-2 text-left whitespace-normal",
                isSelected && "ring-2 ring-ring/30"
              )}
              onClick={() => onSelect(session.id)}
            >
              {getMenuLabel(session)}
            </Button>

            {isExpanded && (
              <div className="mt-2 border-l-2 border-primary/30 pl-3">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  ポイント
                </h4>
                <ul className="space-y-2 text-sm">
                  {session.menu.points.map((point) => (
                    <li key={point} className="leading-relaxed">
                      ▶ {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
