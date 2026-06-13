import type { PracticeMenuData, PracticeSession } from "@/types/menu";
import type {
  MicroCMSListResponse,
  MicroCMSMenuSettings,
  MicroCMSPracticeSession,
  MicroCMSPracticeSessionContent,
} from "@/types/microcms";

export type SaveMenuResult = {
  ok: boolean;
  error?: string;
};

function getMicroCMSConfig() {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;

  if (!serviceDomain || !apiKey) {
    return null;
  }

  return { serviceDomain, apiKey };
}

async function fetchMicroCMS<T>(endpoint: string): Promise<T | null> {
  const config = getMicroCMSConfig();
  if (!config) return null;

  try {
    const response = await fetch(
      `https://${config.serviceDomain}.microcms.io/api/v1/${endpoint}`,
      {
        headers: {
          "X-MICROCMS-API-KEY": config.apiKey,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function mutateMicroCMS(
  endpoint: string,
  method: "PATCH" | "POST" | "DELETE",
  body?: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = getMicroCMSConfig();
  if (!config) {
    return { ok: false, error: "microCMS が設定されていません。" };
  }

  try {
    const response = await fetch(
      `https://${config.serviceDomain}.microcms.io/api/v1/${endpoint}`,
      {
        method,
        headers: {
          "X-MICROCMS-API-KEY": config.apiKey,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: `microCMS への保存に失敗しました（${response.status}）。`,
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "microCMS への接続に失敗しました。" };
  }
}

function transformSettings(settings: MicroCMSMenuSettings) {
  const events = [...settings.events]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((event) => event.name);

  const purposesByEvent = settings.purposeGroups.reduce<
    Record<string, string[]>
  >((acc, group) => {
    acc[group.event] = group.purposes.map((purpose) => purpose.name);
    return acc;
  }, {});

  return { events, purposesByEvent };
}

function transformSession(session: MicroCMSPracticeSession): PracticeSession {
  return {
    id: session.sessionId,
    event: session.event,
    purpose: session.purpose,
    menuLabel: session.menuLabel,
    menu: {
      items: session.menuItems.map((item) => item.text),
      points: session.menuPoints.map((point) => point.text),
    },
    videoUrl: session.videoUrl,
  };
}

export function isMicroCMSEnabled() {
  return getMicroCMSConfig() !== null;
}

export async function getMenuFromMicroCMS(): Promise<PracticeMenuData | null> {
  const [settings, sessionsResponse] = await Promise.all([
    fetchMicroCMS<MicroCMSMenuSettings>("menu-settings"),
    fetchMicroCMS<MicroCMSListResponse<MicroCMSPracticeSessionContent>>(
      "practice-sessions?limit=100"
    ),
  ]);

  if (!settings || !sessionsResponse) {
    return null;
  }

  const { events, purposesByEvent } = transformSettings(settings);
  const sessions = sessionsResponse.contents.map(transformSession);

  if (events.length === 0) {
    return null;
  }

  return {
    events,
    purposesByEvent,
    sessions,
  };
}

function transformToSettings(data: PracticeMenuData): MicroCMSMenuSettings {
  return {
    events: data.events.map((name, index) => ({ name, order: index + 1 })),
    purposeGroups: data.events
      .filter((event) => (data.purposesByEvent[event]?.length ?? 0) > 0)
      .map((event) => ({
        event,
        purposes: (data.purposesByEvent[event] ?? []).map((name) => ({ name })),
      })),
  };
}

function transformToSessionPayload(
  session: PracticeSession
): MicroCMSPracticeSession {
  return {
    sessionId: session.id,
    event: session.event,
    purpose: session.purpose,
    menuLabel: session.menuLabel,
    menuItems: session.menu.items.map((text) => ({ text })),
    menuPoints: session.menu.points.map((text) => ({ text })),
    videoUrl: session.videoUrl,
  };
}

export async function saveMenuToMicroCMS(
  data: PracticeMenuData
): Promise<SaveMenuResult> {
  const settingsResult = await mutateMicroCMS(
    "menu-settings",
    "PATCH",
    transformToSettings(data)
  );

  if (!settingsResult.ok) {
    return settingsResult;
  }

  const existingResponse =
    await fetchMicroCMS<MicroCMSListResponse<MicroCMSPracticeSessionContent>>(
      "practice-sessions?limit=100"
    );

  if (!existingResponse) {
    return { ok: false, error: "既存のセッション取得に失敗しました。" };
  }

  const existingBySessionId = new Map(
    existingResponse.contents.map((session) => [session.sessionId, session])
  );
  const nextSessionIds = new Set(data.sessions.map((session) => session.id));

  for (const session of data.sessions) {
    const payload = transformToSessionPayload(session);
    const existing = existingBySessionId.get(session.id);

    const result = existing
      ? await mutateMicroCMS(`practice-sessions/${existing.id}`, "PATCH", payload)
      : await mutateMicroCMS("practice-sessions", "POST", payload);

    if (!result.ok) {
      return result;
    }
  }

  for (const existing of existingResponse.contents) {
    if (nextSessionIds.has(existing.sessionId)) {
      continue;
    }

    const result = await mutateMicroCMS(
      `practice-sessions/${existing.id}`,
      "DELETE"
    );

    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}
