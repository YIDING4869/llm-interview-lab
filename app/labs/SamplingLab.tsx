'use client';

import { useMemo, useState } from 'react';

const candidates = [
  { token: '需要', logit: 4.6 },
  { token: '可以', logit: 4.05 },
  { token: '通过', logit: 3.5 },
  { token: '先', logit: 3.05 },
  { token: '正在', logit: 2.55 },
  { token: '不会', logit: 1.9 },
  { token: '也许', logit: 1.35 },
  { token: '但是', logit: .8 },
];

function softmax(values: number[]) {
  const max = Math.max(...values);
  const weights = values.map((value) => Math.exp(value - max));
  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights.map((value) => value / total);
}

export function SamplingLab() {
  const [temperature, setTemperature] = useState(.8);
  const [topK, setTopK] = useState(6);
  const [topP, setTopP] = useState(.9);

  const result = useMemo(() => {
    const baseProbabilities = softmax(candidates.map((candidate) => candidate.logit / temperature));
    const ranked = candidates
      .map((candidate, index) => ({ ...candidate, baseProbability: baseProbabilities[index] }))
      .sort((left, right) => right.baseProbability - left.baseProbability)
      .slice(0, topK);

    const nucleus = ranked.reduce<{ selected: typeof ranked; cumulative: number }>((state, candidate, index) => ({
      selected: index === 0 || state.cumulative < topP ? [...state.selected, candidate] : state.selected,
      cumulative: state.cumulative + candidate.baseProbability,
    }), { selected: [], cumulative: 0 }).selected;
    const keptMass = nucleus.reduce((sum, candidate) => sum + candidate.baseProbability, 0);
    const rows = candidates.map((candidate) => {
      const kept = nucleus.find((item) => item.token === candidate.token);
      return { ...candidate, probability: kept ? kept.baseProbability / keptMass : 0, kept: Boolean(kept) };
    });
    const entropy = rows.reduce((sum, row) => row.probability ? sum - row.probability * Math.log2(row.probability) : sum, 0);
    return { rows, entropy, activeCount: nucleus.length };
  }, [temperature, topK, topP]);

  return (
    <section className="standalone-lab sampling-lab" aria-labelledby="sampling-lab-title">
      <div className="standalone-lab-head">
        <div><span>LAB 05 / GENERATION</span><h2 id="sampling-lab-title">Sampling Playground</h2><p>在同一组 next-token logits 上调节 temperature、Top-K 与 Top-P，观察概率如何被拉平、截断和重新归一化。</p></div>
        <div className="lab-live-metrics" aria-live="polite"><div><strong>{result.activeCount}</strong><span>ACTIVE TOKENS</span></div><div><strong>{result.entropy.toFixed(2)}</strong><span>ENTROPY / BITS</span></div></div>
      </div>

      <div className="sampling-workbench">
        <aside className="sampling-controls">
          <div className="sampling-prompt"><span>固定上下文</span><p>“回答 LLM 面试题时，候选人 ____”</p></div>
          <label><span>Temperature <b>{temperature.toFixed(2)}</b></span><input type="range" min="0.2" max="2" step="0.05" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /><small>越低越集中，越高越平坦。</small></label>
          <label><span>Top-K <b>{topK}</b></span><input type="range" min="1" max={candidates.length} value={topK} onChange={(event) => setTopK(Number(event.target.value))} /><small>只保留概率最高的 K 个候选。</small></label>
          <label><span>Top-P <b>{topP.toFixed(2)}</b></span><input type="range" min="0.2" max="1" step="0.05" value={topP} onChange={(event) => setTopP(Number(event.target.value))} /><small>保留累计概率达到阈值的最小集合。</small></label>
          <button type="button" onClick={() => { setTemperature(.8); setTopK(6); setTopP(.9); }}>恢复推荐起点</button>
        </aside>

        <div className="sampling-output" aria-live="polite">
          <div className="sampling-output-head"><span>NEXT-TOKEN DISTRIBUTION</span><span>经过截断后重新归一化</span></div>
          <div className="sampling-bars">
            {result.rows.map((row, index) => (
              <div className={row.kept ? 'kept' : 'filtered'} key={row.token}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{row.token}</strong>
                <div><i style={{ width: `${row.probability * 100}%` }} /></div>
                <b>{(row.probability * 100).toFixed(1)}%</b>
              </div>
            ))}
          </div>
          <div className="token-boundary-note"><span>面试表达</span><p>Temperature 先改变完整分布的形状，Top-K / Top-P 再决定允许采样的候选集合。它们控制随机性与尾部风险，但不能修复模型本身不知道或推理错误的问题。</p></div>
        </div>
      </div>
    </section>
  );
}
