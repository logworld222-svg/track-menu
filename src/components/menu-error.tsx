import Link from "next/link";

export function MenuError() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-medium">メニューを読み込めませんでした</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          microCMS の設定、または public/data/menu.json の形式を確認してください。
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/admin"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            メニュー管理画面を開く
          </Link>
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
