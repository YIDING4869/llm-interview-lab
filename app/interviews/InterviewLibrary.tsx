'use client';

import { useMemo, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { interviewFocuses, interviewRecords, type InterviewFocus } from '../../data/interviews';
import { sitePath } from '../../lib/site-path';

export function InterviewLibrary() {
  const [focus, setFocus] = useState<'全部' | InterviewFocus>('全部');
  const [query, setQuery] = useState('');

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return interviewRecords.filter((record) => {
      const matchesFocus = focus === '全部' || record.focuses.includes(focus);
      const text = `${record.company} ${record.role} ${record.campaign} ${record.summary} ${record.themes.join(' ')}`.toLowerCase();
      return matchesFocus && (!normalized || text.includes(normalized));
    });
  }, [focus, query]);

  return (
    <main className="interviews-page">
      <SiteHeader active="interviews" />

      <section className="interviews-hero">
        <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>国内真实面经</strong></div>
        <div className="interviews-hero-grid">
          <div><p className="eyebrow"><span /> PUBLIC REPORTS / TRACEABLE SOURCES</p><h1>看真实追问怎样发生，<br /><em>不要把面经背成题库。</em></h1></div>
          <div className="interview-source-contract">
            <p>首批内容来自候选人公开复盘。页面保留发布日期、轮次、作者自述结果和原始链接；问题经过摘要与改写，不代表公司官方固定题目。</p>
            <dl><div><dt>{interviewRecords.length}</dt><dd>公开记录</dd></div><div><dt>07</dt><dd>公司 / 业务群</dd></div><div><dt>首批</dt><dd>持续补充</dd></div></dl>
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
          <label><span>SEARCH REPORTS</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="公司、岗位或主题" /></label>
          <div className="interview-focus-filter"><span>按追问方向筛选</span>{interviewFocuses.map((item) => <button className={focus === item ? 'active' : ''} type="button" aria-pressed={focus === item} onClick={() => setFocus(item)} key={item}>{item}<b>{item === '全部' ? interviewRecords.length : interviewRecords.filter((record) => record.focuses.includes(item)).length}</b></button>)}</div>
          <div className="interview-boundary"><span>怎么使用</span><p>先尝试回答卡片里的改写问题，再打开原帖补上下文。不要根据一条经历推断 HC、难度或公司统一偏好。</p></div>
        </aside>

        <div className="interview-results">
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
