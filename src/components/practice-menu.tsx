"use client";

import { useEffect, useMemo, useState } from "react";

import { MenuPointSelector } from "@/components/menu-point-selector";
import { PaneOptionSelector } from "@/components/pane-option-selector";
import { PracticeMenuPane } from "@/components/practice-menu-pane";
import { ADMIN_NAV_STORAGE_KEY, ScreenNav } from "@/components/screen-nav";
import { VideoEmbed } from "@/components/video-embed";
import { getPurposesForEvent } from "@/lib/menu-utils";
import { cn } from "@/lib/utils";
import type { PracticeMenuData, PracticeSession } from "@/types/menu";

type PracticeMenuProps = {
  data: PracticeMenuData;
};

function getSessionsForSelection(
  sessions: PracticeSession[],
  event: string,
  purpose?: string
) {
  return sessions.filter(
    (session) =>
      session.event === event &&
      (purpose === undefined || session.purpose === purpose)
  );
}

function getInitialSelection(data: PracticeMenuData) {
  const event = data.events[0];
  const purposes = getPurposesForEvent(data, event);
  const purpose = purposes[0] ?? "";
  const session = getSessionsForSelection(data.sessions, event, purpose)[0];

  return {
    event,
    purpose,
    sessionId: session?.id ?? "",
    expandedSessionIds: session?.id ? [session.id] : [],
  };
}

export function PracticeMenu({ data }: PracticeMenuProps) {
  const initial = getInitialSelection(data);

  const [selectedEvent, setSelectedEvent] = useState(initial.event);
  const [selectedPurpose, setSelectedPurpose] = useState(initial.purpose);
  const [selectedSessionId, setSelectedSessionId] = useState(initial.sessionId);
  const [expandedSessionIds, setExpandedSessionIds] = useState(
    initial.expandedSessionIds
  );
  const [showAdminNav, setShowAdminNav] = useState(false);

  useEffect(() => {
    setShowAdminNav(sessionStorage.getItem(ADMIN_NAV_STORAGE_KEY) === "1");
  }, []);

  const purposes = useMemo(
    () => getPurposesForEvent(data, selectedEvent),
    [data, selectedEvent]
  );

  const menuSessions = useMemo(
    () =>
      getSessionsForSelection(
        data.sessions,
        selectedEvent,
        selectedPurpose || undefined
      ),
    [data.sessions, selectedEvent, selectedPurpose]
  );

  const selectedSession =
    menuSessions.find((session) => session.id === selectedSessionId) ??
    menuSessions[0];

  const handleEventSelect = (event: string) => {
    const nextPurposes = getPurposesForEvent(data, event);
    const nextPurpose = nextPurposes[0] ?? "";
    const nextSession = getSessionsForSelection(
      data.sessions,
      event,
      nextPurpose || undefined
    )[0];

    setSelectedEvent(event);
    setSelectedPurpose(nextPurpose);
    setSelectedSessionId(nextSession?.id ?? "");
    setExpandedSessionIds(nextSession?.id ? [nextSession.id] : []);
  };

  const handlePurposeSelect = (purpose: string) => {
    const nextSession = getSessionsForSelection(
      data.sessions,
      selectedEvent,
      purpose
    )[0];

    setSelectedPurpose(purpose);
    setSelectedSessionId(nextSession?.id ?? "");
    setExpandedSessionIds(nextSession?.id ? [nextSession.id] : []);
  };

  const handleMenuSelect = (sessionId: string) => {
    if (
      selectedSessionId === sessionId &&
      expandedSessionIds.includes(sessionId)
    ) {
      setExpandedSessionIds((current) =>
        current.filter((id) => id !== sessionId)
      );
      return;
    }

    setSelectedSessionId(sessionId);
    setExpandedSessionIds((current) =>
      current.includes(sessionId) ? current : [...current, sessionId]
    );
  };

  return (
    <div className="min-h-screen p-4">
      {showAdminNav && (
        <div className="mb-4 flex justify-end">
          <ScreenNav current="viewer" />
        </div>
      )}
      <div
        className={cn(
          "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.25fr)] lg:grid-rows-1 lg:overflow-hidden",
          showAdminNav ? "lg:h-[calc(100vh-5rem)]" : "min-h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)]"
        )}
      >
      <PracticeMenuPane title="種目">
        <PaneOptionSelector
          options={data.events}
          selected={selectedEvent}
          onSelect={handleEventSelect}
        />
      </PracticeMenuPane>

      <PracticeMenuPane title="目的">
        {purposes.length > 0 ? (
          <PaneOptionSelector
            options={purposes}
            selected={selectedPurpose}
            onSelect={handlePurposeSelect}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            この種目の目的はまだ登録されていません。
          </p>
        )}
      </PracticeMenuPane>

      <PracticeMenuPane title="メニューとポイント">
        {menuSessions.length > 0 ? (
          <MenuPointSelector
            sessions={menuSessions}
            selectedId={selectedSession?.id ?? ""}
            expandedIds={expandedSessionIds}
            onSelect={handleMenuSelect}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            この種目・目的のメニューはまだ登録されていません。
          </p>
        )}
      </PracticeMenuPane>

      <PracticeMenuPane title="動画">
        <VideoEmbed videoUrl={selectedSession?.videoUrl} />
      </PracticeMenuPane>
      </div>
    </div>
  );
}
