'use client';

import { useState } from 'react';

export function KvCacheLab() {
  const [layers, setLayers] = useState(32);
  const [contextLength, setContextLength] = useState(8192);
  const [batchSize, setBatchSize] = useState(4);
  const [kvHeads, setKvHeads] = useState(8);
  const [headDimension, setHeadDimension] = useState(128);
  const memoryGb = (2 * layers * kvHeads * headDimension * contextLength * batchSize * 2) / 1024 ** 3;
  const mhaMemoryGb = (2 * layers * 32 * headDimension * contextLength * batchSize * 2) / 1024 ** 3;

  return (
    <section className="standalone-lab kv-full-lab" aria-labelledby="kv-lab-title">
      <div className="standalone-lab-head">
        <div><span>LAB 06 / INFERENCE SYSTEMS</span><h2 id="kv-lab-title">KV Cache Calculator</h2><p>估算 FP16 KV Cache 容量，观察上下文、batch、层数和 KV heads 的线性关系。结果不包含权重、激活与运行时开销。</p></div>
        <div className="lab-live-metrics" aria-live="polite"><div><strong>{memoryGb < 1 ? `${(memoryGb * 1024).toFixed(0)} MB` : `${memoryGb.toFixed(2)} GB`}</strong><span>KV MEMORY</span></div><div><strong>{(mhaMemoryGb / Math.max(memoryGb, .0001)).toFixed(1)}×</strong><span>MHA / CURRENT</span></div></div>
      </div>
      <div className="kv-full-grid">
        <div className="kv-full-controls">
          <label><span>模型层数 <b>{layers}</b></span><input type="range" min="12" max="80" step="4" value={layers} onChange={(event) => setLayers(Number(event.target.value))} /></label>
          <label><span>上下文长度 <b>{contextLength.toLocaleString()}</b></span><input type="range" min="1024" max="131072" step="1024" value={contextLength} onChange={(event) => setContextLength(Number(event.target.value))} /></label>
          <label><span>Batch size <b>{batchSize}</b></span><input type="range" min="1" max="64" value={batchSize} onChange={(event) => setBatchSize(Number(event.target.value))} /></label>
          <label><span>KV heads <b>{kvHeads}</b></span><input type="range" min="1" max="32" value={kvHeads} onChange={(event) => setKvHeads(Number(event.target.value))} /></label>
          <label><span>Head dimension <b>{headDimension}</b></span><input type="range" min="64" max="256" step="64" value={headDimension} onChange={(event) => setHeadDimension(Number(event.target.value))} /></label>
          <p>2 × layers × kv_heads × head_dim × seq_len × batch × 2 bytes</p>
        </div>
        <div className="kv-full-output">
          <div className="kv-capacity-number"><span>ESTIMATED FP16 KV CACHE</span><strong>{memoryGb < 1 ? `${(memoryGb * 1024).toFixed(0)} MB` : `${memoryGb.toFixed(2)} GB`}</strong><small>当前配置 · 单个服务实例</small></div>
          <div className="kv-capacity-scale"><div><span>0</span><span>20 GB</span><span>40 GB</span><span>60 GB</span><span>80 GB+</span></div><div><span style={{ width: `${Math.min(100, (memoryGb / 80) * 100)}%` }} /></div></div>
          <div className="kv-comparison"><article><span>CURRENT KV HEADS</span><strong>{kvHeads}</strong><p>{memoryGb.toFixed(2)} GB</p></article><article><span>MHA BASELINE</span><strong>32</strong><p>{mhaMemoryGb.toFixed(2)} GB</p></article><article><span>CAPACITY SAVED</span><strong>{Math.max(0, 100 * (1 - memoryGb / mhaMemoryGb)).toFixed(0)}%</strong><p>仅比较 KV 容量</p></article></div>
          <div className="token-boundary-note"><span>面试表达</span><p>KV Cache 对层数、KV heads、上下文和 batch 都是线性增长。GQA/MQA 减少的是 K/V head 数，而 Query heads 可以保持不变；真实服务还会受到分页、碎片与调度影响。</p></div>
        </div>
      </div>
    </section>
  );
}
