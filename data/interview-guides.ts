export const interviewGuideTracks = ['知识机制', '项目深挖'] as const;
export type InterviewGuideTrack = (typeof interviewGuideTracks)[number];

export type InterviewAnswerGuide = {
  track: InterviewGuideTrack;
  label: string;
  shortAnswer: string;
  deepDive: string[];
  mistakes: string[];
  followups: string[];
};

const interviewAnswerGuides: Record<string, InterviewAnswerGuide> = {
  'multi-company-intern-2025:0': {
    track: '知识机制',
    label: 'MoE 路由与训练',
    shortAnswer: 'MoE 用路由器为每个 token 计算专家分数，通常只激活 top-k 个专家，再把加权后的专家输出合并。它用更大的总参数量换取近似受控的单 token 计算量，但训练时必须同时处理负载均衡、专家容量和跨设备通信；因此“参数更多”不等于“推理一定更快”。',
    deepDive: [
      '计算链路：hidden state 先进入 router 得到专家概率，选择 top-k 后 dispatch 到对应 FFN 专家，最后按门控权重 combine 回原 token 顺序。',
      '训练目标：主任务 loss 之外，常加入负载均衡或 router 相关辅助目标，避免少数专家被持续挤占；不同实现对 token drop、capacity factor 的处理不同。',
      '系统代价：专家并行会引入 all-to-all 通信、动态负载和显存分布问题，吞吐取决于 batch、序列、拓扑和路由均衡，而不只取决于激活参数量。',
      '项目证据：说明你实际调整了哪些层、训练了哪些参数、使用多少数据，以及质量、吞吐、专家利用率或通信开销如何变化。',
    ],
    mistakes: ['把 MoE 说成每次都会运行全部专家', '只说“参数变大、计算不变”，忽略路由和通信成本', '没有区分读过的模型结构与自己真正做过的微调工作'],
    followups: ['top-k、capacity factor 和 token drop 分别怎样影响质量？', '怎样判断出现了 expert collapse？', '专家并行与数据并行应该怎样组合？'],
  },
  'meituan-llm-algorithm-2025:0': {
    track: '知识机制',
    label: 'Prompt Tuning vs Prefix Tuning',
    shortAnswer: '两者都冻结主体模型并学习少量连续参数。Prompt Tuning 通常在输入 embedding 前加入可学习虚拟 token；Prefix Tuning 常为每一层注入可学习的前缀状态或 K/V。前者更轻、更易部署，后者对深层表示的控制更直接，但参数、缓存和实现复杂度通常更高。选择要由任务迁移幅度、模型规模和服务约束验证。',
    deepDive: [
      '先定边界：不同代码库对 soft prompt、prefix 的命名和参数化并不完全一致，回答时要说明所指实现。',
      '容量差异：Prompt Tuning 的信号从输入向上传播；Prefix Tuning 在多层提供条件，因此往往有更强的调节能力，也带来更多可学习状态。',
      '服务取舍：比较每任务参数量、前缀带来的有效序列或 KV 开销、是否便于批处理，以及多租户切换成本。',
      '实验选择：固定基座、数据和预算，对比全量微调或 LoRA，并同时报告任务质量、训练成本、首 token 延迟和稳定性。',
    ],
    mistakes: ['把离散文本 prompt 与可学习 soft prompt 混为一谈', '断言 Prefix Tuning 在所有任务上都优于 Prompt Tuning', '只比较参数量，不讨论推理时的前缀与缓存开销'],
    followups: ['为什么模型越大时 Prompt Tuning 往往更有竞争力？', '它们与 LoRA 的注入位置和表达能力有什么不同？', '多任务服务时如何存储和切换不同前缀？'],
  },
  'meituan-llm-algorithm-2025:3': {
    track: '知识机制',
    label: 'Position Embedding',
    shortAnswer: '纯自注意力只根据内容两两交互，不自带 token 顺序；若没有位置信号，对输入置换会得到相应置换的输出。位置编码把绝对位置或相对距离加入注意力计算。常见方案包括绝对可学习位置、相对位置偏置和 RoPE；取舍重点是训练长度、长上下文外推、计算实现与任务需求。',
    deepDive: [
      '必要性：词序会改变语义，而注意力的加权求和本身无法区分“谁在前、谁在后”，所以必须显式注入顺序。',
      '绝对位置：把位置向量与 token embedding 相加，直观且简单，但超过训练位置时通常需要插值或其他处理。',
      '相对位置与 RoPE：相对偏置直接影响 attention score；RoPE 旋转 Q/K，使内积携带相对位移信息，同时保留高效实现。',
      '长上下文：外推效果不能只看理论形式，应在目标长度上检查困惑度、检索能力和真实任务质量，并关注位置缩放带来的短上下文损失。',
    ],
    mistakes: ['说 Attention 天然知道输入顺序', '把 RoPE 简化成“给 embedding 加一个位置向量”', '只谈最大长度，不验证长上下文里是否真正利用了信息'],
    followups: ['RoPE 为什么能让 QK 内积包含相对位置信息？', '长度外推和长度内插有什么区别？', 'ALiBi、相对位置偏置与 RoPE 的服务成本如何比较？'],
  },
  'kuaishou-llm-2025:1': {
    track: '知识机制',
    label: 'LoRA 初始化与 rank',
    shortAnswer: 'LoRA 冻结原权重 W，用低秩增量 ΔW = sBA 参与前向。常见做法是一侧随机初始化、另一侧置零，使训练开始时 ΔW 为零，模型初始行为不被扰动，同时非零一侧让另一侧能获得梯度；具体 A/B 命名可能因实现相反。rank 决定增量矩阵的容量与训练、存储成本，不是越大越好。',
    deepDive: [
      '形状：若 W 把 d_in 映射到 d_out，可令 A 为 r×d_in、B 为 d_out×r，新增参数约为 r(d_in+d_out)。',
      '初始化：若 A 随机、B 为零，首步 B 可由 A 与输入获得梯度；随后 B 非零后 A 也开始更新。应以具体库的矩阵定义为准。',
      'rank 选择：小 rank 是更强的低维约束；增加 rank 提高表达容量，也增加优化与显存成本，收益常随任务和目标层不同而饱和。',
      '部署：线性层 LoRA 通常可合并进原权重以减少额外算子；多租户动态 adapter 则要权衡切换、批处理和显存驻留。',
    ],
    mistakes: ['死记“A 必须为零、B 必须随机”而不看实现的矩阵约定', '把 rank 当成原模型的矩阵秩', '只报可训练参数比例，不报任务质量和目标层选择'],
    followups: ['两侧都初始化为零会发生什么？', 'alpha 与 rank 的缩放怎样影响更新幅度？', '为什么 Q/K/V、O 与 FFN 层可能需要不同 rank？'],
  },
  'kuaishou-llm-2025:2': {
    track: '知识机制',
    label: 'MHA / GQA / MQA / MLA',
    shortAnswer: '它们主要改变 K/V 的表示与共享方式。MHA 为每个 query head 配独立 K/V head；GQA 让一组 query head 共享 K/V；MQA 让全部 query head 共享一组 K/V，因此逐步降低 KV Cache 和解码带宽。MLA 则把 K/V 信息压到低维 latent 后再投影使用，并需单独处理位置信息。质量与速度取决于训练方式、head 配置和内核支持。',
    deepDive: [
      '容量：MHA 的 K/V 表达最独立；GQA 在质量与缓存之间折中；MQA 共享最强，可能限制 K/V 多样性。',
      '缓存：标准 decoder KV Cache 与 KV head 数近似线性增长，所以 GQA/MQA 在长上下文和大 batch 解码中收益明显。',
      'MLA：核心不是简单“更少的 KV heads”，而是学习低秩潜表示并在注意力中恢复所需分量；实现还要处理可缓存部分与位置编码耦合。',
      '评测：同时比较预填充与解码速度、显存、吞吐、困惑度和下游质量，避免仅按理论缓存量下结论。',
    ],
    mistakes: ['把 GQA 说成减少 query head 数量', '认为 MQA 一定不损失质量或一定最快', '把 MLA 等同于普通低秩压缩而忽略位置与吸收投影的实现'],
    followups: ['给定 head 数怎样计算四种结构的 KV Cache 差异？', '为什么解码阶段往往比 prefill 更受 KV 带宽影响？', '从 MHA 转成 GQA 是否必须重新训练？'],
  },
  'ant-intelligent-app-2025:1': {
    track: '知识机制',
    label: '预训练 / SFT / 偏好优化',
    shortAnswer: '预训练用大规模通用序列的 next-token 目标学习语言与世界模式；SFT 用高质量指令—回答样本教模型按任务和格式作答；偏好优化或 RL 再利用成对偏好、奖励模型或可验证奖励调整相对行为。三阶段的数据、目标和风险不同，后训练不能稳定补回基座从未学到的大量知识。',
    deepDive: [
      '预训练：优化 token 级似然，数据覆盖和规模决定基础能力，同时要关注去重、污染、配比和训练稳定性。',
      'SFT：仍常是交叉熵目标，但条件分布变成指令响应；重点是示范质量、格式、多样性以及是否过拟合少数风格。',
      '偏好阶段：DPO 类方法直接利用偏好对；PPO/GRPO 类方法按奖励更新策略。回答时应说清参考策略、奖励来源和 KL 或其他约束。',
      '评测：分别看基础能力保持、指令遵循、偏好胜率、可验证任务与安全边界，并用回归集检查能力税。',
    ],
    mistakes: ['把三阶段都概括成“继续喂数据训练”', '认为 RL 会自动创造训练数据和基座里不存在的知识', '只报最终 benchmark，不检查基础能力回退和奖励投机'],
    followups: ['SFT 数据中只对回答 token 计算 loss 有什么影响？', 'DPO 与 PPO 的数据和训练链路有何区别？', '如何识别 reward hacking 或长度偏好？'],
  },
  'ant-international-agent-2025:0': {
    track: '知识机制',
    label: 'RAG vs 微调',
    shortAnswer: 'RAG 主要解决外部知识可更新、可追溯和长尾覆盖：先检索证据，再让模型基于证据生成。微调更适合改变稳定的行为模式、格式、领域语言或任务策略。若错误来自没取到或没用好事实，应先修检索和 grounded generation；若事实已给出但模型不会按目标行为处理，再考虑微调，实际系统也常组合两者。',
    deepDive: [
      '先做错误归因：区分知识库缺失、召回失败、排序失败、上下文利用失败与生成错误，升级方案才不会答非所问。',
      'RAG 代价：需要切分、索引、权限、时效、引用和在线检索链路；优势是更新快、证据可检查，不等于自动正确。',
      '微调代价：需要稳定高质量样本、训练和版本回归；它能压缩行为模式，但不适合作为频繁更新事实的数据库。',
      '评测：分别测 recall@k / NDCG、证据覆盖与忠实度、端到端正确率、延迟和成本，并保留无答案或冲突证据集。',
    ],
    mistakes: ['用“知识问题选 RAG、能力问题选微调”一句话结束而没有错误归因', '认为接入 RAG 就不会幻觉', '拿端到端分数代替召回、排序和生成各环节诊断'],
    followups: ['证据已召回但答案仍错，怎样继续定位？', '什么时候值得把 RAG 轨迹蒸馏进模型？', '知识库频繁更新时如何设计离线与在线评测？'],
  },
  '4paradigm-agent-intern-2026:3': {
    track: '知识机制',
    label: 'Agent 熔断与恢复',
    shortAnswer: '我会先把失败分成可重试、需改参、不可恢复和需要人工确认四类，并为每个工具设置超时、有限次数重试与总预算。连续失败触发 circuit breaker，保存已完成状态后走降级工具、返回部分结果或人工接管。关键是让工具调用尽量幂等、状态可恢复，并记录每一步输入摘要、错误类型、延迟和决策原因。',
    deepDive: [
      '边界预算：同时限制单工具超时、同类错误重试次数、整条任务步数和总耗时，避免换一种形式无限循环。',
      '分类恢复：网络抖动可退避重试；参数错误先修正一次；权限或确定性业务错误不重试；高风险动作要求人工确认。',
      '状态设计：为步骤分配稳定 ID，记录完成结果和副作用；恢复时从最近检查点继续，而不是重放整条链路。',
      '降级与观测：准备只读工具、缓存结果、较弱模型或部分回答等降级路径，并用成功率、恢复率、重复副作用和尾延迟评估。',
    ],
    mistakes: ['把指数退避当成所有错误的通用答案', '只有最大循环次数，没有错误分类、状态保存和降级', '宣称 exactly-once，却没有说明工具端幂等或去重条件'],
    followups: ['模型输出一直无法通过参数校验时怎样处理？', '有副作用的工具如何实现安全重试？', '熔断后什么时候半开探测，怎样恢复流量？'],
  },
  'meituan-ai-infra-2025:0': {
    track: '知识机制',
    label: 'FlashAttention',
    shortAnswer: 'FlashAttention 不是稀疏注意力，而是标准精确注意力的 IO-aware 实现。它把 Q/K/V 分块加载到片上存储，用 online softmax 在块间维护最大值与归一化统计，避免把完整 N×N attention score 矩阵反复写入和读出 HBM，因此减少显存占用与数据搬运。实际加速取决于序列长度、head dim、硬件和内核支持。',
    deepDive: [
      '瓶颈：朴素实现会物化 score 和 probability 矩阵，矩阵乘之外还发生大量 HBM 读写，长序列时 IO 成本很高。',
      '分块算法：按 Q block 与 K/V block 迭代，在 SRAM 中完成局部乘法，并通过 online softmax 合并各块，保持数值稳定。',
      '反向传播：可保存少量归一化统计并重算局部值，以更多计算换更少中间激活存储。',
      '证据：比较相同 dtype、shape、mask 和精度容差下的峰值显存、吞吐与端到端时间，不能只引用理论复杂度。',
    ],
    mistakes: ['说 FlashAttention 把 O(N²) 注意力变成 O(N)', '把它描述成近似或稀疏 Attention', '只说“用了 tiling”却讲不清 online softmax 怎样跨块归一化'],
    followups: ['online softmax 需要维护哪几个统计量？', '为什么多做重计算反而可能更快？', '短序列或小 batch 下为什么收益可能有限？'],
  },
  'ant-ai-infra-third-round-2026:1': {
    track: '知识机制',
    label: 'INT8 vs FP8',
    shortAnswer: 'INT8 通常用整数值配合 scale、可选 zero-point 和量化粒度来近似张量；FP8 仍有符号、指数与尾数，如 E4M3 和 E5M2，在相同比特下用部分精度换更大的动态范围。INT8 常用于推理权重和激活量化，FP8 在支持硬件上也适合训练或矩阵计算。谁更好取决于张量分布、离群值、校准方式、累加精度和硬件内核。',
    deepDive: [
      '表示：INT8 在给定 scale 下间隔均匀；FP8 的间隔随指数变化，E4M3 偏精度、E5M2 偏范围，具体特殊值支持依格式而定。',
      '校准：INT8 需要选择 per-tensor / per-channel 等粒度与范围；FP8 也需要缩放或 amax 管理，不能因为有指数就忽略溢出与下溢。',
      '计算链路：说明权重、激活、梯度和累加分别用什么 dtype；很多内核会用更高精度累加，再转换输出。',
      '验证：按层敏感性、任务质量、吞吐和显存共同评估，并检查离群通道；硬件不支持时理论位宽不会自动转化成速度。',
    ],
    mistakes: ['把 FP8 说成无需 scale 和校准', '只比较可表示最大值，不比较有效精度和张量分布', '不区分存储 dtype、乘法输入 dtype 与累加 dtype'],
    followups: ['E4M3 与 E5M2 分别适合哪些张量？', 'per-channel scaling 为什么常比 per-tensor 更准？', 'SmoothQuant 解决的是哪类激活离群问题？'],
  },
  'ant-ai-infra-third-round-2026:2': {
    track: '知识机制',
    label: 'KV Cache 计算',
    shortAnswer: 'Decoder 自注意力的 KV Cache 近似字节数是 2 × 层数 L × batch B × 已缓存 token 数 T × KV head 数 H_kv × head dim D × 每元素字节数。前面的 2 表示 K 和 V。MHA 中 H_kv 通常等于 query head 数，GQA/MQA 会显著减少它。这个公式先算逻辑张量，实际显存还会受分块、预分配和元数据影响。',
    deepDive: [
      '先列 shape：每层 K、V 通常都可看作 [B, H_kv, T, D]，两者元素数相同，再乘层数和 dtype bytes。',
      '举例：32 层、batch 4、2048 token、8 个 KV heads、head dim 128、FP16，约为 2×32×4×2048×8×128×2 bytes，即 1 GiB。',
      '结构影响：GQA/MQA 通过减少 H_kv 降低缓存；滑窗或 token 淘汰减少有效 T；KV 量化减少每元素字节数。',
      '系统边界：PagedAttention 主要改善动态序列的分配、碎片和共享方式，不会凭空改变同一逻辑 KV 张量的元素数。',
    ],
    mistakes: ['漏掉 K/V 的系数 2 或层数', '用 query head 数代替实际 KV head 数', '把参数量、临时 attention 矩阵和持久 KV Cache 混在一起'],
    followups: ['把示例从 FP16 改成 INT8 后是多少？', 'beam search 或 prefix sharing 会怎样改变实际占用？', 'PagedAttention 解决了什么，但没有解决什么？'],
  },
  'xiaomi-multimodal-2025:2': {
    track: '知识机制',
    label: '跨模态 Attention',
    shortAnswer: '跨模态 Attention 的方向由 Q 决定：若文本要读取图像信息，就用文本 hidden states 投影成 Q，图像 tokens 投影成 K/V，计算 softmax(QKᵀ/√d)V，输出仍与文本 query 数量对齐。反过来让图像查询文本会改变信息流和输出 shape。实际模型还要先把两种模态投影到兼容维度，并处理 mask、位置和对齐训练。',
    deepDive: [
      '形状：Q 为 [B, H, T_text, D]，K/V 为 [B, H, T_image, D]，score 为 [B, H, T_text, T_image]，输出回到 T_text。',
      '方向：Q 表示“哪些位置需要取信息”，K 用于匹配，V 提供被聚合内容；交换模态不是符号替换，而是改变谁更新表示。',
      '融合位置：可以在浅层、中间层或查询模块中多次交互；选择影响计算量、模态保真度与对齐难度。',
      '评测：除端到端准确率外，还要用图文错配、遮挡、反事实替换或 grounding 指标检查模型是否真正使用目标模态。',
    ],
    mistakes: ['只背 Q/K/V 来源却说不出输出与 score shape', '认为两个模态做一次线性投影就已经完成语义对齐', '只看最终任务分数，不检查模型是否忽略某个模态'],
    followups: ['把图像作为 Q、文本作为 K/V 后输出 shape 怎样变化？', 'cross-attention 与拼接后 self-attention 有何取舍？', '如何证明模型不是只依赖语言先验？'],
  },
  'multi-company-intern-2025:2': {
    track: '项目深挖',
    label: '视频大模型项目设计',
    shortAnswer: '我会先把需求写成可评测任务，而不是先选模型：输入是什么视频、输出是什么、允许多少延迟、错误代价是什么。然后建立简单 baseline，按视频来源或时间切分数据，避免相邻帧泄漏；再比较抽帧加图像模型、时序聚合和视频模型。评测同时覆盖任务质量、时序一致性、长尾场景、延迟与成本，最后用 badcase 决定下一步。',
    deepDive: [
      '问题口径：明确分类、检索、描述、问答或事件定位，以及离线处理还是在线服务；不同目标决定采样率、标注和指标。',
      '数据账本：记录视频小时数、来源、去重方式、片段长度、标注规则和 train/dev/test 切分单位；同源视频或相邻帧不能跨集合泄漏。',
      '模型阶梯：先做抽帧 + 图像编码 + pooling 的可解释 baseline，再判断是否需要时序编码、音频、字幕或端到端视频模型。',
      '评测闭环：主任务指标之外，按时长、运动速度、遮挡、场景和语言分桶，并报告吞吐、单视频成本与无法覆盖的失败类型。',
    ],
    mistakes: ['一开始只讲最新视频模型，没有定义任务和 baseline', '随机按帧切分数据，导致同一视频泄漏到训练和测试', '只报平均准确率，不看时序、长尾与推理成本'],
    followups: ['为什么需要视频模型，而不是更密集地抽帧？', '标注预算减半时怎样保留最有价值的数据？', '线上分布变化后如何发现并回收 badcase？'],
  },
  'tencent-wxg-ml-2025:0': {
    track: '项目深挖',
    label: '数据、算力与成本账本',
    shortAnswer: '回答资源问题时我先统一口径：训练样本数和 token 数、模型与可训练参数、全局 batch、有效训练步数、卡型与卡数、墙钟时间。由卡数乘时间得到 GPU-hours，再说明混合精度、梯度累积和 checkpoint 对显存与吞吐的影响。最后把成本连接到 baseline、效果增量和停止条件；不知道的数字明确说估算，不伪造精度。',
    deepDive: [
      '数据：分别报告原始量、清洗去重后量、训练实际见到的 token 或样本，以及切分与采样方式，避免只说文件大小。',
      '训练：给出模型规模、更新参数比例、sequence length、global batch、steps / epochs、优化器和精度；这些量共同决定计算。',
      '资源：卡型 × 卡数 × 墙钟时间得到 GPU-hours，再补峰值显存、tokens/s、失败重跑与数据处理成本；没有账单时标注估算口径。',
      '决策：用同预算 baseline 或消融说明额外成本换来了什么，并给出继续扩数据、换模型或停止训练的阈值。',
    ],
    mistakes: ['把“8 卡训练两天”当作完整资源说明', '混淆原始样本、去重样本、token 和 epoch', '为了显得完整而编造记不清的数字'],
    followups: ['global batch 怎样由单卡 batch 和梯度累积得到？', '如果效果只提升很小，如何判断是否值得增加算力？', '训练吞吐明显低于预期时先检查什么？'],
  },
  'tencent-wxg-ml-2025:1': {
    track: '项目深挖',
    label: 'RAG 多路召回项目',
    shortAnswer: '我会先说明每一路召回覆盖哪类失败，例如 BM25 保留精确词，dense retrieval 处理语义改写，结构化过滤处理权限或时间。各路先在独立验证集测 recall@k，再做去重、分数归一或 rank fusion，最后由 reranker 统一排序。生成端只接收有来源的证据，并把召回、排序、忠实度、端到端正确率和延迟分开评测。',
    deepDive: [
      '召回设计：每一路都要有明确互补假设和候选预算，不能因为“多路更强”就无上限叠加索引。',
      '融合与排序：原始分数往往不可直接比较，可用 rank fusion、分路归一或学习排序；先去重并保留来源与权限元数据。',
      '生成连接：控制证据 token 预算、引用和无答案行为，检查模型是否使用召回证据而不是只靠参数记忆。',
      '诊断矩阵：分别标记知识库缺失、召回漏失、rerank 排错、上下文截断和生成不忠实，按错误占比决定优化顺序。',
    ],
    mistakes: ['只列 BM25、向量和知识图谱，却不说各自解决的失败', '直接混合不可比的召回分数', '只报最终回答准确率，无法定位提升来自哪一层'],
    followups: ['增加一路召回后 recall 上升但答案变差，为什么？', 'reranker 的训练负例从哪里来？', '如何评测系统在知识库没有答案时是否会拒答？'],
  },
  'tencent-wxg-ml-2025:3': {
    track: '项目深挖',
    label: '图片翻译系统拆解',
    shortAnswer: '我会把图片翻译拆成文本检测、OCR、阅读顺序与版面理解、翻译、擦除重绘和端到端验收。先逐模块建立指标，再用真实图片测最终可读性和版面保持。最难问题要用具体 badcase 回答，例如弯曲文字或复杂背景导致 OCR 错误，并说明我尝试的 baseline、干预、量化结果和仍未解决的边界。',
    deepDive: [
      '链路：输入先做方向与质量判断，再检测文本框、识别字符、恢复阅读顺序，翻译后根据字体、颜色和布局完成 inpainting 与渲染。',
      '指标：检测看 precision/recall，OCR 看 CER/WER，翻译看人工质量与任务指标，渲染看遮挡、溢出和可读性；端到端还要测延迟。',
      '误差传播：上游框偏移会影响 OCR 和重绘，识别错误会被翻译放大；需要保留中间结果才能做 attribution。',
      '个人难点：用“问题—证据—尝试—结果—边界”讲一个真实案例，而不是把整条系统都说成自己的贡献。',
    ],
    mistakes: ['只说 OCR + 翻译模型，忽略版面、擦除和重绘', '拿单模块指标替代端到端用户体验', '描述“解决了复杂场景”却没有具体样本和前后对照'],
    followups: ['竖排、弯曲或艺术字怎样处理？', '如何判断错误来自 OCR 还是翻译？', '移动端延迟预算不足时先压缩哪一段？'],
  },
  'ant-intelligent-app-2025:2': {
    track: '项目深挖',
    label: '训练样本审计',
    shortAnswer: '我会展示一条脱敏后的真实样本，逐字段说明 system、input、target、metadata 和 loss mask 从哪里来。接着解释原始数据如何清洗、去重、过滤、切分和版本化，以及自动规则与人工抽检分别拦截什么错误。最后说明这条样本是否代表训练分布、哪些字段可能泄漏答案，以及它怎样进入离线评测。',
    deepDive: [
      '样本结构：展示模型实际读取的序列，而不是只展示原始业务表；说明模板、特殊 token、截断和哪些 token 参与 loss。',
      '来源与授权：说明数据的业务来源、脱敏、许可和排除规则，不把“网上收集”当成可复现的数据说明。',
      '质量控制：用 schema、长度、语言、重复度和规则检查做第一层，再按类别抽样人工复核并记录分歧。',
      '切分与污染：按用户、仓库、文档或时间等真实独立单位切分，并检查近重复与 benchmark 泄漏。',
    ],
    mistakes: ['只展示漂亮样本，不解释它是否具有代表性', '说“清洗后质量很好”但没有规则、抽检量和错误率', '训练与测试随机按行切分，忽略同源数据泄漏'],
    followups: ['只对 assistant token 计算 loss 的 mask 怎样生成？', '自动清洗误删高价值长尾样本怎么办？', '数据版本变化后如何复现实验？'],
  },
  'ant-intelligent-app-2025:3': {
    track: '项目深挖',
    label: '代码生成评测与干预',
    shortAnswer: '代码生成首先看可执行正确性，而不是文本相似度。我会在隔离环境运行固定测试，报告编译率、pass@1 或任务通过率，并按语法、API、逻辑、性能和测试不足分桶。任何提升都要固定模型、采样与题集，用消融区分数据、prompt、检索、反馈或后训练的贡献，同时检查数据污染、超时和隐藏测试覆盖。',
    deepDive: [
      '执行协议：固定语言版本、依赖、时间和内存限制，区分编译失败、运行异常、超时和测试断言失败。',
      '指标口径：pass@k 依赖采样数与估计方式；若产品只生成一次，pass@1、修复轮数和真实任务成功率更直接。',
      '干预归因：按单变量消融比较 prompt、检索、测试反馈和训练数据，并保存相同题目上的 paired 结果。',
      '边界：公开 benchmark 可能被污染且测试不完备，应补内部时序切分任务、隐藏测试和人工代码质量检查。',
    ],
    mistakes: ['用 BLEU 或代码字符串相似度代表正确性', '报告 pass@k 却不说 k、采样参数与估计协议', '同时改数据、prompt 和模型后把全部提升归因给一个方法'],
    followups: ['测试本身覆盖不足时怎样避免假通过？', '多轮执行反馈怎样防止只针对测试过拟合？', '如何评测生成代码的安全性与可维护性而不喧宾夺主？'],
  },
  '4paradigm-agent-intern-2026:0': {
    track: '项目深挖',
    label: '个人贡献与上线证据',
    shortAnswer: '我会先用一句话说明项目目标和团队边界，再把自己的贡献限定到可验证的设计、实现或实验，例如负责状态图、工具协议和失败恢复，而不是笼统说“做了整个 Agent”。证据可以是脱敏架构、提交记录、可运行 demo、测试、监控或前后指标。若没有上线就明确说原型或离线验证，并说明尚未验证的用户规模与可靠性。',
    deepDive: [
      '边界：区分团队已有基础、本人主责、协作完成和仅调研部分；面试官通常会用实现细节检验归属。',
      '决策：选择一个本人做出的关键取舍，说明替代方案、约束、为什么选择，以及后来是否被证据推翻。',
      '证据：按项目阶段给出代码、测试、demo、离线回放、灰度或线上监控；不能公开时可描述验证协议与脱敏结果。',
      '失败：准备一个真实 badcase、定位过程、修复前后变化和仍未解决的边界，比“最终效果很好”更可信。',
    ],
    mistakes: ['把团队工作全部用“我”表述', '把能运行一次的 demo 说成稳定上线', '指标没有 baseline、样本量、时间窗或测量口径'],
    followups: ['如果拿掉你负责的部分，系统会怎样退化？', '哪一个设计决策后来证明是错的？', '无法公开代码时你还能提供什么可验证证据？'],
  },
  'ant-ai-infra-third-round-2026:0': {
    track: '项目深挖',
    label: 'W4A16 Runtime 证据链',
    shortAnswer: '我会从原始推理链路开始，明确 W4A16 改的是权重存储、反量化、矩阵乘内核还是算子融合；说明 scale 粒度和激活为何保留 16 bit。然后在相同模型、batch、序列和硬件上比较显存、prefill/decode 吞吐与延迟，并用固定校准集和下游任务报告精度变化。若没有端到端加速，也要说明瓶颈转移到哪里。',
    deepDive: [
      '数值链路：权重如何分组量化、scale 存在哪里、运行时何时反量化、乘法与累加使用什么 dtype。',
      '工程改动：区分调用已有库、修改 kernel、融合算子和调度变化，并指出本人真正实现和测量的部分。',
      '性能协议：固定 warmup、输入 shape、并发、功耗状态和统计口径，分别报告 TTFT、TPOT、吞吐、峰值显存。',
      '质量协议：报告 calibration 数据、perplexity 或任务指标，并按层或样本分析量化误差；平均下降不能掩盖关键长尾失败。',
    ],
    mistakes: ['只说“权重量化成 4 bit，所以理论加速 4 倍”', '不区分权重存储、反量化、乘法和累加 dtype', '性能与精度使用不同模型版本或输入条件比较'],
    followups: ['为什么显存下降但速度没有提升？', 'group size 怎样影响精度与 kernel 效率？', '哪些层应保留更高精度，怎样用证据选择？'],
  },
  'baidu-ai-infra-first-round-2026:0': {
    track: '项目深挖',
    label: '性能测量与观测偏差',
    shortAnswer: '计时工具会通过同步、日志、hook 和额外 kernel 扰动被测程序。我会先明确测的是 GPU kernel、算子还是端到端请求；GPU 异步执行时使用 event 或显式同步，先 warmup，再重复多轮报告中位数和尾部。然后测量计时器自身开销，与成熟 profiler 交叉验证；profiling 模式和正式 benchmark 分开运行。',
    deepDive: [
      '测量边界：kernel latency、算子 latency、请求 TTFT/TPOT 和吞吐不是同一个指标，必须明确起止点与并发条件。',
      '异步与 warmup：CPU 时钟可能只测到 enqueue；首次运行还包含编译、缓存和频率爬升，因此需同步和预热。',
      '工具扰动：hook、trace、NVTX、日志和 profiler 会增加开销；用空操作或关闭/开启工具的 paired 实验估计扰动。',
      '统计：固定输入分布和功耗状态，保留原始样本，报告 median、p95/p99 与方差，不只展示最好一次。',
    ],
    mistakes: ['直接用 Python wall clock 测异步 CUDA kernel', '只跑一次并报告最小值', '在 profiler 打开时得到的数字直接当生产延迟'],
    followups: ['CUDA event 与 CPU timer 分别适合测什么？', '怎样区分编译时间、排队时间和执行时间？', '工具本身开销不可忽略时怎样校正或报告？'],
  },
  'kuaishou-ai-infra-2025:3': {
    track: '项目深挖',
    label: '专用算子投入决策',
    shortAnswer: '我不会先写专用 kernel，而是先 profile 确认该算子在目标 workload 中占多少端到端时间，并建立可达到的收益上限。再比较编译器、现有库、融合和 shape 调度等更便宜方案。只有流量足够稳定、硬件生命周期足够长且收益能覆盖开发维护成本时才做专用优化，并预先定义正确性、性能、回归和停止条件。',
    deepDive: [
      '机会大小：用端到端占比和 Amdahl 上限判断，即使单算子翻倍，整体收益也受其时间占比限制。',
      '工作负载：统计真实 batch、sequence、dtype、shape 分布与目标 GPU，占比很低的形状不值得单独优化。',
      '方案阶梯：依次比较库参数、布局、融合、图编译和自定义 kernel，并把开发、测试、适配和未来迁移成本计入。',
      '上线门槛：要求数值容差、目标 shape 的稳定收益、端到端增益与回归集通过；硬件或模型变化后重新评估。',
    ],
    mistakes: ['看到算子慢就直接开始写 CUDA', '只展示 microbenchmark 加速，不报告端到端收益', '忽略目标 GPU 生命周期和后续维护成本'],
    followups: ['单算子快 2 倍但只占 5% 时间，整体上限是多少？', '哪些 shape 应该进入专用 kernel 的支持范围？', '新一代 GPU 上收益消失时如何决定继续维护？'],
  },
};

export const interviewGuideCount = Object.keys(interviewAnswerGuides).length;

export function interviewGuideCountForTrack(track: InterviewGuideTrack) {
  return Object.values(interviewAnswerGuides).filter((guide) => guide.track === track).length;
}

export function guideForInterviewQuestion(recordId: string, promptIndex: number) {
  return interviewAnswerGuides[`${recordId}:${promptIndex}`];
}
