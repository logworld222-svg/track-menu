import type { PracticeMenuData, PracticeSession } from "@/types/menu";

export function generateSessionId(
  event: string,
  purpose: string,
  label?: string
): string {
  const base = [event, purpose, label].filter(Boolean).join("-");
  const slug = base
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `session-${Date.now()}`;
}

function uniqueSessionId(data: PracticeMenuData, baseId: string): string {
  let id = baseId;
  let counter = 2;

  while (data.sessions.some((session) => session.id === id)) {
    id = `${baseId}-${counter}`;
    counter += 1;
  }

  return id;
}

export function addEvent(data: PracticeMenuData, name: string): PracticeMenuData {
  const trimmed = name.trim();
  if (!trimmed || data.events.includes(trimmed)) {
    return data;
  }

  return {
    ...data,
    events: [...data.events, trimmed],
    purposesByEvent: {
      ...data.purposesByEvent,
      [trimmed]: data.purposesByEvent[trimmed] ?? [],
    },
  };
}

export function deleteEvent(
  data: PracticeMenuData,
  event: string
): PracticeMenuData {
  const { [event]: _removed, ...purposesByEvent } = data.purposesByEvent;

  return {
    events: data.events.filter((item) => item !== event),
    purposesByEvent,
    sessions: data.sessions.filter((session) => session.event !== event),
  };
}

export function addPurpose(
  data: PracticeMenuData,
  event: string,
  purpose: string
): PracticeMenuData {
  const trimmed = purpose.trim();
  if (!trimmed) return data;

  const purposes = data.purposesByEvent[event] ?? [];
  if (purposes.includes(trimmed)) return data;

  return {
    ...data,
    purposesByEvent: {
      ...data.purposesByEvent,
      [event]: [...purposes, trimmed],
    },
  };
}

export function deletePurpose(
  data: PracticeMenuData,
  event: string,
  purpose: string
): PracticeMenuData {
  const purposes = data.purposesByEvent[event] ?? [];

  return {
    ...data,
    purposesByEvent: {
      ...data.purposesByEvent,
      [event]: purposes.filter((item) => item !== purpose),
    },
    sessions: data.sessions.filter(
      (session) => !(session.event === event && session.purpose === purpose)
    ),
  };
}

export function addSession(
  data: PracticeMenuData,
  event: string,
  purpose: string,
  menuLabel?: string
): PracticeMenuData {
  const label = menuLabel?.trim() || "新しいメニュー";
  const baseId = generateSessionId(event, purpose, label);
  const id = uniqueSessionId(data, baseId);

  const session: PracticeSession = {
    id,
    event,
    purpose,
    menuLabel: label,
    menu: { items: [], points: [] },
  };

  return {
    ...data,
    sessions: [...data.sessions, session],
  };
}

export function deleteSession(
  data: PracticeMenuData,
  sessionId: string
): PracticeMenuData {
  return {
    ...data,
    sessions: data.sessions.filter((session) => session.id !== sessionId),
  };
}

export function updateSessionMenuLabel(
  data: PracticeMenuData,
  sessionId: string,
  menuLabel: string
): PracticeMenuData {
  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === sessionId
        ? { ...session, menuLabel: menuLabel.trim() || session.menuLabel }
        : session
    ),
  };
}

export function addMenuItem(
  data: PracticeMenuData,
  sessionId: string,
  item: string
): PracticeMenuData {
  const trimmed = item.trim();
  if (!trimmed) return data;

  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            menu: {
              ...session.menu,
              items: [...session.menu.items, trimmed],
            },
          }
        : session
    ),
  };
}

export function deleteMenuItem(
  data: PracticeMenuData,
  sessionId: string,
  index: number
): PracticeMenuData {
  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            menu: {
              ...session.menu,
              items: session.menu.items.filter((_, itemIndex) => itemIndex !== index),
            },
          }
        : session
    ),
  };
}

export function addPoint(
  data: PracticeMenuData,
  sessionId: string,
  point: string
): PracticeMenuData {
  const trimmed = point.trim();
  if (!trimmed) return data;

  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            menu: {
              ...session.menu,
              points: [...session.menu.points, trimmed],
            },
          }
        : session
    ),
  };
}

export function deletePoint(
  data: PracticeMenuData,
  sessionId: string,
  index: number
): PracticeMenuData {
  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            menu: {
              ...session.menu,
              points: session.menu.points.filter(
                (_, pointIndex) => pointIndex !== index
              ),
            },
          }
        : session
    ),
  };
}

export function setVideoUrl(
  data: PracticeMenuData,
  sessionId: string,
  videoUrl: string
): PracticeMenuData {
  const trimmed = videoUrl.trim();

  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            videoUrl: trimmed || undefined,
          }
        : session
    ),
  };
}

export function deleteVideo(
  data: PracticeMenuData,
  sessionId: string
): PracticeMenuData {
  return {
    ...data,
    sessions: data.sessions.map((session) =>
      session.id === sessionId
        ? { ...session, videoUrl: undefined }
        : session
    ),
  };
}
