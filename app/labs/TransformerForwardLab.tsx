'use client';

import { FormEvent, useMemo, useState } from 'react';

type Vector = number[];
type Matrix = number[][];

type LayerTrace = {
  input: Matrix;
  norm1: Matrix;
  q: Matrix;
  k: Matrix;
  v: Matrix;
  scores: Matrix;
  weights: Matrix;
  context: Matrix;
  attentionProjected: Matrix;
  postAttention: Matrix;
  norm2: Matrix;
  gate: Matrix;
  up: Matrix;
  activated: Matrix;
  ffnOutput: Matrix;
  output: Matrix;
};

type ForwardTrace = {
  tokens: string[];
  tokenIds: number[];
  embeddings: Matrix;
  layers: LayerTrace[];
  finalNorm: Matrix;
  logits: Matrix;
  probabilities: Matrix;
  positionPredictions: string[];
  prediction: string;
};

const hiddenSize = 4;
const ffnSize = 8;
const outputVocabulary = ['模型', '学习', '答案', '继续', '。', '很', '清晰', 'Transformer'];

function splitInput(text: string) {
  return text.trim().match(/[\p{Script=Han}]|[A-Za-z0-9]+|[^\s]/gu)?.slice(0, 6) ?? [];
}

function tokenId(token: string) {
  let hash = 17;
  for (const character of token) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 997;
  return (hash % 96) + 1;
}

function add(left: Vector, right: Vector) {
  return left.map((value, index) => value + right[index]);
}

function dot(left: Vector, right: Vector) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function linear(input: Vector, weight: Matrix) {
  return weight[0].map((_, column) => input.reduce((sum, value, row) => sum + value * weight[row][column], 0));
}

function makeWeight(rows: number, columns: number, seed: number, scale = .42): Matrix {
  return Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
    const wave = Math.sin((row + 1) * (column + 2) * .37 + seed * .61);
    const offset = Math.cos((row + 2) * .43 + (column + 1) * .29 + seed);
    return (wave + offset * .35) * scale;
  }));
}

function rmsNorm(input: Vector) {
  const rms = Math.sqrt(input.reduce((sum, value) => sum + value * value, 0) / input.length + 1e-5);
  return input.map((value) => value / rms);
}

function applyRoPE(input: Vector, position: number) {
  const result = [...input];
  for (let pair = 0; pair < input.length; pair += 2) {
    const angle = position / Math.pow(10000, pair / input.length);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    result[pair] = input[pair] * cosine - input[pair + 1] * sine;
    result[pair + 1] = input[pair] * sine + input[pair + 1] * cosine;
  }
  return result;
}

function softmax(values: Vector) {
  const finite = values.filter(Number.isFinite);
  const maximum = Math.max(...finite);
  const exponentials = values.map((value) => Number.isFinite(value) ? Math.exp(value - maximum) : 0);
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function embeddingFor(id: number) {
  return [
    Math.sin(id * .37),
    Math.cos((id + 3) * .23),
    Math.sin((id + 5) * .17),
    Math.cos((id * 2 + 1) * .11),
  ].map((value) => value * .72);
}

function runLayer(input: Matrix, layerIndex: number): LayerTrace {
  const seed = layerIndex + 1;
  const wq = makeWeight(hiddenSize, hiddenSize, seed * 3 + 1);
  const wk = makeWeight(hiddenSize, hiddenSize, seed * 3 + 2);
  const wv = makeWeight(hiddenSize, hiddenSize, seed * 3 + 3);
  const wo = makeWeight(hiddenSize, hiddenSize, seed * 5 + 4, .34);
  const wGate = makeWeight(hiddenSize, ffnSize, seed * 7 + 5, .31);
  const wUp = makeWeight(hiddenSize, ffnSize, seed * 7 + 6, .31);
  const wDown = makeWeight(ffnSize, hiddenSize, seed * 7 + 7, .24);

  const norm1 = input.map(rmsNorm);
  const q = norm1.map((vector, position) => applyRoPE(linear(vector, wq), position));
  const k = norm1.map((vector, position) => applyRoPE(linear(vector, wk), position));
  const v = norm1.map((vector) => linear(vector, wv));
  const scores = q.map((query, row) => k.map((key, column) => column <= row ? dot(query, key) / Math.sqrt(hiddenSize) : Number.NEGATIVE_INFINITY));
  const weights = scores.map(softmax);
  const context = weights.map((row) => Array.from({ length: hiddenSize }, (_, dimension) => row.reduce((sum, weight, column) => sum + weight * v[column][dimension], 0)));
  const attentionProjected = context.map((vector) => linear(vector, wo));
  const postAttention = input.map((vector, position) => add(vector, attentionProjected[position]));
  const norm2 = postAttention.map(rmsNorm);
  const gate = norm2.map((vector) => linear(vector, wGate));
  const up = norm2.map((vector) => linear(vector, wUp));
  const activated = gate.map((vector, position) => vector.map((value, index) => (value / (1 + Math.exp(-value))) * up[position][index]));
  const ffnOutput = activated.map((vector) => linear(vector, wDown));
  const output = postAttention.map((vector, position) => add(vector, ffnOutput[position]));

  return { input, norm1, q, k, v, scores, weights, context, attentionProjected, postAttention, norm2, gate, up, activated, ffnOutput, output };
}

function runForward(text: string): ForwardTrace {
  const tokens = splitInput(text);
  const tokenIds = tokens.map(tokenId);
  const embeddings = tokenIds.map(embeddingFor);
  const layers: LayerTrace[] = [];
  let hidden = embeddings;
  for (let layer = 0; layer < 2; layer += 1) {
    const trace = runLayer(hidden, layer);
    layers.push(trace);
    hidden = trace.output;
  }
  const finalNorm = hidden.map(rmsNorm);
  const lmHead = makeWeight(hiddenSize, outputVocabulary.length, 29, .56);
  const bias = outputVocabulary.map((_, index) => Math.sin(index * .8 + .3) * .08);
  const logits = finalNorm.map((vector) => linear(vector, lmHead).map((value, index) => value + bias[index]));
  const probabilities = logits.map(softmax);
  const positionPredictions = probabilities.map((row) => outputVocabulary[row.indexOf(Math.max(...row))]);
  return { tokens, tokenIds, embeddings, layers, finalNorm, logits, probabilities, positionPredictions, prediction: positionPredictions.at(-1) ?? '模型' };
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return 'MASK';
  if (Math.abs(value) < .0005) return '0.000';
  return value.toFixed(3);
}

function VectorValues({ values }: { values: Vector }) {
  return <code>[{values.map(formatNumber).join(', ')}]</code>;
}

function MatrixTable({ values, rowLabels, columnPrefix, selectedRow, heatmap = false }: { values: Matrix; rowLabels: string[]; columnPrefix: string; selectedRow?: number; heatmap?: boolean }) {
  const maximum = Math.max(...values.flat().filter(Number.isFinite).map(Math.abs), .001);
  return <div className="forward-table-wrap"><table className={`forward-matrix-table ${heatmap ? 'heatmap' : ''}`}><thead><tr><th>token</th>{values[0]?.map((_, index) => <th key={index}>{columnPrefix}{index}</th>)}</tr></thead><tbody>{values.map((row, rowIndex) => <tr className={selectedRow === rowIndex ? 'selected' : ''} key={`${rowLabels[rowIndex]}-${rowIndex}`}><th>{rowLabels[rowIndex]}</th>{row.map((value, columnIndex) => <td className={!Number.isFinite(value) ? 'masked' : ''} style={heatmap && Number.isFinite(value) ? { backgroundColor: `rgba(54,89,217,${.08 + Math.abs(value) / maximum * .72})` } : undefined} key={columnIndex}>{formatNumber(value)}</td>)}</tr>)}</tbody></table></div>;
}

function TokenSelector({ tokens, selected, onSelect }: { tokens: string[]; selected: number; onSelect: (index: number) => void }) {
  return <div className="forward-token-selector" aria-label="选择查看的 token">{tokens.map((token, index) => <button type="button" className={selected === index ? 'active' : ''} aria-pressed={selected === index} onClick={() => onSelect(index)} key={`${token}-${index}`}><span>{index}</span>{token}</button>)}</div>;
}

function VectorLedger({ rows }: { rows: Array<{ label: string; values: Vector; note: string }> }) {
  return <div className="forward-vector-ledger">{rows.map((row) => <article key={row.label}><span>{row.label}</span><VectorValues values={row.values} /><small>{row.note}</small></article>)}</div>;
}

const stageMeta = [
  { title: 'Tokenizer', subtitle: '文本 → token ids' },
  { title: 'Embedding', subtitle: 'ids → hidden states' },
  { title: 'Layer 1 · Attention', subtitle: '跨 token 聚合' },
  { title: 'Layer 1 · FFN', subtitle: '逐 token 变换' },
  { title: 'Layer 2 · Attention', subtitle: '再次跨位置通信' },
  { title: 'Layer 2 · FFN', subtitle: '形成最终表示' },
  { title: 'LM Head + Softmax', subtitle: 'hidden → output token' },
] as const;

export function TransformerForwardLab() {
  const [draft, setDraft] = useState('我 正在 学习 Transformer');
  const [input, setInput] = useState(draft);
  const [activeStage, setActiveStage] = useState(0);
  const [selectedToken, setSelectedToken] = useState(3);
  const trace = useMemo(() => runForward(input), [input]);
  const tokenIndex = Math.min(selectedToken, trace.tokens.length - 1);
  const sequenceLength = trace.tokens.length;

  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTokens = splitInput(draft);
    if (!nextTokens.length) return;
    setInput(draft);
    setSelectedToken(nextTokens.length - 1);
    setActiveStage(0);
  }

  function loadExample(example: string) {
    setDraft(example);
    setInput(example);
    setSelectedToken(splitInput(example).length - 1);
    setActiveStage(0);
  }

  function appendPrediction() {
    const next = [...trace.tokens, trace.prediction].slice(-6).join(' ');
    setDraft(next);
    setInput(next);
    setSelectedToken(splitInput(next).length - 1);
    setActiveStage(0);
  }

  function renderAttention(layerIndex: number) {
    const layer = trace.layers[layerIndex];
    return <>
      <div className="forward-formula"><span>PRE-NORM SELF-ATTENTION</span><strong>Q = RoPE(RMSNorm(x)Wq) · K = RoPE(RMSNorm(x)Wk) · V = RMSNorm(x)Wv</strong><p>scores = QKᵀ / √4 + causal mask → softmax → weighted V → Wo → residual add</p></div>
      <TokenSelector tokens={trace.tokens} selected={tokenIndex} onSelect={setSelectedToken} />
      <VectorLedger rows={[
        { label: 'INPUT x', values: layer.input[tokenIndex], note: `Layer ${layerIndex + 1} 输入` },
        { label: 'RMSNORM(x)', values: layer.norm1[tokenIndex], note: 'RMS 缩放，γ=1' },
        { label: 'QUERY + RoPE', values: layer.q[tokenIndex], note: '当前位置寻找什么' },
        { label: 'KEY + RoPE', values: layer.k[tokenIndex], note: '当前位置如何被匹配' },
        { label: 'VALUE', values: layer.v[tokenIndex], note: '真正被聚合的内容' },
        { label: 'CONTEXT', values: layer.context[tokenIndex], note: 'attention-weighted V' },
      ]} />
      <div className="forward-matrix-pair"><section><div className="forward-subhead"><span>QKᵀ / √dₖ + MASK</span><small>[S, S]</small></div><MatrixTable values={layer.scores} rowLabels={trace.tokens} columnPrefix="k" selectedRow={tokenIndex} /></section><section><div className="forward-subhead"><span>SOFTMAX WEIGHTS</span><small>每行和为 1</small></div><MatrixTable values={layer.weights} rowLabels={trace.tokens} columnPrefix="k" selectedRow={tokenIndex} heatmap /></section></div>
      <VectorLedger rows={[
        { label: 'RESIDUAL x', values: layer.input[tokenIndex], note: '跳连保留原表示' },
        { label: 'ATTENTION · Wo', values: layer.attentionProjected[tokenIndex], note: '注意力分支输出' },
        { label: 'x + ATTENTION', values: layer.postAttention[tokenIndex], note: 'Attention 子层结果' },
      ]} />
    </>;
  }

  function renderFfn(layerIndex: number) {
    const layer = trace.layers[layerIndex];
    return <>
      <div className="forward-formula"><span>SWIGLU FEED-FORWARD</span><strong>h = SiLU(RMSNorm(x)Wgate) ⊙ (RMSNorm(x)Wup)</strong><p>ffn = hWdown，随后再次 residual add；FFN 对每个 token 独立执行，不混合序列位置。</p></div>
      <TokenSelector tokens={trace.tokens} selected={tokenIndex} onSelect={setSelectedToken} />
      <VectorLedger rows={[
        { label: 'POST-ATTENTION x', values: layer.postAttention[tokenIndex], note: '[H=4]' },
        { label: 'RMSNORM(x)', values: layer.norm2[tokenIndex], note: '[H=4]' },
        { label: 'GATE', values: layer.gate[tokenIndex], note: '[FFN=8]' },
        { label: 'UP', values: layer.up[tokenIndex], note: '[FFN=8]' },
        { label: 'SILU(GATE) ⊙ UP', values: layer.activated[tokenIndex], note: '[FFN=8]' },
        { label: 'DOWN PROJECTION', values: layer.ffnOutput[tokenIndex], note: '[H=4]' },
        { label: 'RESIDUAL OUTPUT', values: layer.output[tokenIndex], note: `Layer ${layerIndex + 1} 最终输出` },
      ]} />
      <div className="forward-token-output-grid">{trace.tokens.map((token, index) => <article className={index === tokenIndex ? 'active' : ''} key={`${token}-${index}`}><span>{index} / {token}</span><VectorValues values={layer.output[index]} /></article>)}</div>
    </>;
  }

  function renderStage() {
    if (activeStage === 0) return <>
      <div className="forward-formula"><span>TOKENIZER</span><strong>text → tokens → integer ids</strong><p>教学切分器把中文按字、英文/数字按连续片段切分，最多保留 6 个 token。</p></div>
      <div className="forward-tokenization">{trace.tokens.map((token, index) => <article key={`${token}-${index}`}><span>POSITION {index}</span><strong>{token}</strong><p>token id</p><code>{trace.tokenIds[index]}</code></article>)}</div>
      <div className="forward-shape-callout"><span>OUTPUT SHAPE</span><strong>[1, {sequenceLength}]</strong><p>Batch = 1，sequence = {sequenceLength}；此时每个位置仍只是一个整数。</p></div>
    </>;

    if (activeStage === 1) return <>
      <div className="forward-formula"><span>EMBEDDING LOOKUP</span><strong>x₀[i] = EmbeddingTable[token_id[i]]</strong><p>每个 token id 查出一个 4 维向量。真实模型通常是数千维；这里用 H=4 才能完整展示数值。</p></div>
      <MatrixTable values={trace.embeddings} rowLabels={trace.tokens} columnPrefix="h" selectedRow={tokenIndex} />
      <div className="forward-shape-callout"><span>SHAPE CHANGE</span><strong>[1, {sequenceLength}] → [1, {sequenceLength}, 4]</strong><p>整数 id 变为 hidden state；位置信息将在每层 Attention 的 Q/K 上通过 RoPE 注入。</p></div>
    </>;

    if (activeStage === 2) return renderAttention(0);
    if (activeStage === 3) return renderFfn(0);
    if (activeStage === 4) return renderAttention(1);
    if (activeStage === 5) return renderFfn(1);

    const lastPosition = sequenceLength - 1;
    return <>
      <div className="forward-formula"><span>FINAL NORM + LM HEAD</span><strong>logits = RMSNorm(x₂) Wvocab + b · probabilities = softmax(logits)</strong><p>LM Head 对所有位置执行；自回归生成只使用最后一个位置的分布选择下一个 token。</p></div>
      <MatrixTable values={trace.finalNorm} rowLabels={trace.tokens} columnPrefix="h" selectedRow={lastPosition} />
      <div className="forward-position-predictions"><span>每个位置的 next-token argmax</span><div>{trace.tokens.map((token, index) => <article key={`${token}-${index}`}><small>{index}</small><strong>{token}</strong><b>→</b><em>{trace.positionPredictions[index]}</em></article>)}</div></div>
      <div className="forward-logit-bars">{outputVocabulary.map((token, index) => {
        const probability = trace.probabilities[lastPosition][index];
        return <div className={token === trace.prediction ? 'winner' : ''} key={token}><span>{token}</span><code>{formatNumber(trace.logits[lastPosition][index])}</code><i><b style={{ width: `${probability * 100}%` }} /></i><strong>{(probability * 100).toFixed(1)}%</strong></div>;
      })}</div>
      <div className="forward-final-output" aria-live="polite"><div><span>MODEL OUTPUT</span><strong>{trace.prediction}</strong><p>argmax over last-position probabilities</p></div><button type="button" onClick={appendPrediction}>追加输出并再运行 →</button></div>
    </>;
  }

  return (
    <section className="standalone-lab forward-lab" aria-labelledby="forward-lab-title">
      <div className="standalone-lab-head">
        <div><span>LAB 08 / END-TO-END TRACE</span><h2 id="forward-lab-title">Transformer Forward Trace</h2><p>输入一句短文本，逐步查看 Tokenizer、Embedding、两层 Decoder Block、LM Head 与输出 token 的真实教学计算。</p></div>
        <div className="lab-live-metrics" aria-live="polite"><div><strong>{trace.tokens.length}</strong><span>TOKENS</span></div><div><strong>2</strong><span>LAYERS</span></div><div><strong>{trace.prediction}</strong><span>OUTPUT</span></div></div>
      </div>

      <form className="forward-input-bar" onSubmit={run}>
        <label htmlFor="forward-input"><span>MODEL INPUT · 最多 6 个 token</span><input id="forward-input" value={draft} maxLength={60} onChange={(event) => setDraft(event.target.value)} /></label>
        <button type="submit">运行完整 Forward →</button>
        <div className="forward-examples"><span>示例</span>{['我 爱 学习', 'LLM predicts tokens', '注意力 如何 工作'].map((example) => <button type="button" onClick={() => loadExample(example)} key={example}>{example}</button>)}</div>
      </form>

      <div className="forward-token-strip" aria-live="polite"><span>INPUT TOKENS</span><div>{trace.tokens.map((token, index) => <b key={`${token}-${index}`}><small>{index}</small>{token}<i>#{trace.tokenIds[index]}</i></b>)}</div></div>

      <div className="forward-workbench">
        <nav className="forward-stage-rail" aria-label="Forward 计算步骤">{stageMeta.map((stage, index) => <button className={activeStage === index ? 'active' : ''} type="button" aria-current={activeStage === index ? 'step' : undefined} onClick={() => setActiveStage(index)} key={stage.title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{stage.title}</strong><small>{stage.subtitle}</small><b>{index < 2 ? index === 0 ? `[1, ${sequenceLength}]` : `[1, ${sequenceLength}, 4]` : index < 6 ? `[1, ${sequenceLength}, 4]` : '[1, 8]'}</b></button>)}</nav>

        <section className="forward-step-panel" aria-live="polite">
          <header><div><span>STEP {String(activeStage + 1).padStart(2, '0')} / 07</span><h3>{stageMeta[activeStage].title}</h3><p>{stageMeta[activeStage].subtitle}</p></div><div><button type="button" disabled={activeStage === 0} onClick={() => setActiveStage((stage) => Math.max(0, stage - 1))}>← 上一步</button><button type="button" disabled={activeStage === stageMeta.length - 1} onClick={() => setActiveStage((stage) => Math.min(stageMeta.length - 1, stage + 1))}>下一步 →</button></div></header>
          <div className="forward-step-body">{renderStage()}</div>
        </section>
      </div>

      <section className="forward-ledger"><div><span>COMPLETE SHAPE LEDGER</span><strong>Input 到 Output 的形状不会断链。</strong></div><ol>{[
        ['Token ids', `[1, ${sequenceLength}]`, 'Tokenizer'],
        ['Hidden states', `[1, ${sequenceLength}, 4]`, 'Embedding'],
        ['Attention scores', `[1, ${sequenceLength}, ${sequenceLength}]`, 'QKᵀ'],
        ['Layer 1 output', `[1, ${sequenceLength}, 4]`, 'Attention + FFN'],
        ['Layer 2 output', `[1, ${sequenceLength}, 4]`, 'Attention + FFN'],
        ['Vocabulary logits', `[1, ${sequenceLength}, 8]`, 'LM Head'],
        ['Next token', '[1]', trace.prediction],
      ].map(([label, shape, operation], index) => <li key={label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong><code>{shape}</code><small>{operation}</small></li>)}</ol></section>

      <div className="token-boundary-note"><span>教学边界</span><p>这里真实执行展示出的矩阵运算，但只使用 H=4、FFN=8、单头 Attention、2 层和 8 个输出词的确定性教学权重。它用于理解计算路径，不代表生产模型的切词方式、参数规模或语言能力。</p></div>
    </section>
  );
}
