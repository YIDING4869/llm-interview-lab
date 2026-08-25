'use client';

import { useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { entryRoutes } from '../data/curriculum';
import { sitePath } from '../lib/site-path';

type Question = {
  id: number;
  category: string;
  difficulty: '基础' | '进阶' | '系统设计';
  time: string;
  title: string;
  answer: string;
  points: string[];
  followup: string;
};

const roadmaps = [
  { index: '01', title: '基础与 Transformer', detail: 'Tokenizer、Attention、RoPE、归一化与训练目标', count: '16 topics', tone: 'blue' },
  { index: '02', title: '后训练与对齐', detail: 'SFT、Reward Model、RLHF、DPO 与 GRPO', count: '12 topics', tone: 'lime' },
  { index: '03', title: 'RAG 与 Agent', detail: '检索、重排、工具调用、记忆与 Agent 评测', count: '14 topics', tone: 'violet' },
  { index: '04', title: '推理与系统', detail: 'KV Cache、量化、并行、批处理与服务架构', count: '15 topics', tone: 'orange' },
  { index: '05', title: '评测与可靠性', detail: 'LLM-as-a-Judge、偏差、幻觉、安全与 badcase', count: '11 topics', tone: 'cyan' },
  { index: '06', title: '项目深挖', detail: '实验设计、基线、失败分析、成本与扩展追问', count: '12 topics', tone: 'pink' },
];

const questions: Question[] = [
  {
    id: 1,
    category: '推理系统',
    difficulty: '进阶',
    time: '90 秒',
    title: '为什么 KV Cache 能加速自回归生成？它的代价是什么？',
    answer: 'KV Cache 保存历史 token 在每一层产生的 Key 和 Value。解码新 token 时只需计算当前 token 的 Q/K/V，并让新的 Query 与缓存的 Key/Value 做注意力，避免反复重算整个前缀。代价是显存随 batch、层数、KV head 数、head dimension 和上下文长度线性增长。',
    points: ['区分 prefill 与 decode', '说明避免重复计算的对象', '给出 KV 显存的主要变量', '提到 MQA/GQA 或 PagedAttention'],
    followup: '如果把 MHA 换成 GQA，KV Cache 的大小会发生什么变化？',
  },
  {
    id: 2,
    category: 'Transformer',
    difficulty: '基础',
    time: '60 秒',
    title: '为什么 Attention 分数要除以 √dₖ？',
    answer: '当 Q 和 K 的各维近似独立且方差稳定时，点积方差会随维度 dₖ 增长。除以 √dₖ 能把分数尺度拉回稳定范围，减少 softmax 过早饱和，从而保留有效梯度。',
    points: ['从点积方差解释', '连接 softmax 饱和', '说明是稳定尺度而非改变表达能力'],
    followup: '如果使用 cosine attention，这个缩放还以同样形式存在吗？',
  },
  {
    id: 3,
    category: '后训练',
    difficulty: '进阶',
    time: '120 秒',
    title: 'DPO 与基于 PPO 的 RLHF，优化目标和工程流程有什么区别？',
    answer: 'PPO-RLHF 通常需要显式 Reward Model，并在在线采样中用策略优化约束新旧策略距离；DPO 从偏好对和参考模型直接构造分类式目标，隐式恢复相对奖励，训练流程更接近监督学习。DPO 更简单稳定，但仍依赖偏好数据、参考策略与超参数，不能等同于消除了对齐偏差。',
    points: ['是否显式训练 Reward Model', '在线采样与离线偏好对', '参考模型和 KL 约束的角色', '不要把训练简单等同于效果更好'],
    followup: 'DPO 中 β 过大或过小分别可能带来什么现象？',
  },
  {
    id: 4,
    category: 'RAG / Agent',
    difficulty: '系统设计',
    time: '5 分钟',
    title: '设计一个带可验证引用的企业知识库问答系统。',
    answer: '先明确文档更新频率、权限、延迟与答案可拒绝边界；再设计解析、切块、索引、混合检索、重排和生成链路。评测应拆为检索召回、引用支持率、答案正确性与拒答质量，并保留可定位到原文片段的证据。',
    points: ['先澄清需求与权限', '检索和生成分层评测', '引用必须能回到原文', '讨论更新、缓存、延迟和失败降级'],
    followup: '如果答案正确但引用不支持答案，应该如何计分和处理？',
  },
  {
    id: 5,
    category: '评测',
    difficulty: '进阶',
    time: '120 秒',
    title: '如何判断 LLM-as-a-Judge 的评分是否可信？',
    answer: '需要与人工标注比较一致性，并测试位置偏差、长度偏好、自我偏好、rubric 稳定性和不同 judge 间分歧。不能只报告平均相关性；还应查看分层误差、置信度、顺序交换后的稳定性以及不可判定样本。',
    points: ['人工参考标签', '位置与自我偏好', '多 judge 分歧', '明确 no-call 或人工复核边界'],
    followup: '如果两个 judge 的平均分高度相关，但逐样本经常不一致，能否替代人工评测？',
  },
  {
    id: 6,
    category: '项目深挖',
    difficulty: '系统设计',
    time: '3 分钟',
    title: '你的实验优于 baseline，如何证明提升来自核心方法而不是额外计算量？',
    answer: '构造计算量、数据量和调用次数匹配的 baseline，报告成本与延迟，并用消融拆开核心组件。若无法完全匹配，应明确剩余混杂因素，把结论限定为当前系统配置下的整体改进。',
    points: ['计算与数据预算匹配', '关键组件消融', '报告方差和失败案例', '限制因果归因范围'],
    followup: '如果最强 baseline 的成本是你的两倍，你会如何公平呈现结果？',
  },
];

const resources = [
  { type: 'COURSE', title: 'Stanford CS336', subtitle: 'Language Modeling from Scratch', href: 'https://cs336.stanford.edu/', tag: '训练与系统' },
  { type: 'COURSE', title: 'Hugging Face LLM Course', subtitle: 'Transformers、微调与生态实践', href: 'https://huggingface.co/learn/llm-course/en/chapter1/1', tag: '基础实践' },
  { type: 'BLOG', title: "Lil'Log", subtitle: 'Agent、推理、对齐与前沿综述', href: 'https://lilianweng.github.io/archives/', tag: '深度阅读' },
  { type: 'PAPER', title: 'Attention Is All You Need', subtitle: 'Transformer 原始论文', href: 'https://arxiv.org/abs/1706.03762', tag: '经典论文' },
  { type: 'PAPER', title: 'Direct Preference Optimization', subtitle: '偏好优化的核心推导', href: 'https://arxiv.org/abs/2305.18290', tag: '后训练' },
  { type: 'PAPER', title: 'PagedAttention / vLLM', subtitle: '大模型服务的显存管理', href: 'https://arxiv.org/abs/2309.06180', tag: '推理系统' },
];

const categories = ['全部', 'Transformer', '后训练', 'RAG / Agent', '推理系统', '评测', '项目深挖'];

function formatTimer(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, '0');
  const seconds = (total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function Home() {
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedId, setSelectedId] = useState(1);
  const [contextLength, setContextLength] = useState(4096);
  const [batchSize, setBatchSize] = useState(1);
  const [kvHeads, setKvHeads] = useState(8);
  const [notes, setNotes] = useState('');
  const [noteStatus, setNoteStatus] = useState('仅保存在此设备');

  useEffect(() => {
    const saved = window.localStorage.getItem('llm-interview-lab-notes');
    if (saved) setNotes(saved);
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
    () => activeCategory === '全部' ? questions : questions.filter((question) => question.category === activeCategory),
    [activeCategory],
  );
  const selectedQuestion = questions.find((question) => question.id === selectedId) ?? questions[0];
  const kvMemoryGb = (2 * 32 * kvHeads * 128 * contextLength * batchSize * 2) / 1024 ** 3;

  const handleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(90);
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
            <a className="primary-button" href="#practice">开始今日训练 <span>→</span></a>
            <a className="text-button" href="#roadmap">查看完整路线 <span>↓</span></a>
          </div>
          <dl className="hero-stats">
            <div><dt>03</dt><dd>背景入口</dd></div>
            <div><dt>14</dt><dd>知识模块</dd></div>
            <div><dt>06</dt><dd>精编面试题</dd></div>
          </dl>
        </div>

        <div className="practice-shell" id="practice">
          <div className="shell-topline"><span>DAILY PRACTICE</span><span>01 / 05</span></div>
          <div className="practice-card">
            <div className="card-meta"><span className="topic-pill">推理系统</span><span>建议 90 秒</span></div>
            <p className="question-label">INTERVIEW QUESTION</p>
            <h2>为什么 KV Cache 能加速自回归生成？它的代价是什么？</h2>
            <div className="prompt-hint"><span className="hint-index">提示</span><p>从 prefill / decode 两个阶段，以及时间复杂度和显存占用回答。</p></div>
            <div className="card-actions">
              <button type="button" onClick={handleTimer} aria-live="polite">
                {secondsLeft === 0 ? '重新练习' : timerRunning ? '暂停计时' : '开始作答'}
                <span>{formatTimer(secondsLeft)}</span>
              </button>
              <button className={`icon-button ${bookmarked ? 'is-bookmarked' : ''}`} type="button" aria-label={bookmarked ? '取消收藏' : '收藏题目'} onClick={() => setBookmarked((value) => !value)}>{bookmarked ? '✓' : '＋'}</button>
            </div>
          </div>
          <div className="shell-footer"><span><i className="status-dot" /> 今日进度 20%</span><span>下一题：PagedAttention →</span></div>
        </div>
      </section>

      <section className="home-entry-section">
        <div className="home-entry-head">
          <div><p className="section-kicker">START FROM WHERE YOU ARE</p><h2>零基础、转码和 ML 背景，不应该拿到同一张书单。</h2></div>
          <a href={sitePath('/learn/')}>打开完整学习地图 <span>→</span></a>
        </div>
        <div className="home-entry-grid">
          {entryRoutes.map((route, index) => (
            <a className={`home-entry-card route-${route.color}`} href={sitePath('/learn/#entry-routes')} key={route.id}>
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
            <p>每道题包含短答案、必答点和连续追问。点击题目进入回答拆解。</p>
          </div>
          <div className="filter-row" aria-label="题目分类">
            {categories.map((category) => (
              <button key={category} type="button" className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category}>{category}</button>
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
            </article>
          </div>
        </div>
      </section>

      <section className="lab-section section" id="labs">
        <div className="section-head">
          <div><p className="section-kicker">03 / VISUAL LAB</p><h2>把抽象概念变成可以调节的变量。</h2></div>
          <p>第一项实验已经可以使用。改变上下文、batch 和 KV heads，观察显存如何变化。</p>
        </div>
        <div className="lab-nav">
          <button className="active" type="button"><span>01</span> KV Cache Calculator <b>LIVE</b></button>
          <button type="button" disabled><span>02</span> Tokenizer Explorer <b>NEXT</b></button>
          <button type="button" disabled><span>03</span> Sampling Playground <b>NEXT</b></button>
          <button type="button" disabled><span>04</span> RAG Retrieval Lab <b>NEXT</b></button>
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
            <div className="lab-insight"><span>面试表达</span><p>KV Cache 对上下文长度和 batch size 都是线性增长；把 MHA 的 32 个 KV heads 改成 8 个 GQA heads，在其他条件不变时，KV 显存约降到四分之一。</p></div>
          </div>
        </div>
      </section>

      <section className="notes-section" id="notes">
        <div className="section notes-inner">
          <div className="notes-copy"><p className="section-kicker">04 / PERSONAL NOTES</p><h2>知识只有经过自己的语言，才真正属于你。</h2><p>记录今天没讲清楚的部分、面试官的追问，或者下一次复习时要验证的假设。第一版内容只保存在当前浏览器。</p><div className="notes-prompt"><span>今日复盘提示</span><strong>“我能否不用术语，向另一个工程师解释 KV Cache 的收益和瓶颈？”</strong></div></div>
          <div className="notes-editor">
            <div className="editor-top"><span>MY_NOTES.md</span><span>{noteStatus}</span></div>
            <textarea value={notes} onChange={(event) => { setNotes(event.target.value); setNoteStatus('有未保存修改'); }} placeholder={'# 今日复盘\n\n- 我已经能讲清楚：\n- 我仍然含糊的地方：\n- 下一次需要回答的追问：'} aria-label="个人面试复盘笔记" />
            <div className="editor-actions"><span>{notes.length} characters</span><button type="button" onClick={saveNotes}>保存到本机 <b>⌘ S</b></button></div>
          </div>
        </div>
      </section>

      <section className="resource-section section" id="resources">
        <div className="section-head">
          <div><p className="section-kicker">05 / CURATED LIBRARY</p><h2>少而可靠的阅读入口。</h2></div>
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
