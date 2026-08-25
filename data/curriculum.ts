export type EntryRoute = {
  id: 'beginner' | 'switcher' | 'ml';
  label: string;
  title: string;
  audience: string;
  duration: string;
  color: string;
  sequence: string[];
  phases: Array<{ weeks: string; title: string; focus: string; deliverable: string }>;
};

export type KnowledgeModule = {
  id: string;
  order: string;
  cluster: '基础层' | '模型层' | '训练层' | '应用层' | '系统与研究层';
  title: string;
  level: '必修' | '岗位分支' | '进阶';
  summary: string;
  prerequisites: string[];
  concepts: string[];
  output: string;
  interview: string;
};

export type LearningResource = {
  id: string;
  type: '课程' | '教程' | '书籍' | '博客' | '论文';
  title: string;
  provider: string;
  href: string;
  stage: '编程基础' | '深度学习' | 'LLM 核心' | '应用与系统' | '对齐与研究';
  audiences: Array<'零基础' | '转码' | 'ML 背景'>;
  language: '中文' | '英文' | '中英';
  time: string;
  why: string;
  deliverable: string;
};

export const entryRoutes: EntryRoute[] = [
  {
    id: 'beginner',
    label: 'BEGINNER',
    title: '零编程基础',
    audience: '没有系统写过代码，或只使用过少量脚本，希望从可运行的小项目进入 LLM。',
    duration: '建议 18–24 周',
    color: 'blue',
    sequence: ['foundation-code', 'foundation-math', 'foundation-dl', 'lm-basics', 'transformer', 'finetune', 'rag', 'agent', 'evaluation', 'project'],
    phases: [
      { weeks: '01–04', title: '能写、能跑、能调试', focus: 'Python、命令行、Git、数据结构与测试', deliverable: '一个带 README 和测试的文本处理 CLI' },
      { weeks: '05–09', title: '建立机器学习直觉', focus: '线代、概率、损失、梯度、过拟合与 PyTorch', deliverable: '从零实现 MLP，并解释训练曲线' },
      { weeks: '10–14', title: '拆开 Transformer', focus: 'Tokenizer、Embedding、Attention、RoPE、语言模型目标', deliverable: '训练小型字符语言模型并完成误差分析' },
      { weeks: '15–19', title: '做出一个 LLM 应用', focus: 'Hugging Face、Prompt、RAG、工具调用与基础评测', deliverable: '带引用和拒答能力的小型 RAG 系统' },
      { weeks: '20–24', title: '转向岗位表达', focus: '部署、成本、系统设计、项目复盘与模拟面试', deliverable: '一份可演示项目和 10 分钟技术讲解' },
    ],
  },
  {
    id: 'switcher',
    label: 'SWITCHER',
    title: '软件工程转 LLM',
    audience: '已经会编程、后端或数据工程，需要补齐 ML 直觉、模型原理和 LLM 评测。',
    duration: '建议 10–14 周',
    color: 'lime',
    sequence: ['foundation-math', 'foundation-dl', 'lm-basics', 'transformer', 'finetune', 'inference', 'rag', 'agent', 'evaluation', 'project'],
    phases: [
      { weeks: '01–03', title: '补齐 ML 最小闭环', focus: '训练/验证划分、损失、梯度、优化与 PyTorch', deliverable: '可复现的文本分类训练脚本' },
      { weeks: '04–06', title: '理解 LLM 内部结构', focus: 'Tokenizer、Attention、位置编码、训练与生成', deliverable: '从张量形状解释一次 Transformer forward' },
      { weeks: '07–10', title: '发挥工程优势', focus: 'RAG、Agent、评测、缓存、延迟与可观测性', deliverable: '可评测、可追踪的 Agent 或 RAG 服务' },
      { weeks: '11–14', title: '准备系统面试', focus: '容量估算、失败降级、成本、数据闭环与项目深挖', deliverable: '两套 LLM 系统设计答题稿' },
    ],
  },
  {
    id: 'ml',
    label: 'ML → LLM',
    title: '已有 ML / DL 背景',
    audience: '熟悉训练与评测，希望进入 LLM 算法、后训练、推理系统或研究岗位。',
    duration: '建议 6–10 周',
    color: 'violet',
    sequence: ['lm-basics', 'transformer', 'pretraining', 'finetune', 'alignment', 'inference', 'evaluation', 'interpretability', 'project'],
    phases: [
      { weeks: '01–02', title: '补齐 LLM 特有机制', focus: 'Tokenizer、RoPE、长上下文、Scaling 与数据配方', deliverable: '一份模型架构与训练配方对比' },
      { weeks: '03–05', title: '深入训练与后训练', focus: 'SFT、LoRA、Reward Model、DPO、PPO/GRPO', deliverable: '小模型偏好优化实验与失败分析' },
      { weeks: '06–08', title: '选择岗位分支', focus: '推理系统、评测可靠性或机制可解释性', deliverable: '一项带控制和边界的专项实验' },
      { weeks: '09–10', title: '形成研究表达', focus: '基线、公平比较、消融、统计不确定性与 no-call', deliverable: '技术报告、复现实验和项目答辩' },
    ],
  },
];

export const knowledgeModules: KnowledgeModule[] = [
  { id: 'foundation-code', order: '00', cluster: '基础层', title: '编程与工程基础', level: '必修', summary: '先具备独立运行、调试和交付代码的能力，避免把环境问题误认为模型问题。', prerequisites: ['无'], concepts: ['Python 语法与数据结构', '命令行与 Linux', 'Git 与协作', '虚拟环境与依赖', '测试、日志与调试', 'HTTP / JSON / API'], output: '文本处理 CLI + 测试 + README', interview: '解释一次从输入到输出的程序执行路径。' },
  { id: 'foundation-math', order: '01', cluster: '基础层', title: '数学与机器学习', level: '必修', summary: '掌握理解损失、优化、泛化和表示所需的最小数学闭环。', prerequisites: ['基础代数', 'Python'], concepts: ['向量与矩阵', '概率与期望', '导数与链式法则', '损失与最大似然', '训练/验证/测试', '偏差、方差与正则化'], output: '从零实现线性/softmax 回归', interview: '从目标函数解释模型为什么这样训练。' },
  { id: 'foundation-dl', order: '02', cluster: '基础层', title: '深度学习与 PyTorch', level: '必修', summary: '把张量、计算图、反向传播和训练循环连接成可调试的系统。', prerequisites: ['数学与机器学习'], concepts: ['Tensor 与 broadcasting', 'Autograd', 'MLP 与激活函数', '初始化与归一化', '优化器与学习率', 'DataLoader 与训练循环'], output: 'MLP 训练脚本 + 曲线诊断', interview: '定位梯度消失、过拟合或训练不稳定。' },
  { id: 'lm-basics', order: '03', cluster: '模型层', title: 'NLP 与语言模型基础', level: '必修', summary: '理解文本如何变成 token，以及自回归模型到底在优化什么。', prerequisites: ['深度学习与 PyTorch'], concepts: ['BPE / Unigram', 'Embedding', 'N-gram 与神经语言模型', 'Causal LM / Masked LM', 'Cross-entropy 与 perplexity', 'Teacher forcing'], output: 'Tokenizer 分析 + 小型字符 LM', interview: '解释 tokenization 如何影响成本、长度和模型行为。' },
  { id: 'transformer', order: '04', cluster: '模型层', title: 'Transformer 内部机制', level: '必修', summary: '沿张量形状理解一次完整 forward，而不是停留在模块名。', prerequisites: ['NLP 与语言模型', '线性代数'], concepts: ['Q/K/V 与 scaled attention', 'Multi-head / MQA / GQA', 'Residual 与归一化', 'FFN / SwiGLU', 'RoPE 与位置编码', 'Causal mask'], output: '最小 Transformer + shape trace', interview: '从复杂度、信息流和数值稳定性解释设计取舍。' },
  { id: 'pretraining', order: '05', cluster: '训练层', title: '数据、预训练与 Scaling', level: '岗位分支', summary: '把数据治理、训练稳定性、计算预算和评测放进同一训练系统。', prerequisites: ['Transformer', '训练循环'], concepts: ['数据清洗与去重', '数据混合与 curriculum', 'Scaling laws', '分布式训练基础', '混合精度与 checkpoint', '预训练评测'], output: '小模型预训练计划与预算表', interview: '给定计算预算时如何选择数据、模型与训练 token。' },
  { id: 'finetune', order: '06', cluster: '训练层', title: 'SFT 与参数高效微调', level: '必修', summary: '理解 instruction data、训练模板和 PEFT 如何改变模型行为。', prerequisites: ['Transformer', 'PyTorch'], concepts: ['Instruction tuning', 'Chat template 与 masking', 'Full FT / LoRA / QLoRA', '数据质量与去污染', '超参数与过拟合', '任务评测'], output: '小模型 LoRA 实验 + 对照', interview: '何时选择 RAG、Prompt、LoRA 或全量微调。' },
  { id: 'alignment', order: '07', cluster: '训练层', title: '偏好优化与对齐', level: '岗位分支', summary: '区分偏好数据、Reward Model、策略优化与评价偏差。', prerequisites: ['SFT', '概率与优化'], concepts: ['Preference data', 'Reward modeling', 'RLHF / PPO', 'DPO 与 β', 'GRPO 与组内优势', 'Reward hacking'], output: '偏好优化复现 + 稳定性检查', interview: '比较 PPO-RLHF、DPO 与 GRPO 的目标和工程流程。' },
  { id: 'inference', order: '08', cluster: '系统与研究层', title: '推理、服务与效率', level: '岗位分支', summary: '从 prefill/decode、显存和调度解释延迟与吞吐。', prerequisites: ['Transformer', '基础系统知识'], concepts: ['KV Cache', 'Continuous batching', 'PagedAttention', '量化', 'Tensor/Pipeline parallel', 'Speculative decoding'], output: '显存/吞吐估算器 + serving benchmark', interview: '在延迟、吞吐、成本和质量之间做容量设计。' },
  { id: 'rag', order: '09', cluster: '应用层', title: 'RAG 与知识系统', level: '必修', summary: '把检索、引用、生成和拒答拆开评测，避免只看最终 demo。', prerequisites: ['Embedding', 'API 与数据处理'], concepts: ['切块与索引', 'Dense / sparse / hybrid retrieval', 'Reranker', 'Query rewrite', 'Grounded generation', '检索与生成分层评测'], output: '带可验证引用和拒答的 RAG', interview: '设计更新、权限、延迟、引用和失败降级。' },
  { id: 'agent', order: '10', cluster: '应用层', title: 'Agent 与工具调用', level: '岗位分支', summary: '把 Agent 看成可观测的决策循环，而不是框架名列表。', prerequisites: ['LLM API', 'RAG', '软件工程'], concepts: ['Tool schema', 'Planning / ReAct', '状态与记忆', '工作流与 Agent', '错误恢复', '轨迹评测与可观测性'], output: '可回放轨迹的工具型 Agent', interview: '何时需要 Agent，何时固定工作流更可靠。' },
  { id: 'evaluation', order: '11', cluster: '系统与研究层', title: '评测、可靠性与安全', level: '必修', summary: '把指标、人工标签、judge 偏差、线上反馈和 no-call 连接起来。', prerequisites: ['统计基础', '目标任务'], concepts: ['任务指标与 rubric', 'LLM-as-a-Judge', '位置/长度/自我偏好', '人工一致性', '红队与安全评测', '线上监控与 badcase'], output: 'Judge 可靠性审计或评测 harness', interview: '证明指标真的测到了产品关心的能力。' },
  { id: 'interpretability', order: '12', cluster: '系统与研究层', title: '可解释性与机制研究', level: '进阶', summary: '区分可视化、可解码相关性和真正的因果机制证据。', prerequisites: ['Transformer', '实验设计'], concepts: ['Probing', 'Activation patching', 'Ablation / steering', 'SAE 基础', '因果与混杂', '外部效度与结论边界'], output: '小模型因果干预实验', interview: '说明一个结果支持什么、不支持什么。' },
  { id: 'project', order: '13', cluster: '系统与研究层', title: '系统设计与项目表达', level: '必修', summary: '把知识收束为可演示系统、可复现实验和能经受追问的技术决策。', prerequisites: ['至少一个岗位分支'], concepts: ['需求澄清', '数据与评测闭环', '架构与容量估算', '基线与消融', '成本与失败分析', '项目叙事与行为面试'], output: '项目仓库 + 技术报告 + 10 分钟答辩', interview: '解释为什么这样做、证据是什么、边界在哪里。' },
];

export const learningResources: LearningResource[] = [
  { id: 'cs50p', type: '课程', title: 'CS50P: Introduction to Programming with Python', provider: 'Harvard', href: 'https://cs50.harvard.edu/python/', stage: '编程基础', audiences: ['零基础'], language: '英文', time: '10 周', why: '真正从零开始，包含调试、测试、文件 I/O 和最终项目，不只是语法速查。', deliverable: '完成 problem sets，并写一个文本处理小项目。' },
  { id: 'missing-semester', type: '课程', title: 'The Missing Semester of Your CS Education', provider: 'MIT', href: 'https://missing.csail.mit.edu/', stage: '编程基础', audiences: ['零基础', '转码'], language: '英文', time: '9 讲', why: '补齐命令行、Git、调试、环境和交付工具，是转码者最容易忽略的一层。', deliverable: '能独立创建环境、调试程序并用 Git 管理项目。' },
  { id: 'd2l-zh', type: '书籍', title: '动手学深度学习', provider: 'D2L', href: 'https://zh.d2l.ai/', stage: '深度学习', audiences: ['零基础', '转码'], language: '中文', time: '8–12 周', why: '把数学、代码和模型放在一起，适合建立系统的深度学习基础。', deliverable: '重写线性回归、MLP 和注意力章节的核心代码。' },
  { id: 'pytorch-basics', type: '教程', title: 'Learn the Basics', provider: 'PyTorch', href: 'https://docs.pytorch.org/tutorials/beginner/basics/intro.html', stage: '深度学习', audiences: ['零基础', '转码', 'ML 背景'], language: '英文', time: '1–2 周', why: '官方最短 PyTorch 闭环：Tensor、DataLoader、模型、autograd、优化与保存。', deliverable: '写出不依赖高级 Trainer 的训练循环。' },
  { id: 'nn-zero-to-hero', type: '课程', title: 'Neural Networks: Zero to Hero', provider: 'Andrej Karpathy', href: 'https://github.com/karpathy/nn-zero-to-hero', stage: 'LLM 核心', audiences: ['零基础', '转码', 'ML 背景'], language: '英文', time: '6–10 周', why: '从 micrograd、字符 LM 一路写到 GPT 和 tokenizer，适合建立机制直觉。', deliverable: '完成 micrograd、makemore 和 mini-GPT 练习。' },
  { id: 'hf-llm', type: '课程', title: 'Hugging Face LLM Course', provider: 'Hugging Face', href: 'https://huggingface.co/learn/llm-course/en/chapter1/1', stage: 'LLM 核心', audiences: ['转码', 'ML 背景'], language: '中英', time: '6–8 周', why: '覆盖 Transformers、Datasets、Tokenizers 和微调，是进入实际生态的主线。', deliverable: '完成一个数据处理、微调、评测和上传模型的闭环。' },
  { id: 'cs336', type: '课程', title: 'CS336: Language Modeling from Scratch', provider: 'Stanford', href: 'https://cs336.stanford.edu/', stage: 'LLM 核心', audiences: ['ML 背景'], language: '英文', time: '高强度学期课', why: '从 tokenizer、训练到系统、Scaling 和数据，适合算法与研究路线。', deliverable: '选择一个 assignment 做完整复现，不建议只看视频。' },
  { id: 'hf-agents', type: '课程', title: 'AI Agents Course', provider: 'Hugging Face', href: 'https://huggingface.co/learn/agents-course/en/unit0/introduction', stage: '应用与系统', audiences: ['转码', 'ML 背景'], language: '英文', time: '4–6 周', why: '覆盖 Agent 基础、框架、Agentic RAG、可观测性和最终项目。', deliverable: '做一个有工具失败恢复和轨迹评测的 Agent。' },
  { id: 'fsdl', type: '课程', title: 'The Full Stack', provider: 'Full Stack Deep Learning', href: 'https://fullstackdeeplearning.com/', stage: '应用与系统', audiences: ['转码', 'ML 背景'], language: '英文', time: '按主题选学', why: '把模型选择、产品设计、部署、LLMOps 和用户体验放到完整产品生命周期中。', deliverable: '为自己的 LLM 项目补充评测、监控、成本和上线设计。' },
  { id: 'ml-systems', type: '教程', title: 'Machine Learning Systems Design', provider: 'Chip Huyen', href: 'https://huyenchip.com/machine-learning-systems-design/toc.html', stage: '应用与系统', audiences: ['转码', 'ML 背景'], language: '英文', time: '2–3 周', why: '适合建立系统设计答题结构：问题、数据、建模、服务和迭代。', deliverable: '完成两道开放式系统设计题并录音复盘。' },
  { id: 'lil-log', type: '博客', title: "Lil'Log Archive", provider: 'Lilian Weng', href: 'https://lilianweng.github.io/archives/', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '按主题精读', why: '高质量串联 Agent、对齐、推理、幻觉与训练主题，适合论文前的概念地图。', deliverable: '每篇只做一页：问题、方法、证据、边界。' },
  { id: 'instructgpt', type: '论文', title: 'Training language models to follow instructions', provider: 'OpenAI', href: 'https://arxiv.org/abs/2203.02155', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '1–2 天', why: '理解 SFT、Reward Model 与 PPO-RLHF 经典流程和评测设计。', deliverable: '画出数据与模型流，并指出每阶段的偏差来源。' },
  { id: 'dpo', type: '论文', title: 'Direct Preference Optimization', provider: 'Stanford', href: 'https://arxiv.org/abs/2305.18290', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '1–2 天', why: '理解偏好优化如何从 RLHF 目标化为直接分类式损失。', deliverable: '推导核心 loss，并解释 β 和 reference model。' },
  { id: 'vllm', type: '论文', title: 'PagedAttention / vLLM', provider: 'UC Berkeley', href: 'https://arxiv.org/abs/2309.06180', stage: '应用与系统', audiences: ['转码', 'ML 背景'], language: '英文', time: '1–2 天', why: '把 KV Cache、显存碎片和服务吞吐连接起来。', deliverable: '用站内计算器复现一组容量估算。' },
];
