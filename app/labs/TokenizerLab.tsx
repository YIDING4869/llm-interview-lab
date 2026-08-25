'use client';

import { useMemo, useState } from 'react';
import { tokenizerExamples } from '../../data/labs';

const mergeRules: Array<[string, string]> = [
  ['t', 'h'], ['th', 'e'], ['t', 'r'], ['tr', 'a'], ['tra', 'n'], ['tran', 's'],
  ['f', 'o'], ['fo', 'r'], ['for', 'm'], ['e', 'r'], ['i', 'n'], ['in', 'g'],
  ['t', 'o'], ['to', 'k'], ['tok', 'e'], ['toke', 'n'], ['c', 'a'], ['ca', 'ch'],
  ['a', 't'], ['at', 't'], ['att', 'e'], ['atte', 'n'], ['atten', 't'],
  ['attent', 'i'], ['attenti', 'o'], ['attentio', 'n'],
];

type TokenizerMode = 'character' | 'whitespace' | 'toy-bpe';

function characterTokens(text: string) {
  return Array.from(text).filter((character) => !/\s/u.test(character));
}

function whitespaceTokens(text: string) {
  return text.match(/[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) ?? [];
}

function toyBpeTokens(text: string) {
  const segments = text.toLowerCase().match(/[a-z]+|[0-9]+|[\p{Script=Han}]|[^\s\p{L}\p{N}]/gu) ?? [];
  const tokens: string[] = [];
  const appliedSteps: string[] = [];

  for (const segment of segments) {
    if (!/^[a-z]+$/u.test(segment)) {
      tokens.push(segment);
      continue;
    }

    let pieces = Array.from(segment);
    for (const [left, right] of mergeRules) {
      let merged = false;
      const next: string[] = [];
      for (let index = 0; index < pieces.length; index += 1) {
        if (pieces[index] === left && pieces[index + 1] === right) {
          next.push(left + right);
          index += 1;
          merged = true;
        } else {
          next.push(pieces[index]);
        }
      }
      if (merged) appliedSteps.push(`${left} + ${right} → ${left}${right}`);
      pieces = next;
    }
    tokens.push(...pieces);
  }

  return { tokens, appliedSteps };
}

export function TokenizerLab() {
  const [text, setText] = useState(tokenizerExamples[0].text);
  const [mode, setMode] = useState<TokenizerMode>('toy-bpe');

  const result = useMemo(() => {
    if (mode === 'character') return { tokens: characterTokens(text), appliedSteps: [] };
    if (mode === 'whitespace') return { tokens: whitespaceTokens(text), appliedSteps: [] };
    return toyBpeTokens(text);
  }, [mode, text]);

  const visibleCharacters = characterTokens(text).length;
  const ratio = result.tokens.length ? visibleCharacters / result.tokens.length : 0;

  return (
    <section className="standalone-lab tokenizer-lab" aria-labelledby="tokenizer-lab-title">
      <div className="standalone-lab-head">
        <div><span>LAB 02 / MODEL INTERFACE</span><h2 id="tokenizer-lab-title">Tokenizer Explorer</h2><p>同一句话用不同规则切分，会产生不同的序列长度和边界。这里的 BPE 是可解释的教学模型，不代表任何具体线上模型。</p></div>
        <div className="lab-live-metrics" aria-live="polite"><div><strong>{result.tokens.length}</strong><span>TOKENS</span></div><div><strong>{ratio.toFixed(2)}</strong><span>CHARS / TOKEN</span></div></div>
      </div>

      <div className="tokenizer-workbench">
        <div className="tokenizer-input-panel">
          <label><span>输入文本</span><small>{text.length} / 240</small><textarea maxLength={240} value={text} onChange={(event) => setText(event.target.value)} /></label>
          <div className="example-buttons"><span>示例</span>{tokenizerExamples.map((example) => <button type="button" key={example.label} onClick={() => setText(example.text)}>{example.label}</button>)}</div>
          <div className="tokenizer-modes" aria-label="选择切分方式">
            <button className={mode === 'character' ? 'active' : ''} type="button" onClick={() => setMode('character')} aria-pressed={mode === 'character'}><span>01</span><strong>字符切分</strong><small>每个非空白字符一个 token</small></button>
            <button className={mode === 'whitespace' ? 'active' : ''} type="button" onClick={() => setMode('whitespace')} aria-pressed={mode === 'whitespace'}><span>02</span><strong>空白 / 标点</strong><small>观察中文无空格时的差异</small></button>
            <button className={mode === 'toy-bpe' ? 'active' : ''} type="button" onClick={() => setMode('toy-bpe')} aria-pressed={mode === 'toy-bpe'}><span>03</span><strong>教学版 BPE</strong><small>按固定 merge rules 合并</small></button>
          </div>
        </div>

        <div className="tokenizer-output-panel">
          <div className="token-output-head"><span>TOKEN SEQUENCE</span><span>{mode === 'toy-bpe' ? 'TOY MERGE VOCAB' : mode.toUpperCase()}</span></div>
          {result.tokens.length ? <div className="token-stream" aria-live="polite">{result.tokens.map((token, index) => <span className={`token-color-${index % 6}`} key={`${token}-${index}`}><i>{index}</i>{token}</span>)}</div> : <div className="lab-empty">输入文本后查看切分结果。</div>}
          <div className="token-boundary-note"><span>观察重点</span><p>{mode === 'character' ? '字符切分稳定但序列通常更长；它是直观 baseline，不是现代 LLM 的常用方案。' : mode === 'whitespace' ? '英文可以依靠空格形成词项，而连续中文可能被视为一个大词项，说明只按空格并不足够。' : '常见字符对被逐步合并，频繁片段使用更少 token；未进入 merge vocab 的字符仍保持细粒度。'}</p></div>
        </div>
      </div>

      {mode === 'toy-bpe' && <div className="merge-trace"><div><span>APPLIED MERGES</span><strong>{result.appliedSteps.length} steps</strong></div>{result.appliedSteps.length ? <ol>{result.appliedSteps.map((step, index) => <li key={`${step}-${index}`}><span>{(index + 1).toString().padStart(2, '0')}</span>{step}</li>)}</ol> : <p>当前输入没有命中教学 merge rules。</p>}</div>}
    </section>
  );
}
