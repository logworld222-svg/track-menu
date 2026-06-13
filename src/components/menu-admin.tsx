"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { MenuPointSelector } from "@/components/menu-point-selector";
import { PaneOptionSelector } from "@/components/pane-option-selector";
import { PracticeMenuPane } from "@/components/practice-menu-pane";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/video-embed";
import { saveMenuAction } from "@/lib/menu-actions";
import {
  addEvent,
  addMenuItem,
  addPoint,
  addPurpose,
  addSession,
  deleteEvent,
  deleteMenuItem,
  deletePoint,
  deletePurpose,
  deleteSession,
  deleteVideo,
  setVideoUrl,
  updateSessionMenuLabel,
} from "@/lib/menu-mutations";
import { getPurposesForEvent } from "@/lib/menu-utils";
import type { PracticeMenuData, PracticeSession } from "@/types/menu";

type MenuAdminProps = {
  initialData: PracticeMenuData;
  loadFailed?: boolean;
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
  const event = data.events[0] ?? "";
  const purposes = getPurposesForEvent(data, event);
  const purpose = purposes[0] ?? "";
  const session = getSessionsForSelection(data.sessions, event, purpose)[0];

  return {
    event,
    purpose,
    sessionId: session?.id ?? "",
    expandedSessionId: session?.id ?? "",
  };
}

const inputClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function MenuAdmin({ initialData, loadFailed = false }: MenuAdminProps) {
  const [data, setData] = useState(initialData);
  const initial = getInitialSelection(initialData);
  const [selectedEvent, setSelectedEvent] = useState(initial.event);
  const [selectedPurpose, setSelectedPurpose] = useState(initial.purpose);
  const [selectedSessionId, setSelectedSessionId] = useState(initial.sessionId);
  const [expandedSessionId, setExpandedSessionId] = useState(
    initial.expandedSessionId
  );
  const [newEvent, setNewEvent] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [newMenuItem, setNewMenuItem] = useState("");
  const [newPoint, setNewPoint] = useState("");
  const [newSessionLabel, setNewSessionLabel] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  useEffect(() => {
    setVideoUrlInput(selectedSession?.videoUrl ?? "");
  }, [selectedSession?.id, selectedSession?.videoUrl]);

  const persist = (nextData: PracticeMenuData, successMessage: string) => {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      const result = await saveMenuAction(nextData);

      if (result.ok) {
        setData(nextData);
        setStatusMessage(successMessage);
      } else {
        setErrorMessage(result.error ?? "保存に失敗しました。");
      }
    });
  };

  const syncSelection = (
    nextData: PracticeMenuData,
    event: string,
    purpose: string,
    sessionId?: string
  ) => {
    const nextPurposes = getPurposesForEvent(nextData, event);
    const nextPurpose = nextPurposes.includes(purpose)
      ? purpose
      : (nextPurposes[0] ?? "");
    const nextSessions = getSessionsForSelection(
      nextData.sessions,
      event,
      nextPurpose || undefined
    );
    const nextSessionId =
      sessionId && nextSessions.some((session) => session.id === sessionId)
        ? sessionId
        : (nextSessions[0]?.id ?? "");

    setSelectedEvent(event);
    setSelectedPurpose(nextPurpose);
    setSelectedSessionId(nextSessionId);
    setExpandedSessionId(nextSessionId);

    if (nextSessionId) {
      const session = nextData.sessions.find((item) => item.id === nextSessionId);
      setVideoUrlInput(session?.videoUrl ?? "");
    } else {
      setVideoUrlInput("");
    }
  };

  const handleEventSelect = (event: string) => {
    syncSelection(data, event, selectedPurpose);
  };

  const handlePurposeSelect = (purpose: string) => {
    const nextSessions = getSessionsForSelection(
      data.sessions,
      selectedEvent,
      purpose
    );
    const nextSessionId = nextSessions[0]?.id ?? "";
    setSelectedPurpose(purpose);
    setSelectedSessionId(nextSessionId);
    setExpandedSessionId(nextSessionId);
    setVideoUrlInput(nextSessions[0]?.videoUrl ?? "");
  };

  const handleMenuSelect = (sessionId: string) => {
    if (selectedSessionId === sessionId && expandedSessionId === sessionId) {
      setExpandedSessionId("");
      return;
    }

    setSelectedSessionId(sessionId);
    setExpandedSessionId(sessionId);
    const session = data.sessions.find((item) => item.id === sessionId);
    setVideoUrlInput(session?.videoUrl ?? "");
  };

  const handleAddEvent = () => {
    const nextData = addEvent(data, newEvent);
    if (nextData === data) return;

    const event = newEvent.trim();
    setNewEvent("");
    syncSelection(nextData, event, "");
    persist(nextData, `種目「${event}」を追加しました。`);
  };

  const handleDeleteEvent = (event: string) => {
    if (!window.confirm(`種目「${event}」と関連する目的・メニューを削除しますか？`)) {
      return;
    }

    const nextData = deleteEvent(data, event);
    const nextEvent = nextData.events[0] ?? "";
    syncSelection(nextData, nextEvent, "");
    persist(nextData, `種目「${event}」を削除しました。`);
  };

  const handleAddPurpose = () => {
    const nextData = addPurpose(data, selectedEvent, newPurpose);
    if (nextData === data) return;

    const purpose = newPurpose.trim();
    setNewPurpose("");
    syncSelection(nextData, selectedEvent, purpose);
    persist(nextData, `目的「${purpose}」を追加しました。`);
  };

  const handleDeletePurpose = (purpose: string) => {
    if (
      !window.confirm(
        `目的「${purpose}」と関連するメニューを削除しますか？`
      )
    ) {
      return;
    }

    const nextData = deletePurpose(data, selectedEvent, purpose);
    syncSelection(nextData, selectedEvent, "");
    persist(nextData, `目的「${purpose}」を削除しました。`);
  };

  const handleAddSession = () => {
    if (!selectedEvent || !selectedPurpose) {
      setErrorMessage("先に種目と目的を選択してください。");
      return;
    }

    const nextData = addSession(
      data,
      selectedEvent,
      selectedPurpose,
      newSessionLabel
    );
    const nextSession = getSessionsForSelection(
      nextData.sessions,
      selectedEvent,
      selectedPurpose
    ).at(-1);

    setNewSessionLabel("");
    if (nextSession) {
      syncSelection(nextData, selectedEvent, selectedPurpose, nextSession.id);
    }
    persist(nextData, "メニューを追加しました。");
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!window.confirm("このメニューを削除しますか？")) {
      return;
    }

    const nextData = deleteSession(data, sessionId);
    syncSelection(nextData, selectedEvent, selectedPurpose);
    persist(nextData, "メニューを削除しました。");
  };

  const handleAddMenuItem = () => {
    if (!selectedSession) return;

    const nextData = addMenuItem(data, selectedSession.id, newMenuItem);
    if (nextData === data) return;

    setNewMenuItem("");
    persist(nextData, "メニュー項目を追加しました。");
  };

  const handleDeleteMenuItem = (index: number) => {
    if (!selectedSession) return;

    const nextData = deleteMenuItem(data, selectedSession.id, index);
    persist(nextData, "メニュー項目を削除しました。");
  };

  const handleAddPoint = () => {
    if (!selectedSession) return;

    const nextData = addPoint(data, selectedSession.id, newPoint);
    if (nextData === data) return;

    setNewPoint("");
    persist(nextData, "ポイントを追加しました。");
  };

  const handleDeletePoint = (index: number) => {
    if (!selectedSession) return;

    const nextData = deletePoint(data, selectedSession.id, index);
    persist(nextData, "ポイントを削除しました。");
  };

  const handleSaveVideo = () => {
    if (!selectedSession) return;

    const nextData = setVideoUrl(data, selectedSession.id, videoUrlInput);
    persist(nextData, "動画 URL を保存しました。");
  };

  const handleDeleteVideo = () => {
    if (!selectedSession) return;

    const nextData = deleteVideo(data, selectedSession.id);
    setVideoUrlInput("");
    persist(nextData, "動画を削除しました。");
  };

  const handleUpdateMenuLabel = (menuLabel: string) => {
    if (!selectedSession) return;

    const nextData = updateSessionMenuLabel(
      data,
      selectedSession.id,
      menuLabel
    );
    persist(nextData, "メニュー名を更新しました。");
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">メニュー管理</h1>
          <p className="text-sm text-muted-foreground">
            種目・目的・メニュー・ポイント・動画の追加と削除ができます。
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          閲覧画面へ
        </Link>
      </div>

      {(loadFailed || statusMessage || errorMessage || isPending) && (
        <div className="mb-4 space-y-2">
          {loadFailed && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              menu.json を読み込めなかったため、初期データで表示しています。保存すると
              menu.json が上書きされます。
            </p>
          )}
          {isPending && (
            <p className="text-sm text-muted-foreground">保存中...</p>
          )}
          {statusMessage && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              {statusMessage}
            </p>
          )}
          {errorMessage && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:h-[calc(100vh-8rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.25fr)] lg:grid-rows-1 lg:overflow-hidden">
        <PracticeMenuPane title="種目">
          <div className="space-y-4">
            <PaneOptionSelector
              options={data.events}
              selected={selectedEvent}
              onSelect={handleEventSelect}
            />
            {selectedEvent && data.events.length > 1 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDeleteEvent(selectedEvent)}
                >
                  この種目を削除
                </Button>
              </div>
            )}
            <div className="space-y-2 border-t pt-4">
              <input
                type="text"
                value={newEvent}
                onChange={(event) => setNewEvent(event.target.value)}
                placeholder="新しい種目名"
                className={inputClassName}
              />
              <Button
                type="button"
                className="w-full"
                disabled={isPending || !newEvent.trim()}
                onClick={handleAddEvent}
              >
                種目を追加
              </Button>
            </div>
          </div>
        </PracticeMenuPane>

        <PracticeMenuPane title="目的">
          <div className="space-y-4">
            {purposes.length > 0 ? (
              <>
                <PaneOptionSelector
                  options={purposes}
                  selected={selectedPurpose}
                  onSelect={handlePurposeSelect}
                />
                {selectedPurpose && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleDeletePurpose(selectedPurpose)}
                    >
                      この目的を削除
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                この種目の目的はまだ登録されていません。
              </p>
            )}
            <div className="space-y-2 border-t pt-4">
              <input
                type="text"
                value={newPurpose}
                onChange={(event) => setNewPurpose(event.target.value)}
                placeholder="新しい目的"
                className={inputClassName}
                disabled={!selectedEvent}
              />
              <Button
                type="button"
                className="w-full"
                disabled={isPending || !selectedEvent || !newPurpose.trim()}
                onClick={handleAddPurpose}
              >
                目的を追加
              </Button>
            </div>
          </div>
        </PracticeMenuPane>

        <PracticeMenuPane title="メニューとポイント">
          <div className="space-y-6">
            {!selectedEvent || !selectedPurpose ? (
              <p className="text-sm text-muted-foreground">
                先に種目と目的を選択してください。
              </p>
            ) : menuSessions.length > 0 ? (
              <MenuPointSelector
                sessions={menuSessions}
                selectedId={selectedSession?.id ?? ""}
                expandedId={expandedSessionId}
                onSelect={handleMenuSelect}
                renderSessionActions={(session) => (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    削除
                  </Button>
                )}
                renderPointItem={(_session, point, index) => (
                  <div className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 leading-relaxed">
                      ▶ {point}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      disabled={isPending}
                      onClick={() => handleDeletePoint(index)}
                    >
                      削除
                    </Button>
                  </div>
                )}
                renderAfterPoints={() => (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newPoint}
                      onChange={(event) => setNewPoint(event.target.value)}
                      placeholder="ポイントを追加"
                      className={inputClassName}
                    />
                    <Button
                      type="button"
                      disabled={isPending || !newPoint.trim()}
                      onClick={handleAddPoint}
                    >
                      追加
                    </Button>
                  </div>
                )}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                この種目・目的のメニューはまだありません。
              </p>
            )}

            {selectedEvent && selectedPurpose && (
              <div className="flex gap-2 border-t pt-4">
                <input
                  type="text"
                  value={newSessionLabel}
                  onChange={(event) => setNewSessionLabel(event.target.value)}
                  placeholder="新しいメニュー名"
                  className={inputClassName}
                />
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={handleAddSession}
                >
                  追加
                </Button>
              </div>
            )}

            {selectedSession ? (
              <>
                <section>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    メニュー名
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedSession.menuLabel ?? ""}
                    key={selectedSession.id}
                    className={inputClassName}
                    onBlur={(event) => {
                      if (event.target.value !== (selectedSession.menuLabel ?? "")) {
                        handleUpdateMenuLabel(event.target.value);
                      }
                    }}
                  />
                </section>

                <section>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    メニュー
                  </h3>
                  <ol className="space-y-2">
                    {selectedSession.menu.items.map((item, index) => (
                      <li
                        key={`${selectedSession.id}-item-${index}`}
                        className="flex items-start gap-2"
                      >
                        <span className="min-w-0 flex-1 leading-relaxed">
                          {index + 1}. {item}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          disabled={isPending}
                          onClick={() => handleDeleteMenuItem(index)}
                        >
                          削除
                        </Button>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newMenuItem}
                      onChange={(event) => setNewMenuItem(event.target.value)}
                      placeholder="メニュー項目を追加"
                      className={inputClassName}
                    />
                    <Button
                      type="button"
                      disabled={isPending || !newMenuItem.trim()}
                      onClick={handleAddMenuItem}
                    >
                      追加
                    </Button>
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </PracticeMenuPane>

        <PracticeMenuPane title="動画">
          {selectedSession ? (
            <div className="space-y-4">
              <VideoEmbed videoUrl={selectedSession.videoUrl} />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(event) => setVideoUrlInput(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={inputClassName}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={isPending}
                    onClick={handleSaveVideo}
                  >
                    保存
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending || !selectedSession.videoUrl}
                    onClick={handleDeleteVideo}
                  >
                    削除
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              メニューを選択すると動画を編集できます。
            </p>
          )}
        </PracticeMenuPane>
      </div>
    </div>
  );
}
