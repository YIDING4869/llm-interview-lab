import type { Metadata } from 'next';
import { SiteFooter } from '../../../components/SiteFooter';
import { SiteHeader } from '../../../components/SiteHeader';
import { interviewRecords } from '../../../data/interviews';
import { sitePath } from '../../../lib/site-path';

const publicSiteUrl = 'https://yiding4869.github.io/llm-interview-lab';

type InterviewPageProps = { params: Promise<{ recordId: string }> };

export function generateStaticParams() {
  return interviewRecords.map((record) => ({ recordId: record.id }));
}

export async function generateMetadata({ params }: InterviewPageProps): Promise<Metadata> {
  const { recordId } = await params;
  const record = interviewRecords.find((item) => item.id === recordId);
  if (!record) return { title: '面经不存在 — LLM Interview Lab' };
  const title = `${record.company} ${record.role}面经 — LLM Interview Lab`;
  const canonical = `${publicSiteUrl}/interviews/${record.id}/`;
  return {
    title,
    description: record.summary,
    alternates: { canonical },
    openGraph: { title, description: record.summary, type: 'article', url: canonical, images: [] },
    twitter: { card: 'summary', title, description: record.summary, images: [] },
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { recordId } = await params;
  const record = interviewRecords.find((item) => item.id === recordId);
  if (!record) return <main className="content-detail-page"><SiteHeader active="interviews" /><section className="content-detail-missing"><h1>没有找到这条面经</h1><a href={sitePath('/interviews/')}>返回面经库 →</a></section><SiteFooter /></main>;

  return (
    <main className="content-detail-page interview-detail-page">
      <SiteHeader active="interviews" />
      <article className="content-detail-shell">
        <nav className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><a href={sitePath('/interviews/')}>国内真实面经</a><span>→</span><strong>{record.company}</strong></nav>
        <header className="content-detail-hero">
          <div className="content-detail-meta">{record.focuses.map((focus) => <span key={focus}>{focus}</span>)}</div>
          <p className="eyebrow"><span /> PUBLIC REPORT / {record.published}</p>
          <h1>{record.company}<br /><em>{record.role}</em></h1>
          <p className="content-detail-lead">{record.summary}</p>
          <div className="content-detail-actions"><a className="primary-button" href={sitePath(record.practiceHref)}>进入对应学习闭环 <span>→</span></a><a href={record.sourceHref} target="_blank" rel="noreferrer">打开原始面经 ↗</a></div>
        </header>

        <section className="interview-detail-facts"><div><span>招聘批次</span><strong>{record.campaign}</strong></div><div><span>流程</span><strong>{record.rounds}</strong></div><div><span>结果边界</span><strong>{record.outcome}</strong></div></section>

        <section className="interview-detail-themes"><div><span>QUESTION MAP</span><h2>这场面试在连续追问什么？</h2></div><ul>{record.themes.map((theme, index) => <li key={theme}><span>{String(index + 1).padStart(2, '0')}</span><strong>{theme}</strong></li>)}</ul></section>

        <section className="interview-detail-prompts"><div><span>REPHRASED PROMPTS</span><h2>先自己回答，再回到原帖补上下文。</h2></div><ol>{record.prompts.map((prompt, index) => <li key={prompt}><span>Q{String(index + 1).padStart(2, '0')}</span><p>{prompt}</p><a href={sitePath(`/interviews/?record=${record.id}&prompt=${index + 1}#question-trainer`)}>进入 90 秒训练 →</a></li>)}</ol></section>

        <section className="interview-detail-prepare"><span>PREPARATION SIGNAL</span><blockquote>{record.preparation}</blockquote><div><a href={record.sourceHref} target="_blank" rel="noreferrer">核对原始面经 <span>↗</span></a>{record.labHref && <a href={sitePath(record.labHref)}>打开关联实验 <span>→</span></a>}<a href={sitePath('/interviews/')}>返回完整面经库 <span>→</span></a></div></section>

        <aside className="interview-detail-boundary"><strong>证据边界</strong><p>这是一位候选人的公开自述摘要，不代表公司官方题库、固定流程或未来仍会重复。岗位、部门、招聘批次、候选人项目与面试官都会改变追问路径。</p></aside>
      </article>
      <SiteFooter />
    </main>
  );
}
