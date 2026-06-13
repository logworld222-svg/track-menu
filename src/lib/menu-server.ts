import { readFile, writeFile } from "fs/promises";
import path from "path";

import {
  getMenuFromMicroCMS,
  isMicroCMSEnabled,
  saveMenuToMicroCMS,
} from "@/lib/microcms";
import type { PracticeMenuData, PracticeSession } from "@/types/menu";

export type SaveMenuResult = {
  ok: boolean;
  error?: string;
};

const MENU_JSON_PATH = path.join(process.cwd(), "public/data/menu.json");

export const FALLBACK_MENU: PracticeMenuData = {
  events: ["短距離"],
  purposesByEvent: {
    短距離: ["加速"],
  },
  sessions: [],
};

function isPracticeSession(value: unknown): value is PracticeSession {
  if (!value || typeof value !== "object") return false;

  const session = value as Record<string, unknown>;

  if (
    typeof session.id !== "string" ||
    typeof session.event !== "string" ||
    typeof session.purpose !== "string"
  ) {
    return false;
  }

  if (!session.menu || typeof session.menu !== "object") return false;

  const menu = session.menu as Record<string, unknown>;

  if (!Array.isArray(menu.items) || !Array.isArray(menu.points)) return false;

  return (
    menu.items.every((item) => typeof item === "string") &&
    menu.points.every((point) => typeof point === "string") &&
    (session.menuLabel === undefined || typeof session.menuLabel === "string") &&
    (session.videoUrl === undefined || typeof session.videoUrl === "string")
  );
}

function isPurposesByEvent(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== "object") return false;

  return Object.values(value).every(
    (purposes) =>
      Array.isArray(purposes) &&
      purposes.every((purpose) => typeof purpose === "string")
  );
}

function isPracticeMenuData(value: unknown): value is PracticeMenuData {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;

  if (
    !Array.isArray(data.events) ||
    data.events.length === 0 ||
    !data.events.every((event) => typeof event === "string") ||
    !isPurposesByEvent(data.purposesByEvent) ||
    !Array.isArray(data.sessions)
  ) {
    return false;
  }

  return data.sessions.every(isPracticeSession);
}

async function getMenuFromJson(): Promise<PracticeMenuData | null> {
  try {
    const content = await readFile(MENU_JSON_PATH, "utf-8");
    const parsed: unknown = JSON.parse(content);

    if (!isPracticeMenuData(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function getMenu(): Promise<PracticeMenuData | null> {
  if (isMicroCMSEnabled()) {
    const menuFromMicroCMS = await getMenuFromMicroCMS();
    if (menuFromMicroCMS) {
      return menuFromMicroCMS;
    }
  }

  return getMenuFromJson();
}

async function saveMenuToJson(data: PracticeMenuData): Promise<SaveMenuResult> {
  try {
    await writeFile(MENU_JSON_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "menu.json への保存に失敗しました。ローカル環境で実行しているか確認してください。",
    };
  }
}

export async function saveMenu(data: PracticeMenuData): Promise<SaveMenuResult> {
  if (!isPracticeMenuData(data)) {
    return { ok: false, error: "データ形式が正しくありません。" };
  }

  if (isMicroCMSEnabled()) {
    const result = await saveMenuToMicroCMS(data);
    if (result.ok) {
      return result;
    }
  }

  return saveMenuToJson(data);
}
