'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { guideForInterviewQuestion, interviewGuideCount, interviewGuideCountForTrack, interviewGuideTracks, type InterviewGuideTrack } from '../../data/interview-guides';
import { interviewFocuses, interviewPromptCount, interviewRecords, type InterviewFocus } from '../../data/interviews';
import { trackEvent } from '../../lib/analytics';
import { answerFrameForQuestion, interviewAnswerRubric, interviewPracticeStorageKey, interviewQuestionKey, type InterviewPracticeProgress } from '../../lib/interview-practice';
import { saveLastLearningActivity } from '../../lib/learning-activity';
import { sitePath } from '../../lib/site-path';

const interviewQuestions = interviewRecords.flatMap((record) => record.prompts.map((prompt, promptIndex) => ({ record, prompt, promptIndex })));
const practiceFilters = ['全部', '待练', '已练'] as const;
const guideFilters: Array<'全部题目' | InterviewGuideTrack> = ['全部题目', ...interviewGuideTracks];

function formatCountdown(total: number) {
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}

export function InterviewLibrary() {
  const [focus, setFocus] = useState<'全部' | InterviewFocus>('全部');
  const [query, setQuery] = useState('');
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [guideFilter, setGuideFilter] = useState<(typeof guideFilters)[number]>('全部题目');
  const [practiceFilter, setPracticeFilter] = useState<(typeof practiceFilters)[number]>('全部');
  const [practiceProgress, setPracticeProgress] = useState<InterviewPracticeProgress>({});
  const [activeQuestionKey, setActiveQuestionKey] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [practiceStatus, setPracticeStatus] = useState('草稿自动保存在当前设备');
  const [activeFollowupIndex, setActiveFollowupIndex] = useState<number | null>(null);
  const [followupSecondsLeft, setFollowupSecondsLeft] = useState(60);
  const [followupTimerRunning, setFollowupTimerRunning] = useState(false);
  const [followupStatus, setFollowupStatus] = useState('选择一个追问，开始第二轮作答');
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const trainerRef = useRef<HTMLElement>(null);
  const followupRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(interviewPracticeStorageKey);
    const params = new URLSearchParams(window.location.search);
    const recordId = params.get('record');
    const promptIndex = Number(params.get('prompt')) - 1;
    const requestedQuestion = interviewQuestions.find((item) => item.record.id === recordId && item.promptIndex === promptIndex);
    queueMicrotask(() => {
      if (saved) {
        try {
          setPracticeProgress(JSON.parse(saved) as InterviewPracticeProgress);
        } catch {
          window.localStorage.removeItem(interviewPracticeStorageKey);
        }
      }
      if (requestedQuestion) setActiveQuestionKey(interviewQuestionKey(requestedQuestion.record.id, requestedQuestion.promptIndex));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(interviewPracticeStorageKey, JSON.stringify(practiceProgress));
  }, [hydrated, practiceProgress]);

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

  useEffect(() => {
    if (!followupTimerRunning) return;
    const timer = window.setInterval(() => {
      setFollowupSecondsLeft((current) => {
        if (current <= 1) {
          setFollowupTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [followupTimerRunning]);

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return interviewRecords.filter((record) => {
      const matchesFocus = focus === '全部' || record.focuses.includes(focus);
      const text = `${record.company} ${record.role} ${record.campaign} ${record.summary} ${record.themes.join(' ')} ${record.prompts.join(' ')}`.toLowerCase();
      return matchesFocus && (!normalized || text.includes(normalized));
    });
  }, [focus, query]);

  const matchingQuestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return interviewQuestions.filter(({ record, prompt, promptIndex }) => {
      const matchesFocus = focus === '全部' || record.focuses.includes(focus);
      const text = `${record.company} ${record.role} ${record.themes.join(' ')} ${prompt}`.toLowerCase();
      const guide = guideForInterviewQuestion(record.id, promptIndex);
      const matchesGuide = guideFilter === '全部题目' || guide?.track === guideFilter;
      return matchesFocus && matchesGuide && (!normalized || text.includes(normalized));
    });
  }, [focus, guideFilter, query]);

  const filteredQuestions = useMemo(() => matchingQuestions.filter(({ record, promptIndex }) => {
    const practiced = (practiceProgress[interviewQuestionKey(record.id, promptIndex)]?.attempts?.length ?? 0) > 0;
    return practiceFilter === '全部' || (practiceFilter === '已练' ? practiced : !practiced);
  }), [matchingQuestions, practiceFilter, practiceProgress]);

  const visibleQuestions = showAllQuestions ? filteredQuestions : filteredQuestions.slice(0, 12);
  const activeQuestion = interviewQuestions.find((item) => interviewQuestionKey(item.record.id, item.promptIndex) === activeQuestionKey);
  const activeProgress = activeQuestionKey ? practiceProgress[activeQuestionKey] ?? {} : {};
  const practicedQuestionCount = Object.values(practiceProgress).filter((item) => (item.attempts?.length ?? 0) > 0).length;
  const savedAttemptCount = Object.values(practiceProgress).reduce((total, item) => total + (item.attempts?.length ?? 0), 0);
  const savedFollowupAttemptCount = Object.values(practiceProgress).reduce((total, item) => total + Object.values(item.followups ?? {}).reduce((count, followup) => count + (followup.attempts?.length ?? 0), 0), 0);
  const matchingPracticedCount = matchingQuestions.filter(({ record, promptIndex }) => (practiceProgress[interviewQuestionKey(record.id, promptIndex)]?.attempts?.length ?? 0) > 0).length;
  const nextUnpracticedQuestion = matchingQuestions.find(({ record, promptIndex }) => (practiceProgress[interviewQuestionKey(record.id, promptIndex)]?.attempts?.length ?? 0) === 0);
  const activeGuide = activeQuestion ? guideForInterviewQuestion(activeQuestion.record.id, activeQuestion.promptIndex) : null;
  const activeAnswerFrame = activeGuide?.track === '项目深挖'
    ? { focus: '项目深挖', frame: '问题与约束 → 本人贡献 → baseline 与干预 → 指标证据 → badcase 与边界' }
    : activeQuestion ? answerFrameForQuestion(activeQuestion.record, activeQuestion.prompt) : null;
  const activeAnswerPlaceholder = activeGuide?.track === '项目深挖'
    ? '先给项目结论，再补：\n1. 问题、约束和本人职责\n2. baseline、关键干预与为什么这样选\n3. 指标证据、badcase 和仍未验证的边界'
    : '先直接回答，再补：\n1. 输入与关键机制\n2. 收益、代价和适用条件\n3. 指标、项目证据或失败边界';
  const activeAttempts = activeProgress.attempts ?? [];
  const activeFollowupProgress = activeFollowupIndex === null ? undefined : activeProgress.followups?.[String(activeFollowupIndex)];
  const activeFollowupAttempts = activeFollowupProgress?.attempts ?? [];
  const previousAttempt = activeAttempts.at(-2);
  const latestAttempt = activeAttempts.at(-1);
  const previousScore = previousAttempt?.rubric.filter(Boolean).length ?? 0;
  const latestScore = latestAttempt?.rubric.filter(Boolean).length ?? 0;

  const startQuestion = (recordId: string, promptIndex: number) => {
    const key = interviewQuestionKey(recordId, promptIndex);
    const question = interviewQuestions.find((item) => interviewQuestionKey(item.record.id, item.promptIndex) === key);
    if (!question) return;
    const questionProgress = practiceProgress[key];
    const hasSavedAttempt = (questionProgress?.attempts?.length ?? 0) > 0;
    const hasDraft = Boolean(questionProgress?.draft?.trim());
    setActiveQuestionKey(key);
    setActiveFollowupIndex(null);
    setFollowupTimerRunning(false);
    setCalibrationOpen(false);
    setSecondsLeft(90);
    setTimerRunning(!hasSavedAttempt && !hasDraft);
    setPracticeStatus(hasSavedAttempt ? '已载入历史答案；清空草稿后再开始独立复答' : hasDraft ? '已载入未完成草稿，可继续计时' : '90 秒计时已开始，先完成第一版');
    saveLastLearningActivity({ type: 'interview', recordId, promptIndex });
    if (!hasSavedAttempt && !hasDraft) trackEvent('practice_start', { surface: 'interview', record_id: recordId, prompt_index: promptIndex + 1 });
    const url = new URL(window.location.href);
    url.searchParams.set('record', recordId);
    url.searchParams.set('prompt', String(promptIndex + 1));
    url.hash = 'question-trainer';
    window.history.replaceState({}, '', url);
    queueMicrotask(() => trainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const beginFreshAttempt = () => {
    if (!activeQuestion || !activeQuestionKey) return;
    setPracticeProgress((current) => ({
      ...current,
      [activeQuestionKey]: { ...current[activeQuestionKey], draft: '', rubric: [] },
    }));
    setSecondsLeft(90);
    setTimerRunning(true);
    setActiveFollowupIndex(null);
    setFollowupTimerRunning(false);
    setCalibrationOpen(false);
    setPracticeStatus('新一轮已开始：旧答案保留在历史中，当前草稿已清空');
    saveLastLearningActivity({ type: 'interview', recordId: activeQuestion.record.id, promptIndex: activeQuestion.promptIndex });
    trackEvent('practice_start', { surface: 'interview', record_id: activeQuestion.record.id, prompt_index: activeQuestion.promptIndex + 1, repeat: activeAttempts.length > 0 });
  };

  const openNextQuestion = () => {
    const nextQuestion = nextUnpracticedQuestion ?? matchingQuestions[0];
    if (nextQuestion) startQuestion(nextQuestion.record.id, nextQuestion.promptIndex);
  };

  const setDraft = (draft: string) => {
    if (!activeQuestionKey) return;
    setPracticeProgress((current) => ({ ...current, [activeQuestionKey]: { ...current[activeQuestionKey], draft } }));
  };

  const toggleRubric = (index: number) => {
    if (!activeQuestionKey) return;
    setPracticeProgress((current) => {
      const rubric = [...(current[activeQuestionKey]?.rubric ?? [])];
      rubric[index] = !rubric[index];
      const attempts = current[activeQuestionKey]?.attempts ?? [];
      const latest = attempts.at(-1);
      const draftMatchesLatest = Boolean(latest && current[activeQuestionKey]?.draft?.trim() === latest.answer);
      const nextAttempts = draftMatchesLatest ? [...attempts.slice(0, -1), { ...latest!, rubric }] : attempts;
      return { ...current, [activeQuestionKey]: { ...current[activeQuestionKey], rubric, attempts: nextAttempts } };
    });
  };

  const toggleTimer = () => {
    setFollowupTimerRunning(false);
    setActiveFollowupIndex(null);
    setCalibrationOpen(false);
    if (secondsLeft === 0) {
      setSecondsLeft(90);
      setTimerRunning(true);
      return;
    }
    setTimerRunning((running) => !running);
  };

  const saveAttempt = () => {
    if (!activeQuestion || !activeQuestionKey) return;
    const answer = activeProgress.draft?.trim();
    if (!answer) return;
    const attempt = { answer, savedAt: new Date().toISOString(), rubric: activeProgress.rubric ?? [] };
    setPracticeProgress((current) => ({
      ...current,
      [activeQuestionKey]: {
        ...current[activeQuestionKey],
        attempts: [...(current[activeQuestionKey]?.attempts ?? []), attempt].slice(-8),
      },
    }));
    setTimerRunning(false);
    setCalibrationOpen(Boolean(activeGuide));
    setPracticeStatus(`已保存第 ${(activeProgress.attempts?.length ?? 0) + 1} 次作答；现在${activeGuide ? '解锁题级参考并' : ''}对照骨架补漏`);
    saveLastLearningActivity({ type: 'interview', recordId: activeQuestion.record.id, promptIndex: activeQuestion.promptIndex });
    trackEvent('practice_complete', {
      surface: 'interview',
      record_id: activeQuestion.record.id,
      prompt_index: activeQuestion.promptIndex + 1,
      answer_length: answer.length,
      attempt_number: (activeProgress.attempts?.length ?? 0) + 1,
    });
  };

  const openFollowup = (followupIndex: number) => {
    if (!activeQuestion || !activeGuide || activeAttempts.length === 0) return;
    const progress = activeProgress.followups?.[String(followupIndex)];
    const hasSavedAttempt = (progress?.attempts?.length ?? 0) > 0;
    const hasDraft = Boolean(progress?.draft?.trim());
    setTimerRunning(false);
    setCalibrationOpen(true);
    setActiveFollowupIndex(followupIndex);
    setFollowupSecondsLeft(60);
    setFollowupTimerRunning(!hasSavedAttempt && !hasDraft);
    setFollowupStatus(hasSavedAttempt ? '已载入追问历史；清空后可独立复答' : hasDraft ? '已载入未完成的追问草稿' : '60 秒追问已开始');
    if (!hasSavedAttempt && !hasDraft) {
      trackEvent('practice_start', { surface: 'interview_followup', record_id: activeQuestion.record.id, prompt_index: activeQuestion.promptIndex + 1, followup_index: followupIndex + 1 });
    }
    queueMicrotask(() => followupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const beginFreshFollowup = () => {
    if (!activeQuestion || activeFollowupIndex === null || !activeQuestionKey) return;
    const followupKey = String(activeFollowupIndex);
    setPracticeProgress((current) => {
      const questionProgress = current[activeQuestionKey] ?? {};
      return {
        ...current,
        [activeQuestionKey]: {
          ...questionProgress,
          followups: {
            ...(questionProgress.followups ?? {}),
            [followupKey]: { ...(questionProgress.followups?.[followupKey] ?? {}), draft: '' },
          },
        },
      };
    });
    setFollowupSecondsLeft(60);
    setFollowupTimerRunning(true);
    setFollowupStatus('新一轮追问已开始，旧答案仍保留在历史中');
    trackEvent('practice_start', { surface: 'interview_followup', record_id: activeQuestion.record.id, prompt_index: activeQuestion.promptIndex + 1, followup_index: activeFollowupIndex + 1, repeat: activeFollowupAttempts.length > 0 });
  };

  const setFollowupDraft = (draft: string) => {
    if (activeFollowupIndex === null || !activeQuestionKey) return;
    const followupKey = String(activeFollowupIndex);
    setPracticeProgress((current) => {
      const questionProgress = current[activeQuestionKey] ?? {};
      return {
        ...current,
        [activeQuestionKey]: {
          ...questionProgress,
          followups: {
            ...(questionProgress.followups ?? {}),
            [followupKey]: { ...(questionProgress.followups?.[followupKey] ?? {}), draft },
          },
        },
      };
    });
  };

  const toggleFollowupTimer = () => {
    if (followupSecondsLeft === 0) {
      setFollowupSecondsLeft(60);
      setFollowupTimerRunning(true);
      return;
    }
    setFollowupTimerRunning((running) => !running);
  };

  const saveFollowupAttempt = () => {
    if (!activeQuestion || activeFollowupIndex === null || !activeQuestionKey) return;
    const answer = activeFollowupProgress?.draft?.trim();
    if (!answer) return;
    const followupKey = String(activeFollowupIndex);
    const attempt = { answer, savedAt: new Date().toISOString() };
    setPracticeProgress((current) => {
      const questionProgress = current[activeQuestionKey] ?? {};
      const followupProgress = questionProgress.followups?.[followupKey] ?? {};
      return {
        ...current,
        [activeQuestionKey]: {
          ...questionProgress,
          followups: {
            ...(questionProgress.followups ?? {}),
            [followupKey]: { ...followupProgress, attempts: [...(followupProgress.attempts ?? []), attempt].slice(-8) },
          },
        },
      };
    });
    setFollowupTimerRunning(false);
    setFollowupStatus(`已保存第 ${activeFollowupAttempts.length + 1} 次追问回答；检查是否补了具体证据和边界`);
    saveLastLearningActivity({ type: 'interview', recordId: activeQuestion.record.id, promptIndex: activeQuestion.promptIndex });
    trackEvent('practice_complete', {
      surface: 'interview_followup',
      record_id: activeQuestion.record.id,
      prompt_index: activeQuestion.promptIndex + 1,
      followup_index: activeFollowupIndex + 1,
      answer_length: answer.length,
      attempt_number: activeFollowupAttempts.length + 1,
    });
  };

  return (
    <main className="interviews-page">
      <SiteHeader active="interviews" />

      <section className="interviews-hero">
        <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>国内真实面经</strong></div>
        <div className="interviews-hero-grid">
          <div><p className="eyebrow"><span /> PUBLIC REPORTS / TRACEABLE SOURCES</p><h1>看真实追问怎样发生，<br /><em>不要把面经背成题库。</em></h1></div>
          <div className="interview-source-contract">
            <p>首批内容来自候选人公开复盘。页面保留发布日期、轮次、作者自述结果和原始链接；问题经过摘要与改写，不代表公司官方固定题目。</p>
            <dl><div><dt>{interviewRecords.length}</dt><dd>公开流程</dd></div><div><dt>{interviewPromptCount}</dt><dd>改写真题</dd></div><div><dt>{practicedQuestionCount}</dt><dd>本机已练</dd></div></dl>
          </div>
        </div>
      </section>

      <section className="interview-patterns">
        <article><span>01 / PROJECT</span><strong>项目会被持续下钻</strong><p>数据规模、训练成本、方案选择、效果指标与 badcase，通常比项目名称更重要。</p></article>
        <article><span>02 / ROLE</span><strong>同一基础，不同落点</strong><p>推荐岗追业务偏差，多模态岗追数据与融合，Agent 岗继续追检索、评测和系统状态。</p></article>
        <article><span>03 / ENGINEERING</span><strong>应用岗仍有系统基础</strong><p>算法题、数据库、消息队列、缓存和服务指标并没有因为使用大模型而消失。</p></article>
      </section>

      <section className="interview-library">
        <aside className="interview-filters">
          <label><span>SEARCH QUESTIONS</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setShowAllQuestions(false); }} placeholder="公司、岗位、问题或主题" /></label>
          <div className="interview-focus-filter"><span>按追问方向筛选</span>{interviewFocuses.map((item) => <button className={focus === item ? 'active' : ''} type="button" aria-pressed={focus === item} onClick={() => { setFocus(item); setShowAllQuestions(false); }} key={item}>{item}<b>{item === '全部' ? interviewPromptCount : interviewRecords.filter((record) => record.focuses.includes(item)).reduce((total, record) => total + record.prompts.length, 0)}</b></button>)}</div>
          <div className="interview-guide-filter"><span>按校准类型筛选</span>{guideFilters.map((item) => { const count = item === '全部题目' ? interviewPromptCount : interviewGuideCountForTrack(item); return <button className={guideFilter === item ? 'active' : ''} type="button" aria-pressed={guideFilter === item} onClick={() => { setGuideFilter(item); setShowAllQuestions(false); }} key={item}><span><b>{item}</b><small>{item === '全部题目' ? '浏览全部改写真题' : item === '知识机制' ? '定义、计算与取舍' : '贡献、指标与证据'}</small></span><strong>{count}</strong></button>; })}</div>
          <div className="interview-practice-filter"><span>按练习状态筛选</span>{practiceFilters.map((item) => { const count = item === '全部' ? matchingQuestions.length : item === '已练' ? matchingPracticedCount : matchingQuestions.length - matchingPracticedCount; return <button className={practiceFilter === item ? 'active' : ''} type="button" aria-pressed={practiceFilter === item} onClick={() => { setPracticeFilter(item); setShowAllQuestions(false); }} key={item}><span>{item}</span><b>{count}</b></button>; })}</div>
          <div className="interview-boundary"><span>怎么使用</span><p>先尝试回答卡片里的改写问题，再打开原帖补上下文。不要根据一条经历推断 HC、难度或公司统一偏好。</p></div>
        </aside>

        <div className="interview-results">
          <section className="real-question-index" id="real-questions">
            <div className="real-question-index-head"><div><span>REAL QUESTION INDEX</span><h2>先刷真题，再回到完整面经理解上下文。</h2></div><div className="real-question-index-actions"><p><strong>{filteredQuestions.length}</strong> 道匹配问题 · 经过摘要与改写</p><a href={sitePath('/mock/')}>进入 12 分钟整场模拟 →</a><button type="button" disabled={matchingQuestions.length === 0} onClick={openNextQuestion}>{nextUnpracticedQuestion ? '练下一道待练题' : '查看一题准备复答'} <span>→</span></button></div></div>
            {visibleQuestions.length > 0 ? <div className="real-question-grid">{visibleQuestions.map(({ record, prompt, promptIndex }, index) => {
              const practiced = (practiceProgress[interviewQuestionKey(record.id, promptIndex)]?.attempts?.length ?? 0) > 0;
              const guide = guideForInterviewQuestion(record.id, promptIndex);
              return <article className={`real-question-card${practiced ? ' practiced' : ''}${guide ? ' has-guide' : ''}`} key={`${record.id}-${promptIndex}`}>
                <div><span>Q{String(index + 1).padStart(2, '0')}</span><span>{record.company}</span><span>{record.published}</span></div>
                <small>{record.role} · {record.focuses.join(' / ')}{guide && <b className={`real-question-guide-badge${guide.track === '项目深挖' ? ' project' : ''}`}>{guide.track}</b>}</small>
                <h3>{prompt}</h3>
                <div><button type="button" onClick={() => startQuestion(record.id, promptIndex)}>{practiced ? '查看 / 复答' : '90 秒作答'} →</button><a href={sitePath(`/interviews/${record.id}/`)}>上下文</a><a href={record.sourceHref} target="_blank" rel="noreferrer">原帖 ↗</a></div>
              </article>;
            })}</div> : <div className="interview-empty"><strong>没有匹配的真题</strong><p>减少筛选条件，或搜索 RAG、Agent、量化、多模态等主题。</p></div>}
            {filteredQuestions.length > 12 && <button className="real-question-more" type="button" onClick={() => setShowAllQuestions((visible) => !visible)}>{showAllQuestions ? '收起真题' : `展开全部 ${filteredQuestions.length} 道真题`} <span>{showAllQuestions ? '↑' : '↓'}</span></button>}

            <section className={`interview-practice-workspace${activeQuestion ? ' active' : ''}`} id="question-trainer" ref={trainerRef}>
              {activeQuestion ? <>
                <header>
                  <div><span>90-SECOND INTERVIEW PRACTICE</span><small>{activeQuestion.record.company} · {activeQuestion.record.role}</small></div>
                  <strong>{practicedQuestionCount} / {interviewPromptCount} 已练 · 主答 {savedAttemptCount} · 追问 {savedFollowupAttemptCount}</strong>
                  <h2>{activeQuestion.prompt}</h2>
                </header>
                <div className="interview-practice-grid">
                  <div>
                    <div className="answer-recorder interview-answer-recorder">
                      <div className="answer-recorder-head"><span>YOUR ANSWER · 只保存在当前设备</span><strong>{formatCountdown(secondsLeft)}</strong></div>
                      <textarea aria-label="面经真题作答" value={activeProgress.draft ?? ''} onChange={(event) => setDraft(event.target.value)} placeholder={activeAnswerPlaceholder} />
                      <div className="answer-recorder-actions"><button type="button" onClick={toggleTimer}>{secondsLeft === 0 ? '重新计时' : timerRunning ? '暂停' : '继续计时'}</button>{(activeAttempts.length > 0 || activeProgress.draft?.trim()) && <button type="button" onClick={beginFreshAttempt}>清空草稿，开始新一轮</button>}<button className="save-attempt" type="button" disabled={!activeProgress.draft?.trim()} onClick={saveAttempt}>保存本次作答</button><span aria-live="polite">{practiceStatus}</span></div>
                    </div>
                    {activeGuide && activeAttempts.length === 0 && <div className="interview-calibration-lock"><span>{activeGuide.track.toUpperCase()} · REFERENCE LOCKED</span><strong>保存第一版后解锁「{activeGuide.label}」题级参考</strong><p>先独立组织一次答案，再看 30 秒示范、2 分钟展开、常见误区和追问。这里不会记录或上报你的答案正文。</p></div>}
                    {activeGuide && activeAttempts.length > 0 && <details className="interview-calibration" open={calibrationOpen} onToggle={(event) => setCalibrationOpen(event.currentTarget.open)}>
                      <summary><span>{activeGuide.track.toUpperCase()} · {activeGuide.label}</span><b>首答后已解锁</b></summary>
                      <div className="interview-calibration-body">
                        <section><span>30 秒参考回答</span><p>{activeGuide.shortAnswer}</p></section>
                        <section><span>2 分钟结构化展开</span><ol>{activeGuide.deepDive.map((item) => <li key={item}>{item}</li>)}</ol></section>
                        <div className="interview-calibration-columns"><section><span>常见失分点</span><ul>{activeGuide.mistakes.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="interview-followup-list"><span>继续追问 · 点击进入第二轮</span><ol>{activeGuide.followups.map((item, index) => { const attemptCount = activeProgress.followups?.[String(index)]?.attempts?.length ?? 0; return <li key={item}><p>{item}</p><button type="button" className={activeFollowupIndex === index ? 'active' : ''} onClick={() => openFollowup(index)}>{attemptCount > 0 ? `复答 · ${attemptCount} 次` : '60 秒回答'} <b>→</b></button></li>; })}</ol></section></div>
                        {activeFollowupIndex !== null && activeGuide.followups[activeFollowupIndex] && <section className="interview-followup-practice" ref={followupRef}>
                          <header><div><span>FOLLOW-UP {String(activeFollowupIndex + 1).padStart(2, '0')} / {String(activeGuide.followups.length).padStart(2, '0')}</span><strong>{activeGuide.followups[activeFollowupIndex]}</strong></div><b>{formatCountdown(followupSecondsLeft)}</b></header>
                          <p>先直接回应追问，再补一个具体证据、取舍或失败边界。不要重复第一轮的完整答案。</p>
                          <textarea aria-label="面经连续追问作答" value={activeFollowupProgress?.draft ?? ''} onChange={(event) => setFollowupDraft(event.target.value)} placeholder={'用 60 秒回答：\n1. 一句话回应追问\n2. 给出数字、实验、实现细节或反例\n3. 说明适用条件与尚未验证的边界'} />
                          <div className="interview-followup-actions"><button type="button" onClick={toggleFollowupTimer}>{followupSecondsLeft === 0 ? '重新计时' : followupTimerRunning ? '暂停' : '继续计时'}</button>{(activeFollowupAttempts.length > 0 || activeFollowupProgress?.draft?.trim()) && <button type="button" onClick={beginFreshFollowup}>清空并独立复答</button>}<button className="save" type="button" disabled={!activeFollowupProgress?.draft?.trim()} onClick={saveFollowupAttempt}>保存追问回答</button>{activeFollowupIndex < activeGuide.followups.length - 1 && <button type="button" onClick={() => openFollowup(activeFollowupIndex + 1)}>下一个追问 →</button>}<span aria-live="polite">{followupStatus}</span></div>
                          {activeFollowupAttempts.length > 0 && <details className="interview-followup-history"><summary>查看追问历史 · {activeFollowupAttempts.length} 次 <span>＋</span></summary><ol>{[...activeFollowupAttempts].reverse().map((attempt, index) => <li key={`${attempt.savedAt}-${index}`}><span>{new Date(attempt.savedAt).toLocaleString('zh-CN')}</span><p>{attempt.answer}</p></li>)}</ol></details>}
                        </section>}
                        <small>这是帮助校准结构与技术边界的参考，不是唯一标准答案；请用自己的项目证据替换通用表述。</small>
                      </div>
                    </details>}
                    {previousAttempt && latestAttempt && <div className="interview-attempt-compare"><div><span>PREVIOUS</span><strong>{previousScore}<b>/4</b></strong><small>{previousAttempt.answer.length} 字</small></div><div><span>LATEST</span><strong>{latestScore}<b>/4</b></strong><small>{latestAttempt.answer.length} 字</small></div><p>自评变化 {latestScore - previousScore >= 0 ? '+' : ''}{latestScore - previousScore}；长度只用于观察表达变化，不代表答案质量。</p></div>}
                    {(activeProgress.attempts?.length ?? 0) > 0 && <details className="attempt-history"><summary>查看历史作答 · {activeProgress.attempts?.length} 次 <span>＋</span></summary><ol>{[...(activeProgress.attempts ?? [])].reverse().map((attempt, index) => <li key={`${attempt.savedAt}-${index}`}><span>{new Date(attempt.savedAt).toLocaleString('zh-CN')} · 自评 {attempt.rubric.filter(Boolean).length}/4</span><p>{attempt.answer}</p></li>)}</ol></details>}
                  </div>
                  <aside className="interview-answer-coach">
                    <div><span>这道题的回答主线</span>{activeAnswerFrame && <p><b>{activeAnswerFrame.focus}</b>{activeAnswerFrame.frame}</p>}<small className="interview-theme-cue">结合本场主题：{activeQuestion.record.themes.slice(0, 3).join(' · ')}</small></div>
                    <div><span>完成后自评</span><ul className="answer-rubric">{interviewAnswerRubric.map((item, index) => <li key={item.title}><button type="button" className={activeProgress.rubric?.[index] ? 'checked' : ''} aria-pressed={Boolean(activeProgress.rubric?.[index])} onClick={() => toggleRubric(index)}><span>{activeProgress.rubric?.[index] ? '✓' : String(index + 1).padStart(2, '0')}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div></button></li>)}</ul></div>
                    <div className="interview-followup-coach"><span>下一轮可能怎样追问</span><p>{activeQuestion.record.preparation}</p></div>
                  </aside>
                </div>
                <footer><button type="button" disabled={matchingQuestions.length === 0} onClick={openNextQuestion}>{nextUnpracticedQuestion ? '下一道待练题' : '打开一题准备复答'} <span>→</span></button><a href={sitePath(`/interviews/${activeQuestion.record.id}/`)}>查看完整面经上下文 →</a><a href={sitePath(activeQuestion.record.practiceHref)}>补对应知识与结构题 →</a>{activeQuestion.record.labHref && <a href={sitePath(activeQuestion.record.labHref)}>打开关联实验 →</a>}</footer>
              </> : <div className="interview-practice-empty"><span>INTERVIEW PRACTICE</span><h2>从上面的任意真题开始，留下第一版答案。</h2><p>系统提供 90 秒计时、回答骨架和四项自评；其中 {interviewGuideCount} 道校准题分为知识机制与项目深挖，均在首答后解锁参考。草稿、历史版本和完成进度只保存在当前设备。</p></div>}
            </section>
          </section>

          <div className="interview-results-head"><span>{filteredRecords.length.toString().padStart(2, '0')} REPORTS</span><span>公开个人复盘 · 非官方题库</span></div>
          <div className="interview-records">
            {filteredRecords.map((record, index) => (
              <article className="interview-record" key={record.id}>
                <header>
                  <div className="interview-record-index"><span>{String(index + 1).padStart(2, '0')}</span><b>{record.company}</b></div>
                  <div className="interview-record-role"><span>{record.campaign}</span><h2>{record.role}</h2><p>{record.summary}</p></div>
                  <div className="interview-record-date"><span>SOURCE DATE</span><strong>{record.published}</strong></div>
                </header>
                <div className="interview-record-meta"><div><span>流程</span><strong>{record.rounds}</strong></div><div><span>结果边界</span><strong>{record.outcome}</strong></div></div>
                <div className="interview-theme-row">{record.themes.map((theme) => <span key={theme}>{theme}</span>)}</div>
                <details>
                  <summary><span>展开改写问题与准备动作</span><b>＋</b></summary>
                  <div className="interview-detail-grid">
                    <div><span>REPHRASED PROMPTS</span><ol>{record.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol></div>
                    <aside><span>PREPARATION SIGNAL</span><p>{record.preparation}</p><div>{record.focuses.map((item) => <b key={item}>{item}</b>)}</div></aside>
                  </div>
                </details>
                <div className="interview-record-actions">
                  <a href={sitePath(`/interviews/${record.id}/`)}>打开独立面经页 <span>→</span></a>
                  <a href={record.sourceHref} target="_blank" rel="noreferrer">打开原始面经 <span>↗</span></a>
                  <a href={sitePath(record.practiceHref)}>进入对应学习闭环 <span>→</span></a>
                  {record.labHref && <a href={sitePath(record.labHref)}>打开关联实验 <span>→</span></a>}
                </div>
              </article>
            ))}
          </div>
          {filteredRecords.length === 0 && <div className="interview-empty"><strong>没有匹配的面经</strong><p>减少筛选条件，或搜索 RAG、Agent、微调、多模态等主题。</p></div>}
        </div>
      </section>

      <section className="interview-method-note">
        <div><p className="section-kicker">EVIDENCE BOUNDARY</p><h2>“真实”指原帖可追溯，<br />不等于独立核验或未来仍会重复。</h2></div>
        <p>面试内容会随部门、面试官、候选人简历和招聘批次变化。本站只摘要公开自述，并明确结果边界；准备时应提炼能力结构，而不是预测下一场会出现相同问题。</p>
      </section>

      <SiteFooter />
    </main>
  );
}
