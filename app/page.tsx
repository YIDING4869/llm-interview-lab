'use client';

import { useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { entryRoutes, knowledgeModules } from '../data/curriculum';
import { interviewRecords } from '../data/interviews';
import { foundationLessons } from '../data/lessons';
import { practiceCategories, practiceQuestions } from '../data/practice';
import { readLastLearningActivity } from '../lib/learning-activity';
import { sitePath } from '../lib/site-path';

type ResumeCard = {
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  badge: string;
};

type PracticeProgressSnapshot = Record<string, {
  steps?: Record<string, boolean>;
  questions?: Record<string, { attempts?: unknown[] }>;
  attempts?: unknown[];
}>;

const roadmaps = [
  { index: '01', title: '基础、Transformer 与多模态', detail: 'Tokenizer、Attention、RoPE、视觉 token 与跨模态融合', count: '22 topics', tone: 'blue' },
  { index: '02', title: '后训练、对齐与推理模型', detail: 'SFT、Reward Model、RLHF、GRPO 与 Thinking Budget', count: '17 topics', tone: 'lime' },
  { index: '03', title: 'RAG 与 Agent', detail: '检索、重排、工具调用、记忆与 Agent 评测', count: '14 topics', tone: 'violet' },
  { index: '04', title: '推理与系统', detail: 'KV Cache、量化、并行、批处理与服务架构', count: '15 topics', tone: 'orange' },
  { index: '05', title: '评测与可靠性', detail: 'LLM-as-a-Judge、偏差、幻觉、安全与 badcase', count: '11 topics', tone: 'cyan' },
  { index: '06', title: '项目深挖', detail: '实验设计、基线、失败分析、成本与扩展追问', count: '12 topics', tone: 'pink' },
];

const resources = [
  { type: 'COURSE', title: 'Stanford CS336', subtitle: 'Language Modeling from Scratch', href: 'https://cs336.stanford.edu/', tag: '训练与系统' },
  { type: 'COURSE', title: 'Hugging Face LLM Course', subtitle: 'Transformers、微调与生态实践', href: 'https://huggingface.co/learn/llm-course/en/chapter1/1', tag: '基础实践' },
  { type: 'BLOG', title: "Lil'Log", subtitle: 'Agent、推理、对齐与前沿综述', href: 'https://lilianweng.github.io/archives/', tag: '深度阅读' },
  { type: 'PAPER', title: 'Attention Is All You Need', subtitle: 'Transformer 原始论文', href: 'https://arxiv.org/abs/1706.03762', tag: '经典论文' },
  { type: 'PAPER', title: 'Direct Preference Optimization', subtitle: '偏好优化的核心推导', href: 'https://arxiv.org/abs/2305.18290', tag: '后训练' },
  { type: 'PAPER', title: 'PagedAttention / vLLM', subtitle: '大模型服务的显存管理', href: 'https://arxiv.org/abs/2309.06180', tag: '推理系统' },
];

function formatTimer(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, '0');
  const seconds = (total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function secondsForPractice(time: string) {
  const minutes = time.match(/(\d+)\s*分钟/);
  if (minutes) return Number(minutes[1]) * 60;
  const seconds = time.match(/(\d+)\s*秒/);
  return seconds ? Number(seconds[1]) : 90;
}

const dailyQuestion = practiceQuestions.find((question) => question.moduleId === 'inference') ?? practiceQuestions[0];

export default function Home() {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsForPractice(dailyQuestion.time));
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<(typeof practiceCategories)[number]>('全部');
  const [selectedId, setSelectedId] = useState(1);
  const [contextLength, setContextLength] = useState(4096);
  const [batchSize, setBatchSize] = useState(1);
  const [kvHeads, setKvHeads] = useState(8);
  const [notes, setNotes] = useState('');
  const [noteStatus, setNoteStatus] = useState('仅保存在此设备');
  const [resumeCard, setResumeCard] = useState<ResumeCard | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('llm-interview-lab-notes');
    const requestedQuestion = Number(new URLSearchParams(window.location.search).get('question'));
    const matchedQuestion = practiceQuestions.find((question) => question.id === requestedQuestion);
    const lastActivity = readLastLearningActivity();
    let nextResumeCard: ResumeCard | null = null;

    if (lastActivity?.type === 'practice') {
      const question = practiceQuestions.find((item) => item.id === lastActivity.questionId);
      const knowledgeModule = knowledgeModules.find((item) => item.id === lastActivity.moduleId);
      if (question && knowledgeModule) {
        let snapshot: PracticeProgressSnapshot = {};
        const savedProgress = window.localStorage.getItem('llm-interview-lab-progress-v1');
        if (savedProgress) {
          try { snapshot = JSON.parse(savedProgress) as PracticeProgressSnapshot; } catch { snapshot = {}; }
        }
        const moduleProgress = snapshot[knowledgeModule.id];
        const finishedSteps = Object.values(moduleProgress?.steps ?? {}).filter(Boolean).length;
        const attempts = moduleProgress?.questions?.[String(question.id)]?.attempts?.length ?? moduleProgress?.attempts?.length ?? 0;
        nextResumeCard = {
          eyebrow: '继续上次作答',
          title: question.title,
          detail: `${knowledgeModule.title} · ${finishedSteps}/4 个学习动作 · ${attempts} 次已保存作答`,
          href: `/practice/?module=${knowledgeModule.id}&question=${question.id}#answer`,
          badge: `${finishedSteps}/4`,
        };
      }
    } else if (lastActivity?.type === 'lesson') {
      const lesson = foundationLessons.find((item) => item.id === lastActivity.lessonId);
      const knowledgeModule = knowledgeModules.find((item) => item.id === lastActivity.moduleId);
      if (lesson && knowledgeModule) {
        let completed: Record<string, boolean> = {};
        const savedLessons = window.localStorage.getItem('llm-interview-lab-lesson-progress-v1');
        if (savedLessons) {
          try { completed = JSON.parse(savedLessons) as Record<string, boolean>; } catch { completed = {}; }
        }
        const finishedLessons = foundationLessons.filter((item) => completed[item.id]).length;
        nextResumeCard = {
          eyebrow: '继续上次课程',
          title: lesson.title,
          detail: `${knowledgeModule.title} · 已完成 ${finishedLessons}/${foundationLessons.length} 节`,
          href: `/lessons/?lesson=${lesson.id}`,
          badge: `${finishedLessons}/${foundationLessons.length}`,
        };
      }
    }

    queueMicrotask(() => {
      if (saved) setNotes(saved);
      if (nextResumeCard) setResumeCard(nextResumeCard);
      if (matchedQuestion) {
        setSelectedId(matchedQuestion.id);
        setActiveCategory(matchedQuestion.category);
      }
    });
  }, []);

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

  const filteredQuestions = useMemo(
    () => activeCategory === '全部' ? practiceQuestions : practiceQuestions.filter((question) => question.category === activeCategory),
    [activeCategory],
  );
  const selectedQuestion = practiceQuestions.find((question) => question.id === selectedId) ?? practiceQuestions[0];
  const kvMemoryGb = (2 * 32 * kvHeads * 128 * contextLength * batchSize * 2) / 1024 ** 3;

  const selectCategory = (category: (typeof practiceCategories)[number]) => {
    setActiveCategory(category);
    const firstMatch = category === '全部' ? practiceQuestions[0] : practiceQuestions.find((question) => question.category === category);
    if (firstMatch) setSelectedId(firstMatch.id);
  };

  const handleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(secondsForPractice(dailyQuestion.time));
      setTimerRunning(true);
      return;
    }
    setTimerRunning((running) => !running);
  };

  const saveNotes = () => {
    window.localStorage.setItem('llm-interview-lab-notes', notes);
    setNoteStatus(`已保存 · ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
  };

  return (
    <main>
      <SiteHeader active="home" />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> LEARN · EXPLAIN · DEFEND</p>
          <h1>把 LLM 知识，练成<br /><em>面试时能讲清楚的答案。</em></h1>
          <p className="hero-lead">
            从原理理解到限时表达，从第一问到连续追问。为 LLM、Agent、后训练与推理岗位准备的一站式学习实验室。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href={sitePath('/practice/?module=transformer&quickstart=1#answer')}>3 分钟开始体验 <span>→</span></a>
            <a className="text-button" href={sitePath(`/lessons/${foundationLessons[0].id}/`)}>零基础从第一课开始 <span>↗</span></a>
          </div>
          <p className="quickstart-caption">无需注册 · 30 秒作答 · 对照答案结构 · 打开可视化实验</p>
          <dl className="hero-stats">
            <div><dt>03</dt><dd>背景入口</dd></div>
            <div><dt>{foundationLessons.length}</dt><dd>站内基础课</dd></div>
            <div><dt>{knowledgeModules.length}</dt><dd>知识模块</dd></div>
          </dl>
        </div>

        <div className="practice-shell" id="practice">
          <div className="shell-topline"><span>DAILY PRACTICE</span><span>{dailyQuestion.id.toString().padStart(2, '0')} / {practiceQuestions.length}</span></div>
          <div className="practice-card">
            <div className="card-meta"><span className="topic-pill">{dailyQuestion.category}</span><span>建议 {dailyQuestion.time}</span></div>
            <p className="question-label">INTERVIEW QUESTION</p>
            <h2>{dailyQuestion.title}</h2>
            <div className="prompt-hint"><span className="hint-index">提示</span><p>{dailyQuestion.hint}</p></div>
            <div className="card-actions">
              <button type="button" onClick={handleTimer} aria-live="polite">
                {secondsLeft === 0 ? '重新预演' : timerRunning ? '暂停计时' : '开始口头预演'}
                <span>{formatTimer(secondsLeft)}</span>
              </button>
            </div>
          </div>
          <div className="shell-footer"><span><i className="status-dot" /> 这里只做口头预演；保存答案请进入完整作答</span><a href={sitePath(`/practice/?module=${dailyQuestion.moduleId}&question=${dailyQuestion.id}#answer`)}>进入完整作答 →</a></div>
        </div>
      </section>

      {resumeCard && (
        <section className="home-resume-section" aria-label="继续学习">
          <div className="home-resume-copy"><span>{resumeCard.eyebrow}</span><h2>{resumeCard.title}</h2><p>{resumeCard.detail}</p></div>
          <div className="home-resume-progress"><span>DEVICE PROGRESS</span><strong>{resumeCard.badge}</strong></div>
          <a href={sitePath(resumeCard.href)}>从上次位置继续 <span>→</span></a>
        </section>
      )}

      <section className="home-entry-section">
        <div className="home-entry-head">
          <div><p className="section-kicker">START FROM WHERE YOU ARE</p><h2>零基础、转码和 ML 背景，不应该拿到同一张书单。</h2></div>
          <a href={sitePath('/learn/')}>打开完整学习地图 <span>→</span></a>
        </div>
        <div className="home-entry-grid">
          {entryRoutes.map((route, index) => (
            <a className={`home-entry-card route-${route.color}`} href={sitePath(`/learn/?route=${route.id}#entry-routes`)} key={route.id}>
              <div><span>{(index + 1).toString().padStart(2, '0')}</span><span>{route.label}</span></div>
              <h3>{route.title}</h3>
              <p>{route.audience}</p>
              <strong>{route.duration} <b>↗</b></strong>
            </a>
          ))}
        </div>
      </section>

      <section className="roadmap-section section" id="roadmap">
        <div className="section-head">
          <div><p className="section-kicker">01 / THE KNOWLEDGE SKELETON</p><h2>先看完整骨架，再选择岗位分支。</h2></div>
          <p>基础、模型和评测是共同主干；后训练、推理、Agent 与机制研究按岗位深入。每个模块都有前置知识、阶段产物和面试能力。</p>
        </div>
        <div className="roadmap-grid">
          {roadmaps.map((roadmap) => (
            <a className={`roadmap-card tone-${roadmap.tone}`} href={sitePath('/learn/')} key={roadmap.index}>
              <div className="roadmap-top"><span>{roadmap.index}</span><span>{roadmap.count}</span></div>
              <div className="roadmap-symbol" aria-hidden="true">{roadmap.index === '01' ? 'QKᵀ' : roadmap.index === '02' ? 'πθ' : roadmap.index === '03' ? '↗↙' : roadmap.index === '04' ? 'KV' : roadmap.index === '05' ? '±' : '∴'}</div>
              <h3>{roadmap.title}</h3>
              <p>{roadmap.detail}</p>
              <span className="roadmap-link">进入路线 <b>↗</b></span>
            </a>
          ))}
        </div>
      </section>

      <section className="question-section" id="question-bank">
        <div className="section question-inner">
          <div className="section-head light-head">
            <div><p className="section-kicker">02 / QUESTION BANK</p><h2>不背标准答案，练习答案的结构。</h2></div>
            <div className="question-bank-head-action"><p>每道题包含短答案、必答点和连续追问。点击题目进入回答拆解。</p><a href={sitePath('/questions/')}>搜索完整题库 →</a></div>
          </div>
          <div className="filter-row" aria-label="题目分类">
            {practiceCategories.map((category) => (
              <button key={category} type="button" className={activeCategory === category ? 'active' : ''} onClick={() => selectCategory(category)} aria-pressed={activeCategory === category}>{category}</button>
            ))}
          </div>
          <div className="question-layout">
            <div className="question-list">
              {filteredQuestions.map((question) => (
                <button className={`question-row ${selectedId === question.id ? 'selected' : ''}`} key={question.id} type="button" onClick={() => setSelectedId(question.id)}>
                  <span className="question-number">{question.id.toString().padStart(2, '0')}</span>
                  <span className="question-summary"><small>{question.category} · {question.difficulty}</small><strong>{question.title}</strong></span>
                  <span className="question-time">{question.time}<b>→</b></span>
                </button>
              ))}
              {filteredQuestions.length === 0 && <p className="empty-state">这一分类的题目正在整理。</p>}
            </div>
            <article className="answer-panel">
              <div className="answer-panel-head"><span>ANSWER STRUCTURE</span><span>Q{selectedQuestion.id.toString().padStart(2, '0')}</span></div>
              <h3>{selectedQuestion.title}</h3>
              <p className="answer-copy">{selectedQuestion.answer}</p>
              <h4>必答点</h4>
              <ul>{selectedQuestion.points.map((point) => <li key={point}>{point}</li>)}</ul>
              <div className="followup-box"><span>FOLLOW-UP</span><p>{selectedQuestion.followup}</p></div>
              <div className="answer-panel-links"><a className="answer-module-link" href={sitePath(`/practice/?module=${selectedQuestion.moduleId}&question=${selectedQuestion.id}#answer`)}>进入对应题目训练 <span>→</span></a><a href={sitePath(`/questions/${selectedQuestion.id}/`)}>打开独立题目页 ↗</a></div>
            </article>
          </div>
        </div>
      </section>

      <section className="interview-preview-section section">
        <div className="section-head">
          <div><p className="section-kicker">03 / REAL INTERVIEW REPORTS</p><h2>看看国内岗位，真的会怎样连续追问。</h2></div>
          <div className="resource-head-action"><p>13 份公开流程整理出 52 道可筛选真题，并保留原帖、日期和结果边界。它们用于识别能力结构，不是公司官方题库。</p><a href={sitePath('/interviews/#real-questions')}>开始刷国内面试真题 →</a></div>
        </div>
        <div className="interview-preview-grid">
          {interviewRecords.slice(0, 3).map((record, index) => (
            <a className="interview-preview-card" href={sitePath('/interviews/')} key={record.id}>
              <div><span>{String(index + 1).padStart(2, '0')}</span><span>{record.published}</span></div>
              <p>{record.company}</p><h3>{record.role}</h3>
              <div className="interview-preview-themes">{record.themes.slice(0, 3).map((theme) => <span key={theme}>{theme}</span>)}</div>
              <strong>{record.rounds}<b>→</b></strong>
            </a>
          ))}
        </div>
      </section>

      <section className="lab-section section" id="labs">
        <div className="section-head">
          <div><p className="section-kicker">04 / VISUAL LAB</p><h2>把抽象概念变成可以调节的变量。</h2></div>
          <p>八项实验已经可以使用，新增从 Input 到 Output 的完整 Transformer Forward Trace；首页保留容量估算器，完整控制请进入 Labs。</p>
        </div>
        <div className="lab-nav">
          <a className="active" href={sitePath('/labs/?lab=kv')}><span>06</span> KV Cache Calculator <b>LIVE</b></a>
          <a href={sitePath('/labs/?lab=shapes')}><span>01</span> Tensor Shape Lab <b>LIVE</b></a>
          <a href={sitePath('/labs/?lab=gradient')}><span>02</span> Gradient Descent <b>LIVE</b></a>
          <a href={sitePath('/labs/?lab=transformer')}><span>08</span> Transformer Forward <b>NEW</b></a>
        </div>
        <div className="lab-stage">
          <div className="lab-controls">
            <div className="lab-title"><p>KV CACHE / FP16</p><h3>显存估算器</h3><span>假设 32 层、head dim = 128</span></div>
            <label><span>上下文长度 <b>{contextLength.toLocaleString()}</b></span><input type="range" min="512" max="32768" step="512" value={contextLength} onChange={(event) => setContextLength(Number(event.target.value))} /></label>
            <label><span>Batch size <b>{batchSize}</b></span><input type="range" min="1" max="32" value={batchSize} onChange={(event) => setBatchSize(Number(event.target.value))} /></label>
            <label><span>KV heads <b>{kvHeads}</b></span><input type="range" min="1" max="32" value={kvHeads} onChange={(event) => setKvHeads(Number(event.target.value))} /></label>
            <p className="formula">2 × layers × kv_heads × head_dim × seq_len × batch × bytes</p>
          </div>
          <div className="lab-output">
            <div className="memory-total"><span>ESTIMATED KV MEMORY</span><strong>{kvMemoryGb < 1 ? `${(kvMemoryGb * 1024).toFixed(0)} MB` : `${kvMemoryGb.toFixed(2)} GB`}</strong><small>不含模型权重、激活值和运行时开销</small></div>
            <div className="memory-visual" aria-label="KV Cache 显存相对占用示意">
              <div className="memory-axis"><span>0</span><span>8 GB</span><span>16 GB</span><span>24 GB+</span></div>
              <div className="memory-track"><span style={{ width: `${Math.min(100, (kvMemoryGb / 24) * 100)}%` }} /></div>
              <div className="memory-blocks">
                {Array.from({ length: 8 }, (_, index) => <span className={index < Math.max(1, Math.ceil((kvMemoryGb / 24) * 8)) ? 'filled' : ''} key={index}>L{(index + 1) * 4}</span>)}
              </div>
            </div>
            <div className="lab-insight"><span>面试表达</span><p>KV Cache 对上下文长度和 batch size 都是线性增长；把 MHA 的 32 个 KV heads 改成 8 个 GQA heads，在其他条件不变时，KV 显存约降到四分之一。</p><a href={sitePath('/labs/')}>进入完整实验室 →</a></div>
          </div>
        </div>
      </section>

      <section className="notes-section" id="notes">
        <div className="section notes-inner">
          <div className="notes-copy"><p className="section-kicker">05 / PERSONAL NOTES</p><h2>知识只有经过自己的语言，才真正属于你。</h2><p>记录今天没讲清楚的部分、面试官的追问，或者下一次复习时要验证的假设。第一版内容只保存在当前浏览器。</p><div className="notes-prompt"><span>今日复盘提示</span><strong>“我能否不用术语，向另一个工程师解释 KV Cache 的收益和瓶颈？”</strong></div></div>
          <div className="notes-editor">
            <div className="editor-top"><span>MY_NOTES.md</span><span>{noteStatus}</span></div>
            <textarea value={notes} onChange={(event) => { setNotes(event.target.value); setNoteStatus('有未保存修改'); }} placeholder={'# 今日复盘\n\n- 我已经能讲清楚：\n- 我仍然含糊的地方：\n- 下一次需要回答的追问：'} aria-label="个人面试复盘笔记" />
            <div className="editor-actions"><span>{notes.length} characters</span><button type="button" onClick={saveNotes}>保存到本机 <b>⌘ S</b></button></div>
          </div>
        </div>
      </section>

      <section className="resource-section section" id="resources">
        <div className="section-head">
          <div><p className="section-kicker">06 / CURATED LIBRARY</p><h2>少而可靠的阅读入口。</h2></div>
          <div className="resource-head-action"><p>链接指向原始课程、博客或论文。平台提供阅读路线和面试问题，不复制整篇内容。</p><a href={sitePath('/resources/')}>浏览完整资源库 →</a></div>
        </div>
        <div className="resource-grid">
          {resources.map((resource, index) => (
            <a className="resource-card" href={resource.href} target="_blank" rel="noreferrer" key={resource.title}>
              <div className="resource-meta"><span>{resource.type}</span><span>{(index + 1).toString().padStart(2, '0')}</span></div>
              <span className="resource-tag">{resource.tag}</span>
              <h3>{resource.title}</h3><p>{resource.subtitle}</p>
              <span className="resource-link">打开原始资源 ↗</span>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
