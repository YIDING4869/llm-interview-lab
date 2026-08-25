'use client';

import { useState } from 'react';

type StepRecord = { step: number; weight: number; loss: number; gradient: number };
const target = 3;

export function GradientDescentLab() {
  const [weight, setWeight] = useState(-2);
  const [learningRate, setLearningRate] = useState(.2);
  const [history, setHistory] = useState<StepRecord[]>([]);
  const loss = (weight - target) ** 2;
  const gradient = 2 * (weight - target);
  const nextWeight = weight - learningRate * gradient;
  const position = (value: number) => `${Math.max(0, Math.min(100, ((value + 6) / 16) * 100))}%`;

  function reset(nextWeightValue = -2) {
    setWeight(nextWeightValue);
    setHistory([]);
  }

  function stepOnce() {
    setHistory((current) => [...current.slice(-5), { step: current.length + 1, weight, loss, gradient }]);
    setWeight(nextWeight);
  }

  return (
    <section className="standalone-lab gradient-lab" aria-labelledby="gradient-lab-title">
      <div className="standalone-lab-head">
        <div><span>LAB 02 / OPTIMIZATION</span><h2 id="gradient-lab-title">Gradient Descent Lab</h2><p>在一维损失 L(w) = (w − 3)² 上逐步更新参数，观察梯度方向、学习率与收敛或震荡的关系。</p></div>
        <div className="lab-live-metrics" aria-live="polite"><div><strong>{loss.toFixed(3)}</strong><span>CURRENT LOSS</span></div><div><strong>{gradient.toFixed(2)}</strong><span>GRADIENT</span></div></div>
      </div>

      <div className="foundation-lab-grid">
        <aside className="foundation-lab-controls">
          <div className="foundation-control-intro"><span>更新规则</span><p>w ← w − η · ∂L/∂w</p></div>
          <label><span>Current w <b>{weight.toFixed(2)}</b></span><input type="range" min="-6" max="10" step="0.25" value={weight} onChange={(event) => reset(Number(event.target.value))} /></label>
          <label><span>Learning rate η <b>{learningRate.toFixed(2)}</b></span><input type="range" min="0.05" max="1.2" step="0.05" value={learningRate} onChange={(event) => setLearningRate(Number(event.target.value))} /></label>
          <div className="gradient-next"><span>NEXT UPDATE</span><strong>{weight.toFixed(2)} − {learningRate.toFixed(2)} × ({gradient.toFixed(2)})</strong><b>→ {nextWeight.toFixed(2)}</b></div>
          <div className="foundation-action-row"><button type="button" onClick={() => reset()}>重置</button><button type="button" onClick={stepOnce}>执行一步更新 →</button></div>
        </aside>

        <div className="foundation-lab-output gradient-output">
          <div className="foundation-output-head"><span>LOSS LANDSCAPE</span><span>目标参数 w* = {target}</span></div>
          <div className="gradient-landscape">
            <div className="gradient-axis"><span>-6</span><span>-2</span><span>2</span><span>6</span><span>10</span></div>
            <div className="gradient-track"><i className="target-marker" style={{ left: position(target) }}><span>最小值 3</span></i><i className="weight-marker" style={{ left: position(weight), height: `${Math.min(150, 28 + loss * 2)}px` }}><span>w = {weight.toFixed(2)}</span></i></div>
            <div className={`gradient-direction ${Math.abs(gradient) < .01 ? 'done' : ''}`}><span>{Math.abs(gradient) < .01 ? '已经到达最小值' : gradient < 0 ? '梯度为负，更新会向右移动 →' : '← 梯度为正，更新会向左移动'}</span></div>
          </div>
          <div className="gradient-history"><div><span>STEP</span><span>W</span><span>LOSS</span><span>GRADIENT</span></div>{history.length ? history.map((row) => <div key={`${row.step}-${row.weight}`}><span>{String(row.step).padStart(2, '0')}</span><span>{row.weight.toFixed(3)}</span><span>{row.loss.toFixed(3)}</span><span>{row.gradient.toFixed(3)}</span></div>) : <p>点击“执行一步更新”记录参数轨迹。</p>}</div>
          <div className="token-boundary-note"><span>观察重点</span><p>η 小时更新稳定但慢；η 接近 1 时可能在最小值两侧震荡；η 大于 1 时这组简单更新甚至会发散。真实神经网络只是把一个参数扩展成大量参数。</p></div>
        </div>
      </div>
    </section>
  );
}
