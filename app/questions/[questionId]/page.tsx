import type { Metadata } from 'next';
import { SiteFooter } from '../../../components/SiteFooter';
import { SiteHeader } from '../../../components/SiteHeader';
import { knowledgeModules } from '../../../data/curriculum';
import { practiceQuestions } from '../../../data/practice';
import { sitePath } from '../../../lib/site-path';

const publicSiteUrl = 'https://yiding4869.github.io/llm-interview-lab';

type QuestionPageProps = { params: Promise<{ questionId: string }> };

export function generateStaticParams() {
  return practiceQuestions.map((question) => ({ questionId: String(question.id) }));
}

export async function generateMetadata({ params }: QuestionPageProps): Promise<Metadata> {
  const { questionId } = await params;
  const question = practiceQuestions.find((item) => item.id === Number(questionId));
  if (!question) return { title: '题目不存在 — LLM Interview Lab' };
  const canonical = `${publicSiteUrl}/questions/${question.id}/`;
  const description = `${question.category}面试题：${question.hint}`;
  return {
    title: `${question.title} — LLM Interview Lab`,
    description,
    alternates: { canonical },
    openGraph: { title: question.title, description, type: 'article', url: canonical, images: [] },
    twitter: { card: 'summary', title: question.title, description, images: [] },
  };
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { questionId } = await params;
  const question = practiceQuestions.find((item) => item.id === Number(questionId));
  if (!question) return <main className="content-detail-page"><SiteHeader active="questions" /><section className="content-detail-missing"><h1>没有找到这道题</h1><a href={sitePath('/questions/')}>返回题库 →</a></section><SiteFooter /></main>;

  const knowledgeModule = knowledgeModules.find((item) => item.id === question.moduleId);
  return (
    <main className="content-detail-page question-detail-page">
      <SiteHeader active="questions" />
      <article className="content-detail-shell">
        <nav className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><a href={sitePath('/questions/')}>面试题</a><span>→</span><strong>Q{question.id.toString().padStart(2, '0')}</strong></nav>
        <header className="content-detail-hero">
          <div className="content-detail-meta"><span>{question.category}</span><span>{question.difficulty}</span><span>{question.time}</span></div>
          <p className="eyebrow"><span /> INTERVIEW QUESTION / Q{question.id.toString().padStart(2, '0')}</p>
          <h1>{question.title}</h1>
          <p className="content-detail-lead">提示：{question.hint}</p>
          <div className="content-detail-actions"><a className="primary-button" href={sitePath(`/practice/?module=${question.moduleId}&question=${question.id}#answer`)}>进入限时作答 <span>→</span></a>{knowledgeModule && <a href={sitePath(`/learn/#module-${knowledgeModule.id}`)}>查看 {knowledgeModule.title} 知识模块 ↗</a>}</div>
        </header>

        <section className="question-detail-answer">
          <div><span>ANSWER STRUCTURE</span><h2>一个可靠答案应该覆盖什么？</h2><p>{question.answer}</p></div>
          <ol>{question.points.map((point, index) => <li key={point}><span>{String(index + 1).padStart(2, '0')}</span><strong>{point}</strong></li>)}</ol>
        </section>

        <section className="question-detail-followup"><div><span>FOLLOW-UP</span><h2>面试官继续追问</h2></div><blockquote>{question.followup}</blockquote></section>

        <section className="question-detail-task">
          <div><span>MINI PROJECT</span><h2>{question.task.title}</h2><p>{question.task.brief}</p></div>
          <ol>{question.task.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
          <aside><span>完成证据</span><strong>{question.task.evidence}</strong></aside>
        </section>

        <section className="question-detail-reflect"><span>REFLECT IN YOUR OWN WORDS</span><blockquote>{question.notePrompt}</blockquote><a href={sitePath(`/practice/?module=${question.moduleId}&question=${question.id}#answer`)}>保存自己的答案与复盘 →</a></section>
      </article>
      <SiteFooter />
    </main>
  );
}
