import type { Metadata } from 'next';
import { MockInterviewWorkspace } from './MockInterviewWorkspace';

export const metadata: Metadata = {
  title: '12 分钟模拟面试 — LLM Interview Lab',
  description: '从真实大模型面经中组合 5 道主问题与连续追问，完成本机限时作答、自评和结构化复盘。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/mock/' },
};

export const dynamic = 'force-static';

export default function MockInterviewPage() {
  return <MockInterviewWorkspace />;
}
