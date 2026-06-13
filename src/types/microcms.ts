export type MicroCMSEventField = {
  name: string;
  order?: number;
};

export type MicroCMSPurposeGroup = {
  event: string;
  purposes: { name: string }[];
};

export type MicroCMSMenuSettings = {
  events: MicroCMSEventField[];
  purposeGroups: MicroCMSPurposeGroup[];
};

export type MicroCMSPracticeSession = {
  sessionId: string;
  event: string;
  purpose: string;
  menuLabel?: string;
  menuItems: { text: string }[];
  menuPoints: { text: string }[];
  videoUrl?: string;
};

export type MicroCMSPracticeSessionContent = MicroCMSPracticeSession & {
  id: string;
};

export type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};
