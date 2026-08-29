'use client';

import { useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { mockInterviewQuestionSet, mockInterviewTracks, mockInterviewVariantCount, mockInterviewVariantLabel, resolveMockInterviewQuestion } from '../../data/mock-interviews';
import { trackEvent } from '../../lib/analytics';
import { interviewAnswerRubric } from '../../lib/interview-practice';
import { saveLastLearningActivity } from '../../lib/learning-activity';
import { mockRubricRate, recommendationForMockReport, selfReviewTrendForMockReports } from '../../lib/mock-interview-recommendation';
import { emptyMockInterviewStorage, mockInterviewStorageKey, type MockAnswer, type MockInterviewStorage, type MockReport, type MockSession } from '../../lib/mock-interview';
import { sitePath } from '../../lib/site-path';

function formatCountdown(total: number) {
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}

function answerKey(index: number) {
  return String(index);
}

function nextVariantIndex(reports: MockReport[], trackId: string) {
  const latest = [...reports].reverse().find((report) => report.trackId === trackId);
  return latest ? ((latest.variantIndex ?? 0) + 1) % mockInterviewVariantCount : 0;
}

function buildReport(session: MockSession, questionCount: number): MockReport {
  const answers = Array.from({ length: questionCount }, (_, index) => session.answers[answerKey(index)] ?? {});
  const completedMain = answers.filter((answer) => answer.mainSavedAt);
  const completedFollowups = answers.filter((answer) => answer.followupSavedAt);
  const average = (values: number[]) => values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0;
  return {
    id: session.id,
    trackId: session.trackId,
    variantIndex: session.variantIndex ?? 0,
    completedAt: new Date().toISOString(),
    mainCompleted: completedMain.length,
    followupsCompleted: completedFollowups.length,
    averageMainLength: average(completedMain.map((answer) => answer.mainDraft?.trim().length ?? 0)),
    averageFollowupLength: average(completedFollowups.map((answer) => answer.followupDraft?.trim().length ?? 0)),
    rubricCounts: interviewAnswerRubric.map((_, rubricIndex) => completedMain.filter((answer) => answer.mainRubric?.[rubricIndex]).length),
  };
}

function finishStorage(storage: MockInterviewStorage, session: MockSession, questionCount: number, answers = session.answers): MockInterviewStorage {
  const completedSession = { ...session, answers, stage: 'report' as const };
  const report = buildReport(completedSession, questionCount);
  return { active: completedSession, reports: [...storage.reports.filter((item) => item.id !== report.id), report].slice(-6) };
}

export function MockInterviewWorkspace() {
  const [selectedTrackId, setSelectedTrackId] = useState(mockInterviewTracks[0].id);
  const [storage, setStorage] = useState<MockInterviewStorage>(() => emptyMockInterviewStorage());
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [status, setStatus] = useState('选择方向后开始，所有答案只保存在当前设备');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(mockInterviewStorageKey);
    queueMicrotask(() => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as MockInterviewStorage;
          setStorage({ reports: parsed.reports ?? [], active: parsed.active });
          if (parsed.active) {
            setSelectedTrackId(parsed.active.trackId);
            setSecondsLeft(parsed.active.stage === 'followup' ? 60 : 90);
            setStatus(parsed.active.stage === 'report' ? '已载入最近一场本机复盘' : '已载入未完成模拟；计时保持暂停');
          }
        } catch {
          window.localStorage.removeItem(mockInterviewStorageKey);
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(mockInterviewStorageKey, JSON.stringify(storage));
  }, [hydrated, storage]);

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

  const session = storage.active;
  const selectedTrack = mockInterviewTracks.find((track) => track.id === selectedTrackId) ?? mockInterviewTracks[0];
  const activeTrack = mockInterviewTracks.find((track) => track.id === session?.trackId) ?? selectedTrack;
  const selectedVariantIndex = nextVariantIndex(storage.reports, selectedTrackId);
  const activeVariantIndex = session ? session.variantIndex ?? 0 : selectedVariantIndex;
  const questionSpecs = useMemo(() => mockInterviewQuestionSet(activeTrack, activeVariantIndex), [activeTrack, activeVariantIndex]);
  const questions = useMemo(() => questionSpecs.map(resolveMockInterviewQuestion).filter((item) => item !== null), [questionSpecs]);
  const previousTrackReport = [...storage.reports].reverse().find((report) => report.trackId === selectedTrackId);
  const selfReviewTrend = useMemo(() => selfReviewTrendForMockReports(storage.reports.filter((report) => report.trackId === activeTrack.id)), [activeTrack.id, storage.reports]);
  const currentQuestion = session ? questions[session.currentIndex] : null;
  const currentAnswer = session ? session.answers[answerKey(session.currentIndex)] ?? {} : {};
  const currentReport = session?.stage === 'report' ? storage.reports.find((report) => report.id === session.id) ?? buildReport(session, questions.length) : null;
  const recommendation = currentReport ? recommendationForMockReport(currentReport) : null;
  const focusQuestionIndex = recommendation && session ? Math.max(questions.findIndex((_, index) => !session.answers[answerKey(index)]?.mainRubric?.[recommendation.rubricIndex]), 0) : 0;
  const focusQuestion = questions[focusQuestionIndex];
  const focusQuestionHref = focusQuestion ? `/interviews/?record=${focusQuestion.recordId}&prompt=${focusQuestion.promptIndex + 1}#question-trainer` : '/interviews/#real-questions';
  const nextVariant = nextVariantIndex(storage.reports, session?.trackId ?? selectedTrackId);

  const updateAnswer = (patch: Partial<MockAnswer>) => {
    if (!session) return;
    const key = answerKey(session.currentIndex);
    setStorage((current) => current.active ? {
      ...current,
      active: { ...current.active, answers: { ...current.active.answers, [key]: { ...(current.active.answers[key] ?? {}), ...patch } } },
    } : current);
  };

  const startSession = (trackId = selectedTrackId) => {
    const id = crypto.randomUUID();
    const variantIndex = nextVariantIndex(storage.reports, trackId);
    const nextSession: MockSession = { id, trackId, variantIndex, startedAt: new Date().toISOString(), currentIndex: 0, stage: 'main', answers: {} };
    setStorage((current) => ({ ...current, active: nextSession }));
    setSelectedTrackId(trackId);
    setSecondsLeft(90);
    setTimerRunning(true);
    setStatus(`题单 ${mockInterviewVariantLabel(variantIndex)} 已开始；先给结论，再展开证据`);
    saveLastLearningActivity({ type: 'mock', trackId });
    trackEvent('practice_start', { surface: 'mock_interview_main', track_id: trackId, variant_index: variantIndex, question_index: 1 });
  };

  const toggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(session?.stage === 'followup' ? 60 : 90);
      setTimerRunning(true);
      return;
    }
    setTimerRunning((running) => !running);
  };

  const toggleRubric = (index: number) => {
    const rubric = [...(currentAnswer.mainRubric ?? [])];
    rubric[index] = !rubric[index];
    updateAnswer({ mainRubric: rubric });
  };

  const saveMain = () => {
    if (!session || !currentQuestion) return;
    const answer = currentAnswer.mainDraft?.trim();
    if (!answer) return;
    const savedAt = new Date().toISOString();
    const key = answerKey(session.currentIndex);
    setStorage((current) => current.active ? {
      ...current,
      active: {
        ...current.active,
        stage: 'followup',
        answers: { ...current.active.answers, [key]: { ...(current.active.answers[key] ?? {}), mainDraft: answer, mainSavedAt: savedAt } },
      },
    } : current);
    setSecondsLeft(60);
    setTimerRunning(true);
    setStatus('主回答已保存；面试官开始连续追问');
    saveLastLearningActivity({ type: 'mock', trackId: session.trackId });
    trackEvent('practice_complete', { surface: 'mock_interview_main', track_id: session.trackId, variant_index: session.variantIndex ?? 0, question_index: session.currentIndex + 1, answer_length: answer.length });
    trackEvent('practice_start', { surface: 'mock_interview_followup', track_id: session.trackId, variant_index: session.variantIndex ?? 0, question_index: session.currentIndex + 1 });
  };

  const moveAfterFollowup = (followupPatch: Partial<MockAnswer> = {}) => {
    if (!session) return;
    const key = answerKey(session.currentIndex);
    const isLast = session.currentIndex >= questions.length - 1;
    setStorage((current) => {
      if (!current.active) return current;
      const answers = { ...current.active.answers, [key]: { ...(current.active.answers[key] ?? {}), ...followupPatch } };
      if (isLast) return finishStorage(current, current.active, questions.length, answers);
      return { ...current, active: { ...current.active, answers, currentIndex: current.active.currentIndex + 1, stage: 'main' } };
    });
    setTimerRunning(!isLast);
    setSecondsLeft(90);
    setStatus(isLast ? '模拟完成；复盘只使用完成度、长度和你的自评' : `进入第 ${session.currentIndex + 2} 道主问题`);
    saveLastLearningActivity({ type: 'mock', trackId: session.trackId });
    if (!isLast) trackEvent('practice_start', { surface: 'mock_interview_main', track_id: session.trackId, variant_index: session.variantIndex ?? 0, question_index: session.currentIndex + 2 });
  };

  const saveFollowup = () => {
    if (!session || !currentQuestion) return;
    const answer = currentAnswer.followupDraft?.trim();
    if (!answer) return;
    trackEvent('practice_complete', { surface: 'mock_interview_followup', track_id: session.trackId, variant_index: session.variantIndex ?? 0, question_index: session.currentIndex + 1, answer_length: answer.length });
    moveAfterFollowup({ followupDraft: answer, followupSavedAt: new Date().toISOString() });
  };

  const skipStage = () => {
    if (!session) return;
    if (session.stage === 'main') {
      setStorage((current) => current.active ? { ...current, active: { ...current.active, stage: 'followup' } } : current);
      setSecondsLeft(60);
      setTimerRunning(true);
      setStatus('已跳过主回答；仍可尝试这条追问');
      trackEvent('practice_start', { surface: 'mock_interview_followup', track_id: session.trackId, variant_index: session.variantIndex ?? 0, question_index: session.currentIndex + 1 });
      return;
    }
    moveAfterFollowup();
  };

  const finishNow = () => {
    if (!session) return;
    setStorage((current) => current.active ? finishStorage(current, current.active, questions.length) : current);
    setTimerRunning(false);
    setStatus('已提前结束；未完成项会如实保留在复盘中');
  };

  const clearActive = () => {
    setStorage((current) => ({ ...current, active: undefined }));
    setTimerRunning(false);
    setStatus('选择一个方向开始新的模拟');
  };

  return (
    <main className="mock-page">
      <SiteHeader active="mock" />

      {!session && <>
        <section className="mock-intro">
          <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>12 分钟模拟面试</strong></div>
          <div className="mock-intro-grid"><div><p className="eyebrow"><span /> FIVE QUESTIONS / FIVE FOLLOW-UPS</p><h1>从“会一道题”，<br /><em>练到扛住一整场。</em></h1></div><aside><strong>5 × 90 秒主答</strong><strong>5 × 60 秒追问</strong><p>不提供虚假的 AI 面试分。报告只展示完成度、表达长度和你的四项自评；所有答案只保存在当前设备。</p></aside></div>
        </section>

        <section className="mock-track-section" aria-busy={!hydrated}>
          <div className="mock-track-head"><div><span>CHOOSE A ROLE</span><h2>选择最接近目标岗位的一场。</h2></div><p>每个方向从 8 道可追溯面经题中轮换 5 道，连续练习还会更换全部追问；开始后仍可提前结束并查看真实缺口。</p></div>
          <div className="mock-track-grid">{mockInterviewTracks.map((track, index) => <button className={selectedTrackId === track.id ? 'active' : ''} type="button" aria-pressed={selectedTrackId === track.id} onClick={() => setSelectedTrackId(track.id)} key={track.id}><div><span>{String(index + 1).padStart(2, '0')}</span><b>{track.role}</b></div><h3>{track.title}</h3><p>{track.description}</p><div>{track.tags.map((tag) => <small key={tag}>{tag}</small>)}</div><strong>{selectedTrackId === track.id ? '已选择' : '选择此场'} <i>→</i></strong></button>)}</div>
          <div className="mock-start-bar"><div><span>READY / 题单 {mockInterviewVariantLabel(selectedVariantIndex)}</span><strong>{selectedTrack.title}</strong><small>{previousTrackReport ? `上次为题单 ${mockInterviewVariantLabel(previousTrackReport.variantIndex ?? 0)}，本次已自动轮换` : '首次练习从基础题单开始'} · 约 12 分钟 · 本机保存</small></div><button type="button" disabled={!hydrated || questions.length !== 5} onClick={() => startSession()}>开始整场模拟 <span>→</span></button></div>
          <div className="mock-upcoming-set"><div><span>NEXT SET</span><strong>本轮题目预览</strong><small>只展示主题，不提前展示具体问题；每完成一场自动切换题单。</small></div><ol>{questions.map((question, index) => <li key={`${question.recordId}-${question.promptIndex}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{question.guide.label}</strong><small>{question.record.company} · {question.guide.track}</small></div></li>)}</ol></div>
          {storage.reports.length > 0 && <p className="mock-local-history">当前设备已完成 {storage.reports.length} 场；开始新场不会删除最近 6 次复盘摘要。</p>}
        </section>
      </>}

      {session && session.stage !== 'report' && currentQuestion && <section className="mock-session">
        <header className="mock-session-head"><div><a href={sitePath('/mock/')}>模拟面试</a><span>/</span><strong>{activeTrack.title} · 题单 {mockInterviewVariantLabel(activeVariantIndex)}</strong></div><button type="button" onClick={finishNow}>提前结束并复盘</button></header>
        <div className="mock-progress-row">{questions.map((question, index) => { const answer = session.answers[answerKey(index)] ?? {}; const done = Boolean(answer.mainSavedAt && answer.followupSavedAt); return <div className={`${index === session.currentIndex ? 'current' : ''}${done ? ' done' : ''}`} key={`${question.recordId}-${question.promptIndex}`}><span>{String(index + 1).padStart(2, '0')}</span><b>{done ? '完成' : index === session.currentIndex ? session.stage === 'main' ? '主问题' : '追问' : '待进行'}</b></div>; })}</div>
        <div className="mock-stage-label"><span>QUESTION {session.currentIndex + 1} / {questions.length}</span><strong>{session.stage === 'main' ? '90 秒主回答' : '60 秒连续追问'}</strong><b>{formatCountdown(secondsLeft)}</b></div>

        <article className={`mock-question-panel ${session.stage}`}>
          <div className="mock-question-context"><span>{currentQuestion.record.company}</span><span>{currentQuestion.record.role}</span><a href={currentQuestion.record.sourceHref} target="_blank" rel="noreferrer">原始面经 ↗</a></div>
          {session.stage === 'main' ? <>
            <h1>{currentQuestion.prompt}</h1>
            <p className="mock-answer-frame"><span>回答主线</span>{currentQuestion.guide.track === '项目深挖' ? '问题与约束 → 本人贡献 → baseline 与干预 → 指标证据 → badcase 与边界' : '先给定义或结论 → 讲清计算链路 → 对比收益和代价 → 落到证据与适用条件'}</p>
            <textarea aria-label="模拟面试主回答" value={currentAnswer.mainDraft ?? ''} onChange={(event) => updateAnswer({ mainDraft: event.target.value })} placeholder={'像真实面试一样直接回答。\n不要查看题级参考；先留下自己的第一版。'} />
            <div className="mock-rubric"><span>保存前快速自评</span>{interviewAnswerRubric.map((item, index) => <button className={currentAnswer.mainRubric?.[index] ? 'checked' : ''} type="button" aria-pressed={Boolean(currentAnswer.mainRubric?.[index])} onClick={() => toggleRubric(index)} key={item.title}><b>{currentAnswer.mainRubric?.[index] ? '✓' : index + 1}</b><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}</div>
            <div className="mock-stage-actions"><button type="button" onClick={toggleTimer}>{secondsLeft === 0 ? '重新计时' : timerRunning ? '暂停' : '继续计时'}</button><button type="button" onClick={skipStage}>跳过主回答</button><button className="primary" type="button" disabled={!currentAnswer.mainDraft?.trim()} onClick={saveMain}>保存并接受追问 <span>→</span></button></div>
          </> : <>
            <small className="mock-main-reminder">基于上一问：{currentQuestion.prompt}</small>
            <h1>{currentQuestion.followup}</h1>
            <p className="mock-answer-frame"><span>追问要求</span>不要重复完整主回答；直接回应变化条件，再给一个数字、实现细节、实验或失败边界。</p>
            <textarea aria-label="模拟面试连续追问" value={currentAnswer.followupDraft ?? ''} onChange={(event) => updateAnswer({ followupDraft: event.target.value })} placeholder={'用 60 秒回应：\n1. 直接回答追问\n2. 给具体证据或反例\n3. 说明仍未验证的边界'} />
            <div className="mock-stage-actions"><button type="button" onClick={toggleTimer}>{secondsLeft === 0 ? '重新计时' : timerRunning ? '暂停' : '继续计时'}</button><button type="button" onClick={skipStage}>跳过追问</button><button className="primary" type="button" disabled={!currentAnswer.followupDraft?.trim()} onClick={saveFollowup}>{session.currentIndex === questions.length - 1 ? '保存并生成复盘' : '保存并进入下一题'} <span>→</span></button></div>
          </>}
          <p className="mock-session-status" aria-live="polite">{status}</p>
        </article>
      </section>}

      {session?.stage === 'report' && currentReport && recommendation && <section className="mock-report">
        <header><div><span>LOCAL MOCK REPORT · 题单 {mockInterviewVariantLabel(activeVariantIndex)}</span><h1>{activeTrack.title}<br /><em>本机复盘报告</em></h1><p>这不是模型评分。它只汇总你实际完成的回答、表达长度和自评，用于决定下一轮练什么。</p></div><div><strong>{currentReport.mainCompleted}<b>/5</b></strong><span>主问题完成</span><strong>{currentReport.followupsCompleted}<b>/5</b></strong><span>追问完成</span></div></header>
        <div className="mock-report-metrics"><article><span>主答平均长度</span><strong>{currentReport.averageMainLength}<b> 字</b></strong><p>长度不代表质量，只用于发现回答过短或失控。</p></article><article><span>追问平均长度</span><strong>{currentReport.averageFollowupLength}<b> 字</b></strong><p>追问应比主答更直接，并补新证据。</p></article><article><span>下一轮优先项</span><strong>{recommendation.rubricTitle}</strong><p>来自四项自评中勾选最少的一项，不是模型质量评分。</p></article></div>
        <section className="mock-rubric-report"><div><span>SELF REVIEW</span><h2>五道主回答里，你自评做到了几次？</h2></div><div>{interviewAnswerRubric.map((item, index) => <article key={item.title}><span>{item.title}</span><strong>{currentReport.rubricCounts[index]}<b>/5</b></strong><i><b style={{ width: `${currentReport.rubricCounts[index] * 20}%` }} /></i><p>{item.detail}</p></article>)}</div></section>
        <section className="mock-trend"><header><div><span>RECENT SELF-REVIEW TREND</span><h2>最近三场，弱项有没有反复出现？</h2></div><p>{selfReviewTrend.reports.length >= 2 ? `按已完成主答归一化后，反复勾选最少的是“${selfReviewTrend.weakestRubricTitle}”。` : '再完成一场同方向模拟，就能开始比较自评变化。'}</p></header><div className="mock-trend-table"><div className="mock-trend-head"><span>自评维度</span>{selfReviewTrend.reports.map((report, index) => <span key={report.id}>第 {index + 1} 场 · {mockInterviewVariantLabel(report.variantIndex ?? 0)}</span>)}<span>首尾变化</span></div>{interviewAnswerRubric.map((rubric, rubricIndex) => { const firstRate = selfReviewTrend.reports[0] ? mockRubricRate(selfReviewTrend.reports[0], rubricIndex) : 0; const latestRate = selfReviewTrend.reports.at(-1) ? mockRubricRate(selfReviewTrend.reports.at(-1)!, rubricIndex) : 0; const delta = latestRate - firstRate; return <div className={selfReviewTrend.weakestRubricIndex === rubricIndex ? 'weakest' : ''} key={rubric.title}><strong>{rubric.title}</strong>{selfReviewTrend.reports.map((report) => <span key={report.id}><i><b style={{ width: `${mockRubricRate(report, rubricIndex)}%` }} /></i><small>{report.rubricCounts[rubricIndex] ?? 0}/{report.mainCompleted}</small></span>)}<em>{selfReviewTrend.reports.length >= 2 ? `${delta > 0 ? '+' : ''}${delta}pp` : '待比较'}</em></div>; })}</div><small>只比较每场“勾选次数 ÷ 已完成主答数”。正向变化表示最近更常确认自己做到了该项，不等于客观能力提升。</small></section>
        <section className="mock-prescription"><header><div><span>NEXT PRESCRIPTION</span><h2>{recommendation.title}</h2></div><p>{recommendation.diagnosis}</p></header><div className="mock-prescription-grid"><article><span>01 · 单题热身</span><strong>{focusQuestion?.guide.label ?? '第一道主问题'}</strong><p>{recommendation.drill}</p><a href={sitePath(focusQuestionHref)}>先做 3 分钟补练 →</a></article><article><span>02 · 下一场约束</span><strong>{activeTrack.title} · 题单 {mockInterviewVariantLabel(nextVariant)}</strong><p>{recommendation.nextRule}</p><button type="button" onClick={() => startSession(session.trackId)}>按处方开始下一场 <b>→</b></button></article></div><small>推荐仅使用当前设备上的完成度和你的自评，不读取答案正文，也不代表 AI 对答案质量的判断。</small></section>
        <section className="mock-question-report"><div><span>QUESTION REVIEW</span><h2>逐题回看完成情况。</h2></div><ol>{questions.map((question, index) => { const answer = session.answers[answerKey(index)] ?? {}; return <li key={`${question.recordId}-${question.promptIndex}`}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{question.record.company} · {question.guide.track}</small><strong>{question.prompt}</strong><p>主答 {answer.mainSavedAt ? `${answer.mainDraft?.trim().length ?? 0} 字 · 自评 ${answer.mainRubric?.filter(Boolean).length ?? 0}/4` : '未完成'} · 追问 {answer.followupSavedAt ? `${answer.followupDraft?.trim().length ?? 0} 字` : '未完成'}</p></div><a href={sitePath(`/interviews/?record=${question.recordId}&prompt=${question.promptIndex + 1}#question-trainer`)}>单题复练 →</a></li>; })}</ol></section>
        <div className="mock-report-actions"><button type="button" onClick={clearActive}>更换岗位方向</button><a href={sitePath('/progress/')}>查看全部本机进度 →</a></div>
      </section>}

      <SiteFooter />
    </main>
  );
}
