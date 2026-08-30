'use client';

import { useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { addDaysToIsoDate, buildInterviewPlanDays, daysBetweenIsoDates, interviewPlanPhaseMeta, interviewPlanStorageKey, todayLocalIsoDate, type InterviewPlanIntensity, type InterviewPlanPhase, type InterviewPlanSettings } from '../../data/interview-plan';
import { mockInterviewTracks } from '../../data/mock-interviews';
import { saveLastLearningActivity } from '../../lib/learning-activity';
import { sitePath } from '../../lib/site-path';

const emptyDraft = { trackId: mockInterviewTracks[0].id, targetDate: '', dailyMinutes: 45 as InterviewPlanIntensity };
const standardPhases: InterviewPlanPhase[] = ['foundation', 'drill', 'mock', 'review'];

function displayDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' });
}

export function InterviewPlanWorkspace() {
  const [draft, setDraft] = useState(emptyDraft);
  const [settings, setSettings] = useState<InterviewPlanSettings | null>(null);
  const [today, setToday] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const localToday = todayLocalIsoDate();
    const saved = window.localStorage.getItem(interviewPlanStorageKey);
    let nextSettings: InterviewPlanSettings | null = null;
    if (saved) {
      try { nextSettings = JSON.parse(saved) as InterviewPlanSettings; } catch { window.localStorage.removeItem(interviewPlanStorageKey); }
    }
    queueMicrotask(() => {
      setToday(localToday);
      if (nextSettings) {
        setSettings(nextSettings);
        setDraft({ trackId: nextSettings.trackId, targetDate: nextSettings.targetDate, dailyMinutes: nextSettings.dailyMinutes });
      } else {
        setDraft((current) => ({ ...current, targetDate: addDaysToIsoDate(localToday, 14) }));
      }
      setHydrated(true);
    });
  }, []);

  const daysLeft = draft.targetDate && today ? daysBetweenIsoDates(today, draft.targetDate) : 0;
  const previewDays = useMemo(() => settings && today ? buildInterviewPlanDays(settings, today) : [], [settings, today]);
  const activeTrack = mockInterviewTracks.find((track) => track.id === settings?.trackId);
  const settingsDaysLeft = settings && today ? Math.max(daysBetweenIsoDates(today, settings.targetDate), 0) : 0;
  const currentPhase = previewDays[0]?.phase;
  const visiblePhases = settings && daysBetweenIsoDates(settings.createdDate, settings.targetDate) <= 3 ? ['sprint' as const] : standardPhases;
  const visibleTasks = previewDays.flatMap((day) => day.tasks);
  const completedVisibleTasks = visibleTasks.filter((task) => settings?.completedTaskIds.includes(task.id)).length;

  const savePlan = () => {
    if (!today || !draft.targetDate || daysBetweenIsoDates(today, draft.targetDate) < 0) return;
    const keepCompletion = settings?.trackId === draft.trackId && settings.targetDate === draft.targetDate && settings.dailyMinutes === draft.dailyMinutes;
    const nextSettings: InterviewPlanSettings = {
      ...draft,
      createdDate: keepCompletion ? settings.createdDate : today,
      completedTaskIds: keepCompletion ? settings.completedTaskIds : [],
    };
    window.localStorage.setItem(interviewPlanStorageKey, JSON.stringify(nextSettings));
    setSettings(nextSettings);
    saveLastLearningActivity({ type: 'plan', trackId: draft.trackId, targetDate: draft.targetDate });
  };

  const toggleTask = (taskId: string) => {
    setSettings((current) => {
      if (!current) return current;
      const completedTaskIds = current.completedTaskIds.includes(taskId)
        ? current.completedTaskIds.filter((id) => id !== taskId)
        : [...current.completedTaskIds, taskId];
      const nextSettings = { ...current, completedTaskIds };
      window.localStorage.setItem(interviewPlanStorageKey, JSON.stringify(nextSettings));
      saveLastLearningActivity({ type: 'plan', trackId: current.trackId, targetDate: current.targetDate });
      return nextSettings;
    });
  };

  return (
    <main className="countdown-page">
      <SiteHeader active="plan" />
      <section className="countdown-hero">
        <nav className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>面试倒计时计划</strong></nav>
        <div><p className="eyebrow"><span /> TARGET DATE → DAILY ACTION</p><h1>别再问“今天学什么”，<br /><em>让面试日期倒推行动。</em></h1><p>选择目标岗位、日期和每日投入时间，计划只保存在当前设备；它安排学习顺序，不承诺面试结果。</p></div>
      </section>
      <section className="countdown-setup" aria-busy={!hydrated}>
        <header><span>01 · SET THE DEADLINE</span><h2>先把约束说清楚。</h2></header>
        <div className="countdown-form-grid">
          <label><span>目标岗位</span><select value={draft.trackId} onChange={(event) => setDraft((current) => ({ ...current, trackId: event.target.value }))}>{mockInterviewTracks.map((track) => <option value={track.id} key={track.id}>{track.role}</option>)}</select></label>
          <label><span>面试日期</span><input type="date" min={today} value={draft.targetDate} onChange={(event) => setDraft((current) => ({ ...current, targetDate: event.target.value }))} /></label>
          <fieldset><legend>每日投入</legend>{([20, 45, 90] as const).map((minutes) => <button className={draft.dailyMinutes === minutes ? 'active' : ''} type="button" aria-pressed={draft.dailyMinutes === minutes} onClick={() => setDraft((current) => ({ ...current, dailyMinutes: minutes }))} key={minutes}>{minutes}<span>分钟</span></button>)}</fieldset>
        </div>
        <div className="countdown-save-bar"><div><span>{daysLeft >= 0 ? `距离面试 ${daysLeft} 天` : '请选择今天之后的日期'}</span><strong>{mockInterviewTracks.find((track) => track.id === draft.trackId)?.title}</strong><small>每日 {draft.dailyMinutes} 分钟 · 本机保存 · 随日期自动推进阶段</small></div><button type="button" disabled={!hydrated || !draft.targetDate || daysLeft < 0} onClick={savePlan}>{settings ? '更新冲刺计划' : '生成冲刺计划'} <span>→</span></button></div>
        {settings && previewDays[0] && <p className="countdown-preview-note">计划已生成：今天进入“{previewDays[0].phaseLabel}”，修改目标后点击更新即可重新倒排。</p>}
      </section>

      {settings && previewDays[0] && <>
        <section className="countdown-overview">
          <div><span>距离面试</span><strong>{settingsDaysLeft}<b> 天</b></strong><p>{settings.targetDate} · {activeTrack?.role}</p></div>
          <div><span>今日阶段</span><strong>{previewDays[0].phaseLabel}</strong><p>{interviewPlanPhaseMeta[previewDays[0].phase].description}</p></div>
          <div><span>每日预算</span><strong>{settings.dailyMinutes}<b> 分钟</b></strong><p>{previewDays[0].tasks.length} 个有边界的学习动作</p></div>
          <div><span>未来 7 天</span><strong>{completedVisibleTasks}<b> / {visibleTasks.length}</b></strong><p>只统计当前窗口内已勾选任务</p></div>
        </section>

        <section className="countdown-plan-shell">
          <div className="countdown-section-head"><div><span>02 · PHASES</span><h2>先补机制，再练表达，最后收口。</h2></div><p>阶段会随日期自动推进。时间缩短时会压缩前面的学习，把完整模拟和最后复盘保留下来。</p></div>
          <div className={`countdown-phase-grid ${visiblePhases.length === 1 ? 'sprint' : ''}`}>{visiblePhases.map((phase, index) => <article className={currentPhase === phase ? 'active' : ''} key={phase}><span>{String(index + 1).padStart(2, '0')}</span><strong>{interviewPlanPhaseMeta[phase].label}</strong><p>{interviewPlanPhaseMeta[phase].description}</p><small>{currentPhase === phase ? '当前阶段' : phase === 'foundation' ? '前 28%' : phase === 'drill' ? '28%–63%' : phase === 'mock' ? '63%–88%' : phase === 'review' ? '最后 12%' : '全部剩余时间'}</small></article>)}</div>

          <div className="countdown-section-head week"><div><span>03 · NEXT SEVEN DAYS</span><h2>未来七天，具体做什么？</h2></div><p>点击圆点标记完成；所有状态只保存在当前设备。任务链接直接进入站内课程、单题、实验或整场模拟。</p></div>
          <div className="countdown-week-grid">{previewDays.map((day, dayIndex) => { const completed = day.tasks.filter((task) => settings.completedTaskIds.includes(task.id)).length; return <article className={dayIndex === 0 ? 'today' : ''} key={day.date}><header><div><span>{dayIndex === 0 ? 'TODAY' : `DAY ${dayIndex + 1}`}</span><strong>{displayDate(day.date)}</strong></div><div><b>{day.phaseLabel}</b><small>{completed}/{day.tasks.length}</small></div></header><ol>{day.tasks.map((task) => { const done = settings.completedTaskIds.includes(task.id); return <li className={done ? 'done' : ''} key={task.id}><button type="button" aria-pressed={done} aria-label={done ? `取消完成：${task.title}` : `标记完成：${task.title}`} onClick={() => toggleTask(task.id)}>{done ? '✓' : ''}</button><a href={sitePath(task.href)}><span>{task.minutes} MIN</span><strong>{task.title}</strong><small>{task.detail}</small></a></li>; })}</ol></article>; })}</div>
          <div className="countdown-plan-note"><span>PLAN BOUNDARY</span><p>这份计划根据剩余时间分配站内内容，不知道你的真实基础、公司流程或面试轮次。每天完成后仍应根据实际弱项调整，不要为了打勾跳过理解。</p><a href={sitePath('/progress/')}>查看本机学习进度 →</a></div>
        </section>
      </>}
      <SiteFooter />
    </main>
  );
}
