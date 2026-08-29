import type { Metadata } from 'next';
import { ProgressDashboard } from './ProgressDashboard';

export const metadata: Metadata = {
  title: '我的学习进度 — LLM Interview Lab',
  description: '汇总站内课程、面试题作答与四步学习闭环进度，并给出下一步学习入口。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/progress/' },
};

export const dynamic = 'force-static';

export default function ProgressPage() {
  return <ProgressDashboard />;
}
