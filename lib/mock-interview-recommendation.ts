import { interviewAnswerRubric } from './interview-practice';
import type { MockReport } from './mock-interview';

export type MockInterviewRecommendation = {
  rubricIndex: number;
  rubricTitle: string;
  title: string;
  diagnosis: string;
  drill: string;
  nextRule: string;
};

const recommendationRecipes = [
  {
    title: '先练“两句给结论”',
    diagnosis: '你最少确认自己在开头直接回答问题，下一轮先收紧表达入口。',
    drill: '挑一道未勾选题，只写两句话：第一句给判断，第二句给最关键理由。',
    nextRule: '下一场每道题先用 20 秒说完结论与核心理由，再展开背景。',
  },
  {
    title: '把输入到输出画清楚',
    diagnosis: '你最少确认自己讲清了计算或系统链路，知识点可能停留在名词层。',
    drill: '挑一道未勾选题，补齐输入、关键状态、核心计算和输出四个节点。',
    nextRule: '下一场每道题至少说出一组 shape、状态流或端到端执行顺序。',
  },
  {
    title: '为每个方案补一组取舍',
    diagnosis: '你最少确认自己说明了收益、代价和适用条件，回答容易像背诵。',
    drill: '挑一道未勾选题，写下一个收益、一个代价、一个不该使用它的条件。',
    nextRule: '下一场禁止只说“更快”或“更好”，每题必须补一个对冲指标。',
  },
  {
    title: '让判断落到可检查证据',
    diagnosis: '你最少确认自己给出了指标、实验、项目结果或失败边界。',
    drill: '挑一道未勾选题，补一个具体数字、对照实验、badcase 或停止条件。',
    nextRule: '下一场每道主答结束前必须给一条可复现证据或明确未验证边界。',
  },
] as const;

export function recommendationForMockReport(report: MockReport): MockInterviewRecommendation {
  if (report.mainCompleted === 0) {
    return {
      rubricIndex: 0,
      rubricTitle: '完成第一道',
      title: '先完成一组主答与追问',
      diagnosis: '本场没有完成的主回答，现有记录不足以判断具体表达弱项。',
      drill: '先选第一题完成一版主回答，不追求完美，也不要提前查看参考结构。',
      nextRule: '下一场先完整走完第一道主答和追问，再决定是否继续整场。',
    };
  }

  const rubricIndex = report.rubricCounts.reduce((lowest, count, index, counts) => count < counts[lowest] ? index : lowest, 0);
  const recipe = recommendationRecipes[rubricIndex];
  return { rubricIndex, rubricTitle: interviewAnswerRubric[rubricIndex].title, ...recipe };
}
