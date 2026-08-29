import type { Metadata } from 'next';
import { QuestionLibrary } from './QuestionLibrary';

export const metadata: Metadata = {
  title: '大模型面试题库 — LLM Interview Lab',
  description: '按关键词、知识分类与难度筛选大模型面试题，并连接答案结构、连续追问、动手任务与限时作答。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/questions/' },
};

export const dynamic = 'force-static';

export default function QuestionsPage() {
  return <QuestionLibrary />;
}
