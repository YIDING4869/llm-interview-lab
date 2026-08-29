import type { Metadata } from 'next';
import { InterviewLibrary } from './InterviewLibrary';

export const metadata: Metadata = {
  title: '国内真实大模型面经 — LLM Interview Lab',
  description: '13 份可追溯公开流程、52 道改写真题与 12 道核心题级参考，支持 90 秒独立复答、首答后校准和版本比较。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/interviews/' },
};

export const dynamic = 'force-static';

export default function InterviewsPage() {
  return <InterviewLibrary />;
}
