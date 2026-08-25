export type LessonSection = {
  title: string;
  lead: string;
  paragraphs?: string[];
  bullets?: string[];
  formula?: { label: string; expression: string; explanation: string };
  code?: { language: string; source: string };
  callout?: string;
};

export type FoundationLesson = {
  id: string;
  moduleId: string;
  order: string;
  title: string;
  eyebrow: string;
  duration: string;
  level: '零基础' | '基础';
  summary: string;
  goals: string[];
  sections: LessonSection[];
  checkpoint: { question: string; hint: string; answer: string };
  takeaways: string[];
  labHref?: string;
};

export const foundationLessons: FoundationLesson[] = [
  {
    id: 'program-execution', moduleId: 'foundation-code', order: '00.1', title: '程序到底是怎样运行的？', eyebrow: 'COMPUTER → PROGRAM → OUTPUT', duration: '25 分钟', level: '零基础',
    summary: '从输入、状态、指令和输出理解程序，先建立调试所需的执行模型。',
    goals: ['区分源代码、运行时和输出', '沿执行顺序解释一个小程序', '把报错定位到输入、依赖、逻辑或输出边界'],
    sections: [
      { title: '程序不是魔法，是一串状态变化', lead: '计算机按照确定顺序执行指令，并把中间结果保存在变量或文件中。', paragraphs: ['当你运行 Python 文件时，解释器读取源代码，把语句转换成可执行操作，再依次更新内存中的状态。函数只是把一段操作命名，参数是它接收的输入，return 是它交还的输出。', '调试的核心不是猜，而是确认“程序执行到哪里、此时拥有什么状态、预期状态是什么”。'], callout: '把程序想成厨房：原料是输入，菜谱是代码，台面上的半成品是状态，成品是输出；报错意味着某一步缺原料、工具不可用或操作不符合预期。' },
      { title: '最小执行路径', lead: '先读一个只有输入、处理和输出的程序。', code: { language: 'python', source: 'def normalize(text: str) -> str:\n    cleaned = text.strip().lower()\n    return cleaned\n\nraw = "  Hello LLM  "\nresult = normalize(raw)\nprint(result)' }, bullets: ['raw 是输入状态', 'normalize 调用创建新的局部状态 cleaned', 'return 把结果交回调用处', 'print 产生用户可见输出'] },
      { title: '报错应该从边界开始定位', lead: '同一个“没有结果”可能来自完全不同的层。', bullets: ['输入：文件为空、参数拼错、编码与预期不同', '依赖：包没有安装、版本不匹配、服务不可访问', '逻辑：条件分支没有覆盖当前输入', '输出：结果正确产生，但序列化或展示阶段丢失'], callout: '每次只确认一个边界，并保留最小失败样本。这样比在整段代码里同时改五处更快。' },
    ],
    checkpoint: { question: '一个脚本正常退出但没有打印任何内容，最先应该确认什么？', hint: '先判断程序是否走到输出边界。', answer: '先用最小输入确认输出语句是否执行，再向前检查结果变量和分支条件。正常退出只说明没有未处理异常，不代表业务结果正确产生。' },
    takeaways: ['程序可以分解为输入、状态变化和输出', '函数有明确的输入输出边界', '调试要沿执行路径逐层缩小范围'],
  },
  {
    id: 'python-text-api', moduleId: 'foundation-code', order: '00.2', title: '用 Python 处理文本与调用 API', eyebrow: 'TEXT → JSON → HTTP', duration: '40 分钟', level: '零基础',
    summary: '掌握进入 LLM 应用最常用的 Python、JSON 与 HTTP 最小闭环。',
    goals: ['使用字符串、列表和字典整理文本', '读懂 JSON 请求与响应', '为 API 调用保留可诊断的错误信息'],
    sections: [
      { title: 'LLM 应用首先是数据处理程序', lead: '在模型之前，你通常先处理字符串、列表和字典。', code: { language: 'python', source: 'messages = [\n    {"role": "system", "content": "回答要简洁"},\n    {"role": "user", "content": "什么是 token？"},\n]\n\nfor message in messages:\n    print(message["role"], message["content"])' }, paragraphs: ['列表保存有顺序的消息，字典保存每条消息的字段。JSON 只是这些基础结构在网络中的文本表示。'] },
      { title: '一次 HTTP 调用包含什么', lead: '请求不是一句 prompt，而是一组明确字段。', bullets: ['URL：请求发送到哪个服务', 'Method：GET、POST 等操作类型', 'Headers：认证方式与内容类型', 'Body：模型、消息和生成参数', 'Status code：请求是否被服务接受', 'Response body：模型输出或结构化错误'] },
      { title: '保留失败信息', lead: '不要只写“调用失败”。', code: { language: 'python', source: 'response = client.post(url, json=payload, timeout=30)\nprint("status:", response.status_code)\nif response.status_code >= 400:\n    print("error:", response.text)\n    raise RuntimeError("request failed")\ndata = response.json()' }, callout: '重试只适用于明确的暂时性错误。参数错误、认证失败和解析错误不会因为无限重试自动消失。' },
    ],
    checkpoint: { question: '为什么调用模型 API 时要同时记录状态码和响应体？', hint: '它们回答的问题不同。', answer: '状态码快速区分成功、客户端错误和服务端错误；响应体通常包含具体失败原因或模型返回内容。只有二者结合，才能区分网络/API、服务逻辑与本地解析问题。' },
    takeaways: ['消息通常由列表和字典组成', 'JSON 是常见的网络数据表示', '可诊断 API 调用必须保留请求边界和响应信息'],
  },
  {
    id: 'vectors-and-shapes', moduleId: 'foundation-math', order: '01.1', title: '向量、矩阵、张量与 Shape', eyebrow: 'VALUES WITH STRUCTURE', duration: '35 分钟', level: '零基础',
    summary: '用“数据有几层、每层有多长”理解张量，而不是先背线性代数符号。',
    goals: ['读懂标量、向量、矩阵和三维张量', '沿 shape 判断矩阵乘法是否合法', '理解 batch、sequence 和 hidden dimension'],
    sections: [
      { title: 'Shape 描述数据的组织方式', lead: '同样一组数字，组织方式不同，含义也不同。', bullets: ['标量：一个数，例如 loss = 2.3', '向量：[hidden]，例如一个 token 的表示', '矩阵：[sequence, hidden]，例如一句话所有 token 的表示', '三维张量：[batch, sequence, hidden]，例如一批句子'] },
      { title: '矩阵乘法是在变换最后一维', lead: '神经网络大量操作都可以看成表示空间的线性变换。', formula: { label: 'LINEAR LAYER', expression: '[batch, seq, hidden] × [hidden, out] → [batch, seq, out]', explanation: '中间的 hidden 必须一致；结果保留 batch 和 sequence，只把每个 token 的表示维度从 hidden 变为 out。' } },
      { title: '先写 Shape，再写代码', lead: 'Shape trace 是理解 Transformer forward 的最短路径。', code: { language: 'python', source: 'import torch\n\nx = torch.randn(2, 4, 8)      # batch=2, seq=4, hidden=8\nw = torch.randn(8, 16)        # hidden=8, out=16\ny = x @ w\nprint(y.shape)                 # torch.Size([2, 4, 16])' }, callout: '出现 shape mismatch 时，先写出每个张量的语义和维度；不要立刻用 reshape 把错误隐藏起来。' },
    ],
    checkpoint: { question: '输入 X 的 shape 是 [3, 10, 64]，线性层权重是 [64, 128]，输出 shape 是什么？', hint: '保留前两维，变换最后一维。', answer: '[3, 10, 128]。3 是 batch，10 是序列长度，64 与权重第一维相乘并被输出维度 128 替换。' },
    takeaways: ['Shape 同时描述结构和语义', '线性层通常变换最后一维', 'Transformer 中经常使用 [batch, sequence, hidden]'],
  },
  {
    id: 'probability-and-softmax', moduleId: 'foundation-math', order: '01.2', title: '概率、Logits 与 Softmax', eyebrow: 'SCORES → PROBABILITIES', duration: '35 分钟', level: '零基础',
    summary: '理解模型如何把任意分数变成可比较的 next-token 概率。',
    goals: ['区分 logit 与 probability', '解释 Softmax 的归一化作用', '说明 temperature 为什么改变分布形状'],
    sections: [
      { title: 'Logit 是分数，不是概率', lead: '模型最后一层为词表中的每个 token 输出一个实数。', paragraphs: ['Logit 可以为负，也不需要总和为 1。它表达候选之间的相对偏好。Softmax 把这些分数指数化并归一化，得到总和为 1 的概率分布。'] },
      { title: 'Softmax 保留排序，改变尺度', lead: '分数差异会经过指数函数被放大。', formula: { label: 'SOFTMAX', expression: 'pᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)', explanation: '每个候选的指数分数除以所有候选指数分数之和，因此每项非负且总和为 1。实际计算会先减去最大 logit 以提高数值稳定性。' } },
      { title: 'Temperature 调整分布尖锐程度', lead: '先用 temperature 缩放 logits，再做 Softmax。', formula: { label: 'TEMPERATURE', expression: 'pᵢ(T) = softmax(zᵢ / T)', explanation: 'T 小于 1 时差异被放大，分布更集中；T 大于 1 时差异缩小，分布更平坦。它不会增加模型原本不知道的候选。' }, callout: '去 Sampling Playground 改变 Temperature、Top-K 与 Top-P，观察它们分别作用于分布形状和候选集合。' },
    ],
    checkpoint: { question: 'Temperature 降低后，最高 logit 对应 token 的概率通常怎样变化？', hint: '低温会放大 logit 之间的差距。', answer: '通常会上升，其他候选概率下降，分布更集中。但最高 logit 的排序本身没有改变。' },
    takeaways: ['Logit 是未归一化分数', 'Softmax 产生概率分布', 'Temperature 控制分布集中程度而不是模型知识'], labHref: '/labs/?lab=sampling',
  },
  {
    id: 'loss-and-gradient', moduleId: 'foundation-math', order: '01.3', title: 'Loss、梯度与参数更新', eyebrow: 'MEASURE → DIFFERENTIATE → UPDATE', duration: '45 分钟', level: '基础',
    summary: '把训练理解为反复测量错误、计算方向并更新参数。',
    goals: ['解释 loss 的作用', '理解梯度描述局部变化方向', '读懂一次最小梯度下降更新'],
    sections: [
      { title: 'Loss 把目标变成一个可优化数字', lead: '模型需要一个标量告诉它当前预测有多差。', paragraphs: ['分类任务常用交叉熵：真实类别概率越低，损失越高。训练并不是直接“提高智能”，而是在数据和目标函数定义的方向上降低平均损失。'] },
      { title: '梯度回答“参数往哪里改”', lead: '对每个参数求导，得到它对 loss 的局部影响。', formula: { label: 'GRADIENT DESCENT', expression: 'θ ← θ − η · ∇θ L', explanation: 'θ 是参数，η 是学习率，梯度给出 loss 增长最快方向，因此减去梯度会在局部降低 loss。学习率过大可能越过有效区域，过小则更新缓慢。' } },
      { title: '训练是重复循环', lead: '一次更新通常包含五步。', bullets: ['取出一个 batch', '前向计算预测', '计算 loss', '反向传播得到梯度', 'optimizer 更新参数并清空旧梯度'], callout: '训练 loss 下降只说明优化目标在训练数据上改善；是否泛化需要独立验证集。' },
    ],
    checkpoint: { question: '训练 loss 持续下降、验证 loss 上升，最常见的解释是什么？', hint: '模型在训练数据和未见数据上的表现开始分离。', answer: '这是过拟合信号，但应先检查数据划分、泄漏和评测代码。确认测量无误后，再比较早停、正则化、数据增强或模型容量调整。' },
    takeaways: ['Loss 定义模型被奖励的方向', '梯度描述参数对 loss 的局部影响', '训练改进不等同于泛化改进'],
  },
  {
    id: 'neural-network-basics', moduleId: 'foundation-dl', order: '02.1', title: '神经网络、激活函数与表示', eyebrow: 'LINEAR → NONLINEAR → REPRESENTATION', duration: '40 分钟', level: '基础',
    summary: '理解神经网络为何要堆叠线性层与非线性激活。',
    goals: ['解释一个神经元和线性层', '说明非线性激活的必要性', '把 hidden representation 与任务输出区分开'],
    sections: [
      { title: '线性层学习特征组合', lead: '每个输出维度都是输入维度的加权组合。', formula: { label: 'LINEAR', expression: 'y = xW + b', explanation: 'W 决定如何组合输入特征，b 提供偏置。单独堆叠多个线性层仍然等价于一个线性变换。' } },
      { title: '激活函数打破线性限制', lead: 'ReLU、GELU、SiLU 等让网络可以表达非线性关系。', paragraphs: ['一层产生中间表示，激活函数改变这些值，下一层再重新组合。随着层数增加，模型可以逐步形成更适合任务的表示。'] },
      { title: '表示不是人类预先命名的特征', lead: 'Hidden dimension 是模型内部的坐标系。', callout: '单个维度不一定对应一个稳定的人类概念。解释模型内部表示需要对照、干预和边界，不能只凭一张激活图下结论。', code: { language: 'python', source: 'import torch.nn as nn\n\nmlp = nn.Sequential(\n    nn.Linear(64, 128),\n    nn.GELU(),\n    nn.Linear(128, 64),\n)' } },
    ],
    checkpoint: { question: '为什么连续堆叠两个没有激活函数的线性层不会增加非线性表达能力？', hint: '两个矩阵乘法仍可合并。', answer: '因为 (xW₁)W₂ = x(W₁W₂)，两个线性变换的组合仍是一个线性变换。非线性激活使这种合并不再成立。' },
    takeaways: ['线性层学习特征组合', '激活函数带来非线性表达能力', '隐藏表示是模型学习到的内部坐标'],
  },
  {
    id: 'pytorch-training-loop', moduleId: 'foundation-dl', order: '02.2', title: 'PyTorch 训练循环与 Autograd', eyebrow: 'FORWARD → BACKWARD → STEP', duration: '50 分钟', level: '基础',
    summary: '用一个完整训练循环连接 Tensor、模型、Loss、梯度和 Optimizer。',
    goals: ['解释 forward、backward 和 step', '知道梯度为何需要清空', '区分 train 与 evaluation 模式'],
    sections: [
      { title: 'Autograd 记录计算关系', lead: 'PyTorch 在前向过程中建立计算图。', paragraphs: ['调用 loss.backward() 时，框架沿计算图反向应用链式法则，把梯度累积到需要训练的参数上。计算图描述本次运算关系，不是模型结构图的另一种名字。'] },
      { title: '最小训练循环', lead: '训练的关键操作应该能逐行解释。', code: { language: 'python', source: 'model.train()\nfor x, y in loader:\n    optimizer.zero_grad()\n    logits = model(x)\n    loss = loss_fn(logits, y)\n    loss.backward()\n    optimizer.step()' }, bullets: ['zero_grad：清除上一次累积梯度', 'model(x)：前向预测', 'loss_fn：把预测与目标变成标量', 'backward：计算每个参数的梯度', 'step：根据梯度更新参数'] },
      { title: '验证阶段不更新参数', lead: '验证用于测量当前模型对未参与更新的数据表现。', code: { language: 'python', source: 'model.eval()\nwith torch.no_grad():\n    for x, y in valid_loader:\n        logits = model(x)\n        valid_loss += loss_fn(logits, y).item()' }, callout: '验证集被反复用于调参后，也会间接参与开发决策；最终结论仍需要独立测试集或明确的评测边界。' },
    ],
    checkpoint: { question: '如果忘记 optimizer.zero_grad()，通常会发生什么？', hint: 'PyTorch 默认累积梯度。', answer: '当前 batch 的梯度会与之前 batch 的梯度累加，更新方向和幅度不再对应预期训练配置。梯度累积可以是有意设计，但必须按计划缩放 loss 和控制更新频率。' },
    takeaways: ['Autograd 沿计算图应用链式法则', '梯度默认累积，需要按训练设计清空', '验证阶段只测量，不更新参数'],
  },
  {
    id: 'tokenization-basics', moduleId: 'lm-basics', order: '03.1', title: 'Tokenizer：文本如何变成 Token', eyebrow: 'TEXT → TOKEN IDS', duration: '40 分钟', level: '零基础',
    summary: '理解 tokenizer 是模型接口的一部分，它直接影响长度、成本和跨语言表现。',
    goals: ['区分字符、词和子词切分', '解释 vocabulary 与 token id', '说明切分如何影响上下文与成本'],
    sections: [
      { title: '模型不直接读取字符串', lead: 'Tokenizer 把文本转换为离散 token，再映射为整数 id。', paragraphs: ['现代 LLM 通常使用 BPE、Unigram 等子词方案，在字符和完整单词之间寻找折中。常见片段使用一个 token，罕见片段会被拆得更细。'] },
      { title: '词表大小与序列长度存在取舍', lead: '更大的词表不代表一定更好。', bullets: ['词表更大：常见文本可能更短，但 embedding/output 层更大', '词表更小：参数更少，但序列可能更长', '训练语料决定不同语言、代码和数字的切分效率', '特殊 token 和 chat template 也占用上下文'] },
      { title: '上下文窗口以 token 计数', lead: '同样的 8K 上下文不等于同样的字符数量。', callout: '在 Tokenizer Explorer 中比较中英混合、英文术语和代码输入。教学 BPE 只用于解释机制，不代表具体线上模型。' },
    ],
    checkpoint: { question: '为什么两个都有 8K 上下文窗口的模型，可容纳的中文字符数可能不同？', hint: '上下文限制统计的是 token。', answer: '因为它们可能使用不同 tokenizer 和词表，中文文本被切成的 token 数不同。上下文上限相同只表示最多 token 数相同，不保证字符数相同。' },
    takeaways: ['Tokenizer 把字符串变成 token id', '切分效率影响序列长度和计算成本', '特殊 token 与模板同样属于模型接口'], labHref: '/labs/?lab=tokenizer',
  },
  {
    id: 'embeddings', moduleId: 'lm-basics', order: '03.2', title: 'Embedding：Token 如何变成向量', eyebrow: 'TOKEN ID → VECTOR', duration: '35 分钟', level: '基础',
    summary: '理解 embedding lookup、表示空间以及输入输出权重的基本作用。',
    goals: ['解释 embedding table 的输入输出', '读懂 [batch, seq] 到 [batch, seq, hidden]', '避免把相似度直接等同于真实语义'],
    sections: [
      { title: 'Token id 只是索引', lead: '数字大小本身没有语义顺序。', paragraphs: ['Embedding table 可以看成一个形状为 [vocab, hidden] 的可训练矩阵。每个 token id 选择其中一行，得到 hidden 维向量。训练让这些向量逐渐适合 next-token 目标。'] },
      { title: 'Embedding lookup 改变最后一维', lead: '序列中的每个 token 都得到一个向量。', formula: { label: 'EMBEDDING SHAPE', expression: '[batch, sequence] → [batch, sequence, hidden]', explanation: '输入是整数 token ids，输出是浮点表示。batch 和 sequence 保持不变，新增加的 hidden 维承载模型内部特征。' } },
      { title: '相似度是一种测量，不是完整解释', lead: '向量相近说明在当前表示与度量下相近。', callout: 'Embedding 空间由训练数据、目标和模型共同决定。余弦相似度高不自动证明两个词在人类语义上等价，更不能单独证明因果机制。' },
    ],
    checkpoint: { question: '词表大小 50,000、hidden size 768，embedding table 的 shape 是什么？', hint: '每个词表项对应一个 hidden 向量。', answer: '[50,000, 768]。输入 token id 用来选择一行，输出为 768 维表示。' },
    takeaways: ['Token id 是 embedding table 的索引', 'Embedding 把离散 id 变为连续向量', '向量相似是特定表示与度量下的结果'],
  },
  {
    id: 'next-token-objective', moduleId: 'lm-basics', order: '03.3', title: 'Next-token Prediction 与 Perplexity', eyebrow: 'PREFIX → NEXT TOKEN', duration: '45 分钟', level: '基础',
    summary: '理解自回归语言模型的训练样本、因果目标和生成过程。',
    goals: ['把一句文本转换为多组前缀—目标样本', '解释 causal language modeling', '连接 cross-entropy 与 perplexity'],
    sections: [
      { title: '一句文本提供多个训练位置', lead: '模型在每个位置预测下一个 token。', code: { language: 'text', source: '输入:  <BOS> 我 喜欢\n目标:  我    喜欢 LLM\n\n位置 1: <BOS> → 我\n位置 2: <BOS> 我 → 喜欢\n位置 3: <BOS> 我 喜欢 → LLM' }, paragraphs: ['训练时可以并行计算多个位置的 loss，但 causal mask 保证每个位置只能使用自己之前的 token。'] },
      { title: 'Teacher forcing 使用真实历史', lead: '训练时当前位置看到的是数据中的真实前缀。', paragraphs: ['生成时模型看到的前缀包含自己之前采样的 token，因此早期错误可能改变后续分布。这是训练和自由生成之间的重要差异。'] },
      { title: 'Perplexity 是平均交叉熵的指数', lead: '它衡量模型对真实序列的平均不确定程度。', formula: { label: 'PERPLEXITY', expression: 'PPL = exp(mean cross-entropy)', explanation: '在相同 tokenizer、数据与评测方式下，perplexity 越低通常表示模型给真实 token 更高概率。不同 tokenizer 的 PPL 不宜直接比较。' } },
    ],
    checkpoint: { question: '为什么不同 tokenizer 的两个模型不能只用 perplexity 直接比较？', hint: '每个模型定义的预测单位不同。', answer: '因为 token 粒度和序列长度不同，平均每 token loss 的单位不一致。需要统一数据与 tokenization 边界，或使用更可比较的下游指标。' },
    takeaways: ['自回归模型预测每个位置的下一个 token', 'Teacher forcing 使用真实前缀', 'Perplexity 的比较依赖 tokenizer 和评测边界'],
  },
  {
    id: 'attention-qkv', moduleId: 'transformer', order: '04.1', title: 'Q、K、V 与 Scaled Attention', eyebrow: 'QUERY × KEY → WEIGHT × VALUE', duration: '55 分钟', level: '基础',
    summary: '从信息检索直觉和张量 Shape 理解一次单头 Attention。',
    goals: ['解释 Q、K、V 的不同作用', '沿 shape 推导 attention matrix', '说明缩放与 causal mask'],
    sections: [
      { title: '每个 token 同时产生 Q、K、V', lead: '三者来自同一输入表示的不同线性投影。', bullets: ['Query：当前位置正在寻找什么', 'Key：每个位置可以被怎样匹配', 'Value：匹配后真正聚合的内容'], callout: 'Q/K/V 是计算角色，不是固定的人类语义标签。不同层和 head 会学习不同匹配模式。' },
      { title: '先计算匹配分数，再加权 Value', lead: 'Q 与所有 K 做点积，Softmax 后得到权重。', formula: { label: 'SCALED DOT-PRODUCT ATTENTION', expression: 'Attention(Q,K,V) = softmax(QKᵀ / √dₖ + mask)V', explanation: 'QKᵀ 产生 [sequence, sequence] 分数矩阵；除以 √dₖ 稳定尺度；mask 屏蔽未来位置；权重再与 V 相乘回到 token 表示。' } },
      { title: 'Shape trace', lead: '单头 attention 的维度应该逐步闭合。', code: { language: 'text', source: 'Q:       [batch, seq, d_k]\nKᵀ:      [batch, d_k, seq]\nscores:  [batch, seq, seq]\nweights: [batch, seq, seq]\nV:       [batch, seq, d_v]\noutput:  [batch, seq, d_v]' }, callout: 'Causal mask 不是删除未来 token，而是在 Softmax 前把对应分数设为极小值，使其概率接近 0。' },
    ],
    checkpoint: { question: '为什么 attention score 要除以 √dₖ？', hint: '考虑点积方差随维度如何变化。', answer: '当 Q、K 各维近似独立且方差稳定时，点积方差随 dₖ 增长。除以 √dₖ 让分数尺度更稳定，减少 Softmax 过早饱和并保留有效梯度。' },
    takeaways: ['Q/K 决定匹配，V 提供被聚合内容', 'QKᵀ 产生位置之间的分数矩阵', '缩放稳定数值，mask 保持因果性'],
  },
  {
    id: 'transformer-forward', moduleId: 'transformer', order: '04.2', title: '一次完整 Transformer Forward', eyebrow: 'TOKENS → LOGITS', duration: '60 分钟', level: '基础',
    summary: '把 Tokenizer、Embedding、Attention、FFN、Residual、Norm 和输出层串成一条完整路径。',
    goals: ['按顺序解释 Transformer block', '说明 residual 与 normalization 的作用', '从 hidden states 走到 vocabulary logits'],
    sections: [
      { title: '输入从 token ids 变成 hidden states', lead: 'Tokenizer 在模型外产生 ids，embedding 在模型内产生向量。', bullets: ['文本经过 tokenizer 得到 [batch, seq] token ids', 'Embedding lookup 得到 [batch, seq, hidden]', '位置信息通过 RoPE 等方式进入 attention 计算', 'hidden states 依次通过多个 Transformer blocks'] },
      { title: '每个 block 有两个主要子层', lead: 'Attention 混合位置间信息，FFN 独立变换每个位置。', formula: { label: 'PRE-NORM BLOCK', expression: 'x ← x + Attention(Norm(x))\nx ← x + FFN(Norm(x))', explanation: 'Residual 为信息和梯度提供直接路径；Norm 控制表示尺度；Attention 在 token 之间通信；FFN 在每个 token 内扩展和变换特征。' } },
      { title: '最后输出词表 logits', lead: '最终 hidden state 被投影到 vocabulary 维度。', code: { language: 'text', source: 'token ids       [B, S]\nembeddings      [B, S, H]\nN × blocks      [B, S, H]\nLM head logits  [B, S, V]\nsoftmax(last)   [B, V]' }, paragraphs: ['训练时计算多个位置的 logits 与目标；生成时通常只使用最后位置的分布选择下一个 token，再把它追加到上下文。'], callout: '理解完整 forward 后，再学习 KV Cache、GQA、量化等优化会更自然，因为你知道它们改变了哪一步、保留了什么。' },
    ],
    checkpoint: { question: 'Attention 和 FFN 在 Transformer block 中分别混合什么信息？', hint: '一个跨位置，一个逐位置。', answer: 'Attention 让不同 token 位置之间交换和聚合信息；FFN 对每个位置独立应用相同的非线性变换，主要在特征维度内处理表示。' },
    takeaways: ['Embedding 把 ids 变成 hidden states', 'Attention 跨位置通信，FFN 逐位置变换', 'LM head 把 hidden states 投影为词表 logits'],
  },
];

export function lessonsForModule(moduleId: string) {
  return foundationLessons.filter((lesson) => lesson.moduleId === moduleId);
}
