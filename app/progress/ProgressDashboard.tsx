'use client';

import { useEffect, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { knowledgeModules } from '../../data/curriculum';
import { guideForInterviewQuestion } from '../../data/interview-guides';
import { interviewRecords } from '../../data/interviews';
import { foundationLessons, lessonsForModule } from '../../data/lessons';
import { mockInterviewTracks } from '../../data/mock-interviews';
import { practiceQuestions } from '../../data/practice';
import { interviewPracticeStorageKey, interviewQuestionKey, type InterviewPracticeProgress } from '../../lib/interview-practice';
import { readLastLearningActivity } from '../../lib/learning-activity';
import { recommendationForMockReport } from '../../lib/mock-interview-recommendation';
import { emptyMockInterviewStorage, mockInterviewStorageKey, type MockInterviewStorage } from '../../lib/mock-interview';
import { sitePath } from '../../lib/site-path';

type QuestionProgress = { attempts?: Array<{ answer?: string; savedAt?: string }> };
type PracticeProgress = Record<string, {
  steps?: Record<string, boolean>;
  questions?: Record<string, QuestionProgress>;
  attempts?: Array<{ answer?: string; savedAt?: string }>;
}>;

type ProgressSummary = {
  lessonsDone: number;
  learningActions: number;
  modulesComplete: number;
  savedAttempts: number;
  structuredAttempts: number;
  interviewAttempts: number;
  followupAttempts: number;
  interviewQuestions: number;
  mockInterviews: number;
  nextTitle: string;
  nextDetail: string;
  nextHref: string;
};

type ModuleProgressRow = {
  id: string;
  order: string;
  title: string;
  cluster: string;
  actions: boolean[];
  lessonsDone: number;
  lessonsTotal: number;
  attempts: number;
  href: string;
};

type RecentAttempt = {
  id: string;
  title: string;
  context: string;
  savedAt: string;
  href: string;
};

const eventDefinitions = [
  { id: 'site_enter', label: '进入站点' },
  { id: 'practice_start', label: '开始题目' },
  { id: 'practice_complete', label: '完成题目' },
  { id: 'lab_open', label: '打开实验' },
] as const;

const emptySummary: ProgressSummary = {
  lessonsDone: 0,
  learningActions: 0,
  modulesComplete: 0,
  savedAttempts: 0,
  structuredAttempts: 0,
  interviewAttempts: 0,
  followupAttempts: 0,
  interviewQuestions: 0,
  mockInterviews: 0,
  nextTitle: foundationLessons[0].title,
  nextDetail: '从第一节站内课建立程序、数学与模型直觉。',
  nextHref: `/lessons/?lesson=${foundationLessons[0].id}`,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
}

export function ProgressDashboard() {
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [moduleRows, setModuleRows] = useState<ModuleProgressRow[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const practice = readJson<PracticeProgress>('llm-interview-lab-progress-v1', {});
    const interviewPractice = readJson<InterviewPracticeProgress>(interviewPracticeStorageKey, {});
    const mockInterview = readJson<MockInterviewStorage>(mockInterviewStorageKey, emptyMockInterviewStorage());
    const lessons = readJson<Record<string, boolean>>('llm-interview-lab-lesson-progress-v1', {});
    const events = readJson<Array<{ event?: string }>>('llm-interview-lab-events-v1', []);
    const lastActivity = readLastLearningActivity();
    const learningActions = knowledgeModules.reduce((total, module) => total + Object.values(practice[module.id]?.steps ?? {}).filter(Boolean).length, 0);
    const modulesComplete = knowledgeModules.filter((module) => ['understand', 'answer', 'build', 'reflect'].every((step) => practice[module.id]?.steps?.[step])).length;
    const structuredAttempts = knowledgeModules.reduce((total, module) => {
      const item = practice[module.id];
      const questionAttempts = Object.values(item?.questions ?? {}).reduce((count, question) => count + (question.attempts?.length ?? 0), 0);
      return total + (questionAttempts || item?.attempts?.length || 0);
    }, 0);
    const interviewAttempts = Object.values(interviewPractice).reduce((total, item) => total + (item.attempts?.length ?? 0), 0);
    const followupAttempts = Object.values(interviewPractice).reduce((total, item) => total + Object.values(item.followups ?? {}).reduce((count, followup) => count + (followup.attempts?.length ?? 0), 0), 0);
    const interviewQuestions = Object.values(interviewPractice).filter((item) => (item.attempts?.length ?? 0) > 0).length;

    const nextModuleRows = knowledgeModules.map((module) => {
      const item = practice[module.id];
      const moduleLessons = lessonsForModule(module.id);
      const questionAttempts = Object.values(item?.questions ?? {}).reduce((count, question) => count + (question.attempts?.length ?? 0), 0);
      const firstQuestion = practiceQuestions.find((question) => question.moduleId === module.id);
      return {
        id: module.id,
        order: module.order,
        title: module.title,
        cluster: module.cluster,
        actions: ['understand', 'answer', 'build', 'reflect'].map((step) => Boolean(item?.steps?.[step])),
        lessonsDone: moduleLessons.filter((lesson) => lessons[lesson.id]).length,
        lessonsTotal: moduleLessons.length,
        attempts: questionAttempts || item?.attempts?.length || 0,
        href: firstQuestion ? `/practice/?module=${module.id}&question=${firstQuestion.id}` : `/learn/#module-${module.id}`,
      };
    });

    const nextRecentAttempts: RecentAttempt[] = [];
    for (const knowledgeModule of knowledgeModules) {
      const item = practice[knowledgeModule.id];
      let hasQuestionAttempts = false;
      for (const [questionId, questionProgress] of Object.entries(item?.questions ?? {})) {
        const question = practiceQuestions.find((candidate) => candidate.id === Number(questionId));
        if (!question) continue;
        for (const attempt of questionProgress.attempts ?? []) {
          if (!attempt.savedAt) continue;
          hasQuestionAttempts = true;
          nextRecentAttempts.push({ id: `practice-${question.id}-${attempt.savedAt}`, title: question.title, context: knowledgeModule.title, savedAt: attempt.savedAt, href: `/practice/?module=${knowledgeModule.id}&question=${question.id}#answer` });
        }
      }
      if (!hasQuestionAttempts) {
        const firstQuestion = practiceQuestions.find((question) => question.moduleId === knowledgeModule.id);
        if (!firstQuestion) continue;
        for (const attempt of item?.attempts ?? []) {
          if (attempt.savedAt) nextRecentAttempts.push({ id: `practice-${firstQuestion.id}-${attempt.savedAt}`, title: firstQuestion.title, context: knowledgeModule.title, savedAt: attempt.savedAt, href: `/practice/?module=${knowledgeModule.id}&question=${firstQuestion.id}#answer` });
        }
      }
    }
    for (const record of interviewRecords) {
      record.prompts.forEach((prompt, promptIndex) => {
        const item = interviewPractice[interviewQuestionKey(record.id, promptIndex)];
        for (const attempt of item?.attempts ?? []) {
          nextRecentAttempts.push({ id: `interview-${record.id}-${promptIndex}-${attempt.savedAt}`, title: prompt, context: `${record.company} · 真实面经`, savedAt: attempt.savedAt, href: `/interviews/?record=${record.id}&prompt=${promptIndex + 1}#question-trainer` });
        }
        const guide = guideForInterviewQuestion(record.id, promptIndex);
        for (const [followupIndex, followupProgress] of Object.entries(item?.followups ?? {})) {
          const followup = guide?.followups[Number(followupIndex)];
          if (!followup) continue;
          for (const attempt of followupProgress.attempts ?? []) {
            nextRecentAttempts.push({ id: `interview-followup-${record.id}-${promptIndex}-${followupIndex}-${attempt.savedAt}`, title: followup, context: `${record.company} · 连续追问`, savedAt: attempt.savedAt, href: `/interviews/?record=${record.id}&prompt=${promptIndex + 1}#question-trainer` });
          }
        }
      });
    }
    nextRecentAttempts.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));

    const nextEventCounts = eventDefinitions.reduce<Record<string, number>>((counts, event) => {
      counts[event.id] = events.filter((item) => item.event === event.id).length;
      return counts;
    }, {});

    let nextTitle = emptySummary.nextTitle;
    let nextDetail = emptySummary.nextDetail;
    let nextHref = emptySummary.nextHref;
    if (lastActivity?.type === 'practice') {
      const question = practiceQuestions.find((item) => item.id === lastActivity.questionId);
      const knowledgeModule = knowledgeModules.find((item) => item.id === lastActivity.moduleId);
      if (question && knowledgeModule) {
        nextTitle = question.title;
        nextDetail = `继续 ${knowledgeModule.title} 的限时作答、答案对照与复盘。`;
        nextHref = `/practice/?module=${knowledgeModule.id}&question=${question.id}#answer`;
      }
    } else if (lastActivity?.type === 'lesson') {
      const lesson = foundationLessons.find((item) => item.id === lastActivity.lessonId);
      const knowledgeModule = knowledgeModules.find((item) => item.id === lastActivity.moduleId);
      if (lesson && knowledgeModule) {
        nextTitle = lesson.title;
        nextDetail = `继续 ${knowledgeModule.title} 的站内课程与检查题。`;
        nextHref = `/lessons/?lesson=${lesson.id}`;
      }
    } else if (lastActivity?.type === 'interview') {
      const record = interviewRecords.find((item) => item.id === lastActivity.recordId);
      const prompt = record?.prompts[lastActivity.promptIndex];
      if (record && prompt) {
        nextTitle = prompt;
        nextDetail = `继续 ${record.company} 面经题的限时作答、自评与追问准备。`;
        nextHref = `/interviews/?record=${record.id}&prompt=${lastActivity.promptIndex + 1}#question-trainer`;
      }
    } else if (lastActivity?.type === 'mock') {
      const track = mockInterviewTracks.find((item) => item.id === lastActivity.trackId);
      if (track) {
        const unfinished = mockInterview.active?.trackId === track.id && mockInterview.active.stage !== 'report';
        const latestReport = [...mockInterview.reports].reverse().find((report) => report.trackId === track.id);
        const recommendation = latestReport ? recommendationForMockReport(latestReport) : null;
        nextTitle = unfinished ? track.title : recommendation ? recommendation.title : track.title;
        nextDetail = unfinished ? '继续未完成的整场模拟与连续追问。' : recommendation ? `${track.title}最近一场优先补“${recommendation.rubricTitle}”；先做单题热身，再进入轮换题单。` : '开始一场 5 道主问题与连续追问。';
        nextHref = '/mock/';
      }
    }

    queueMicrotask(() => {
      setSummary({
        lessonsDone: Object.values(lessons).filter(Boolean).length,
        learningActions,
        modulesComplete,
        savedAttempts: structuredAttempts + interviewAttempts + followupAttempts,
        structuredAttempts,
        interviewAttempts,
        followupAttempts,
        interviewQuestions,
        mockInterviews: mockInterview.reports.length,
        nextTitle,
        nextDetail,
        nextHref,
      });
      setModuleRows(nextModuleRows);
      setRecentAttempts(nextRecentAttempts.slice(0, 5));
      setEventCounts(nextEventCounts);
      setHydrated(true);
    });
  }, []);

  return (
    <main className="progress-page">
      <SiteHeader active="progress" />
      <section className="progress-head">
        <nav className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>我的进度</strong></nav>
        <div className="progress-head-grid">
          <div><p className="eyebrow"><span /> DEVICE-LOCAL LEARNING RECORD</p><h1>知道自己学到了哪，<br /><em>下一步才不会乱。</em></h1><p>课程、题目和四步闭环统一汇总在当前设备。无需注册，也不会上传你的答案正文。</p></div>
          <a className="progress-next-card" href={sitePath(summary.nextHref)}><span>NEXT ACTION</span><h2>{summary.nextTitle}</h2><p>{summary.nextDetail}</p><strong>继续学习 <b>→</b></strong></a>
        </div>
      </section>

      <section className="progress-overview" aria-busy={!hydrated}>
        <div><span>课程完成</span><strong>{summary.lessonsDone}<b> / {foundationLessons.length}</b></strong><p>通过检查题或手动标记的站内课程</p></div>
        <div><span>学习动作</span><strong>{summary.learningActions}<b> / {knowledgeModules.length * 4}</b></strong><p>理解、作答、动手与复盘</p></div>
        <div><span>闭环模块</span><strong>{summary.modulesComplete}<b> / {knowledgeModules.length}</b></strong><p>四个学习动作全部完成的模块</p></div>
        <div><span>保存作答</span><strong>{summary.savedAttempts}<b> 次</b></strong><p>结构题 {summary.structuredAttempts} · 面经主答 {summary.interviewAttempts} · 连续追问 {summary.followupAttempts} · 整场模拟 {summary.mockInterviews}</p></div>
      </section>

      <section className="progress-detail-section">
        <div className="progress-section-head"><div><span>KNOWLEDGE COVERAGE</span><h2>16 个模块，哪里真正做完了闭环？</h2></div><p>四个方格依次表示理解、作答、动手和复盘；课程与历史作答单独显示，不用一个模糊总分掩盖差异。</p></div>
        <div className="progress-detail-layout">
          <div className="progress-module-grid">
            {moduleRows.map((module) => (
              <a className="progress-module-card" href={sitePath(module.href)} key={module.id}>
                <div className="progress-module-meta"><span>{module.order}</span><span>{module.cluster}</span></div>
                <h3>{module.title}</h3>
                <div className="progress-action-dots" aria-label={`${module.actions.filter(Boolean).length} / 4 个学习动作完成`}>
                  {module.actions.map((done, index) => <i className={done ? 'done' : ''} key={index}>{String(index + 1).padStart(2, '0')}</i>)}
                </div>
                <div className="progress-module-facts"><span>课程 {module.lessonsDone}/{module.lessonsTotal || '—'}</span><span>作答 {module.attempts} 次</span><b>继续 →</b></div>
              </a>
            ))}
          </div>

          <aside className="progress-activity-column">
            <section className="progress-recent-panel">
              <div><span>RECENT ANSWERS</span><strong>最近保存的作答</strong></div>
              {recentAttempts.length > 0 ? <ol>{recentAttempts.map((attempt, index) => <li key={attempt.id}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{attempt.context} · {new Date(attempt.savedAt).toLocaleDateString('zh-CN')}</small><a href={sitePath(attempt.href)}>{attempt.title}</a></div></li>)}</ol> : <div className="progress-no-attempts"><strong>还没有保存作答</strong><p>选择一道结构题或面经真题，先留下第一版答案，下一次才能比较进步。</p><a href={sitePath('/interviews/#real-questions')}>去面经真题开始第一题 →</a></div>}
            </section>

            <section className="progress-event-panel">
              <div><span>LOCAL EXPERIENCE EVENTS</span><strong>本机体验轨迹</strong></div>
              <dl>{eventDefinitions.map((event) => <div key={event.id}><dt>{event.label}</dt><dd>{eventCounts[event.id] ?? 0}</dd></div>)}</dl>
              <p>这里只显示当前浏览器最近 100 条事件，用于检查自己的学习闭环；它不是全站用户分析。</p>
            </section>
          </aside>
        </div>
      </section>

      <section className="progress-empty-note">
        <span>ABOUT THIS VIEW</span><p>这里反映的是你的个人学习记录，不是全站访问统计。换设备前，可在学习闭环中导出完整备份。</p><a href={sitePath('/practice/')}>进入学习闭环与备份工具 →</a>
      </section>
      <SiteFooter />
    </main>
  );
}
