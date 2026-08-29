export const mockInterviewStorageKey = 'llm-interview-lab-mock-interview-v1';

export type MockAnswer = {
  mainDraft?: string;
  mainSavedAt?: string;
  mainRubric?: boolean[];
  followupDraft?: string;
  followupSavedAt?: string;
};

export type MockSessionStage = 'main' | 'followup' | 'report';

export type MockSession = {
  id: string;
  trackId: string;
  startedAt: string;
  currentIndex: number;
  stage: MockSessionStage;
  answers: Record<string, MockAnswer>;
};

export type MockReport = {
  id: string;
  trackId: string;
  completedAt: string;
  mainCompleted: number;
  followupsCompleted: number;
  averageMainLength: number;
  averageFollowupLength: number;
  rubricCounts: number[];
};

export type MockInterviewStorage = {
  active?: MockSession;
  reports: MockReport[];
};

export function emptyMockInterviewStorage(): MockInterviewStorage {
  return { reports: [] };
}
