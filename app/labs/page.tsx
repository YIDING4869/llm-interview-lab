import type { Metadata } from 'next';
import { LabsExperience } from './LabsExperience';

export const metadata: Metadata = {
  title: '可视化实验室 — LLM Interview Lab',
  description: '用可调节的 Tokenizer、RAG 检索和 KV Cache 实验理解 LLM 原理与系统取舍。',
};

export const dynamic = 'force-static';

export default function LabsPage() {
  return <LabsExperience />;
}
