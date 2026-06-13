"use server";

import { revalidatePath } from "next/cache";

import { saveMenu } from "@/lib/menu-server";
import type { PracticeMenuData } from "@/types/menu";

export type SaveMenuResult = {
  ok: boolean;
  error?: string;
};

export async function saveMenuAction(
  data: PracticeMenuData
): Promise<SaveMenuResult> {
  const result = await saveMenu(data);

  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/admin");
  }

  return result;
}
