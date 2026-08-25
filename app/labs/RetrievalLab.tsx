'use client';

import { useMemo, useState } from 'react';
import { conceptDictionary, retrievalDocuments, retrievalExamples } from '../../data/labs';

type RetrievalMode = 'bm25' | 'concept' | 'hybrid';

function tokenize(text: string) {
  const normalized = text.toLowerCase();
  const latin = normalized.match(/[a-z0-9_]+/g) ?? [];
  const hanRuns = normalized.match(/[\p{Script=Han}]+/gu) ?? [];
  const hanTerms = hanRuns.flatMap((run) => {
    const characters = Array.from(run);
    if (characters.length === 1) return characters;
    return characters.slice(0, -1).map((character, index) => character + characters[index + 1]);
  });
  return [...latin, ...hanTerms];
}

function detectedConcepts(text: string) {
  const normalized = text.toLowerCase();
  return Object.entries(conceptDictionary).filter(([, aliases]) => aliases.some((alias) => normalized.includes(alias))).map(([concept]) => concept);
}

function bm25Scores(query: string) {
  const queryTerms = [...new Set(tokenize(query))];
  const tokenizedDocuments = retrievalDocuments.map((document) => tokenize(`${document.title} ${document.content}`));
  const averageLength = tokenizedDocuments.reduce((total, terms) => total + terms.length, 0) / tokenizedDocuments.length;
  const k1 = 1.5;
  const b = .75;

  return tokenizedDocuments.map((terms) => {
    const frequencies = new Map<string, number>();
    terms.forEach((term) => frequencies.set(term, (frequencies.get(term) ?? 0) + 1));
    const score = queryTerms.reduce((total, term) => {
      const documentFrequency = tokenizedDocuments.filter((documentTerms) => documentTerms.includes(term)).length;
      const termFrequency = frequencies.get(term) ?? 0;
      if (!termFrequency) return total;
      const idf = Math.log(1 + (retrievalDocuments.length - documentFrequency + .5) / (documentFrequency + .5));
      return total + idf * ((termFrequency * (k1 + 1)) / (termFrequency + k1 * (1 - b + b * (terms.length / averageLength))));
    }, 0);
    return { score, matchedTerms: queryTerms.filter((term) => frequencies.has(term)) };
  });
}

export function RetrievalLab() {
  const [query, setQuery] = useState(retrievalExamples[1].query);
  const [mode, setMode] = useState<RetrievalMode>('hybrid');
  const [topK, setTopK] = useState(3);
  const [conceptWeight, setConceptWeight] = useState(45);

  const result = useMemo(() => {
    const lexical = bm25Scores(query);
    const maxLexical = Math.max(...lexical.map((item) => item.score), .0001);
    const queryConcepts = detectedConcepts(query);
    const rows = retrievalDocuments.map((document, index) => {
      const lexicalScore = lexical[index].score / maxLexical;
      const overlap = document.concepts.filter((concept) => queryConcepts.includes(concept));
      const conceptScore = queryConcepts.length ? overlap.length / Math.sqrt(queryConcepts.length * document.concepts.length) : 0;
      const semanticRatio = conceptWeight / 100;
      const score = mode === 'bm25' ? lexicalScore : mode === 'concept' ? conceptScore : lexicalScore * (1 - semanticRatio) + conceptScore * semanticRatio;
      return { document, score, lexicalScore, conceptScore, matchedTerms: lexical[index].matchedTerms, matchedConcepts: overlap };
    }).sort((left, right) => right.score - left.score);

    const example = retrievalExamples.find((item) => item.query === query);
    const visible = query.trim() ? rows.slice(0, topK) : [];
    const recall = example ? visible.filter((row) => example.relevantIds.includes(row.document.id)).length / example.relevantIds.length : null;
    return { rows: visible, queryConcepts, recall };
  }, [conceptWeight, mode, query, topK]);

  return (
    <section className="standalone-lab retrieval-lab" aria-labelledby="retrieval-lab-title">
      <div className="standalone-lab-head">
        <div><span>LAB 07 / RAG SYSTEMS</span><h2 id="retrieval-lab-title">RAG Retrieval Lab</h2><p>在固定八段语料上比较词项检索、教学概念检索和 Hybrid 排序。概念检索使用页面内公开的同义词组，不代表真实 embedding 模型。</p></div>
        <div className="lab-live-metrics" aria-live="polite"><div><strong>TOP {topK}</strong><span>RETURNED</span></div><div><strong>{result.recall === null ? '—' : `${Math.round(result.recall * 100)}%`}</strong><span>RECALL@K</span></div></div>
      </div>

      <div className="retrieval-workbench">
        <aside className="retrieval-controls">
          <label className="retrieval-query"><span>查询</span><textarea value={query} maxLength={160} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="example-buttons"><span>带 gold 的示例</span>{retrievalExamples.map((example) => <button type="button" key={example.label} onClick={() => setQuery(example.query)}>{example.label}</button>)}</div>
          <div className="retrieval-methods"><span>排序方法</span><button className={mode === 'bm25' ? 'active' : ''} type="button" onClick={() => setMode('bm25')}><strong>BM25-lite</strong><small>词项重合与 IDF</small></button><button className={mode === 'concept' ? 'active' : ''} type="button" onClick={() => setMode('concept')}><strong>教学概念检索</strong><small>公开同义词组的概念重合</small></button><button className={mode === 'hybrid' ? 'active' : ''} type="button" onClick={() => setMode('hybrid')}><strong>Hybrid</strong><small>归一化分数加权</small></button></div>
          <label className="retrieval-slider"><span>Top-K <b>{topK}</b></span><input type="range" min="1" max="5" value={topK} onChange={(event) => setTopK(Number(event.target.value))} /></label>
          {mode === 'hybrid' && <label className="retrieval-slider"><span>概念分数权重 <b>{conceptWeight}%</b></span><input type="range" min="0" max="100" step="5" value={conceptWeight} onChange={(event) => setConceptWeight(Number(event.target.value))} /></label>}
          <div className="retrieval-detected"><span>查询概念</span><div>{result.queryConcepts.length ? result.queryConcepts.map((concept) => <b key={concept}>{concept}</b>) : <small>未命中教学概念词典</small>}</div></div>
        </aside>

        <div className="retrieval-results" aria-live="polite">
          <div className="retrieval-results-head"><span>RANKED CHUNKS</span><span>{mode === 'bm25' ? 'LEXICAL' : mode === 'concept' ? 'CONCEPT' : `${100 - conceptWeight}% LEXICAL + ${conceptWeight}% CONCEPT`}</span></div>
          {result.rows.map((row, index) => <article className="retrieval-result" key={row.document.id}><div className="retrieval-rank"><span>{(index + 1).toString().padStart(2, '0')}</span><strong>{(row.score * 100).toFixed(1)}</strong></div><div className="retrieval-result-body"><div><span>{row.document.section}</span><h3>{row.document.title}</h3></div><p>{row.document.content}</p><div className="retrieval-score-track"><span style={{ width: `${Math.max(2, row.score * 100)}%` }} /></div><div className="retrieval-match-row"><span>词项 {row.matchedTerms.length ? row.matchedTerms.slice(0, 5).join(' · ') : '—'}</span><span>概念 {row.matchedConcepts.length ? row.matchedConcepts.join(' · ') : '—'}</span><b>L {row.lexicalScore.toFixed(2)} / C {row.conceptScore.toFixed(2)}</b></div></div></article>)}
          {!query.trim() && <div className="lab-empty">输入查询后查看排序结果。</div>}
        </div>
      </div>

      <details className="retrieval-corpus"><summary>查看实验语料（{retrievalDocuments.length} 个 chunks）<span>＋</span></summary><div>{retrievalDocuments.map((document) => <article key={document.id}><span>{document.section}</span><strong>{document.title}</strong><p>{document.content}</p></article>)}</div></details>
    </section>
  );
}
