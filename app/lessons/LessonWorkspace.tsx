'use client';

import { useEffect, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { knowledgeModules, learningResources } from '../../data/curriculum';
import { foundationLessons, lessonsForModule } from '../../data/lessons';
import { practiceQuestions } from '../../data/practice';
import { saveLastLearningActivity } from '../../lib/learning-activity';
import { sitePath } from '../../lib/site-path';

const lessonStorageKey = 'llm-interview-lab-lesson-progress-v1';
const practiceStorageKey = 'llm-interview-lab-progress-v1';

export function LessonWorkspace() {
  const [activeLessonId, setActiveLessonId] = useState(foundationLessons[0].id);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [checkpointSelections, setCheckpointSelections] = useState<Record<string, number>>({});
  const [checkpointChecks, setCheckpointChecks] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const requestedLesson = new URLSearchParams(window.location.search).get('lesson');
    const saved = window.localStorage.getItem(lessonStorageKey);
    queueMicrotask(() => {
      if (requestedLesson && foundationLessons.some((lesson) => lesson.id === requestedLesson)) setActiveLessonId(requestedLesson);
      if (saved) {
        try {
          setCompleted(JSON.parse(saved) as Record<string, boolean>);
        } catch {
          window.localStorage.removeItem(lessonStorageKey);
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(lessonStorageKey, JSON.stringify(completed));

    const savedPractice = window.localStorage.getItem(practiceStorageKey);
    let practiceProgress: Record<string, { steps?: Record<string, boolean> }> = {};
    if (savedPractice) {
      try {
        practiceProgress = JSON.parse(savedPractice) as typeof practiceProgress;
      } catch {
        window.localStorage.removeItem(practiceStorageKey);
      }
    }
    let changed = false;
    for (const knowledgeModule of knowledgeModules) {
      const moduleLessons = lessonsForModule(knowledgeModule.id);
      if (moduleLessons.length === 0 || !moduleLessons.every((lesson) => completed[lesson.id])) continue;
      if (practiceProgress[knowledgeModule.id]?.steps?.understand) continue;
      practiceProgress[knowledgeModule.id] = {
        ...practiceProgress[knowledgeModule.id],
        steps: { ...practiceProgress[knowledgeModule.id]?.steps, understand: true },
      };
      changed = true;
    }
    if (changed) window.localStorage.setItem(practiceStorageKey, JSON.stringify(practiceProgress));
  }, [completed, hydrated]);

  const activeLesson = foundationLessons.find((lesson) => lesson.id === activeLessonId) ?? foundationLessons[0];
  const activeModule = knowledgeModules.find((module) => module.id === activeLesson.moduleId) ?? knowledgeModules[0];
  const activeIndex = foundationLessons.findIndex((lesson) => lesson.id === activeLesson.id);
  const nextLesson = foundationLessons[activeIndex + 1];
  const finishedCount = foundationLessons.filter((lesson) => completed[lesson.id]).length;
  const selectedCheckpointOption = checkpointSelections[activeLesson.id];
  const checkpointChecked = Boolean(checkpointChecks[activeLesson.id]);
  const checkpointCorrect = checkpointChecked && selectedCheckpointOption === activeLesson.checkpoint.correctIndex;
  const moduleQuestion = practiceQuestions.find((question) => question.moduleId === activeLesson.moduleId);
  const lessonResourceIds = activeLesson.resourceIds ?? moduleQuestion?.resourceIds ?? [];
  const moduleResources = learningResources.filter((resource) => lessonResourceIds.includes(resource.id)).slice(0, 3);
  const modulesWithLessons = knowledgeModules.filter((module) => lessonsForModule(module.id).length > 0);

  useEffect(() => {
    if (!hydrated) return;
    saveLastLearningActivity({ type: 'lesson', moduleId: activeLesson.moduleId, lessonId: activeLesson.id });
  }, [activeLesson.id, activeLesson.moduleId, hydrated]);

  function selectLesson(lessonId: string) {
    setActiveLessonId(lessonId);
    const url = new URL(window.location.href);
    url.searchParams.set('lesson', lessonId);
    window.history.replaceState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectCheckpointOption(optionIndex: number) {
    setCheckpointSelections((current) => ({ ...current, [activeLesson.id]: optionIndex }));
    setCheckpointChecks((current) => ({ ...current, [activeLesson.id]: false }));
  }

  function checkCheckpoint() {
    if (selectedCheckpointOption === undefined) return;
    setCheckpointChecks((current) => ({ ...current, [activeLesson.id]: true }));
    if (selectedCheckpointOption === activeLesson.checkpoint.correctIndex) {
      setCompleted((current) => ({ ...current, [activeLesson.id]: true }));
    }
  }

  return (
    <main className="lessons-page">
      <SiteHeader active="lessons" />

      <section className="lessons-hero">
        <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><a href={sitePath('/learn/')}>学习地图</a><span>→</span><strong>基础课程</strong></div>
        <div className="lessons-hero-grid">
          <div><p className="eyebrow"><span /> ZERO TO ONE / COMPLETE SPINE</p><h1>把名词拆成步骤，<br /><em>从第一行代码走到 LLM 系统。</em></h1></div>
          <div className="lesson-overall-progress"><div><span>完整主干</span><strong>{foundationLessons.length} 节站内课</strong></div><div className="lesson-progress-number"><strong>{finishedCount}</strong><span>/ {foundationLessons.length} COMPLETED</span></div><div className="lesson-progress-track"><span style={{ width: `${(finishedCount / foundationLessons.length) * 100}%` }} /></div><p>进度只保存在当前设备；完成标准是能解释检查题，而不是只滚到页面底部。</p></div>
        </div>
      </section>

      <section className="lesson-workspace">
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-head"><span>课程目录</span><strong>从零到 LLM 主干</strong></div>
          {modulesWithLessons.map((module) => {
            const moduleLessons = lessonsForModule(module.id);
            const moduleDone = moduleLessons.filter((lesson) => completed[lesson.id]).length;
            return <div className="lesson-module-group" key={module.id}><div><span>{module.order}</span><strong>{module.title}</strong><b>{moduleDone}/{moduleLessons.length}</b></div>{moduleLessons.map((lesson) => <button className={activeLesson.id === lesson.id ? 'active' : ''} type="button" onClick={() => selectLesson(lesson.id)} key={lesson.id}><span>{completed[lesson.id] ? '✓' : lesson.order}</span><strong>{lesson.title}</strong><small>{lesson.duration}</small></button>)}</div>;
          })}
        </aside>

        <article className="lesson-reader">
          <header className="lesson-reader-head">
            <div className="lesson-reader-meta"><span>LESSON {activeLesson.order}</span><span>{activeModule.title}</span><span>{activeLesson.duration}</span><span>{activeLesson.level}</span><a href={sitePath(`/lessons/${activeLesson.id}/`)}>独立课程页 ↗</a></div>
            <p className="lesson-eyebrow">{activeLesson.eyebrow}</p>
            <h2>{activeLesson.title}</h2>
            <p className="lesson-summary">{activeLesson.summary}</p>
            <div className="lesson-goals"><span>学完你应该能够</span><ol>{activeLesson.goals.map((goal, index) => <li key={goal}><b>{String(index + 1).padStart(2, '0')}</b>{goal}</li>)}</ol></div>
          </header>

          <div className="lesson-body">
            {activeLesson.sections.map((section, index) => (
              <section className="lesson-section" key={section.title}>
                <div className="lesson-section-title"><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{section.title}</h3><p>{section.lead}</p></div></div>
                {section.paragraphs?.map((paragraph) => <p className="lesson-paragraph" key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul className="lesson-bullets">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                {section.formula && <div className="lesson-formula"><span>{section.formula.label}</span><strong>{section.formula.expression}</strong><p>{section.formula.explanation}</p></div>}
                {section.code && <div className="lesson-code"><div><span>{section.code.language.toUpperCase()}</span><span>MINIMAL EXAMPLE</span></div><pre><code>{section.code.source}</code></pre></div>}
                {section.callout && <aside className="lesson-callout"><span>建立直觉</span><p>{section.callout}</p></aside>}
              </section>
            ))}

            <section className="lesson-checkpoint">
              <div><span>CHECKPOINT</span><strong>选择答案，提交后查看解释。</strong></div>
              <h3>{activeLesson.checkpoint.question}</h3>
              <p><b>提示：</b>{activeLesson.checkpoint.hint}</p>
              <div className="lesson-quiz-options" role="group" aria-label="检查题选项">
                {activeLesson.checkpoint.options.map((option, index) => {
                  const isSelected = selectedCheckpointOption === index;
                  const isCorrectAnswer = checkpointChecked && index === activeLesson.checkpoint.correctIndex;
                  const isWrongAnswer = checkpointChecked && isSelected && index !== activeLesson.checkpoint.correctIndex;
                  return <button className={`${isSelected ? 'selected' : ''} ${isCorrectAnswer ? 'correct' : ''} ${isWrongAnswer ? 'wrong' : ''}`} type="button" aria-pressed={isSelected} onClick={() => selectCheckpointOption(index)} key={option}><span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong></button>;
                })}
              </div>
              <div className="lesson-quiz-actions">
                <button type="button" disabled={selectedCheckpointOption === undefined} onClick={checkCheckpoint}>检查答案</button>
                <span>{checkpointChecked ? checkpointCorrect ? '回答正确，本节已标记完成。' : '还差一步，看看高亮答案与解释。' : '选择一个你认为最准确的答案。'}</span>
              </div>
              {checkpointChecked && <div className={`lesson-quiz-feedback ${checkpointCorrect ? 'correct' : 'wrong'}`} aria-live="polite"><strong>{checkpointCorrect ? '回答正确' : '重新建立推理链'}</strong><p>{activeLesson.checkpoint.answer}</p></div>}
            </section>

            <section className="lesson-takeaways">
              <div><span>TAKEAWAYS</span><h3>离开这一节前，记住三件事。</h3></div>
              <ol>{activeLesson.takeaways.map((takeaway, index) => <li key={takeaway}><span>{String(index + 1).padStart(2, '0')}</span>{takeaway}</li>)}</ol>
            </section>

            <section className="lesson-connections">
              <div><span>继续练习</span><strong>把理解连接到实验、面试题和原始资料。</strong></div>
              <div>
                {activeLesson.labHref && <a href={sitePath(activeLesson.labHref)}>打开对应可视化实验 <span>→</span></a>}
                {moduleQuestion && <a href={sitePath(`/practice/?module=${activeLesson.moduleId}`)}>进入 {activeModule.title} 学习闭环 <span>→</span></a>}
                {moduleResources.map((resource) => <a href={resource.href} target="_blank" rel="noreferrer" key={resource.id}>{resource.title} <span>↗</span></a>)}
              </div>
            </section>

            <div className="lesson-finish-row">
              <button className={completed[activeLesson.id] ? 'complete' : ''} type="button" onClick={() => setCompleted((current) => ({ ...current, [activeLesson.id]: !current[activeLesson.id] }))}>{completed[activeLesson.id] ? '✓ 已完成本节' : '标记本节完成'}</button>
              {nextLesson ? <button type="button" onClick={() => selectLesson(nextLesson.id)}>下一节：{nextLesson.title} →</button> : <a href={sitePath('/practice/')}>进入学习闭环 →</a>}
            </div>
          </div>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
