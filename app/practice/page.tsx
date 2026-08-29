import type { Metadata } from 'next';
import { PracticeWorkspace } from './PracticeWorkspace';

export const metadata: Metadata = {
  title: '学习闭环 — LLM Interview Lab',
  description: '把 LLM 知识模块连接到检查题、动手任务、学习资料和个人复盘。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/practice/' },
};

export const dynamic = 'force-static';

export default function PracticePage() {
  return <PracticeWorkspace />;
}
