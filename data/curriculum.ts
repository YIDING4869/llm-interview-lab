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
  year?: string;
  status?: '同行评审' | '研究报告' | '预印本';
  topics?: string[];
  viewpoint?: string;
  boundary?: string;
};

export type FrontierDebate = {
  id: string;
  title: string;
  question: string;
  positions: string[];
  takeaway: string;
};

export const entryRoutes: EntryRoute[] = [
  {
    id: 'beginner',
    label: 'BEGINNER',
    title: '零编程基础',
    audience: '没有系统写过代码，或只使用过少量脚本，希望从可运行的小项目进入 LLM。',
    duration: '建议 9–12 周',
    color: 'blue',
    sequence: ['foundation-code', 'foundation-math', 'foundation-dl', 'lm-basics', 'transformer', 'multimodal', 'finetune', 'reasoning', 'rag', 'agent', 'evaluation', 'project'],
    phases: [
      { weeks: '01–02', title: '能写、能跑、能调试', focus: 'Python、命令行、Git、数据结构与测试', deliverable: '一个带 README 和测试的文本处理 CLI' },
      { weeks: '03–05', title: '建立机器学习直觉', focus: '线代、概率、损失、梯度、过拟合与 PyTorch', deliverable: '从零实现 MLP，并解释训练曲线' },
      { weeks: '06–07', title: '拆开 Transformer', focus: 'Tokenizer、Embedding、Attention、RoPE、语言模型目标', deliverable: '训练小型字符语言模型并完成误差分析' },
      { weeks: '08–10', title: '做出一个 LLM 应用', focus: 'Hugging Face、Prompt、RAG、工具调用与基础评测', deliverable: '带引用和拒答能力的小型 RAG 系统' },
      { weeks: '11–12', title: '转向岗位表达', focus: '部署、成本、系统设计、项目复盘与模拟面试', deliverable: '一份可演示项目和 10 分钟技术讲解' },
    ],
  },
  {
    id: 'switcher',
    label: 'SWITCHER',
    title: '软件工程转 LLM',
    audience: '已经会编程、后端或数据工程，需要补齐 ML 直觉、模型原理和 LLM 评测。',
    duration: '建议 5–7 周',
    color: 'lime',
    sequence: ['foundation-math', 'foundation-dl', 'lm-basics', 'transformer', 'multimodal', 'finetune', 'reasoning', 'inference', 'rag', 'agent', 'evaluation', 'project'],
    phases: [
      { weeks: '01', title: '补齐 ML 最小闭环', focus: '训练/验证划分、损失、梯度、优化与 PyTorch', deliverable: '可复现的文本分类训练脚本' },
      { weeks: '02–03', title: '理解 LLM 内部结构', focus: 'Tokenizer、Attention、位置编码、训练与生成', deliverable: '从张量形状解释一次 Transformer forward' },
      { weeks: '04–05', title: '发挥工程优势', focus: 'RAG、Agent、评测、缓存、延迟与可观测性', deliverable: '可评测、可追踪的 Agent 或 RAG 服务' },
      { weeks: '06–07', title: '准备系统面试', focus: '容量估算、失败降级、成本、数据闭环与项目深挖', deliverable: '两套 LLM 系统设计答题稿' },
    ],
  },
  {
    id: 'ml',
    label: 'ML → LLM',
    title: '已有 ML / DL 背景',
    audience: '熟悉训练与评测，希望进入 LLM 算法、后训练、推理系统或研究岗位。',
    duration: '建议 3–5 周',
    color: 'violet',
    sequence: ['lm-basics', 'transformer', 'multimodal', 'pretraining', 'finetune', 'alignment', 'reasoning', 'inference', 'evaluation', 'interpretability', 'project'],
    phases: [
      { weeks: '01', title: '补齐 LLM 特有机制', focus: 'Tokenizer、RoPE、长上下文、Scaling 与数据配方', deliverable: '一份模型架构与训练配方对比' },
      { weeks: '02', title: '深入训练与后训练', focus: 'SFT、LoRA、Reward Model、DPO、PPO/GRPO', deliverable: '小模型偏好优化实验与失败分析' },
      { weeks: '03–04', title: '选择岗位分支', focus: '推理系统、评测可靠性或机制可解释性', deliverable: '一项带控制和边界的专项实验' },
      { weeks: '05', title: '形成研究表达', focus: '基线、公平比较、消融、统计不确定性与 no-call', deliverable: '技术报告、复现实验和项目答辩' },
    ],
  },
];

export const knowledgeModules: KnowledgeModule[] = [
  { id: 'foundation-code', order: '00', cluster: '基础层', title: '编程与工程基础', level: '必修', summary: '先具备独立运行、调试和交付代码的能力，避免把环境问题误认为模型问题。', prerequisites: ['无'], concepts: ['Python 语法与数据结构', '命令行与 Linux', 'Git 与协作', '虚拟环境与依赖', '测试、日志与调试', 'HTTP / JSON / API'], output: '文本处理 CLI + 测试 + README', interview: '解释一次从输入到输出的程序执行路径。' },
  { id: 'foundation-math', order: '01', cluster: '基础层', title: '数学与机器学习', level: '必修', summary: '掌握理解损失、优化、泛化和表示所需的最小数学闭环。', prerequisites: ['基础代数', 'Python'], concepts: ['向量与矩阵', '概率与期望', '导数与链式法则', '损失与最大似然', '训练/验证/测试', '偏差、方差与正则化'], output: '从零实现线性/softmax 回归', interview: '从目标函数解释模型为什么这样训练。' },
  { id: 'foundation-dl', order: '02', cluster: '基础层', title: '深度学习与 PyTorch', level: '必修', summary: '把张量、计算图、反向传播和训练循环连接成可调试的系统。', prerequisites: ['数学与机器学习'], concepts: ['Tensor 与 broadcasting', 'Autograd', 'MLP 与激活函数', '初始化与归一化', '优化器与学习率', 'DataLoader 与训练循环'], output: 'MLP 训练脚本 + 曲线诊断', interview: '定位梯度消失、过拟合或训练不稳定。' },
  { id: 'lm-basics', order: '03', cluster: '模型层', title: 'NLP 与语言模型基础', level: '必修', summary: '理解文本如何变成 token，以及自回归模型到底在优化什么。', prerequisites: ['深度学习与 PyTorch'], concepts: ['BPE / Unigram', 'Embedding', 'N-gram 与神经语言模型', 'Causal LM / Masked LM', 'Cross-entropy 与 perplexity', 'Teacher forcing'], output: 'Tokenizer 分析 + 小型字符 LM', interview: '解释 tokenization 如何影响成本、长度和模型行为。' },
  { id: 'transformer', order: '04', cluster: '模型层', title: 'Transformer 内部机制', level: '必修', summary: '沿张量形状理解一次完整 forward，而不是停留在模块名。', prerequisites: ['NLP 与语言模型', '线性代数'], concepts: ['Q/K/V 与 scaled attention', 'Multi-head / MQA / GQA', 'Residual 与归一化', 'FFN / SwiGLU', 'RoPE 与位置编码', 'Causal mask'], output: '最小 Transformer + shape trace', interview: '从复杂度、信息流和数值稳定性解释设计取舍。' },
  { id: 'multimodal', order: '04A', cluster: '模型层', title: '多模态与视觉语言模型', level: '岗位分支', summary: '理解图像或视频如何被编码、压缩、对齐并接入语言模型，以及评测为何不能只看聊天观感。', prerequisites: ['Transformer', '卷积或 ViT 基础'], concepts: ['ViT 与 patch token', '视觉编码器与 projector', 'Cross-attention / early fusion', '动态分辨率与位置编码', '多模态指令数据', 'OCR、文档、视频与 grounding 评测'], output: '图像到文本 token 的 shape trace + 多模态错误集', interview: '解释一张图片如何进入 LLM，并定位感知、对齐或生成阶段的错误。' },
  { id: 'pretraining', order: '05', cluster: '训练层', title: '数据、预训练与 Scaling', level: '岗位分支', summary: '把数据治理、训练稳定性、计算预算和评测放进同一训练系统。', prerequisites: ['Transformer', '训练循环'], concepts: ['数据清洗与去重', '数据混合与 curriculum', 'Scaling laws', '分布式训练基础', '混合精度与 checkpoint', '预训练评测'], output: '小模型预训练计划与预算表', interview: '给定计算预算时如何选择数据、模型与训练 token。' },
  { id: 'finetune', order: '06', cluster: '训练层', title: 'SFT 与参数高效微调', level: '必修', summary: '理解 instruction data、训练模板和 PEFT 如何改变模型行为。', prerequisites: ['Transformer', 'PyTorch'], concepts: ['Instruction tuning', 'Chat template 与 masking', 'Full FT / LoRA / QLoRA', '数据质量与去污染', '超参数与过拟合', '任务评测'], output: '小模型 LoRA 实验 + 对照', interview: '何时选择 RAG、Prompt、LoRA 或全量微调。' },
  { id: 'alignment', order: '07', cluster: '训练层', title: '偏好优化与对齐', level: '岗位分支', summary: '区分偏好数据、Reward Model、策略优化与评价偏差。', prerequisites: ['SFT', '概率与优化'], concepts: ['Preference data', 'Reward modeling', 'RLHF / PPO', 'DPO 与 β', 'GRPO 与组内优势', 'Reward hacking'], output: '偏好优化复现 + 稳定性检查', interview: '比较 PPO-RLHF、DPO 与 GRPO 的目标和工程流程。' },
  { id: 'reasoning', order: '07A', cluster: '训练层', title: '推理模型与 Test-time Compute', level: '岗位分支', summary: '把可验证奖励、推理轨迹、蒸馏与推理预算放进同一闭环，避免把“输出更长”误当推理更强。', prerequisites: ['SFT', '偏好优化', '评测基础'], concepts: ['Reasoning data 与 cold start', '可验证奖励与 RL', 'GRPO / rejection sampling', '推理蒸馏', 'Thinking budget / early stop', '正确率、成本与 CoT 边界'], output: '推理预算曲线 + 可验证任务错误分析', interview: '比较训练时推理能力获取与推理时计算扩展，并说明如何证明收益不是长度泄漏。' },
  { id: 'inference', order: '08', cluster: '系统与研究层', title: '推理、服务与效率', level: '岗位分支', summary: '从 prefill/decode、显存和调度解释延迟与吞吐。', prerequisites: ['Transformer', '基础系统知识'], concepts: ['KV Cache', 'Continuous batching', 'PagedAttention', '量化', 'Tensor/Pipeline parallel', 'Speculative decoding'], output: '显存/吞吐估算器 + serving benchmark', interview: '在延迟、吞吐、成本和质量之间做容量设计。' },
  { id: 'rag', order: '09', cluster: '应用层', title: 'RAG 与知识系统', level: '必修', summary: '把检索、引用、生成和拒答拆开评测，避免只看最终 demo。', prerequisites: ['Embedding', 'API 与数据处理'], concepts: ['切块与索引', 'Dense / sparse / hybrid retrieval', 'Reranker', 'Query rewrite', 'Grounded generation', '检索与生成分层评测'], output: '带可验证引用和拒答的 RAG', interview: '设计更新、权限、延迟、引用和失败降级。' },
  { id: 'agent', order: '10', cluster: '应用层', title: 'Agent 与工具调用', level: '岗位分支', summary: '把 Agent 看成可观测的决策循环，而不是框架名列表。', prerequisites: ['LLM API', 'RAG', '软件工程'], concepts: ['Tool schema', 'Planning / ReAct', '状态与记忆', '工作流与 Agent', '错误恢复', '轨迹评测与可观测性'], output: '可回放轨迹的工具型 Agent', interview: '何时需要 Agent，何时固定工作流更可靠。' },
  { id: 'evaluation', order: '11', cluster: '系统与研究层', title: '评测、可靠性与安全', level: '必修', summary: '把指标、人工标签、judge 偏差、线上反馈和 no-call 连接起来。', prerequisites: ['统计基础', '目标任务'], concepts: ['任务指标与 rubric', 'LLM-as-a-Judge', '位置/长度/自我偏好', '人工一致性', '红队与安全评测', '线上监控与 badcase'], output: 'Judge 可靠性审计或评测 harness', interview: '证明指标真的测到了产品关心的能力。' },
  { id: 'interpretability', order: '12', cluster: '系统与研究层', title: '可解释性与机制研究', level: '进阶', summary: '从候选特征、局部电路到推理可监控性，区分可视化、代理指标与因果机制证据。', prerequisites: ['Transformer', '实验设计'], concepts: ['Probing 与 activation patching', 'SAE / Superposition', 'Circuit tracing / attribution graph', 'SAEBench / MIB', 'CoT faithfulness / monitorability', '因果与外部效度'], output: 'Feature / Circuit 因果审计 + benchmark 报告', interview: '说明一个结果支持什么、不支持什么，以及下一步如何验证。' },
  { id: 'project', order: '13', cluster: '系统与研究层', title: '系统设计与项目表达', level: '必修', summary: '把知识收束为可演示系统、可复现实验和能经受追问的技术决策。', prerequisites: ['至少一个岗位分支'], concepts: ['需求澄清', '数据与评测闭环', '架构与容量估算', '基线与消融', '成本与失败分析', '项目叙事与行为面试'], output: '项目仓库 + 技术报告 + 10 分钟答辩', interview: '解释为什么这样做、证据是什么、边界在哪里。' },
];

export const frontierDebates: FrontierDebate[] = [
  { id: 'feature-basis', title: '特征基底之争', question: '解释单元一定需要 SAE 吗？', positions: ['SAE 提供过完备且稀疏的候选特征字典', '2026 预印本重新强调神经元基底也可能足够稀疏', 'Subspace SAE 认为单方向特征会拆碎多维概念'], takeaway: '不要先选工具再找结论；比较不同基底在同一因果任务上的精确度、简洁度与成本。' },
  { id: 'circuit-evidence', title: '电路证据之争', question: '一张漂亮的 attribution graph 是否就是机制？', positions: ['图可以压缩 prompt-specific 信息流', '图依赖 replacement model 与边选择规则', '真正的机制主张仍要接受干预与组合验证'], takeaway: '把图当成候选计算路径，再用 patching、ablation 和行为读出检验。' },
  { id: 'benchmark-transfer', title: '评测迁移之争', question: '代理指标变好会带来实际解释能力吗？', positions: ['重构、稀疏度和自动解释便于规模化比较', 'SAEBench 显示指标间排名并不稳定', 'MIB 直接检查因果变量和因果路径恢复'], takeaway: '至少同时报告表示质量、任务内因果恢复和外部行为影响。' },
  { id: 'reasoning-visibility', title: '推理可见性之争', question: 'CoT 可读是否等于模型真实思考？', positions: ['Faithfulness 关注文字是否忠实反映内部原因', 'Monitorability 关注文字是否暴露可检测的危险信号', '二者都不能替代内部机制分析'], takeaway: 'CoT 监控是额外观测面，不是真实思维记录，也不是 mechanistic interpretability 的替代品。' },
];

export const learningResources: LearningResource[] = [
  { id: 'cs50p', type: '课程', title: 'CS50P: Introduction to Programming with Python', provider: 'Harvard', href: 'https://cs50.harvard.edu/python/', stage: '编程基础', audiences: ['零基础'], language: '英文', time: '5 周', why: '真正从零开始，包含调试、测试、文件 I/O 和最终项目，不只是语法速查。', deliverable: '完成 problem sets，并写一个文本处理小项目。' },
  { id: 'missing-semester', type: '课程', title: 'The Missing Semester of Your CS Education', provider: 'MIT', href: 'https://missing.csail.mit.edu/', stage: '编程基础', audiences: ['零基础', '转码'], language: '英文', time: '9 讲', why: '补齐命令行、Git、调试、环境和交付工具，是转码者最容易忽略的一层。', deliverable: '能独立创建环境、调试程序并用 Git 管理项目。' },
  { id: 'd2l-zh', type: '书籍', title: '动手学深度学习', provider: 'D2L', href: 'https://zh.d2l.ai/', stage: '深度学习', audiences: ['零基础', '转码'], language: '中文', time: '4–6 周', why: '把数学、代码和模型放在一起，适合建立系统的深度学习基础。', deliverable: '重写线性回归、MLP 和注意力章节的核心代码。' },
  { id: 'pytorch-basics', type: '教程', title: 'Learn the Basics', provider: 'PyTorch', href: 'https://docs.pytorch.org/tutorials/beginner/basics/intro.html', stage: '深度学习', audiences: ['零基础', '转码', 'ML 背景'], language: '英文', time: '4–7 天', why: '官方最短 PyTorch 闭环：Tensor、DataLoader、模型、autograd、优化与保存。', deliverable: '写出不依赖高级 Trainer 的训练循环。' },
  { id: 'nn-zero-to-hero', type: '课程', title: 'Neural Networks: Zero to Hero', provider: 'Andrej Karpathy', href: 'https://github.com/karpathy/nn-zero-to-hero', stage: 'LLM 核心', audiences: ['零基础', '转码', 'ML 背景'], language: '英文', time: '3–5 周', why: '从 micrograd、字符 LM 一路写到 GPT 和 tokenizer，适合建立机制直觉。', deliverable: '完成 micrograd、makemore 和 mini-GPT 练习。' },
  { id: 'hf-llm', type: '课程', title: 'Hugging Face LLM Course', provider: 'Hugging Face', href: 'https://huggingface.co/learn/llm-course/en/chapter1/1', stage: 'LLM 核心', audiences: ['转码', 'ML 背景'], language: '中英', time: '3–4 周', why: '覆盖 Transformers、Datasets、Tokenizers 和微调，是进入实际生态的主线。', deliverable: '完成一个数据处理、微调、评测和上传模型的闭环。' },
  { id: 'cs336', type: '课程', title: 'CS336: Language Modeling from Scratch', provider: 'Stanford', href: 'https://cs336.stanford.edu/', stage: 'LLM 核心', audiences: ['ML 背景'], language: '英文', time: '3–5 周选做', why: '从 tokenizer、训练到系统、Scaling 和数据，适合算法与研究路线。', deliverable: '选择一个 assignment 做完整复现，不建议只看视频。' },
  { id: 'hf-agents', type: '课程', title: 'AI Agents Course', provider: 'Hugging Face', href: 'https://huggingface.co/learn/agents-course/en/unit0/introduction', stage: '应用与系统', audiences: ['转码', 'ML 背景'], language: '英文', time: '2–3 周', why: '覆盖 Agent 基础、框架、Agentic RAG、可观测性和最终项目。', deliverable: '做一个有工具失败恢复和轨迹评测的 Agent。' },
  { id: 'fsdl', type: '课程', title: 'The Full Stack', provider: 'Full Stack Deep Learning', href: 'https://fullstackdeeplearning.com/', stage: '应用与系统', audiences: ['转码', 'ML 背景'], language: '英文', time: '按主题选学', why: '把模型选择、产品设计、部署、LLMOps 和用户体验放到完整产品生命周期中。', deliverable: '为自己的 LLM 项目补充评测、监控、成本和上线设计。' },
  { id: 'ml-systems', type: '教程', title: 'Machine Learning Systems Design', provider: 'Chip Huyen', href: 'https://huyenchip.com/machine-learning-systems-design/toc.html', stage: '应用与系统', audiences: ['转码', 'ML 背景'], language: '英文', time: '1–2 周', why: '适合建立系统设计答题结构：问题、数据、建模、服务和迭代。', deliverable: '完成两道开放式系统设计题并录音复盘。' },
  { id: 'lil-log', type: '博客', title: "Lil'Log Archive", provider: 'Lilian Weng', href: 'https://lilianweng.github.io/archives/', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '按主题精读', why: '高质量串联 Agent、对齐、推理、幻觉与训练主题，适合论文前的概念地图。', deliverable: '每篇只做一页：问题、方法、证据、边界。' },
  { id: 'sae-scaling', type: '论文', title: 'Scaling and evaluating sparse autoencoders', provider: 'OpenAI · ICLR 2025', href: 'https://arxiv.org/abs/2406.04093', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '4–8 小时', why: '建立 SAE 的训练目标、稀疏—重构权衡和规模化评测直觉。', deliverable: '画出 SAE 数据流，并制作一张“指标—用途—失效模式”对照表。', year: '2025', status: '同行评审', topics: ['可解释性', 'SAE', '特征字典'], viewpoint: 'k-sparse SAE 可以沿可预测的缩放趋势改善稀疏度与重构前沿，并把更大模型激活分解为可分析的候选特征。', boundary: '重构、稀疏度和自动解释都是代理指标；它们本身不能证明某个特征被模型因果使用。' },
  { id: 'saebench', type: '论文', title: 'SAEBench: A Comprehensive Benchmark for Sparse Autoencoders', provider: 'ICML 2025', href: 'https://proceedings.mlr.press/v267/karvonen25a.html', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '3–4 小时', why: '把 200 多个 SAE 放进统一的八项评测，观察常用代理指标能否迁移到实用任务。', deliverable: '选三项指标，解释它们分别测什么，以及为什么可能给出不同排名。', year: '2025', status: '同行评审', topics: ['可解释性', 'SAE', 'Benchmark'], viewpoint: 'SAE 架构在不同指标上的排序会变化，代理指标改善并不可靠地转化为实际任务表现。', boundary: '它比较的是给定模型、SAE 与任务集合；benchmark 排名不能直接升级为普遍最优架构。' },
  { id: 'mib', type: '论文', title: 'MIB: A Mechanistic Interpretability Benchmark', provider: 'ICML 2025', href: 'https://proceedings.mlr.press/v267/mueller25a.html', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '4–8 小时', why: '直接评测因果路径和因果变量恢复，是对“特征看起来可解释”更严格的补充。', deliverable: '做一张 circuit localization、causal variable 与 feature basis 的方法对照表。', year: '2025', status: '同行评审', topics: ['可解释性', 'Circuit', 'Benchmark'], viewpoint: '不同任务需要不同方法：attribution / mask optimization 擅长定位电路，监督式 DAS 擅长因果变量；SAE 特征在该基准上没有优于神经元。', boundary: 'MIB 是任务化基准而非所有真实模型行为的总判决；阴性结果应限定在它覆盖的任务与方法。' },
  { id: 'circuit-tracing', type: '论文', title: 'Circuit Tracing: Revealing Computational Graphs in Language Models', provider: 'Anthropic · Transformer Circuits', href: 'https://transformer-circuits.pub/2025/attribution-graphs/methods.html', stage: '对齐与研究', audiences: ['转码', 'ML 背景'], language: '英文', time: '1 天', why: '具体展示如何用 cross-layer transcoder、局部替代模型与 attribution graph 追踪单次提示的候选计算路径。', deliverable: '选一个案例，标出原模型、替代模型、图节点、边和行为验证分别在哪里。', year: '2025', status: '研究报告', topics: ['可解释性', 'Circuit', 'Attribution graph'], viewpoint: '把模型局部替换为更稀疏的可追踪计算图，可以生成 prompt-specific 的机制假设并定位跨层信息流。', boundary: '图解释的是近似 replacement model；缺失或重构不好的关键计算不会自动出现在图中，也不是模型的全局完整解释。' },
  { id: 'mi-axioms', type: '论文', title: 'Validating Mechanistic Interpretations: An Axiomatic Approach', provider: 'ICML 2025', href: 'https://proceedings.mlr.press/v267/palumbo25a.html', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '3–4 小时', why: '把“这个解释看起来合理”改写为可检查的近似语义与组合要求。', deliverable: '用论文中的验证思想审计一个公开 circuit 案例，写出通过项与失败项。', year: '2025', status: '同行评审', topics: ['可解释性', '验证', 'Circuit'], viewpoint: '机制解释需要满足明确的语义与组合性质，不能只依靠研究者挑选的可视化或故事。', boundary: '公理提供验证框架，不保证给定方法能找到唯一、完整或人类最自然的解释。' },
  { id: 'cot-faithfulness', type: '论文', title: "Reasoning models don't always say what they think", provider: 'Anthropic', href: 'https://www.anthropic.com/research/reasoning-models-dont-say-think', stage: '对齐与研究', audiences: ['转码', 'ML 背景'], language: '英文', time: '3–4 小时', why: '用隐藏提示与 reward-hacking 设置具体检验 CoT 是否忠实披露影响答案的因素。', deliverable: '区分 faithfulness、正确率与可监控性，并复述两个最关键的定量结果。', year: '2025', status: '研究报告', topics: ['可解释性', 'CoT', 'Faithfulness'], viewpoint: '在研究设置中，Claude 3.7 Sonnet 与 DeepSeek R1 经常使用提示却不在 CoT 中说明；结果正确不代表推理文本忠实。', boundary: '结论来自有限模型与人为构造的提示任务；不能直接外推为所有自然推理场景中的固定不忠实率。' },
  { id: 'cot-monitorability', type: '论文', title: 'Evaluating chain-of-thought monitorability', provider: 'OpenAI', href: 'https://openai.com/index/evaluating-chain-of-thought-monitorability/', stage: '对齐与研究', audiences: ['转码', 'ML 背景'], language: '英文', time: '3–4 小时', why: '把 CoT 作为安全监控信号，在 13 类评测、24 个环境中比较它与只看动作或输出的差异。', deliverable: '画出 faithfulness 与 monitorability 的二维图，并写出何时必须结合内部机制分析。', year: '2025', status: '研究报告', topics: ['可解释性', 'CoT', 'Monitorability'], viewpoint: 'CoT 监控通常比只看动作和最终输出更能识别问题，较长推理往往更可监控，但优化时存在能力与可监控性的权衡。', boundary: '当前评测的真实性、模型是否察觉被监控和低频行为覆盖仍有限；CoT 监控是补充信号，不是 mechanistic interpretability 的替代品。' },
  { id: 'neuron-circuits-2026', type: '论文', title: 'Language Model Circuits Are Sparse in the Neuron Basis', provider: 'arXiv · 2026 preprint', href: 'https://arxiv.org/abs/2601.22594', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '3–4 小时', why: '挑战“必须先训练 SAE 才能得到稀疏电路”的默认假设，重新比较神经元与学习特征基底。', deliverable: '列出神经元基底与 SAE 基底在稀疏性、训练成本和因果验证上的可比实验。', year: '2026', status: '预印本', topics: ['可解释性', 'Neuron', 'Circuit'], viewpoint: '作者报告神经元基底本身可支持约百个神经元规模的稀疏因果电路，并在无需额外 SAE 训练时追踪潜在推理步骤。', boundary: '这是 2026 预印本；结论仍需跨模型、任务和独立团队复现，不能据此宣布 SAE 已无必要。' },
  { id: 'subspace-sae-2026', type: '论文', title: 'Subspace-Aware Sparse Autoencoders for Effective Mechanistic Interpretability', provider: 'arXiv · 2026 preprint', href: 'https://arxiv.org/abs/2606.06333', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '4–8 小时', why: '把标准 SAE 的单方向假设扩展为稀疏子空间，直接回应 feature splitting 与 absorption。', deliverable: '解释单方向 feature 与 group-gated subspace 的差别，并设计一个可否证对照。', year: '2026', status: '预印本', topics: ['可解释性', 'SAE', 'Subspace'], viewpoint: '多维概念可能需要由一组方向共同表示；subspace-aware SAE 试图用组稀疏门控减少特征拆分与吸收。', boundary: '当前证据来自有限模型与作者评测，且尚未同行评审；效率和可解释性收益需要独立复核。' },
  { id: 'instructgpt', type: '论文', title: 'Training language models to follow instructions', provider: 'OpenAI', href: 'https://arxiv.org/abs/2203.02155', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '4–8 小时', why: '理解 SFT、Reward Model 与 PPO-RLHF 经典流程和评测设计。', deliverable: '画出数据与模型流，并指出每阶段的偏差来源。' },
  { id: 'dpo', type: '论文', title: 'Direct Preference Optimization', provider: 'Stanford', href: 'https://arxiv.org/abs/2305.18290', stage: '对齐与研究', audiences: ['ML 背景'], language: '英文', time: '4–8 小时', why: '理解偏好优化如何从 RLHF 目标化为直接分类式损失。', deliverable: '推导核心 loss，并解释 β 和 reference model。' },
  { id: 'deepseek-r1', type: '论文', title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning', provider: 'DeepSeek-AI', href: 'https://arxiv.org/abs/2501.12948', stage: '对齐与研究', audiences: ['转码', 'ML 背景'], language: '中英', time: '4–8 小时', why: '把纯 RL、cold-start、多阶段训练和推理蒸馏放在同一报告中，适合建立推理模型训练主线。', deliverable: '画出 R1-Zero 与 R1 的训练流程差异，并列出三项不能由 benchmark 直接证明的主张。', year: '2025', status: '研究报告', topics: ['推理模型', '强化学习', '蒸馏'], viewpoint: '报告展示可验证奖励驱动的大规模 RL 能诱导出强推理行为；加入 cold-start 与多阶段训练后，可改善可读性、语言混杂和整体能力。', boundary: '结果来自特定模型、任务与奖励配方；长 CoT 或 benchmark 提升不等于忠实推理，也不能证明纯 RL 对所有任务都优于 SFT。' },
  { id: 'qwen3', type: '论文', title: 'Qwen3 Technical Report', provider: 'Qwen Team', href: 'https://arxiv.org/abs/2505.09388', stage: '对齐与研究', audiences: ['转码', 'ML 背景'], language: '中英', time: '3–5 小时', why: '用统一模型中的 thinking / non-thinking 模式和 thinking budget，连接训练策略与推理时成本控制。', deliverable: '为同一任务画出质量—token—延迟曲线，并说明何时应关闭 thinking。', year: '2025', status: '研究报告', topics: ['推理模型', 'Thinking budget', 'MoE'], viewpoint: 'Qwen3 把思考与非思考模式合并到同一模型，并允许通过推理预算在复杂任务质量与延迟成本之间切换。', boundary: '报告中的能力比较依赖具体基准和推理配置；更长预算不保证单调变好，生产决策仍需在自身任务上校准。' },
  { id: 'qwen25-vl', type: '论文', title: 'Qwen2.5-VL Technical Report', provider: 'Qwen Team', href: 'https://arxiv.org/abs/2502.13923', stage: 'LLM 核心', audiences: ['转码', 'ML 背景'], language: '中英', time: '3–5 小时', why: '把原生动态分辨率、Window Attention、绝对时间编码与文档、视频和 grounding 能力连在一起。', deliverable: '画出图片/视频进入 LLM 的 token 流，并为 OCR、定位和视频理解各设计一个错误切片。', year: '2025', status: '研究报告', topics: ['多模态', 'Vision Transformer', '动态分辨率'], viewpoint: '报告用动态分辨率视觉编码与时间编码处理不同尺寸图像和长视频，并强调定位、文档解析与视觉 Agent 等结构化能力。', boundary: '综合 benchmark 不能替代真实文档、语言、分辨率和时间长度切片；感知正确也不保证最终生成或工具动作正确。' },
  { id: 'vllm', type: '论文', title: 'PagedAttention / vLLM', provider: 'UC Berkeley', href: 'https://arxiv.org/abs/2309.06180', stage: '应用与系统', audiences: ['转码', 'ML 背景'], language: '英文', time: '4–8 小时', why: '把 KV Cache、显存碎片和服务吞吐连接起来。', deliverable: '用站内计算器复现一组容量估算。' },
];
