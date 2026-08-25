'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { entryRoutes, knowledgeModules, learningResources } from '../../data/curriculum';
import { lessonsForModule } from '../../data/lessons';
import { practiceQuestions } from '../../data/practice';
import { sitePath } from '../../lib/site-path';

const stepDefinitions = [
  { id: 'understand', number: '01', label: '理解', detail: '概念与前置' },
  { id: 'answer', number: '02', label: '作答', detail: '限时表达' },
  { id: 'build', number: '03', label: '动手', detail: '最小证据' },
  { id: 'reflect', number: '04', label: '复盘', detail: '自己的语言' },
] as const;

type StepId = (typeof stepDefinitions)[number]['id'];
type SavedAttempt = { answer: string; savedAt: string };
type ProgressRecord = Record<string, {
  steps?: Partial<Record<StepId, boolean>>;
  note?: string;
  answerDraft?: string;
  attempts?: SavedAttempt[];
  rubric?: boolean[];
}>;

const storageKey = 'llm-interview-lab-progress-v1';

function secondsForQuestion(time: string) {
  const minutes = time.match(/(\d+)\s*分钟/);
  if (minutes) return Number(minutes[1]) * 60;
  const seconds = time.match(/(\d+)\s*秒/);
  return seconds ? Number(seconds[1]) : 90;
}

function formatCountdown(total: number) {
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}

function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PracticeWorkspace() {
  const [activeRouteId, setActiveRouteId] = useState(entryRoutes[0].id);
  const [activeModuleId, setActiveModuleId] = useState(entryRoutes[0].sequence[0]);
  const [progress, setProgress] = useState<ProgressRecord>({});
  const [hydrated, setHydrated] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [answerStatus, setAnswerStatus] = useState('回答草稿会自动保存在此设备');
  const [transferStatus, setTransferStatus] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setProgress(JSON.parse(saved) as ProgressRecord);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    const requestedModule = new URLSearchParams(window.location.search).get('module');
    if (requestedModule && knowledgeModules.some((module) => module.id === requestedModule)) {
      setActiveModuleId(requestedModule);
      const matchingRoute = entryRoutes.find((route) => route.sequence.includes(requestedModule));
      if (matchingRoute) setActiveRouteId(matchingRoute.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [hydrated, progress]);

  const activeRoute = entryRoutes.find((route) => route.id === activeRouteId) ?? entryRoutes[0];
  const routeModules = activeRoute.sequence.map((id) => knowledgeModules.find((module) => module.id === id)).filter(Boolean);
  const activeModule = knowledgeModules.find((module) => module.id === activeModuleId) ?? knowledgeModules[0];
  const question = practiceQuestions.find((item) => item.moduleId === activeModule.id) ?? practiceQuestions[0];
  const moduleResources = learningResources.filter((resource) => question.resourceIds.includes(resource.id));
  const moduleLessons = lessonsForModule(activeModule.id);
  const activeSteps = progress[activeModule.id]?.steps ?? {};
  const finishedSteps = stepDefinitions.filter((step) => activeSteps[step.id]).length;
  const answerDraft = progress[activeModule.id]?.answerDraft ?? '';
  const attempts = progress[activeModule.id]?.attempts ?? [];
  const rubric = progress[activeModule.id]?.rubric ?? [];

  useEffect(() => {
    setSecondsLeft(secondsForQuestion(question.time));
    setTimerRunning(false);
    setAnswerStatus('回答草稿会自动保存在此设备');
  }, [question.id, question.time]);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const routeProgress = useMemo(() => {
    const completedSteps = activeRoute.sequence.reduce((total, moduleId) => {
      const moduleSteps = progress[moduleId]?.steps ?? {};
      return total + stepDefinitions.filter((step) => moduleSteps[step.id]).length;
    }, 0);
    return {
      completedSteps,
      totalSteps: activeRoute.sequence.length * stepDefinitions.length,
      percent: Math.round((completedSteps / (activeRoute.sequence.length * stepDefinitions.length)) * 100),
      completeModules: activeRoute.sequence.filter((moduleId) => stepDefinitions.every((step) => progress[moduleId]?.steps?.[step.id])).length,
    };
  }, [activeRoute, progress]);

  const setRoute = (routeId: (typeof entryRoutes)[number]['id']) => {
    const route = entryRoutes.find((item) => item.id === routeId) ?? entryRoutes[0];
    setActiveRouteId(route.id);
    if (!route.sequence.includes(activeModuleId)) {
      const nextIncomplete = route.sequence.find((moduleId) => !stepDefinitions.every((step) => progress[moduleId]?.steps?.[step.id]));
      setActiveModuleId(nextIncomplete ?? route.sequence[0]);
    }
  };

  const toggleStep = (stepId: StepId) => {
    setProgress((current) => ({
      ...current,
      [activeModule.id]: {
        ...current[activeModule.id],
        steps: {
          ...current[activeModule.id]?.steps,
          [stepId]: !current[activeModule.id]?.steps?.[stepId],
        },
      },
    }));
  };

  const setNote = (note: string) => {
    setProgress((current) => ({
      ...current,
      [activeModule.id]: { ...current[activeModule.id], note },
    }));
  };

  const setAnswerDraft = (answerDraft: string) => {
    setProgress((current) => ({
      ...current,
      [activeModule.id]: { ...current[activeModule.id], answerDraft },
    }));
  };

  const saveAttempt = () => {
    const answer = answerDraft.trim();
    if (!answer) return;
    const attempt = { answer, savedAt: new Date().toISOString() };
    setProgress((current) => ({
      ...current,
      [activeModule.id]: {
        ...current[activeModule.id],
        steps: { ...current[activeModule.id]?.steps, answer: true },
        attempts: [...(current[activeModule.id]?.attempts ?? []), attempt].slice(-8),
      },
    }));
    setAnswerStatus(`已保存第 ${attempts.length + 1} 次作答，可以对照必答点复盘`);
    setTimerRunning(false);
  };

  const toggleRubric = (index: number) => {
    setProgress((current) => {
      const nextRubric = [...(current[activeModule.id]?.rubric ?? [])];
      nextRubric[index] = !nextRubric[index];
      return { ...current, [activeModule.id]: { ...current[activeModule.id], rubric: nextRubric } };
    });
  };

  const exportProgress = (format: 'json' | 'md') => {
    if (format === 'json') {
      downloadText('llm-interview-lab-progress.json', JSON.stringify(progress, null, 2), 'application/json');
    } else {
      const markdown = knowledgeModules.map((module) => {
        const item = progress[module.id];
        const completed = stepDefinitions.filter((step) => item?.steps?.[step.id]).map((step) => step.label).join('、') || '无';
        const latestAnswer = item?.attempts?.at(-1)?.answer;
        return `## ${module.order} ${module.title}\n\n- 已完成：${completed}\n\n### 最近作答\n\n${latestAnswer || '暂无'}\n\n### 复盘\n\n${item?.note || '暂无'}`;
      }).join('\n\n---\n\n');
      downloadText('llm-interview-lab-notes.md', `# LLM Interview Lab 学习记录\n\n${markdown}\n`, 'text/markdown');
    }
    setTransferStatus(`已导出 ${format === 'json' ? '可恢复备份' : 'Markdown 笔记'}`);
  };

  const importProgress = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid');
      setProgress(parsed as ProgressRecord);
      setTransferStatus('已恢复学习进度和 Notes');
    } catch {
      setTransferStatus('无法导入：请选择本站导出的 JSON 备份');
    }
  };

  const activeIndex = activeRoute.sequence.indexOf(activeModule.id);
  const nextModuleId = activeIndex >= 0 ? activeRoute.sequence[activeIndex + 1] : undefined;
  const nextModule = knowledgeModules.find((module) => module.id === nextModuleId);

  return (
    <main className="practice-page">
      <SiteHeader active="practice" />

      <section className="loop-hero">
        <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>学习闭环</strong></div>
        <div className="loop-hero-grid">
          <div>
            <p className="eyebrow"><span /> LEARN · ANSWER · BUILD · REFLECT</p>
            <h1>一次只完成一个模块，<br /><em>但要留下四种证据。</em></h1>
            <p>读懂不等于会答，会答不等于会做。每个模块都经过理解、限时作答、动手验证和个人复盘，进度只保存在当前设备。</p>
          </div>
          <div className="loop-progress-card">
            <div><span>CURRENT PATH</span><strong>{activeRoute.title}</strong></div>
            <div className="loop-progress-number"><strong>{routeProgress.percent}%</strong><span>{routeProgress.completedSteps} / {routeProgress.totalSteps} learning actions</span></div>
            <div className="loop-progress-track"><span style={{ width: `${routeProgress.percent}%` }} /></div>
            <p><b>{routeProgress.completeModules}</b> / {activeRoute.sequence.length} 个模块完成全部四步</p>
            <div className="progress-transfer-actions">
              <button type="button" onClick={() => exportProgress('md')}>导出 Notes.md</button>
              <button type="button" onClick={() => exportProgress('json')}>备份进度</button>
              <button type="button" onClick={() => importRef.current?.click()}>恢复进度</button>
              <input ref={importRef} type="file" accept="application/json,.json" onChange={(event) => void importProgress(event.target.files?.[0])} />
            </div>
            {transferStatus && <small className="progress-transfer-status" aria-live="polite">{transferStatus}</small>}
          </div>
        </div>
      </section>

      <section className="loop-workspace" id="workspace">
        <aside className="loop-sidebar">
          <div className="loop-route-switcher">
            <span>选择学习路线</span>
            {entryRoutes.map((route) => <button className={activeRoute.id === route.id ? 'active' : ''} type="button" key={route.id} onClick={() => setRoute(route.id)}><small>{route.label}</small><strong>{route.title}</strong></button>)}
          </div>
          <div className="loop-module-list">
            <span>路线模块</span>
            {routeModules.map((module) => {
              if (!module) return null;
              const moduleDone = stepDefinitions.filter((step) => progress[module.id]?.steps?.[step.id]).length;
              return <button className={activeModule.id === module.id ? 'active' : ''} type="button" key={module.id} onClick={() => setActiveModuleId(module.id)}><i>{module.order}</i><span><strong>{module.title}</strong><small>{module.cluster}</small></span><b className={moduleDone === 4 ? 'complete' : ''}>{moduleDone === 4 ? '✓' : `${moduleDone}/4`}</b></button>;
            })}
          </div>
        </aside>

        <div className="module-cockpit">
          <header className="cockpit-head">
            <div><span>MODULE {activeModule.order} · {activeModule.cluster} · {activeModule.level}</span><h2>{activeModule.title}</h2><p>{activeModule.summary}</p></div>
            <div className="module-score"><strong>{finishedSteps}/4</strong><span>本模块进度</span></div>
          </header>

          <div className="loop-step-rail" aria-label="模块学习步骤">
            {stepDefinitions.map((step) => <button className={activeSteps[step.id] ? 'done' : ''} type="button" key={step.id} onClick={() => toggleStep(step.id)} aria-pressed={Boolean(activeSteps[step.id])}><span>{activeSteps[step.id] ? '✓' : step.number}</span><strong>{step.label}</strong><small>{step.detail}</small></button>)}
          </div>

          <section className="loop-panel understand-panel">
            <div className="loop-panel-label"><span>01</span><strong>理解 / UNDERSTAND</strong></div>
            <div className="understand-grid">
              <div><span>前置知识</span><p>{activeModule.prerequisites.join(' · ')}</p></div>
              <div><span>核心概念</span><ul>{activeModule.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ul></div>
              <div><span>完成产物</span><p>{activeModule.output}</p></div>
            </div>
            <div className="loop-panel-actions">{moduleLessons[0] && <a href={sitePath(`/lessons/?lesson=${moduleLessons[0].id}`)}>先学习 {moduleLessons.length} 节站内基础课 →</a>}<a href={sitePath(`/learn/#module-${activeModule.id}`)}>查看知识树中的模块 →</a>{moduleResources.map((resource) => <a href={resource.href} target="_blank" rel="noreferrer" key={resource.id}>{resource.title} ↗</a>)}</div>
          </section>

          <section className="loop-panel answer-practice-panel">
            <div className="loop-panel-label"><span>02</span><strong>作答 / ANSWER</strong></div>
            <div className="checkpoint-question"><div><span>{question.category} · {question.difficulty}</span><b>{question.time}</b></div><h3>{question.title}</h3><p><strong>提示：</strong>{question.hint}</p></div>
            <div className="answer-recorder">
              <div className="answer-recorder-head"><span>YOUR ANSWER</span><strong>{formatCountdown(secondsLeft)}</strong></div>
              <textarea value={answerDraft} onChange={(event) => setAnswerDraft(event.target.value)} placeholder="先关掉标准答案，用自己的语言写下：定义 → 原理 → 取舍 → 场景。" />
              <div className="answer-recorder-actions">
                <button type="button" onClick={() => {
                  if (secondsLeft === 0) {
                    setSecondsLeft(secondsForQuestion(question.time));
                    setTimerRunning(true);
                  } else {
                    setTimerRunning((running) => !running);
                  }
                }}>{secondsLeft === 0 ? '重新计时' : timerRunning ? '暂停' : '开始计时'}</button>
                <button type="button" className="save-attempt" disabled={!answerDraft.trim()} onClick={saveAttempt}>保存本次作答</button>
                <span aria-live="polite">{answerStatus}</span>
              </div>
            </div>
            {attempts.length > 0 && <details className="attempt-history"><summary>查看历史作答 · {attempts.length} 次 <span>＋</span></summary><ol>{[...attempts].reverse().map((attempt, index) => <li key={`${attempt.savedAt}-${index}`}><span>{new Date(attempt.savedAt).toLocaleString('zh-CN')}</span><p>{attempt.answer}</p></li>)}</ol></details>}
            <details className="answer-reveal"><summary>完成限时作答后，查看答案结构 <span>＋</span></summary><div><p>{question.answer}</p><strong>必答点 · 点击完成自评</strong><ul className="answer-rubric">{question.points.map((point, index) => <li key={point}><button type="button" className={rubric[index] ? 'checked' : ''} aria-pressed={Boolean(rubric[index])} onClick={() => toggleRubric(index)}><span>{rubric[index] ? '✓' : String(index + 1).padStart(2, '0')}</span>{point}</button></li>)}</ul><aside><span>FOLLOW-UP</span><p>{question.followup}</p></aside></div></details>
            <div className="loop-panel-actions"><a href={sitePath(`/?question=${question.id}#question-bank`)}>在完整题库中打开 Q{question.id.toString().padStart(2, '0')} →</a></div>
          </section>

          <section className="loop-panel build-panel">
            <div className="loop-panel-label"><span>03</span><strong>动手 / BUILD</strong></div>
            <div className="build-brief"><span>MINI PROJECT</span><h3>{question.task.title}</h3><p>{question.task.brief}</p></div>
            <ol>{question.task.steps.map((step, index) => <li key={step}><span>{(index + 1).toString().padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
            <div className="evidence-box"><span>完成证据</span><strong>{question.task.evidence}</strong></div>
            {question.labHref && <div className="loop-panel-actions"><a href={sitePath(question.labHref)}>打开站内可视化实验 →</a></div>}
          </section>

          <section className="loop-panel reflect-panel">
            <div className="loop-panel-label"><span>04</span><strong>复盘 / REFLECT</strong></div>
            <blockquote>{question.notePrompt}</blockquote>
            <label><span>MODULE_{activeModule.order}_NOTES.md</span><small>自动保存在此设备</small><textarea value={progress[activeModule.id]?.note ?? ''} onChange={(event) => setNote(event.target.value)} placeholder={'- 我已经能讲清楚：\n- 我仍然含糊的地方：\n- 我的证据：\n- 下一次要回答的追问：'} /></label>
          </section>

          <div className="module-next-row">
            <span>{finishedSteps === 4 ? '本模块闭环已完成。' : `还差 ${4 - finishedSteps} 个动作完成本模块。`}</span>
            {nextModule ? <button type="button" onClick={() => setActiveModuleId(nextModule.id)}>下一个：{nextModule.title} →</button> : <a href={sitePath('/learn/')}>回到完整知识地图 →</a>}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
