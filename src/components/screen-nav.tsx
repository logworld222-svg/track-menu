import Link from "next/link";

import { cn } from "@/lib/utils";

export const ADMIN_NAV_STORAGE_KEY = "show-admin-nav";

type ScreenNavProps = {
  current: "viewer" | "admin";
};

const baseClassName =
  "inline-flex h-8 items-center rounded-lg border px-2.5 text-sm font-medium";

function markAdminNav() {
  sessionStorage.setItem(ADMIN_NAV_STORAGE_KEY, "1");
}

export function ScreenNav({ current }: ScreenNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        aria-current={current === "viewer" ? "page" : undefined}
        onClick={current === "admin" ? markAdminNav : undefined}
        className={cn(
          baseClassName,
          current === "viewer"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background hover:bg-muted"
        )}
      >
        閲覧画面
      </Link>
      <Link
        href="/admin"
        aria-current={current === "admin" ? "page" : undefined}
        className={cn(
          baseClassName,
          current === "admin"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background hover:bg-muted"
        )}
      >
        管理画面
      </Link>
    </div>
  );
}
