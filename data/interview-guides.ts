export type InterviewAnswerGuide = {
  label: string;
  shortAnswer: string;
  deepDive: string[];
  mistakes: string[];
  followups: string[];
};

const interviewAnswerGuides: Record<string, InterviewAnswerGuide> = {
  'multi-company-intern-2025:0': {
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
};

export const interviewGuideCount = Object.keys(interviewAnswerGuides).length;

export function guideForInterviewQuestion(recordId: string, promptIndex: number) {
  return interviewAnswerGuides[`${recordId}:${promptIndex}`];
}
