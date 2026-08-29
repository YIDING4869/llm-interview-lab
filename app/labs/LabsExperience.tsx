'use client';

import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { trackEvent } from '../../lib/analytics';
import { sitePath } from '../../lib/site-path';
import { AttentionMatrixLab } from './AttentionMatrixLab';
import { GradientDescentLab } from './GradientDescentLab';
import { KvCacheLab } from './KvCacheLab';
import { RetrievalLab } from './RetrievalLab';
import { SamplingLab } from './SamplingLab';
import { TensorShapeLab } from './TensorShapeLab';
import { TokenizerLab } from './TokenizerLab';
import { TransformerForwardLab } from './TransformerForwardLab';

type LabId = 'shapes' | 'gradient' | 'tokenizer' | 'attention' | 'sampling' | 'kv' | 'retrieval' | 'transformer';

const labIds: LabId[] = ['shapes', 'gradient', 'tokenizer', 'attention', 'sampling', 'kv', 'retrieval', 'transformer'];

export function LabsExperience() {
  const [activeLab, setActiveLab] = useState<LabId>('tokenizer');
  const switcherRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const requestedLab = new URLSearchParams(window.location.search).get('lab');
    const initialLab = labIds.includes(requestedLab as LabId) ? requestedLab as LabId : 'tokenizer';
    queueMicrotask(() => {
      setActiveLab(initialLab);
      trackEvent('lab_open', { lab_id: initialLab });
    });
  }, []);

  useEffect(() => {
    const switcher = switcherRef.current;
    const activeButton = switcher?.querySelector<HTMLElement>('button.active');
    if (!switcher || !activeButton || switcher.scrollWidth <= switcher.clientWidth) return;
    switcher.scrollTo({ left: activeButton.offsetLeft - (switcher.clientWidth - activeButton.clientWidth) / 2, behavior: 'smooth' });
  }, [activeLab]);

  function selectLab(lab: LabId) {
    if (lab === activeLab) return;
    setActiveLab(lab);
    trackEvent('lab_open', { lab_id: lab });
    const url = new URL(window.location.href);
    url.searchParams.set('lab', lab);
    window.history.replaceState({}, '', url);
  }

  return (
    <main className="labs-page">
      <SiteHeader active="labs" />
      <section className="labs-hero">
        <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>可视化实验室</strong></div>
        <div className="labs-hero-grid"><div><p className="eyebrow"><span /> CHANGE ONE VARIABLE AT A TIME</p><h1>不要只记结论，<br /><em>亲手改变变量。</em></h1></div><p>每个实验只保留解释核心机制所需的控制。它们用于建立直觉与面试表达，不替代真实模型、生产服务或正式 benchmark。</p></div>
      </section>

      <nav className="labs-switcher" aria-label="选择实验" ref={switcherRef}>
        <button className={activeLab === 'shapes' ? 'active' : ''} type="button" onClick={() => selectLab('shapes')}><span>01</span><strong>Tensor Shape Lab</strong><small>张量与维度</small></button>
        <button className={activeLab === 'gradient' ? 'active' : ''} type="button" onClick={() => selectLab('gradient')}><span>02</span><strong>Gradient Descent</strong><small>优化与学习率</small></button>
        <button className={activeLab === 'tokenizer' ? 'active' : ''} type="button" onClick={() => selectLab('tokenizer')}><span>03</span><strong>Tokenizer Explorer</strong><small>切分与上下文</small></button>
        <button className={activeLab === 'attention' ? 'active' : ''} type="button" onClick={() => selectLab('attention')}><span>04</span><strong>Attention Matrix</strong><small>QK 与 Mask</small></button>
        <button className={activeLab === 'sampling' ? 'active' : ''} type="button" onClick={() => selectLab('sampling')}><span>05</span><strong>Sampling Playground</strong><small>生成与随机性</small></button>
        <button className={activeLab === 'kv' ? 'active' : ''} type="button" onClick={() => selectLab('kv')}><span>06</span><strong>KV Cache Calculator</strong><small>容量与服务</small></button>
        <button className={activeLab === 'retrieval' ? 'active' : ''} type="button" onClick={() => selectLab('retrieval')}><span>07</span><strong>RAG Retrieval Lab</strong><small>召回与排序</small></button>
        <button className={activeLab === 'transformer' ? 'active' : ''} type="button" onClick={() => selectLab('transformer')}><span>08</span><strong>Transformer Trace</strong><small>Input 到 Output</small></button>
      </nav>

      <div className="labs-stage">
        {activeLab === 'shapes' && <TensorShapeLab />}
        {activeLab === 'gradient' && <GradientDescentLab />}
        {activeLab === 'tokenizer' && <TokenizerLab />}
        {activeLab === 'attention' && <AttentionMatrixLab />}
        {activeLab === 'sampling' && <SamplingLab />}
        {activeLab === 'kv' && <KvCacheLab />}
        {activeLab === 'retrieval' && <RetrievalLab />}
        {activeLab === 'transformer' && <TransformerForwardLab />}
      </div>
      <SiteFooter />
    </main>
  );
}
