export type InterviewFocus = '模型基础' | '训练与对齐' | 'RAG / Agent' | '多模态' | '推荐 + LLM' | '工程与系统';

export type InterviewRecord = {
  id: string;
  company: string;
  role: string;
  campaign: string;
  published: string;
  rounds: string;
  outcome: string;
  focuses: InterviewFocus[];
  summary: string;
  themes: string[];
  prompts: string[];
  preparation: string;
  sourceTitle: string;
  sourceHref: string;
  practiceHref: string;
  labHref?: string;
};

export const interviewFocuses: Array<'全部' | InterviewFocus> = ['全部', '模型基础', '训练与对齐', 'RAG / Agent', '多模态', '推荐 + LLM', '工程与系统'];

export const interviewRecords: InterviewRecord[] = [
  {
    id: 'multi-company-intern-2025',
    company: '字节 · 百度 · 快手',
    role: '大模型 / 多模态算法日常实习',
    campaign: '2025 日常实习横向记录',
    published: '2025-05-07',
    rounds: '字节一面 · 百度两面 · 快手两面及 HR',
    outcome: '作者自述：百度口头 offer 后放弃，快手 OC',
    focuses: ['训练与对齐', 'RAG / Agent', '多模态'],
    summary: '同一候选人的多家公司流程，能直接看到岗位差异：字节偏 MoE、微调与 Agent 链路，百度和快手更深入追问 CLIP、BLIP、ViT、多模态融合及视频应用。',
    themes: ['项目连续追问', 'MoE 与微调', 'RAG / Agent / Function Calling', 'CLIP、BLIP 与 ViT', '每轮算法题'],
    prompts: ['怎样解释 MoE 的路由与训练，并说明自己真正做过的微调？', 'CLIP、BLIP 与 BLIP-2 的训练目标和结构差异是什么？', '如果要做视频相关的大模型应用，你会如何定义数据、模型与评测？', '为什么 RAG、Agent 和 Function Calling 在一个项目里分别存在？'],
    preparation: '准备一条完整的多模态项目主线，再分别补训练、应用和算法题；不要把三个公司遇到的问题合并成所谓“统一题库”。',
    sourceTitle: '整理下近期的大模型日常实习面经',
    sourceHref: 'https://www.nowcoder.com/feed/main/detail/44b2baec47c740c4b9bccb8a013abd56',
    practiceHref: '/practice/?module=finetune',
    labHref: '/labs/?lab=attention',
  },
  {
    id: 'meituan-llm-algorithm-2025',
    company: '美团',
    role: '大模型算法工程师',
    campaign: '2025 秋招一面',
    published: '2025-08-29',
    rounds: '一面 · 约 25 分钟项目深挖后进入基础与业务题',
    outcome: '原帖发布时未更新后续结果',
    focuses: ['模型基础', '推荐 + LLM'],
    summary: '问题从候选人项目出发，继续落到 Prompt/Prefix Tuning、推荐曝光偏差、归一化、Position Embedding 与表示学习，体现“基础概念 + 业务语境”的组合。',
    themes: ['项目收益与个人贡献', 'Prompt / Prefix Tuning', '推荐曝光偏差', 'Normalization', '位置与表示学习'],
    prompts: ['Prompt Tuning 与 Prefix Tuning 在实际场景中如何选择？', '推荐系统的曝光偏差从数据和建模角度怎样处理？', 'LayerDrop、Dropout 与 Group Normalization 分别解决什么问题？', 'Position Embedding 为什么必要，常见实现有什么取舍？'],
    preparation: '复习概念时为每个方法补一段“使用条件—替代方案—业务指标”，并把项目讲解控制在能持续承受追问的范围内。',
    sourceTitle: '美团大模型算法工程师一面面经（攒 rp）',
    sourceHref: 'https://www.nowcoder.com/feed/main/detail/b0859aa60f9440ed875f7d3178933ce9',
    practiceHref: '/practice/?module=transformer',
    labHref: '/labs/?lab=gradient',
  },
  {
    id: 'tencent-wxg-ml-2025',
    company: '腾讯 WXG',
    role: '机器学习算法暑期实习',
    campaign: '2025 暑期实习',
    published: '2025-08-21',
    rounds: '一面 · 二面 · 面委会 · HR',
    outcome: '作者自述：已 OC',
    focuses: ['模型基础', 'RAG / Agent', '多模态', '推荐 + LLM'],
    summary: '一面同时追问训练资源、RAG 多路召回、Llama、LlamaFactory 与算法题；后续转向图片翻译场景、传统机器学习、项目决策和协作方式。',
    themes: ['训练资源核算', 'RAG 多路召回与排序', 'Llama 结构与微调', '图片翻译系统', '项目协作与复盘'],
    prompts: ['项目用了多少数据、训练多久、占用多少卡，成本如何解释？', 'RAG 的多路召回怎样融合、排序并与生成模型交互？', 'Llama 的结构特点是什么，LlamaFactory 在项目中具体做了什么？', '微信图片翻译链路如何拆解，最难的工程或模型问题是什么？'],
    preparation: '把项目预算、数据规模和效果指标写成一张账本；再准备一张从输入到评测的系统图，避免只说框架名称。',
    sourceTitle: 'WXG 机器学习算法面经（已 OC）',
    sourceHref: 'https://www.nowcoder.com/discuss/788056223324114944',
    practiceHref: '/practice/?module=rag',
    labHref: '/labs/?lab=retrieval',
  },
  {
    id: 'ant-international-agent-2025',
    company: '蚂蚁国际',
    role: '大模型 / Agent 相关岗位',
    campaign: '2025 秋招',
    published: '2025-09-24',
    rounds: '一面 · 二面 · Leader 与 HR',
    outcome: '原帖发布时仍在等待结果',
    focuses: ['RAG / Agent', '工程与系统'],
    summary: '第一轮聚焦 RAG、重排、Agent 记忆与评测、MCP/A2A；第二轮明显转向消息队列、Redis、MongoDB 与手撕题，说明应用岗仍要求系统基础。',
    themes: ['RAG 与微调边界', '重排与 NDCG', 'Agent 记忆与评测', 'MCP / A2A', '消息队列与缓存'],
    prompts: ['RAG 与微调分别解决什么错误，升级条件是什么？', '重排做几轮、使用什么模型，NDCG 与线上目标如何连接？', 'Agent 的短期/长期记忆如何实现并评测？', '消息失败、顺序消费和 Redis 使用如何影响 Agent 服务可靠性？'],
    preparation: 'Agent 应用岗不能只准备 Prompt 和框架：至少能解释检索指标、badcase、状态存储、异步消息和失败恢复。',
    sourceTitle: '蚂蚁秋招时间线 + 面经',
    sourceHref: 'https://www.nowcoder.com/discuss/800426409796624384',
    practiceHref: '/practice/?module=agent',
    labHref: '/labs/?lab=retrieval',
  },
  {
    id: 'kuaishou-llm-2025',
    company: '快手',
    role: '大模型算法岗位',
    campaign: '2025 公开面试记录',
    published: '2025-09-02',
    rounds: '一轮技术面记录',
    outcome: '原帖未披露后续结果',
    focuses: ['模型基础', '训练与对齐'],
    summary: '覆盖 next-token loss、Chain of Thought、Transformer/RoPE、LoRA 初始化、MHA/MLA 与 MoE，并保留常规数据结构算法题。',
    themes: ['训练目标与 Loss', 'CoT', 'RoPE', 'LoRA 初始化与秩', 'MLA / MoE'],
    prompts: ['Next-token prediction 的损失如何从 logits 与标签计算？', 'LoRA 的 A/B 矩阵为什么采用不同初始化，rank 表示什么？', 'MHA、GQA、MQA 与 MLA 的容量和推理代价如何比较？', 'MoE 放在哪里，训练收益与推理代价分别是什么？'],
    preparation: '把每个结构问题都连接到 shape、参数量、训练稳定性和推理成本；同时保留一轮基础算法题训练。',
    sourceTitle: '快手大模型面经',
    sourceHref: 'https://www.nowcoder.com/discuss/792430274750521344',
    practiceHref: '/practice/?module=pretraining',
    labHref: '/labs/?lab=attention',
  },
  {
    id: 'alibaba-llm-first-round',
    company: '阿里',
    role: '大语言模型算法',
    campaign: '春招一面 · 约 1–1.5 小时',
    published: '原帖页面显示 02-21',
    rounds: '一面 · 作者自述进入下一轮',
    outcome: '作者自述：一面通过',
    focuses: ['模型基础', 'RAG / Agent', '训练与对齐'],
    summary: '从 Decoder-only、Attention、Embedding 与 Tokenization 追问到涌现、Benchmark、内部评估、行程规划 Agent，以及论文和实验设计。',
    themes: ['架构对比', 'Attention 与 Tokenization', '涌现与评测', 'Agent 系统能力', '论文实验设计'],
    prompts: ['Decoder-only 与 Encoder–Decoder 的应用边界是什么？', '多头注意力为何有效，减少头数是否必然退化？', 'Benchmark 不能覆盖哪些真实能力，内部评测怎样设计？', '完整行程规划除了 LLM 还需要哪些工具、状态和校验能力？'],
    preparation: '基础题不要停在定义：准备反例、评测边界和产品场景；研究经历要能说明对照、统计与失败后的下一步。',
    sourceTitle: '阿里大模型一面',
    sourceHref: 'https://www.nowcoder.com/discuss/854748927663321088',
    practiceHref: '/practice/?module=transformer',
    labHref: '/labs/?lab=tokenizer',
  },
  {
    id: 'ant-intelligent-app-2025',
    company: '蚂蚁',
    role: '智能化应用开发',
    campaign: '2025 二面',
    published: '2025-10-16',
    rounds: '二面公开记录',
    outcome: '原帖未披露最终结果',
    focuses: ['训练与对齐', 'RAG / Agent', '工程与系统'],
    summary: '围绕候选人的知识构建与项目证据，连续追问 PPO/GRPO、DeepSeek、预训练—微调—强化学习的关系、训练样本、代码正确性评测和 Agent 框架。',
    themes: ['RL 基础与 PPO / GRPO', 'DeepSeek 架构改进', '训练阶段关系', '数据样本审计', '代码与 Agent 评测'],
    prompts: ['传统强化学习算法与大模型强化学习是什么关系？', '预训练、微调和强化学习在目标、数据和优化上如何区分？', '能否展示一条训练样本，并解释数据如何产生与检查？', '代码生成模型的正确性如何评测，提升来自哪些具体干预？'],
    preparation: '把“了解算法”提升为能画出数据—目标—更新—评测链路；为项目准备一条真实样本、一个 badcase 和一组对照结果。',
    sourceTitle: '蚂蚁智能化应用开发二面面经',
    sourceHref: 'https://www.nowcoder.com/feed/main/detail/57fd6a570c7a42e0a5ae8b550009edcf',
    practiceHref: '/practice/?module=alignment',
    labHref: '/labs/?lab=gradient',
  },
];
