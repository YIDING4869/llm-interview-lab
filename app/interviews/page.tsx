import type { Metadata } from 'next';
import { InterviewLibrary } from './InterviewLibrary';

export const metadata: Metadata = {
  title: '国内真实大模型面经 — LLM Interview Lab',
  description: '13 份可追溯公开流程、52 道改写真题，支持 90 秒作答、回答骨架、本地历史与四项自评。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/interviews/' },
};

export const dynamic = 'force-static';

export default function InterviewsPage() {
  return <InterviewLibrary />;
}
