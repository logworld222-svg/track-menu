"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-medium">管理画面の読み込みに失敗しました</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          開発サーバーを再起動してから、もう一度お試しください。
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            再読み込み
          </button>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            閲覧画面へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
