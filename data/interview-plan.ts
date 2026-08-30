import { knowledgeModules } from './curriculum';
import { foundationLessons } from './lessons';
import { practiceQuestions } from './practice';

export const interviewPlanStorageKey = 'llm-interview-lab-countdown-plan-v1';

export type InterviewPlanIntensity = 20 | 45 | 90;
export type InterviewPlanPhase = 'foundation' | 'drill' | 'mock' | 'review' | 'sprint';

export type InterviewPlanSettings = {
  trackId: string;
  targetDate: string;
  dailyMinutes: InterviewPlanIntensity;
  createdDate: string;
  completedTaskIds: string[];
};

export type InterviewPlanTask = {
  id: string;
  title: string;
  detail: string;
  href: string;
  minutes: number;
};

export type InterviewPlanDay = {
  date: string;
  phase: InterviewPlanPhase;
  phaseLabel: string;
  tasks: InterviewPlanTask[];
};

type TrackBlueprint = {
  moduleIds: string[];
  labTitle: string;
  labHref: string;
};

export const interviewPlanPhaseMeta: Record<InterviewPlanPhase, { label: string; description: string }> = {
  foundation: { label: '基础补齐', description: '用课程和可视化把目标岗位的关键机制串起来。' },
  drill: { label: '专项作答', description: '从单题限时表达进入真实面经和连续追问。' },
  mock: { label: '整场模拟', description: '练完整节奏，并用本机复盘定位反复出现的弱项。' },
  review: { label: '最后复盘', description: '收紧项目证据、边界和高频错误，不再铺新知识。' },
  sprint: { label: '紧急冲刺', description: '剩余三天以内，只保留模拟、证据链和明显弱项。' },
};

const trackBlueprints: Record<string, TrackBlueprint> = {
  foundation: { moduleIds: ['lm-basics', 'transformer', 'finetune', 'pretraining', 'reasoning'], labTitle: 'Transformer Forward 实验', labHref: '/labs/?lab=transformer' },
  'rag-agent': { moduleIds: ['transformer', 'rag', 'agent', 'evaluation', 'project'], labTitle: '检索与重排实验', labHref: '/labs/?lab=retrieval' },
  infra: { moduleIds: ['transformer', 'inference', 'evaluation', 'project'], labTitle: 'KV Cache 实验', labHref: '/labs/?lab=kv' },
  multimodal: { moduleIds: ['transformer', 'multimodal', 'evaluation', 'project'], labTitle: '跨模态 Attention 实验', labHref: '/labs/?lab=attention' },
  project: { moduleIds: ['project', 'evaluation', 'transformer', 'inference', 'rag'], labTitle: 'Attention 计算实验', labHref: '/labs/?lab=attention' },
};

function parseLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function formatLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayLocalIsoDate() {
  return formatLocalIsoDate(new Date());
}

export function addDaysToIsoDate(value: string, days: number) {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + days);
  return formatLocalIsoDate(date);
}

export function daysBetweenIsoDates(start: string, end: string) {
  return Math.round((parseLocalDate(end).getTime() - parseLocalDate(start).getTime()) / 86_400_000);
}

function phaseForDate(settings: InterviewPlanSettings, date: string): InterviewPlanPhase {
  const totalDays = Math.max(daysBetweenIsoDates(settings.createdDate, settings.targetDate), 1);
  const elapsedDays = Math.max(daysBetweenIsoDates(settings.createdDate, date), 0);
  const remainingDays = daysBetweenIsoDates(date, settings.targetDate);
  if (totalDays <= 3) return 'sprint';
  if (remainingDays <= 1) return 'review';
  const progress = elapsedDays / totalDays;
  if (progress < 0.28) return 'foundation';
  if (progress < 0.63) return 'drill';
  if (progress < 0.88) return 'mock';
  return 'review';
}

function taskCandidates(settings: InterviewPlanSettings, date: string, phase: InterviewPlanPhase): Omit<InterviewPlanTask, 'id' | 'minutes'>[] {
  const blueprint = trackBlueprints[settings.trackId] ?? trackBlueprints.foundation;
  const dayIndex = Math.max(daysBetweenIsoDates(settings.createdDate, date), 0);
  const moduleId = blueprint.moduleIds[dayIndex % blueprint.moduleIds.length];
  const knowledgeModule = knowledgeModules.find((item) => item.id === moduleId) ?? knowledgeModules[0];
  const lesson = foundationLessons.find((item) => item.moduleId === moduleId) ?? foundationLessons[0];
  const question = practiceQuestions.find((item) => item.moduleId === moduleId) ?? practiceQuestions[0];
  const projectLesson = foundationLessons.find((item) => item.id === 'project-evidence-story') ?? foundationLessons.at(-1)!;

  if (phase === 'foundation') return [
    { title: `学习：${lesson.title}`, detail: `${knowledgeModule.title} · 先理解再作答`, href: `/lessons/${lesson.id}/` },
    { title: `动手：${blueprint.labTitle}`, detail: '把关键计算或系统状态跑一遍', href: blueprint.labHref },
    { title: `限时作答：${question.title}`, detail: '保存第一版，再对照答案结构', href: `/practice/?module=${moduleId}&question=${question.id}#answer` },
  ];

  if (phase === 'drill') return [
    { title: `专项作答：${question.title}`, detail: `${knowledgeModule.title} · 限时表达`, href: `/practice/?module=${moduleId}&question=${question.id}#answer` },
    { title: '真实面经单题与连续追问', detail: '从岗位真题中选择一题完成主答和追问', href: '/interviews/#real-questions' },
    { title: `补课：${lesson.title}`, detail: '只回看作答中暴露出的机制缺口', href: `/lessons/${lesson.id}/` },
  ];

  if (phase === 'mock') return [
    { title: '完成一场 12 分钟模拟面试', detail: '5 道主问题 · 5 道连续追问', href: `/mock/?track=${settings.trackId}` },
    { title: '查看复盘与最近三场自评趋势', detail: '只选择一个反复弱项进入下一场', href: '/mock/' },
    { title: `整理：${projectLesson.title}`, detail: '把模拟中的薄弱回答补成证据链', href: `/lessons/${projectLesson.id}/` },
  ];

  if (phase === 'review') return [
    { title: `速查：${projectLesson.title}`, detail: '收紧个人贡献、指标、badcase 和边界', href: `/lessons/${projectLesson.id}/` },
    { title: '最后一场完整模拟', detail: '按真实时间完成，不在中途补新知识', href: `/mock/?track=${settings.trackId}` },
    { title: '查看本机进度与最近作答', detail: '只复盘明显错误，不再扩大范围', href: '/progress/' },
  ];

  return [
    { title: '立即完成一场模拟面试', detail: '先暴露最明显的表达缺口', href: `/mock/?track=${settings.trackId}` },
    { title: '补一题真实面经和追问', detail: '只练模拟中最弱的一项', href: '/interviews/#real-questions' },
    { title: `收口：${projectLesson.title}`, detail: '准备一条能经受追问的项目证据链', href: `/lessons/${projectLesson.id}/` },
  ];
}

export function buildInterviewPlanDays(settings: InterviewPlanSettings, startDate = todayLocalIsoDate(), limit = 7): InterviewPlanDay[] {
  const remainingDays = Math.max(daysBetweenIsoDates(startDate, settings.targetDate), 0);
  const slots = settings.dailyMinutes === 20 ? [20] : settings.dailyMinutes === 45 ? [25, 20] : [30, 30, 30];
  return Array.from({ length: Math.min(limit, remainingDays + 1) }, (_, dayOffset) => {
    const date = addDaysToIsoDate(startDate, dayOffset);
    const phase = phaseForDate(settings, date);
    const candidates = taskCandidates(settings, date, phase);
    return {
      date,
      phase,
      phaseLabel: interviewPlanPhaseMeta[phase].label,
      tasks: slots.map((minutes, index) => ({ ...candidates[index], minutes, id: `${date}:${phase}:${index}` })),
    };
  });
}
