import { get, put } from "@vercel/blob";

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
    const result = await get(MENU_BLOB_PATH, {
      access: "private",
      useCache: false,
      ...blobOptions,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    return await new Response(result.stream).text();
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
