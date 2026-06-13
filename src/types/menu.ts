export type PracticeSession = {
  id: string;
  event: string;
  purpose: string;
  menuLabel?: string;
  menu: {
    items: string[];
    points: string[];
  };
  videoUrl?: string;
};

export type PracticeMenuData = {
  events: string[];
  purposesByEvent: Record<string, string[]>;
  sessions: PracticeSession[];
};
