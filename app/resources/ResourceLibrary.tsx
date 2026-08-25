'use client';

import { useMemo, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { learningResources } from '../../data/curriculum';
import { sitePath } from '../../lib/site-path';

const stages = ['全部', '编程基础', '深度学习', 'LLM 核心', '应用与系统', '对齐与研究'] as const;
const audiences = ['全部人群', '零基础', '转码', 'ML 背景'] as const;

export function ResourceLibrary() {
  const [stage, setStage] = useState<(typeof stages)[number]>('全部');
  const [audience, setAudience] = useState<(typeof audiences)[number]>('全部人群');
  const [query, setQuery] = useState('');

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return learningResources.filter((resource) => {
      const matchesStage = stage === '全部' || resource.stage === stage;
      const matchesAudience = audience === '全部人群' || resource.audiences.includes(audience);
      const haystack = `${resource.title} ${resource.provider} ${resource.why} ${resource.stage}`.toLowerCase();
      return matchesStage && matchesAudience && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [stage, audience, query]);

  return (
    <main className="library-page">
      <SiteHeader active="resources" />

      <section className="library-hero">
        <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>资源库</strong></div>
        <div className="library-hero-grid">
          <div><p className="eyebrow"><span /> CURATED, NOT COLLECTED</p><h1>资料不是越多越好，<br /><em>关键是知道何时读、读完做什么。</em></h1></div>
          <div className="library-principles">
            <article><span>01</span><strong>按前置知识排序</strong><p>不把 CS336 推荐给还不会写训练循环的人。</p></article>
            <article><span>02</span><strong>每份资料绑定产物</strong><p>看完必须留下代码、实验、图表或口头解释。</p></article>
            <article><span>03</span><strong>原始来源优先</strong><p>课程、官方教程和论文承担事实主线，博客负责串联。</p></article>
          </div>
        </div>
      </section>

      <section className="library-browser">
        <div className="library-controls">
          <label className="resource-search"><span>SEARCH</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索课程、主题或作者" /></label>
          <div className="resource-filter-group"><span>学习阶段</span><div>{stages.map((item) => <button className={stage === item ? 'active' : ''} key={item} type="button" onClick={() => setStage(item)}>{item}</button>)}</div></div>
          <div className="resource-filter-group"><span>适合人群</span><div>{audiences.map((item) => <button className={audience === item ? 'active' : ''} key={item} type="button" onClick={() => setAudience(item)}>{item}</button>)}</div></div>
          <a className="route-reminder" href={sitePath('/learn/')}><span>还不确定从哪里开始？</span><strong>先选择学习路线 →</strong></a>
        </div>

        <div className="library-results">
          <div className="library-results-head"><span>{filteredResources.length.toString().padStart(2, '0')} RESOURCES</span><span>所有链接均指向原始来源 ↗</span></div>
          <div className="full-resource-grid">
            {filteredResources.map((resource, index) => (
              <a className="full-resource-card" href={resource.href} target="_blank" rel="noreferrer" key={resource.id}>
                <div className="full-resource-top"><span>{resource.type}</span><span>{(index + 1).toString().padStart(2, '0')}</span></div>
                <div className="full-resource-tags"><span>{resource.stage}</span><span>{resource.language}</span><span>{resource.time}</span></div>
                <h2>{resource.title}</h2><p className="resource-provider">{resource.provider}</p>
                <p className="resource-why">{resource.why}</p>
                <div className="resource-output"><span>建议产物</span><strong>{resource.deliverable}</strong></div>
                <div className="resource-audience"><span>适合</span>{resource.audiences.map((item) => <b key={item}>{item}</b>)}<i>打开资源 ↗</i></div>
              </a>
            ))}
          </div>
          {filteredResources.length === 0 && <div className="library-empty"><strong>没有匹配的资源</strong><p>减少筛选条件，或者先回到学习地图确认当前阶段。</p></div>}
        </div>
      </section>

      <section className="resource-boundary">
        <div><p className="section-kicker">A NOTE FOR BEGINNERS</p><h2>不要同时学习五门课。</h2></div>
        <p>零基础阶段同时保留一门主课、一份官方文档和一个小项目就够了。遇到不会的数学或工程概念再按需补齐；“先学完所有前置知识”通常只会推迟第一次真正的反馈。</p>
      </section>

      <SiteFooter />
    </main>
  );
}
