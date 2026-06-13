import Link from "next/link";

import { cn } from "@/lib/utils";

type ScreenNavProps = {
  current: "viewer" | "admin";
};

const baseClassName =
  "inline-flex h-8 items-center rounded-lg border px-2.5 text-sm font-medium";

export function ScreenNav({ current }: ScreenNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        aria-current={current === "viewer" ? "page" : undefined}
        className={cn(
          baseClassName,
          current === "viewer"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background hover:bg-muted"
        )}
      >
        閲覧画面
      </Link>
      {current === "admin" && (
        <span
          aria-current="page"
          className={cn(
            baseClassName,
            "border-primary bg-primary text-primary-foreground"
          )}
        >
          管理画面
        </span>
      )}
    </div>
  );
}
