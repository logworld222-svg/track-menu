import type { PracticeMenuData, PracticeSession } from "@/types/menu";

export function getPurposesForEvent(
  data: PracticeMenuData,
  event: string
): string[] {
  return data.purposesByEvent[event] ?? [];
}

export function getMenuLabel(session: PracticeSession) {
  return session.menuLabel ?? session.menu.items[0] ?? session.id;
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url?.trim()) return null;

  try {
    const parsed = new URL(url.trim());

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}
