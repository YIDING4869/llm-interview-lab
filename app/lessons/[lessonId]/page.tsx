import type { Metadata } from 'next';
import { SiteFooter } from '../../../components/SiteFooter';
import { SiteHeader } from '../../../components/SiteHeader';
import { knowledgeModules, learningResources } from '../../../data/curriculum';
import { foundationLessons } from '../../../data/lessons';
import { sitePath } from '../../../lib/site-path';

const publicSiteUrl = 'https://yiding4869.github.io/llm-interview-lab';

type LessonPageProps = { params: Promise<{ lessonId: string }> };

export function generateStaticParams() {
  return foundationLessons.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = foundationLessons.find((item) => item.id === lessonId);
  if (!lesson) return { title: '课程不存在 — LLM Interview Lab' };
  const canonical = `${publicSiteUrl}/lessons/${lesson.id}/`;
  return {
    title: `${lesson.title} — LLM Interview Lab`,
    description: lesson.summary,
    alternates: { canonical },
    openGraph: { title: lesson.title, description: lesson.summary, type: 'article', url: canonical, images: [] },
    twitter: { card: 'summary', title: lesson.title, description: lesson.summary, images: [] },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const lesson = foundationLessons.find((item) => item.id === lessonId);
  if (!lesson) return <main className="content-detail-page"><SiteHeader active="lessons" /><section className="content-detail-missing"><h1>没有找到这节课</h1><a href={sitePath('/lessons/')}>返回基础课 →</a></section><SiteFooter /></main>;

  const knowledgeModule = knowledgeModules.find((item) => item.id === lesson.moduleId);
  const resources = learningResources.filter((resource) => lesson.resourceIds?.includes(resource.id));
  const lessonIndex = foundationLessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = foundationLessons[lessonIndex + 1];

  return (
    <main className="content-detail-page lesson-detail-page">
      <SiteHeader active="lessons" />
      <article className="content-detail-shell lesson-detail-shell">
        <nav className="page-breadcrumb"><a href={sitePath('/')}>首页</a><span>→</span><a href={sitePath('/lessons/')}>基础课</a><span>→</span><strong>{lesson.order}</strong></nav>
        <header className="content-detail-hero">
          <div className="content-detail-meta"><span>{knowledgeModule?.title ?? lesson.moduleId}</span><span>{lesson.level}</span><span>{lesson.duration}</span></div>
          <p className="eyebrow"><span /> LESSON {lesson.order} / {lesson.eyebrow}</p>
          <h1>{lesson.title}</h1>
          <p className="content-detail-lead">{lesson.summary}</p>
          <div className="lesson-detail-goals"><span>学完你应该能够</span><ol>{lesson.goals.map((goal, index) => <li key={goal}><b>{String(index + 1).padStart(2, '0')}</b>{goal}</li>)}</ol></div>
          <div className="content-detail-actions"><a className="primary-button" href={sitePath(`/lessons/?lesson=${lesson.id}`)}>进入互动学习模式 <span>→</span></a><a href={sitePath(`/practice/?module=${lesson.moduleId}`)}>进入模块学习闭环 ↗</a></div>
        </header>

        <div className="lesson-detail-body">
          {lesson.sections.map((section, index) => (
            <section className="lesson-section" key={section.title}>
              <div className="lesson-section-title"><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2><p>{section.lead}</p></div></div>
              {section.paragraphs?.map((paragraph) => <p className="lesson-paragraph" key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul className="lesson-bullets">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
              {section.formula && <div className="lesson-formula"><span>{section.formula.label}</span><strong>{section.formula.expression}</strong><p>{section.formula.explanation}</p></div>}
              {section.code && <div className="lesson-code"><div><span>{section.code.language.toUpperCase()}</span><span>MINIMAL EXAMPLE</span></div><pre><code>{section.code.source}</code></pre></div>}
              {section.callout && <aside className="lesson-callout"><span>建立直觉</span><p>{section.callout}</p></aside>}
            </section>
          ))}
        </div>

        <section className="lesson-detail-checkpoint">
          <div><span>CHECKPOINT</span><h2>{lesson.checkpoint.question}</h2><p>提示：{lesson.checkpoint.hint}</p></div>
          <ol>{lesson.checkpoint.options.map((option, index) => <li className={index === lesson.checkpoint.correctIndex ? 'correct' : ''} key={option}><span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong></li>)}</ol>
          <details><summary>查看答案与解释 <span>＋</span></summary><p>{lesson.checkpoint.answer}</p></details>
        </section>

        <section className="lesson-detail-takeaways"><div><span>TAKEAWAYS</span><h2>离开这一节前，记住三件事。</h2></div><ol>{lesson.takeaways.map((takeaway, index) => <li key={takeaway}><span>{String(index + 1).padStart(2, '0')}</span>{takeaway}</li>)}</ol></section>

        {(lesson.labHref || resources.length > 0 || nextLesson) && <section className="lesson-detail-next"><span>CONTINUE</span><h2>把理解连接到实验、资料与下一节。</h2><div>{lesson.labHref && <a href={sitePath(lesson.labHref)}>打开对应可视化实验 <span>→</span></a>}{resources.map((resource) => <a href={resource.href} target="_blank" rel="noreferrer" key={resource.id}>{resource.title} <span>↗</span></a>)}{nextLesson && <a href={sitePath(`/lessons/${nextLesson.id}/`)}>下一节：{nextLesson.title} <span>→</span></a>}</div></section>}
      </article>
      <SiteFooter />
    </main>
  );
}
