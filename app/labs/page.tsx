import type { Metadata } from 'next';
import { LabsExperience } from './LabsExperience';

export const metadata: Metadata = {
  title: '可视化实验室 — LLM Interview Lab',
  description: '通过 Shape、梯度、Tokenizer、Attention、Sampling、KV Cache 与 RAG 七项可视化实验理解 LLM 原理。',
};

export const dynamic = 'force-static';

export default function LabsPage() {
  return <LabsExperience />;
}
