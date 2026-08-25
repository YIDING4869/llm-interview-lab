export type RetrievalDocument = {
  id: string;
  title: string;
  section: string;
  content: string;
  concepts: string[];
};

export const tokenizerExamples = [
  { label: '中英混合', text: 'Transformer 把文本切成 tokens，再预测下一个 token。' },
  { label: '英文术语', text: 'Tokenization changes context length and inference cost.' },
  { label: '代码与数字', text: 'kv_cache = 2 * layers * seq_len  # FP16' },
];

export const retrievalDocuments: RetrievalDocument[] = [
  { id: 'kv-cache', title: 'KV Cache 与 GQA', section: '推理系统', content: '自回归解码缓存每层历史 token 的 Key 和 Value，避免重复计算前缀。KV 显存随上下文、batch、层数和 KV heads 线性增长；GQA 通过减少 KV heads 降低容量压力。', concepts: ['kv', 'inference'] },
  { id: 'attention', title: 'Scaled Dot-Product Attention', section: 'Transformer', content: 'QK 点积除以根号 d_k，使分数尺度更稳定，减少 softmax 过早饱和。Causal mask 阻止当前位置看到未来 token。', concepts: ['attention', 'transformer'] },
  { id: 'tokenizer', title: 'Tokenizer 与上下文预算', section: '语言模型基础', content: 'Tokenizer 决定文本如何映射为 token。不同词表和切分算法会让中文、英文和代码产生不同序列长度，进而影响上下文容量、训练成本与推理延迟。', concepts: ['tokenizer', 'inference'] },
  { id: 'rag-eval', title: 'RAG 的分层评测', section: 'RAG', content: 'RAG 应分别评测检索召回、重排、引用支持率、答案正确性与拒答。答案即使正确，引用不支持答案也应记为 grounding 失败。', concepts: ['rag', 'evaluation'] },
  { id: 'dpo', title: 'DPO 偏好优化', section: '后训练', content: 'DPO 使用偏好对与参考模型构造直接分类式损失，不需要单独训练显式 Reward Model。结果仍受偏好数据、参考策略和 beta 影响。', concepts: ['alignment', 'training'] },
  { id: 'agent', title: 'Agent 还是固定工作流', section: 'Agent', content: '当任务路径无法预先枚举、需要根据中间结果动态选择工具时，Agent 更有价值。步骤稳定或错误成本高时，固定工作流通常更可控、更容易测试。', concepts: ['agent', 'system'] },
  { id: 'judge', title: 'LLM-as-a-Judge 可靠性', section: '评测', content: '自动 Judge 需要与人工标签比较，并测试位置偏差、长度偏好、顺序交换稳定性与逐样本分歧。不可判定样本应进入人工复核。', concepts: ['evaluation', 'judge'] },
  { id: 'lora', title: 'RAG、LoRA 与全量微调', section: '微调', content: 'RAG 适合可更新外部知识，LoRA 适合用较低成本改变任务行为或风格，全量微调适合数据和计算充足且需要广泛参数更新的情况。', concepts: ['finetune', 'rag', 'training'] },
];

export const retrievalExamples = [
  { label: 'KV 显存', query: '为什么 GQA 能降低长上下文显存？', relevantIds: ['kv-cache'] },
  { label: '引用评测', query: '答案正确但引用不支持，应该如何评测？', relevantIds: ['rag-eval', 'judge'] },
  { label: 'Agent 取舍', query: '什么时候不应该使用 Agent？', relevantIds: ['agent'] },
  { label: '切分成本', query: '中文 token 数为什么会影响上下文成本？', relevantIds: ['tokenizer'] },
];

export const conceptDictionary: Record<string, string[]> = {
  kv: ['kv', 'cache', '缓存', '显存', 'gqa', 'mqa', '上下文', '长上下文'],
  inference: ['推理', '解码', '延迟', '吞吐', '显存', '成本', 'inference'],
  attention: ['attention', '注意力', 'qk', 'softmax', 'd_k', '根号'],
  transformer: ['transformer', '位置编码', 'causal', 'mask'],
  tokenizer: ['token', 'tokenizer', '切分', '词表', '中文', '序列长度'],
  rag: ['rag', '检索', '召回', '重排', '引用', '知识库', 'grounding'],
  evaluation: ['评测', '评价', '指标', '正确', '支持', '分歧', '复核'],
  judge: ['judge', '裁判', '偏差', '人工标签'],
  alignment: ['对齐', '偏好', 'dpo', 'rlhf', 'reward'],
  training: ['训练', '微调', '损失', '数据', '模型'],
  agent: ['agent', '智能体', '工具', '工作流', '路径'],
  system: ['系统', '错误', '可控', '测试', '稳定'],
  finetune: ['lora', '微调', '全量', 'prompt', '行为'],
};
