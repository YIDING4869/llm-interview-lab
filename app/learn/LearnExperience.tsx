'use client';

import { useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { entryRoutes, knowledgeModules } from '../../data/curriculum';
import { sitePath } from '../../lib/site-path';

const clusters = ['基础层', '模型层', '训练层', '应用层', '系统与研究层'] as const;
const progressSteps = ['understand', 'answer', 'build', 'reflect'] as const;

type StoredProgress = Record<string, { steps?: Partial<Record<(typeof progressSteps)[number], boolean>> }>;

export function LearnExperience() {
  const [activeRouteId, setActiveRouteId] = useState(entryRoutes[0].id);
  const [progress, setProgress] = useState<StoredProgress>({});
  const activeRoute = entryRoutes.find((route) => route.id === activeRouteId) ?? entryRoutes[0];
  const routeModules = useMemo(
    () => activeRoute.sequence.map((id) => knowledgeModules.find((module) => module.id === id)).filter(Boolean),
    [activeRoute],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem('llm-interview-lab-progress-v1');
    if (!saved) return;
    try {
      setProgress(JSON.parse(saved) as StoredProgress);
    } catch {
      window.localStorage.removeItem('llm-interview-lab-progress-v1');
    }
  }, []);

  return (
    <main className="knowledge-page">
      <SiteHeader active="learn" />

      <section className="knowledge-hero">
        <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>学习地图</strong></div>
        <div className="knowledge-hero-grid">
          <div>
            <p className="eyebrow"><span /> FROM ZERO TO LLM SYSTEMS</p>
            <h1>不是一张书单，<br /><em>是一棵有前置关系的知识树。</em></h1>
          </div>
          <div className="knowledge-hero-aside">
            <p>先判断自己从哪里开始，再沿着“基础 → 模型 → 训练 → 应用 → 系统与研究”推进。每一阶段都必须产出能运行、能解释、能复盘的作品。</p>
            <dl><div><dt>03</dt><dd>学习入口</dd></div><div><dt>14</dt><dd>知识模块</dd></div><div><dt>05</dt><dd>能力层级</dd></div></dl>
          </div>
        </div>
      </section>

      <section className="entry-route-section" id="entry-routes">
        <div className="compact-section-head"><div><p className="section-kicker">STEP 01 / CHOOSE YOUR ENTRY</p><h2>你不需要从同一个起点出发。</h2></div><p>时间是建议强度，不是承诺。判断标准是阶段产物能否独立完成，而不是视频看完了多少。</p></div>
        <div className="entry-route-tabs" role="tablist" aria-label="选择学习起点">
          {entryRoutes.map((route) => (
            <button className={`entry-route-tab route-${route.color} ${activeRoute.id === route.id ? 'active' : ''}`} key={route.id} type="button" onClick={() => setActiveRouteId(route.id)} role="tab" aria-selected={activeRoute.id === route.id}>
              <span className="entry-tab-label">{route.label}</span>
              <strong>{route.title}</strong>
              <p>{route.audience}</p>
              <span className="entry-duration">{route.duration} <b>→</b></span>
            </button>
          ))}
        </div>

        <div className="selected-route-panel">
          <div className="selected-route-summary">
            <span>{activeRoute.label} PATH</span>
            <h3>{activeRoute.title}学习计划</h3>
            <p>{activeRoute.audience}</p>
            <div className="route-module-chain" aria-label="所需知识模块">
              {routeModules.map((module, index) => module && <a href={`#module-${module.id}`} key={module.id}><span>{(index + 1).toString().padStart(2, '0')}</span>{module.title}</a>)}
            </div>
          </div>
          <div className="route-phases">
            {activeRoute.phases.map((phase, index) => (
              <article key={phase.weeks}>
                <div className="phase-line"><span>{phase.weeks}</span><i /><b>{(index + 1).toString().padStart(2, '0')}</b></div>
                <h4>{phase.title}</h4>
                <p>{phase.focus}</p>
                <div><span>阶段产物</span><strong>{phase.deliverable}</strong></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="framework-section">
        <div className="compact-section-head light-compact-head"><div><p className="section-kicker">STEP 02 / THE WHOLE FRAMEWORK</p><h2>完整 LLM 知识框架</h2></div><p>必修模块形成共同语言；岗位分支按目标选择；进阶模块要求更严格的实验设计和结论边界。</p></div>
        <div className="framework-flow" aria-label="LLM 知识框架五层结构">
          {clusters.map((cluster, index) => (
            <div key={cluster}>
              <span>{(index + 1).toString().padStart(2, '0')}</span>
              <strong>{cluster}</strong>
              <small>{knowledgeModules.filter((module) => module.cluster === cluster).length} modules</small>
              {index < clusters.length - 1 && <b>→</b>}
            </div>
          ))}
        </div>
        <div className="knowledge-module-grid">
          {knowledgeModules.map((module) => {
            const routeIndex = activeRoute.sequence.indexOf(module.id);
            const completedActions = progressSteps.filter((step) => progress[module.id]?.steps?.[step]).length;
            return (
              <details className={`knowledge-module ${routeIndex >= 0 ? 'on-route' : ''}`} id={`module-${module.id}`} key={module.id}>
                <summary>
                  <span className="module-order">{module.order}</span>
                  <span className="module-heading"><small>{module.cluster} · {module.level}</small><strong>{module.title}</strong><p>{module.summary}</p></span>
                  <span className="module-route-state">{routeIndex >= 0 ? `PATH ${(routeIndex + 1).toString().padStart(2, '0')} · ${completedActions}/4` : `${completedActions}/4 DONE`}</span>
                  <span className="module-expand">＋</span>
                </summary>
                <div className="module-detail">
                  <div><span>前置知识</span><p>{module.prerequisites.join(' · ')}</p></div>
                  <div><span>核心概念</span><ul>{module.concepts.map((concept) => <li key={concept}>{concept}</li>)}</ul></div>
                  <div><span>学习产物</span><p>{module.output}</p></div>
                  <div><span>面试能力</span><p>{module.interview}</p></div>
                </div>
                <a className="module-practice-link" href={sitePath(`/practice/?module=${module.id}`)}><span>{completedActions === 4 ? '本模块闭环已完成' : `还需完成 ${4 - completedActions} 个学习动作`}</span><strong>进入模块学习闭环 →</strong></a>
              </details>
            );
          })}
        </div>
      </section>

      <section className="learning-contract-section">
        <div className="learning-contract">
          <div><p className="section-kicker">LEARNING CONTRACT</p><h2>如何判断一个模块真的学完了？</h2></div>
          <ol>
            <li><span>01</span><div><strong>能运行</strong><p>没有复制隐藏环境，能从干净环境完成一次最小实验。</p></div></li>
            <li><span>02</span><div><strong>能解释</strong><p>不用框架名堆砌，能从输入、状态、目标和取舍讲清楚。</p></div></li>
            <li><span>03</span><div><strong>能比较</strong><p>知道 baseline、控制变量、成本和失败案例应该怎么设。</p></div></li>
            <li><span>04</span><div><strong>能守边界</strong><p>明确结果支持什么、不支持什么，以及何时应该 no-call。</p></div></li>
          </ol>
          <a className="primary-button" href={sitePath('/practice/')}>开始第一个模块闭环 <span>→</span></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
