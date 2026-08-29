import { guideForInterviewQuestion, type InterviewAnswerGuide } from './interview-guides';
import { interviewRecords, type InterviewRecord } from './interviews';

export type MockInterviewQuestionSpec = {
  recordId: string;
  promptIndex: number;
  followupIndex: number;
};

export type MockInterviewTrack = {
  id: string;
  title: string;
  role: string;
  description: string;
  tags: string[];
  questionPool: MockInterviewQuestionSpec[];
};

export type ResolvedMockInterviewQuestion = MockInterviewQuestionSpec & {
  record: InterviewRecord;
  prompt: string;
  guide: InterviewAnswerGuide;
  followup: string;
};

export const mockInterviewVariantCount = 3;

export function mockInterviewVariantLabel(variantIndex: number) {
  return String.fromCharCode(65 + ((variantIndex % mockInterviewVariantCount) + mockInterviewVariantCount) % mockInterviewVariantCount);
}

export const mockInterviewTracks: MockInterviewTrack[] = [
  {
    id: 'foundation',
    title: '模型基础综合场',
    role: '大模型算法 / 转码基础',
    description: '从 Attention、位置编码和 LoRA 追到 MoE 与训练阶段，检查是否真正讲清计算、取舍与边界。',
    tags: ['Transformer', 'LoRA', 'MoE', '训练阶段'],
    questionPool: [
      { recordId: 'kuaishou-llm-2025', promptIndex: 2, followupIndex: 1 },
      { recordId: 'meituan-llm-algorithm-2025', promptIndex: 3, followupIndex: 0 },
      { recordId: 'kuaishou-llm-2025', promptIndex: 1, followupIndex: 2 },
      { recordId: 'multi-company-intern-2025', promptIndex: 0, followupIndex: 1 },
      { recordId: 'ant-intelligent-app-2025', promptIndex: 1, followupIndex: 2 },
      { recordId: 'meituan-llm-algorithm-2025', promptIndex: 0, followupIndex: 1 },
      { recordId: 'meituan-ai-infra-2025', promptIndex: 0, followupIndex: 2 },
      { recordId: 'ant-ai-infra-third-round-2026', promptIndex: 2, followupIndex: 0 },
    ],
  },
  {
    id: 'rag-agent',
    title: 'RAG / Agent 应用场',
    role: 'Agent 开发 / LLM 应用算法',
    description: '覆盖技术选型、召回排序、工具失败、个人贡献和训练数据，让应用链路经得住连续下钻。',
    tags: ['RAG', 'Agent', '失败恢复', '项目证据'],
    questionPool: [
      { recordId: 'ant-international-agent-2025', promptIndex: 0, followupIndex: 0 },
      { recordId: 'tencent-wxg-ml-2025', promptIndex: 1, followupIndex: 0 },
      { recordId: '4paradigm-agent-intern-2026', promptIndex: 3, followupIndex: 1 },
      { recordId: '4paradigm-agent-intern-2026', promptIndex: 0, followupIndex: 0 },
      { recordId: 'ant-intelligent-app-2025', promptIndex: 2, followupIndex: 2 },
      { recordId: 'ant-intelligent-app-2025', promptIndex: 3, followupIndex: 1 },
      { recordId: 'tencent-wxg-ml-2025', promptIndex: 0, followupIndex: 2 },
      { recordId: 'tencent-wxg-ml-2025', promptIndex: 3, followupIndex: 0 },
    ],
  },
  {
    id: 'infra',
    title: 'AI Infra 推理场',
    role: '推理引擎 / AI Infra',
    description: '从 FlashAttention、KV Cache 和量化继续追问 runtime 改动与测量偏差，强调可复现性能证据。',
    tags: ['FlashAttention', 'KV Cache', '量化', 'Benchmark'],
    questionPool: [
      { recordId: 'meituan-ai-infra-2025', promptIndex: 0, followupIndex: 1 },
      { recordId: 'ant-ai-infra-third-round-2026', promptIndex: 2, followupIndex: 2 },
      { recordId: 'ant-ai-infra-third-round-2026', promptIndex: 1, followupIndex: 1 },
      { recordId: 'ant-ai-infra-third-round-2026', promptIndex: 0, followupIndex: 0 },
      { recordId: 'baidu-ai-infra-first-round-2026', promptIndex: 0, followupIndex: 0 },
      { recordId: 'kuaishou-ai-infra-2025', promptIndex: 3, followupIndex: 1 },
      { recordId: 'tencent-wxg-ml-2025', promptIndex: 0, followupIndex: 2 },
      { recordId: 'kuaishou-llm-2025', promptIndex: 2, followupIndex: 0 },
    ],
  },
  {
    id: 'multimodal',
    title: '多模态算法场',
    role: '多模态 / 视频算法',
    description: '从跨模态 Attention 进入视频数据、图片翻译和样本审计，同时保留 Transformer 基础追问。',
    tags: ['跨模态', '视频', '图片翻译', '数据审计'],
    questionPool: [
      { recordId: 'xiaomi-multimodal-2025', promptIndex: 2, followupIndex: 0 },
      { recordId: 'multi-company-intern-2025', promptIndex: 2, followupIndex: 0 },
      { recordId: 'tencent-wxg-ml-2025', promptIndex: 3, followupIndex: 1 },
      { recordId: 'meituan-llm-algorithm-2025', promptIndex: 3, followupIndex: 2 },
      { recordId: 'ant-intelligent-app-2025', promptIndex: 2, followupIndex: 1 },
      { recordId: 'tencent-wxg-ml-2025', promptIndex: 0, followupIndex: 2 },
      { recordId: '4paradigm-agent-intern-2026', promptIndex: 0, followupIndex: 0 },
      { recordId: 'ant-intelligent-app-2025', promptIndex: 3, followupIndex: 2 },
    ],
  },
  {
    id: 'project',
    title: '项目深挖压力场',
    role: '通用项目答辩 / Leader 面',
    description: '不考名词数量，集中检查个人贡献、资源账本、样本证据、端到端评测和投入停止条件。',
    tags: ['个人贡献', '成本', 'Baseline', 'Badcase'],
    questionPool: [
      { recordId: '4paradigm-agent-intern-2026', promptIndex: 0, followupIndex: 1 },
      { recordId: 'tencent-wxg-ml-2025', promptIndex: 0, followupIndex: 1 },
      { recordId: 'ant-intelligent-app-2025', promptIndex: 2, followupIndex: 0 },
      { recordId: 'tencent-wxg-ml-2025', promptIndex: 1, followupIndex: 2 },
      { recordId: 'kuaishou-ai-infra-2025', promptIndex: 3, followupIndex: 0 },
      { recordId: 'ant-ai-infra-third-round-2026', promptIndex: 0, followupIndex: 1 },
      { recordId: 'baidu-ai-infra-first-round-2026', promptIndex: 0, followupIndex: 2 },
      { recordId: 'multi-company-intern-2025', promptIndex: 2, followupIndex: 1 },
    ],
  },
];

export function mockInterviewQuestionSet(track: MockInterviewTrack, variantIndex: number) {
  const normalizedVariant = ((variantIndex % mockInterviewVariantCount) + mockInterviewVariantCount) % mockInterviewVariantCount;
  const startIndex = normalizedVariant * 2;
  return Array.from({ length: 5 }, (_, index) => {
    const spec = track.questionPool[(startIndex + index) % track.questionPool.length];
    return { ...spec, followupIndex: spec.followupIndex + normalizedVariant };
  });
}

export function resolveMockInterviewQuestion(spec: MockInterviewQuestionSpec): ResolvedMockInterviewQuestion | null {
  const record = interviewRecords.find((item) => item.id === spec.recordId);
  const prompt = record?.prompts[spec.promptIndex];
  const guide = guideForInterviewQuestion(spec.recordId, spec.promptIndex);
  const followupIndex = guide ? ((spec.followupIndex % guide.followups.length) + guide.followups.length) % guide.followups.length : 0;
  const followup = guide?.followups[followupIndex];
  return record && prompt && guide && followup ? { ...spec, followupIndex, record, prompt, guide, followup } : null;
}
