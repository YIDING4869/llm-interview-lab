import type { Metadata } from 'next';
import { ResourceLibrary } from './ResourceLibrary';

export const metadata: Metadata = {
  title: '学习资源库 — LLM Interview Lab',
  description: '按学习阶段和背景筛选的 LLM 课程、教程、博客与论文。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/resources/' },
};

export const dynamic = 'force-static';

export default function ResourcesPage() {
  return <ResourceLibrary />;
}
