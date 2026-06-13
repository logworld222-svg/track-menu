import { head, put } from "@vercel/blob";

const MENU_BLOB_PATH = "data/menu.json";

function getBlobOptions() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  return token ? { token } : undefined;
}

export type BlobSaveResult = {
  ok: boolean;
  error?: string;
};

export function isBlobStorageEnabled() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  );
}

export async function readMenuBlob(): Promise<string | null> {
  if (!isBlobStorageEnabled()) {
    return null;
  }

  try {
    const blobOptions = getBlobOptions();
    const metadata = await head(MENU_BLOB_PATH, blobOptions);
    const response = await fetch(metadata.url);

    if (!response.ok) {
      return null;
    }

    return response.text();
  } catch {
    return null;
  }
}

export async function writeMenuBlob(content: string): Promise<BlobSaveResult> {
  if (!isBlobStorageEnabled()) {
    return {
      ok: false,
      error: "クラウドストレージが設定されていません。",
    };
  }

  try {
    const blobOptions = getBlobOptions();
    await put(MENU_BLOB_PATH, content, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      ...blobOptions,
    });

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "クラウドストレージへの保存に失敗しました。",
    };
  }
}
