import type { InterviewFocus, InterviewRecord } from '../data/interviews';

export const interviewPracticeStorageKey = 'llm-interview-lab-interview-practice-v1';

export type InterviewAttempt = {
  answer: string;
  savedAt: string;
  rubric: boolean[];
};

export type InterviewQuestionProgress = {
  draft?: string;
  attempts?: InterviewAttempt[];
  rubric?: boolean[];
};

export type InterviewPracticeProgress = Record<string, InterviewQuestionProgress>;

export const interviewAnswerRubric = [
  { title: '先给结论', detail: '前两句直接回应问题，不从大段背景开始。' },
  { title: '讲清链路', detail: '说明输入、关键计算或系统状态怎样产生输出。' },
  { title: '说明取舍', detail: '至少给出一个收益、一个代价和适用条件。' },
  { title: '落到证据', detail: '用指标、项目结果或失败边界支撑判断。' },
] as const;

const answerFrames: Record<InterviewFocus, string> = {
  '模型基础': '定义与 shape → 关键计算 → 为什么有效 → 参数、显存或推理代价',
  '训练与对齐': '训练目标 → 数据与更新 → 对照评测 → 稳定性和失败边界',
  'RAG / Agent': '输入与状态 → 检索/规划/工具链路 → 评测 → 失败恢复',
  '多模态': '各模态表示 → 对齐与融合 → 输出任务 → 分模态与端到端指标',
  '推荐 + LLM': '业务偏差 → 数据和目标 → 模型/系统方案 → 离线与在线指标',
  '工程与系统': '先测瓶颈 → 定位计算/访存/调度 → 优化 → 对冲指标与硬件边界',
};

const focusKeywords: Record<InterviewFocus, string[]> = {
  '模型基础': ['attention', 'transformer', 'rope', 'lora', 'moe', 'llama', 'embedding', 'normalization', 'loss', 'mha', 'gqa', 'mqa', 'mla', 'position'],
  '训练与对齐': ['训练', '微调', 'sft', 'ppo', 'grpo', 'dpo', '强化学习', '初始化', 'rank', '预训练', 'reward'],
  'RAG / Agent': ['rag', 'agent', '检索', '召回', '重排', 'function calling', '记忆', '工具', 'mcp', 'a2a', 'react', 'reflection', 'plan-and-solve', '行程'],
  '多模态': ['多模态', '图像', '图片', '视频', 'clip', 'blip', 'vit', '3d', '点云', '雷达', 'stable diffusion', 'nerf', 'sdf', '跨模态'],
  '推荐 + LLM': ['推荐', '曝光', '排序', 'ndcg', '业务', '线上目标'],
  '工程与系统': ['cuda', 'gpu', 'kv cache', 'vllm', 'trt-llm', '量化', 'w4a16', 'int8', 'fp8', '算子', '吞吐', '延迟', 'ttft', '调度', '缓存', '消息', 'redis', 'mongodb', 'pipeline', 'timing', 'scaling factor', '显存'],
};

export function interviewQuestionKey(recordId: string, promptIndex: number) {
  return `${recordId}:${promptIndex}`;
}

export function answerFrameForQuestion(record: InterviewRecord, prompt: string) {
  const normalized = prompt.toLowerCase();
  const ranked = record.focuses.map((focus, index) => ({
    focus,
    index,
    score: focusKeywords[focus].filter((keyword) => normalized.includes(keyword)).length,
  })).sort((a, b) => b.score - a.score || a.index - b.index);
  const focus = ranked[0]?.focus ?? record.focuses[0];
  return { focus, frame: answerFrames[focus] };
}
