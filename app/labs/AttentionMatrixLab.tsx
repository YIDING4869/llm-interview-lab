'use client';

import { useMemo, useState } from 'react';

const tokens = ['我', '正在', '学习', 'LLM'];
const queries = [[1, .2], [.45, 1], [.9, .65], [.25, 1.25]];
const keys = [[.9, .1], [.35, 1.1], [1, .55], [.2, 1.3]];

function softmax(values: number[]) {
  const finite = values.filter(Number.isFinite);
  const max = Math.max(...finite);
  const weights = values.map((value) => Number.isFinite(value) ? Math.exp(value - max) : 0);
  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights.map((value) => value / total);
}

export function AttentionMatrixLab() {
  const [queryIndex, setQueryIndex] = useState(2);
  const [causal, setCausal] = useState(true);
  const [scaled, setScaled] = useState(true);

  const matrix = useMemo(() => queries.map((query, row) => {
    const scores = keys.map((key, column) => {
      if (causal && column > row) return Number.NEGATIVE_INFINITY;
      const dot = query[0] * key[0] + query[1] * key[1];
      return scaled ? dot / Math.sqrt(2) : dot;
    });
    return softmax(scores);
  }), [causal, scaled]);

  const selected = matrix[queryIndex];
  const focusIndex = selected.indexOf(Math.max(...selected));
  const entropy = selected.reduce((sum, value) => value ? sum - value * Math.log2(value) : sum, 0);

  return (
    <section className="standalone-lab attention-lab" aria-labelledby="attention-lab-title">
      <div className="standalone-lab-head">
        <div><span>LAB 04 / TRANSFORMER</span><h2 id="attention-lab-title">Attention Matrix Lab</h2><p>使用固定的二维 Q/K 教学向量，观察点积分数、causal mask 与 Softmax 如何形成 token 之间的注意力权重。</p></div>
        <div className="lab-live-metrics" aria-live="polite"><div><strong>{tokens[focusIndex]}</strong><span>TOP KEY</span></div><div><strong>{entropy.toFixed(2)}</strong><span>ROW ENTROPY</span></div></div>
      </div>

      <div className="foundation-lab-grid">
        <aside className="foundation-lab-controls">
          <div className="foundation-control-intro"><span>选择 Query token</span><p>当前查看“<b>{tokens[queryIndex]}</b>”如何读取其他位置。</p></div>
          <div className="attention-token-buttons">{tokens.map((token, index) => <button className={queryIndex === index ? 'active' : ''} type="button" key={token} onClick={() => setQueryIndex(index)}><span>{String(index + 1).padStart(2, '0')}</span>{token}</button>)}</div>
          <label className="foundation-toggle"><span><strong>Causal mask</strong><small>禁止看到未来 token</small></span><input type="checkbox" checked={causal} onChange={(event) => setCausal(event.target.checked)} /></label>
          <label className="foundation-toggle"><span><strong>除以 √dₖ</strong><small>稳定 score 的尺度</small></span><input type="checkbox" checked={scaled} onChange={(event) => setScaled(event.target.checked)} /></label>
          <p className="foundation-formula">softmax(QKᵀ / √dₖ + mask)</p>
        </aside>

        <div className="foundation-lab-output attention-output">
          <div className="foundation-output-head"><span>ATTENTION WEIGHT MATRIX</span><span>行 = Query · 列 = Key</span></div>
          <div className="attention-matrix" style={{ gridTemplateColumns: `76px repeat(${tokens.length}, 1fr)` }}>
            <span className="matrix-corner">Q \ K</span>{tokens.map((token) => <strong className="matrix-label" key={`column-${token}`}>{token}</strong>)}
            {matrix.flatMap((row, rowIndex) => [<button className={`matrix-row-label ${queryIndex === rowIndex ? 'active' : ''}`} type="button" onClick={() => setQueryIndex(rowIndex)} key={`row-${tokens[rowIndex]}`}>{tokens[rowIndex]}</button>, ...row.map((weight, columnIndex) => <div className={`matrix-cell ${queryIndex === rowIndex ? 'selected' : ''} ${causal && columnIndex > rowIndex ? 'masked' : ''}`} style={{ backgroundColor: `rgba(54,89,217,${.08 + weight * .85})` }} key={`${rowIndex}-${columnIndex}`}><strong>{causal && columnIndex > rowIndex ? 'MASK' : `${Math.round(weight * 100)}%`}</strong><small>{tokens[rowIndex]} → {tokens[columnIndex]}</small></div>)])}
          </div>
          <div className="attention-row-detail"><span>SELECTED ROW</span>{selected.map((weight, index) => <div key={tokens[index]}><strong>{tokens[index]}</strong><i><b style={{ width: `${weight * 100}%` }} /></i><span>{(weight * 100).toFixed(1)}%</span></div>)}</div>
          <div className="token-boundary-note"><span>面试表达</span><p>Q/K 决定匹配权重，V 才是被聚合的内容。Causal mask 在 Softmax 前屏蔽未来位置；这里的二维向量仅用于教学，不代表真实模型学到的 head 模式。</p></div>
        </div>
      </div>
    </section>
  );
}
