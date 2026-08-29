'use client';

import { useMemo, useState } from 'react';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { knowledgeModules } from '../../data/curriculum';
import { practiceCategories, practiceQuestions, type PracticeQuestion } from '../../data/practice';
import { sitePath } from '../../lib/site-path';

const difficultyOptions: Array<'全部' | PracticeQuestion['difficulty']> = ['全部', '基础', '进阶', '系统设计'];

export function QuestionLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof practiceCategories)[number]>('全部');
  const [difficulty, setDifficulty] = useState<(typeof difficultyOptions)[number]>('全部');

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');
    return practiceQuestions.filter((question) => {
      const knowledgeModule = knowledgeModules.find((module) => module.id === question.moduleId);
      const searchable = [
        question.title,
        question.hint,
        question.answer,
        question.category,
        question.difficulty,
        question.followup,
        question.task.title,
        knowledgeModule?.title ?? '',
        ...question.points,
      ].join(' ').toLocaleLowerCase('zh-CN');
      const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
      const matchesCategory = category === '全部' || question.category === category;
      const matchesDifficulty = difficulty === '全部' || question.difficulty === difficulty;
      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [category, difficulty, query]);

  return (
    <main className="questions-page">
      <SiteHeader active="questions" />

      <section className="questions-browser-head">
        <nav className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><strong>面试题库</strong></nav>
        <div className="questions-browser-intro">
          <div>
            <p className="eyebrow"><span /> SEARCH · ANSWER · FOLLOW UP</p>
            <h1>先找到一道题，<br /><em>再把答案讲出结构。</em></h1>
            <p>每道题都连接短答案、必答点、连续追问、最小动手任务与对应知识模块。搜索的是能力缺口，不只是标题。</p>
          </div>
          <div className="questions-browser-stats">
            <div><strong>{practiceQuestions.length}</strong><span>道结构化题目</span></div>
            <div><strong>{knowledgeModules.length}</strong><span>个知识模块</span></div>
            <div><strong>{difficultyOptions.length - 1}</strong><span>档回答难度</span></div>
            <a href={sitePath('/practice/?module=transformer&quickstart=1#answer')}>3 分钟开始体验 <span>→</span></a>
          </div>
        </div>
      </section>

      <section className="questions-browser-shell">
        <div className="question-search-panel">
          <label className="question-search-input">
            <span>SEARCH THE QUESTION BANK</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索 Attention、RAG、评测、项目失败……"
              aria-label="搜索面试题"
            />
          </label>
          <div className="question-filter-block">
            <span>知识分类</span>
            <div className="question-filter-options">
              {practiceCategories.map((option) => <button className={category === option ? 'active' : ''} type="button" aria-pressed={category === option} onClick={() => setCategory(option)} key={option}>{option}</button>)}
            </div>
          </div>
          <div className="question-filter-block">
            <span>回答难度</span>
            <div className="question-filter-options">
              {difficultyOptions.map((option) => <button className={difficulty === option ? 'active' : ''} type="button" aria-pressed={difficulty === option} onClick={() => setDifficulty(option)} key={option}>{option}</button>)}
            </div>
          </div>
        </div>

        <div className="question-results-head">
          <div><span>RESULTS</span><strong>{filteredQuestions.length} / {practiceQuestions.length}</strong></div>
          <p>点击题目先看回答结构，再进入限时作答保存自己的版本。</p>
        </div>

        {filteredQuestions.length > 0 ? (
          <div className="question-library-grid">
            {filteredQuestions.map((question) => {
              const knowledgeModule = knowledgeModules.find((module) => module.id === question.moduleId);
              return (
                <a className="question-library-card" href={sitePath(`/questions/${question.id}/`)} key={question.id}>
                  <div className="question-library-card-top"><span>Q{question.id.toString().padStart(2, '0')}</span><span>{question.category}</span><span>{question.difficulty} · {question.time}</span></div>
                  <p>{knowledgeModule?.title ?? question.moduleId}</p>
                  <h2>{question.title}</h2>
                  <div className="question-library-hint"><span>提示</span><p>{question.hint}</p></div>
                  <ul>{question.points.slice(0, 2).map((point) => <li key={point}>{point}</li>)}</ul>
                  <strong>打开答案结构 <span>→</span></strong>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="question-library-empty"><strong>没有匹配的题目</strong><p>换一个关键词，或清除分类和难度筛选。</p><button type="button" onClick={() => { setQuery(''); setCategory('全部'); setDifficulty('全部'); }}>清除筛选</button></div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
