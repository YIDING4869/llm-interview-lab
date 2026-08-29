export const lastLearningActivityKey = 'llm-interview-lab-last-activity-v1';

export type LastLearningActivity =
  | { type: 'practice'; moduleId: string; questionId: number; updatedAt: string }
  | { type: 'lesson'; moduleId: string; lessonId: string; updatedAt: string }
  | { type: 'interview'; recordId: string; promptIndex: number; updatedAt: string }
  | { type: 'mock'; trackId: string; updatedAt: string };

type ActivityInput =
  | Omit<Extract<LastLearningActivity, { type: 'practice' }>, 'updatedAt'>
  | Omit<Extract<LastLearningActivity, { type: 'lesson' }>, 'updatedAt'>
  | Omit<Extract<LastLearningActivity, { type: 'interview' }>, 'updatedAt'>
  | Omit<Extract<LastLearningActivity, { type: 'mock' }>, 'updatedAt'>;

export function saveLastLearningActivity(activity: ActivityInput) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(lastLearningActivityKey, JSON.stringify({
    ...activity,
    updatedAt: new Date().toISOString(),
  }));
}

export function readLastLearningActivity(): LastLearningActivity | null {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem(lastLearningActivityKey);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as LastLearningActivity;
    if (parsed.type === 'practice' && typeof parsed.moduleId === 'string' && typeof parsed.questionId === 'number') return parsed;
    if (parsed.type === 'lesson' && typeof parsed.moduleId === 'string' && typeof parsed.lessonId === 'string') return parsed;
    if (parsed.type === 'interview' && typeof parsed.recordId === 'string' && typeof parsed.promptIndex === 'number') return parsed;
    if (parsed.type === 'mock' && typeof parsed.trackId === 'string') return parsed;
  } catch {
    window.localStorage.removeItem(lastLearningActivityKey);
  }
  return null;
}
