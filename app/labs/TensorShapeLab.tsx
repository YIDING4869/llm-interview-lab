'use client';

import { useState } from 'react';

export function TensorShapeLab() {
  const [batch, setBatch] = useState(2);
  const [sequence, setSequence] = useState(8);
  const [hidden, setHidden] = useState(64);
  const [output, setOutput] = useState(128);

  const hiddenElements = batch * sequence * hidden;
  const outputElements = batch * sequence * output;
  const hiddenMemoryKb = (hiddenElements * 4) / 1024;

  return (
    <section className="standalone-lab shape-lab" aria-labelledby="shape-lab-title">
      <div className="standalone-lab-head">
        <div><span>LAB 01 / FOUNDATIONS</span><h2 id="shape-lab-title">Tensor Shape Lab</h2><p>改变 batch、sequence、hidden 和 output，观察 Embedding 与 Linear layer 如何保留或变换维度。</p></div>
        <div className="lab-live-metrics" aria-live="polite"><div><strong>{hiddenElements.toLocaleString()}</strong><span>HIDDEN VALUES</span></div><div><strong>{hiddenMemoryKb < 1024 ? `${hiddenMemoryKb.toFixed(0)} KB` : `${(hiddenMemoryKb / 1024).toFixed(2)} MB`}</strong><span>FP32 MEMORY</span></div></div>
      </div>

      <div className="foundation-lab-grid">
        <aside className="foundation-lab-controls">
          <div className="foundation-control-intro"><span>当前语义</span><p>一批包含 <b>{batch}</b> 个样本，每个样本有 <b>{sequence}</b> 个 token，每个 token 用 <b>{hidden}</b> 个数字表示。</p></div>
          <label><span>Batch <b>{batch}</b></span><input type="range" min="1" max="8" value={batch} onChange={(event) => setBatch(Number(event.target.value))} /></label>
          <label><span>Sequence <b>{sequence}</b></span><input type="range" min="2" max="32" step="2" value={sequence} onChange={(event) => setSequence(Number(event.target.value))} /></label>
          <label><span>Hidden <b>{hidden}</b></span><input type="range" min="32" max="256" step="32" value={hidden} onChange={(event) => setHidden(Number(event.target.value))} /></label>
          <label><span>Linear output <b>{output}</b></span><input type="range" min="32" max="256" step="32" value={output} onChange={(event) => setOutput(Number(event.target.value))} /></label>
          <p className="foundation-formula">[B, S, H] × [H, O] → [B, S, O]</p>
        </aside>

        <div className="foundation-lab-output shape-output">
          <div className="foundation-output-head"><span>SHAPE TRACE</span><span>最后一维被 Linear layer 变换</span></div>
          <div className="shape-pipeline">
            <article><span>01 / TOKEN IDS</span><strong>[{batch}, {sequence}]</strong><p>每个位置是一个整数 token id。</p><div className="shape-dim-row"><i style={{ flex: batch }} /><i style={{ flex: sequence }} /></div></article>
            <b>→</b>
            <article className="active"><span>02 / EMBEDDING</span><strong>[{batch}, {sequence}, {hidden}]</strong><p>查表后，每个 token 得到 hidden 维向量。</p><div className="shape-dim-row"><i style={{ flex: batch }} /><i style={{ flex: sequence }} /><i style={{ flex: Math.max(1, hidden / 32) }} /></div></article>
            <b>→</b>
            <article><span>03 / LINEAR</span><strong>[{batch}, {sequence}, {output}]</strong><p>Batch 与 sequence 保留，hidden 变为 output。</p><div className="shape-dim-row"><i style={{ flex: batch }} /><i style={{ flex: sequence }} /><i style={{ flex: Math.max(1, output / 32) }} /></div></article>
          </div>
          <div className="shape-ledger"><article><span>INPUT WEIGHT</span><strong>[{hidden}, {output}]</strong><p>中间维 {hidden} 必须相等</p></article><article><span>OUTPUT VALUES</span><strong>{outputElements.toLocaleString()}</strong><p>{batch} × {sequence} × {output}</p></article><article><span>WHAT CHANGED</span><strong>H → O</strong><p>{hidden} → {output}</p></article></div>
          <div className="token-boundary-note"><span>面试表达</span><p>线性层通常只变换最后一维。遇到 shape mismatch 时，先写出每一维的语义和矩阵乘法要求，不要用 reshape 把不理解的问题隐藏起来。</p></div>
        </div>
      </div>
    </section>
  );
}
