import type { Metadata } from 'next';
import { InterviewLibrary } from './InterviewLibrary';

export const metadata: Metadata = {
  title: '国内真实大模型面经 — LLM Interview Lab',
  description: '可追溯来源的国内大模型、Agent、多模态与算法岗位公开面经摘要。',
};

export const dynamic = 'force-static';

export default function InterviewsPage() {
  return <InterviewLibrary />;
}
