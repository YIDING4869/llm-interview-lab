import type { Metadata } from 'next';
import { InterviewLibrary } from './InterviewLibrary';

export const metadata: Metadata = {
  title: '国内真实大模型面经 — LLM Interview Lab',
  description: '13 份可追溯公开流程、52 道改写真题与 22 道题级参考，支持首答后校准、60 秒连续追问和本机历史比较。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/interviews/' },
};

export const dynamic = 'force-static';

export default function InterviewsPage() {
  return <InterviewLibrary />;
}
