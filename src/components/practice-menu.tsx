"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PaneOptionSelector } from "@/components/pane-option-selector";
import { PracticeMenuPane } from "@/components/practice-menu-pane";
import { VideoEmbed } from "@/components/video-embed";
import { getMenuLabel, getPurposesForEvent } from "@/lib/menu-utils";
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

  return { event, purpose, sessionId: session?.id ?? "" };
}

export function PracticeMenu({ data }: PracticeMenuProps) {
  const initial = getInitialSelection(data);

  const [selectedEvent, setSelectedEvent] = useState(initial.event);
  const [selectedPurpose, setSelectedPurpose] = useState(initial.purpose);
  const [selectedSessionId, setSelectedSessionId] = useState(initial.sessionId);

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
  };

  const handlePurposeSelect = (purpose: string) => {
    const nextSession = getSessionsForSelection(
      data.sessions,
      selectedEvent,
      purpose
    )[0];

    setSelectedPurpose(purpose);
    setSelectedSessionId(nextSession?.id ?? "");
  };

  const handleMenuSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          メニュー管理
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.25fr)] lg:grid-rows-1 lg:overflow-hidden">
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
        <div className="space-y-6">
          {menuSessions.length > 1 && (
            <section>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                メニューを選択
              </h3>
              <div className="flex flex-col gap-2">
                {menuSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => handleMenuSelect(session.id)}
                    className={
                      selectedSession?.id === session.id
                        ? "rounded-lg bg-primary px-3 py-2 text-left text-sm text-primary-foreground"
                        : "rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
                    }
                  >
                    {getMenuLabel(session)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedSession ? (
            <>
              <section>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  メニュー
                </h3>
                <ol className="list-decimal space-y-2 pl-5">
                  {selectedSession.menu.items.map((item) => (
                    <li key={item} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ol>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  ポイント
                </h3>
                <ul className="space-y-2">
                  {selectedSession.menu.points.map((point) => (
                    <li key={point} className="leading-relaxed">
                      ▶ {point}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              この種目・目的のメニューはまだ登録されていません。
            </p>
          )}
        </div>
      </PracticeMenuPane>

      <PracticeMenuPane title="動画">
        <VideoEmbed videoUrl={selectedSession?.videoUrl} />
      </PracticeMenuPane>
      </div>
    </div>
  );
}
