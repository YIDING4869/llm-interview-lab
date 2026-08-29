import type { Metadata } from 'next';
import { LearnExperience } from './LearnExperience';

export const metadata: Metadata = {
  title: 'LLM 学习地图 — LLM Interview Lab',
  description: '面向零基础、软件工程转码和 ML 背景学习者的完整 LLM 知识框架。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/learn/' },
};

export const dynamic = 'force-static';

export default function LearnPage() {
  return <LearnExperience />;
}
