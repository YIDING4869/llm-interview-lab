import type { Metadata } from 'next';
import { LessonWorkspace } from './LessonWorkspace';

export const metadata: Metadata = {
  title: '从零开始学 LLM — LLM Interview Lab',
  description: '从程序、数学和深度学习出发，逐步理解 Tokenizer、语言模型与 Transformer。',
};

export default function LessonsPage() {
  return <LessonWorkspace />;
}
