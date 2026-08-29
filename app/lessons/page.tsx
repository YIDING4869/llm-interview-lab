import type { Metadata } from 'next';
import { LessonWorkspace } from './LessonWorkspace';

export const metadata: Metadata = {
  title: '从零开始学 LLM — LLM Interview Lab',
  description: '从程序、数学和 Transformer 出发，继续学习预训练、微调、对齐、推理、RAG、Agent 与评测。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/lessons/' },
};

export default function LessonsPage() {
  return <LessonWorkspace />;
}
