'use client';

import { useEffect, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { sitePath } from '../../lib/site-path';
import { KvCacheLab } from './KvCacheLab';
import { RetrievalLab } from './RetrievalLab';
import { TokenizerLab } from './TokenizerLab';

type LabId = 'kv' | 'tokenizer' | 'retrieval';

export function LabsExperience() {
  const [activeLab, setActiveLab] = useState<LabId>('tokenizer');

  useEffect(() => {
    const requestedLab = new URLSearchParams(window.location.search).get('lab');
    if (requestedLab === 'kv' || requestedLab === 'tokenizer' || requestedLab === 'retrieval') setActiveLab(requestedLab);
  }, []);

  return (
    <main className="labs-page">
      <SiteHeader active="labs" />
      <section className="labs-hero">
        <div className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>可视化实验室</strong></div>
        <div className="labs-hero-grid"><div><p className="eyebrow"><span /> CHANGE ONE VARIABLE AT A TIME</p><h1>不要只记结论，<br /><em>亲手改变变量。</em></h1></div><p>每个实验只保留解释核心机制所需的控制。它们用于建立直觉与面试表达，不替代真实模型、生产服务或正式 benchmark。</p></div>
      </section>

      <nav className="labs-switcher" aria-label="选择实验">
        <button className={activeLab === 'kv' ? 'active' : ''} type="button" onClick={() => setActiveLab('kv')}><span>01</span><strong>KV Cache Calculator</strong><small>容量与服务</small></button>
        <button className={activeLab === 'tokenizer' ? 'active' : ''} type="button" onClick={() => setActiveLab('tokenizer')}><span>02</span><strong>Tokenizer Explorer</strong><small>切分与上下文</small></button>
        <button className={activeLab === 'retrieval' ? 'active' : ''} type="button" onClick={() => setActiveLab('retrieval')}><span>03</span><strong>RAG Retrieval Lab</strong><small>召回与排序</small></button>
      </nav>

      <div className="labs-stage">
        {activeLab === 'kv' && <KvCacheLab />}
        {activeLab === 'tokenizer' && <TokenizerLab />}
        {activeLab === 'retrieval' && <RetrievalLab />}
      </div>
      <SiteFooter />
    </main>
  );
}
