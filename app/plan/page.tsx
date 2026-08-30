import type { Metadata } from 'next';
import { InterviewPlanWorkspace } from './InterviewPlanWorkspace';

export const metadata: Metadata = {
  title: '面试倒计时计划 — LLM Interview Lab',
  description: '按目标岗位、面试日期和每日投入时间，生成保存在当前设备上的 LLM 面试冲刺计划。',
  alternates: { canonical: 'https://yiding4869.github.io/llm-interview-lab/plan/' },
};

export const dynamic = 'force-static';

export default function InterviewPlanPage() {
  return <InterviewPlanWorkspace />;
}
