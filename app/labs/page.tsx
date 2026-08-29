import type { Metadata } from 'next';
import { LabsExperience } from './LabsExperience';

export const metadata: Metadata = {
  title: '可视化实验室 — LLM Interview Lab',
  description: '通过 Shape、梯度、Tokenizer、Attention、Transformer Forward、Sampling、KV Cache 与 RAG 八项可视化实验理解 LLM 原理。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/labs/' },
};

export const dynamic = 'force-static';

export default function LabsPage() {
  return <LabsExperience />;
}
