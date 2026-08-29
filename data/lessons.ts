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
  checkpoint: { question: string; hint: string; options: string[]; correctIndex: number; answer: string };
  takeaways: string[];
  labHref?: string;
  resourceIds?: string[];
};

export const foundationLessons: FoundationLesson[] = [
  {
    id: 'program-execution', moduleId: 'foundation-code', order: '00.1', title: '程序到底是怎样运行的？', eyebrow: 'COMPUTER → PROGRAM → OUTPUT', duration: '15 分钟', level: '零基础',
    summary: '从输入、状态、指令和输出理解程序，先建立调试所需的执行模型。',
    goals: ['区分源代码、运行时和输出', '沿执行顺序解释一个小程序', '把报错定位到输入、依赖、逻辑或输出边界'],
    sections: [
      { title: '程序不是魔法，是一串状态变化', lead: '计算机按照确定顺序执行指令，并把中间结果保存在变量或文件中。', paragraphs: ['当你运行 Python 文件时，解释器读取源代码，把语句转换成可执行操作，再依次更新内存中的状态。函数只是把一段操作命名，参数是它接收的输入，return 是它交还的输出。', '调试的核心不是猜，而是确认“程序执行到哪里、此时拥有什么状态、预期状态是什么”。'], callout: '把程序想成厨房：原料是输入，菜谱是代码，台面上的半成品是状态，成品是输出；报错意味着某一步缺原料、工具不可用或操作不符合预期。' },
      { title: '最小执行路径', lead: '先读一个只有输入、处理和输出的程序。', code: { language: 'python', source: 'def normalize(text: str) -> str:\n    cleaned = text.strip().lower()\n    return cleaned\n\nraw = "  Hello LLM  "\nresult = normalize(raw)\nprint(result)' }, bullets: ['raw 是输入状态', 'normalize 调用创建新的局部状态 cleaned', 'return 把结果交回调用处', 'print 产生用户可见输出'] },
      { title: '报错应该从边界开始定位', lead: '同一个“没有结果”可能来自完全不同的层。', bullets: ['输入：文件为空、参数拼错、编码与预期不同', '依赖：包没有安装、版本不匹配、服务不可访问', '逻辑：条件分支没有覆盖当前输入', '输出：结果正确产生，但序列化或展示阶段丢失'], callout: '每次只确认一个边界，并保留最小失败样本。这样比在整段代码里同时改五处更快。' },
    ],
    checkpoint: { question: '一个脚本正常退出但没有打印任何内容，最先应该确认什么？', hint: '先判断程序是否走到输出边界。', options: ['确认输出语句是否执行', '立刻增加无限重试', '重装全部依赖', '直接修改输入格式'], correctIndex: 0, answer: '先用最小输入确认输出语句是否执行，再向前检查结果变量和分支条件。正常退出只说明没有未处理异常，不代表业务结果正确产生。' },
    takeaways: ['程序可以分解为输入、状态变化和输出', '函数有明确的输入输出边界', '调试要沿执行路径逐层缩小范围'],
  },
  {
    id: 'python-text-api', moduleId: 'foundation-code', order: '00.2', title: '用 Python 处理文本与调用 API', eyebrow: 'TEXT → JSON → HTTP', duration: '20 分钟', level: '零基础',
    summary: '掌握进入 LLM 应用最常用的 Python、JSON 与 HTTP 最小闭环。',
    goals: ['使用字符串、列表和字典整理文本', '读懂 JSON 请求与响应', '为 API 调用保留可诊断的错误信息'],
    sections: [
      { title: 'LLM 应用首先是数据处理程序', lead: '在模型之前，你通常先处理字符串、列表和字典。', code: { language: 'python', source: 'messages = [\n    {"role": "system", "content": "回答要简洁"},\n    {"role": "user", "content": "什么是 token？"},\n]\n\nfor message in messages:\n    print(message["role"], message["content"])' }, paragraphs: ['列表保存有顺序的消息，字典保存每条消息的字段。JSON 只是这些基础结构在网络中的文本表示。'] },
      { title: '一次 HTTP 调用包含什么', lead: '请求不是一句 prompt，而是一组明确字段。', bullets: ['URL：请求发送到哪个服务', 'Method：GET、POST 等操作类型', 'Headers：认证方式与内容类型', 'Body：模型、消息和生成参数', 'Status code：请求是否被服务接受', 'Response body：模型输出或结构化错误'] },
      { title: '保留失败信息', lead: '不要只写“调用失败”。', code: { language: 'python', source: 'response = client.post(url, json=payload, timeout=30)\nprint("status:", response.status_code)\nif response.status_code >= 400:\n    print("error:", response.text)\n    raise RuntimeError("request failed")\ndata = response.json()' }, callout: '重试只适用于明确的暂时性错误。参数错误、认证失败和解析错误不会因为无限重试自动消失。' },
    ],
    checkpoint: { question: '为什么调用模型 API 时要同时记录状态码和响应体？', hint: '它们回答的问题不同。', options: ['二者内容完全相同', '状态码说明失败类别，响应体提供具体内容', '只有成功时才需要记录', '它们只用于计算请求速度'], correctIndex: 1, answer: '状态码快速区分成功、客户端错误和服务端错误；响应体通常包含具体失败原因或模型返回内容。只有二者结合，才能区分网络/API、服务逻辑与本地解析问题。' },
    takeaways: ['消息通常由列表和字典组成', 'JSON 是常见的网络数据表示', '可诊断 API 调用必须保留请求边界和响应信息'],
  },
  {
    id: 'vectors-and-shapes', moduleId: 'foundation-math', order: '01.1', title: '向量、矩阵、张量与 Shape', eyebrow: 'VALUES WITH STRUCTURE', duration: '20 分钟', level: '零基础',
    summary: '用“数据有几层、每层有多长”理解张量，而不是先背线性代数符号。',
    goals: ['读懂标量、向量、矩阵和三维张量', '沿 shape 判断矩阵乘法是否合法', '理解 batch、sequence 和 hidden dimension'],
    sections: [
      { title: 'Shape 描述数据的组织方式', lead: '同样一组数字，组织方式不同，含义也不同。', bullets: ['标量：一个数，例如 loss = 2.3', '向量：[hidden]，例如一个 token 的表示', '矩阵：[sequence, hidden]，例如一句话所有 token 的表示', '三维张量：[batch, sequence, hidden]，例如一批句子'] },
      { title: '矩阵乘法是在变换最后一维', lead: '神经网络大量操作都可以看成表示空间的线性变换。', formula: { label: 'LINEAR LAYER', expression: '[batch, seq, hidden] × [hidden, out] → [batch, seq, out]', explanation: '中间的 hidden 必须一致；结果保留 batch 和 sequence，只把每个 token 的表示维度从 hidden 变为 out。' } },
      { title: '先写 Shape，再写代码', lead: 'Shape trace 是理解 Transformer forward 的最短路径。', code: { language: 'python', source: 'import torch\n\nx = torch.randn(2, 4, 8)      # batch=2, seq=4, hidden=8\nw = torch.randn(8, 16)        # hidden=8, out=16\ny = x @ w\nprint(y.shape)                 # torch.Size([2, 4, 16])' }, callout: '出现 shape mismatch 时，先写出每个张量的语义和维度；不要立刻用 reshape 把错误隐藏起来。' },
    ],
    checkpoint: { question: '输入 X 的 shape 是 [3, 10, 64]，线性层权重是 [64, 128]，输出 shape 是什么？', hint: '保留前两维，变换最后一维。', options: ['[3, 64, 128]', '[10, 128]', '[3, 10, 128]', '[3, 10, 64]'], correctIndex: 2, answer: '[3, 10, 128]。3 是 batch，10 是序列长度，64 与权重第一维相乘并被输出维度 128 替换。' },
    takeaways: ['Shape 同时描述结构和语义', '线性层通常变换最后一维', 'Transformer 中经常使用 [batch, sequence, hidden]'], labHref: '/labs/?lab=shapes',
  },
  {
    id: 'probability-and-softmax', moduleId: 'foundation-math', order: '01.2', title: '概率、Logits 与 Softmax', eyebrow: 'SCORES → PROBABILITIES', duration: '20 分钟', level: '零基础',
    summary: '理解模型如何把任意分数变成可比较的 next-token 概率。',
    goals: ['区分 logit 与 probability', '解释 Softmax 的归一化作用', '说明 temperature 为什么改变分布形状'],
    sections: [
      { title: 'Logit 是分数，不是概率', lead: '模型最后一层为词表中的每个 token 输出一个实数。', paragraphs: ['Logit 可以为负，也不需要总和为 1。它表达候选之间的相对偏好。Softmax 把这些分数指数化并归一化，得到总和为 1 的概率分布。'] },
      { title: 'Softmax 保留排序，改变尺度', lead: '分数差异会经过指数函数被放大。', formula: { label: 'SOFTMAX', expression: 'pᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)', explanation: '每个候选的指数分数除以所有候选指数分数之和，因此每项非负且总和为 1。实际计算会先减去最大 logit 以提高数值稳定性。' } },
      { title: 'Temperature 调整分布尖锐程度', lead: '先用 temperature 缩放 logits，再做 Softmax。', formula: { label: 'TEMPERATURE', expression: 'pᵢ(T) = softmax(zᵢ / T)', explanation: 'T 小于 1 时差异被放大，分布更集中；T 大于 1 时差异缩小，分布更平坦。它不会增加模型原本不知道的候选。' }, callout: '去 Sampling Playground 改变 Temperature、Top-K 与 Top-P，观察它们分别作用于分布形状和候选集合。' },
    ],
    checkpoint: { question: 'Temperature 降低后，最高 logit 对应 token 的概率通常怎样变化？', hint: '低温会放大 logit 之间的差距。', options: ['通常上升，分布更集中', '一定变成 0', '通常下降且更平均', '候选排序会随机改变'], correctIndex: 0, answer: '通常会上升，其他候选概率下降，分布更集中。但最高 logit 的排序本身没有改变。' },
    takeaways: ['Logit 是未归一化分数', 'Softmax 产生概率分布', 'Temperature 控制分布集中程度而不是模型知识'], labHref: '/labs/?lab=sampling',
  },
  {
    id: 'loss-and-gradient', moduleId: 'foundation-math', order: '01.3', title: 'Loss、梯度与参数更新', eyebrow: 'MEASURE → DIFFERENTIATE → UPDATE', duration: '25 分钟', level: '基础',
    summary: '把训练理解为反复测量错误、计算方向并更新参数。',
    goals: ['解释 loss 的作用', '理解梯度描述局部变化方向', '读懂一次最小梯度下降更新'],
    sections: [
      { title: 'Loss 把目标变成一个可优化数字', lead: '模型需要一个标量告诉它当前预测有多差。', paragraphs: ['分类任务常用交叉熵：真实类别概率越低，损失越高。训练并不是直接“提高智能”，而是在数据和目标函数定义的方向上降低平均损失。'] },
      { title: '梯度回答“参数往哪里改”', lead: '对每个参数求导，得到它对 loss 的局部影响。', formula: { label: 'GRADIENT DESCENT', expression: 'θ ← θ − η · ∇θ L', explanation: 'θ 是参数，η 是学习率，梯度给出 loss 增长最快方向，因此减去梯度会在局部降低 loss。学习率过大可能越过有效区域，过小则更新缓慢。' } },
      { title: '训练是重复循环', lead: '一次更新通常包含五步。', bullets: ['取出一个 batch', '前向计算预测', '计算 loss', '反向传播得到梯度', 'optimizer 更新参数并清空旧梯度'], callout: '训练 loss 下降只说明优化目标在训练数据上改善；是否泛化需要独立验证集。' },
    ],
    checkpoint: { question: '训练 loss 持续下降、验证 loss 上升，最常见的解释是什么？', hint: '模型在训练数据和未见数据上的表现开始分离。', options: ['学习率一定太小', '验证集一定更简单', '证明模型没有学习', '这是过拟合信号，应先检查数据与评测'], correctIndex: 3, answer: '这是过拟合信号，但应先检查数据划分、泄漏和评测代码。确认测量无误后，再比较早停、正则化、数据增强或模型容量调整。' },
    takeaways: ['Loss 定义模型被奖励的方向', '梯度描述参数对 loss 的局部影响', '训练改进不等同于泛化改进'], labHref: '/labs/?lab=gradient',
  },
  {
    id: 'neural-network-basics', moduleId: 'foundation-dl', order: '02.1', title: '神经网络、激活函数与表示', eyebrow: 'LINEAR → NONLINEAR → REPRESENTATION', duration: '20 分钟', level: '基础',
    summary: '理解神经网络为何要堆叠线性层与非线性激活。',
    goals: ['解释一个神经元和线性层', '说明非线性激活的必要性', '把 hidden representation 与任务输出区分开'],
    sections: [
      { title: '线性层学习特征组合', lead: '每个输出维度都是输入维度的加权组合。', formula: { label: 'LINEAR', expression: 'y = xW + b', explanation: 'W 决定如何组合输入特征，b 提供偏置。单独堆叠多个线性层仍然等价于一个线性变换。' } },
      { title: '激活函数打破线性限制', lead: 'ReLU、GELU、SiLU 等让网络可以表达非线性关系。', paragraphs: ['一层产生中间表示，激活函数改变这些值，下一层再重新组合。随着层数增加，模型可以逐步形成更适合任务的表示。'] },
      { title: '表示不是人类预先命名的特征', lead: 'Hidden dimension 是模型内部的坐标系。', callout: '单个维度不一定对应一个稳定的人类概念。解释模型内部表示需要对照、干预和边界，不能只凭一张激活图下结论。', code: { language: 'python', source: 'import torch.nn as nn\n\nmlp = nn.Sequential(\n    nn.Linear(64, 128),\n    nn.GELU(),\n    nn.Linear(128, 64),\n)' } },
    ],
    checkpoint: { question: '为什么连续堆叠两个没有激活函数的线性层不会增加非线性表达能力？', hint: '两个矩阵乘法仍可合并。', options: ['参数数量一定不变', '组合仍可合并为一个线性变换', '梯度无法计算', '第二层不会执行'], correctIndex: 1, answer: '因为 (xW₁)W₂ = x(W₁W₂)，两个线性变换的组合仍是一个线性变换。非线性激活使这种合并不再成立。' },
    takeaways: ['线性层学习特征组合', '激活函数带来非线性表达能力', '隐藏表示是模型学习到的内部坐标'],
  },
  {
    id: 'pytorch-training-loop', moduleId: 'foundation-dl', order: '02.2', title: 'PyTorch 训练循环与 Autograd', eyebrow: 'FORWARD → BACKWARD → STEP', duration: '25 分钟', level: '基础',
    summary: '用一个完整训练循环连接 Tensor、模型、Loss、梯度和 Optimizer。',
    goals: ['解释 forward、backward 和 step', '知道梯度为何需要清空', '区分 train 与 evaluation 模式'],
    sections: [
      { title: 'Autograd 记录计算关系', lead: 'PyTorch 在前向过程中建立计算图。', paragraphs: ['调用 loss.backward() 时，框架沿计算图反向应用链式法则，把梯度累积到需要训练的参数上。计算图描述本次运算关系，不是模型结构图的另一种名字。'] },
      { title: '最小训练循环', lead: '训练的关键操作应该能逐行解释。', code: { language: 'python', source: 'model.train()\nfor x, y in loader:\n    optimizer.zero_grad()\n    logits = model(x)\n    loss = loss_fn(logits, y)\n    loss.backward()\n    optimizer.step()' }, bullets: ['zero_grad：清除上一次累积梯度', 'model(x)：前向预测', 'loss_fn：把预测与目标变成标量', 'backward：计算每个参数的梯度', 'step：根据梯度更新参数'] },
      { title: '验证阶段不更新参数', lead: '验证用于测量当前模型对未参与更新的数据表现。', code: { language: 'python', source: 'model.eval()\nwith torch.no_grad():\n    for x, y in valid_loader:\n        logits = model(x)\n        valid_loss += loss_fn(logits, y).item()' }, callout: '验证集被反复用于调参后，也会间接参与开发决策；最终结论仍需要独立测试集或明确的评测边界。' },
    ],
    checkpoint: { question: '如果忘记 optimizer.zero_grad()，通常会发生什么？', hint: 'PyTorch 默认累积梯度。', options: ['参数自动冻结', 'Loss 自动变为 0', '梯度会与之前 batch 累加', 'DataLoader 停止工作'], correctIndex: 2, answer: '当前 batch 的梯度会与之前 batch 的梯度累加，更新方向和幅度不再对应预期训练配置。梯度累积可以是有意设计，但必须按计划缩放 loss 和控制更新频率。' },
    takeaways: ['Autograd 沿计算图应用链式法则', '梯度默认累积，需要按训练设计清空', '验证阶段只测量，不更新参数'],
  },
  {
    id: 'tokenization-basics', moduleId: 'lm-basics', order: '03.1', title: 'Tokenizer：文本如何变成 Token', eyebrow: 'TEXT → TOKEN IDS', duration: '20 分钟', level: '零基础',
    summary: '理解 tokenizer 是模型接口的一部分，它直接影响长度、成本和跨语言表现。',
    goals: ['区分字符、词和子词切分', '解释 vocabulary 与 token id', '说明切分如何影响上下文与成本'],
    sections: [
      { title: '模型不直接读取字符串', lead: 'Tokenizer 把文本转换为离散 token，再映射为整数 id。', paragraphs: ['现代 LLM 通常使用 BPE、Unigram 等子词方案，在字符和完整单词之间寻找折中。常见片段使用一个 token，罕见片段会被拆得更细。'] },
      { title: '词表大小与序列长度存在取舍', lead: '更大的词表不代表一定更好。', bullets: ['词表更大：常见文本可能更短，但 embedding/output 层更大', '词表更小：参数更少，但序列可能更长', '训练语料决定不同语言、代码和数字的切分效率', '特殊 token 和 chat template 也占用上下文'] },
      { title: '上下文窗口以 token 计数', lead: '同样的 8K 上下文不等于同样的字符数量。', callout: '在 Tokenizer Explorer 中比较中英混合、英文术语和代码输入。教学 BPE 只用于解释机制，不代表具体线上模型。' },
    ],
    checkpoint: { question: '为什么两个都有 8K 上下文窗口的模型，可容纳的中文字符数可能不同？', hint: '上下文限制统计的是 token。', options: ['Tokenizer 的切分粒度可能不同', 'GPU 型号会改变 token 上限', '中文字符永远占两个 token', 'Softmax 温度改变字符数'], correctIndex: 0, answer: '因为它们可能使用不同 tokenizer 和词表，中文文本被切成的 token 数不同。上下文上限相同只表示最多 token 数相同，不保证字符数相同。' },
    takeaways: ['Tokenizer 把字符串变成 token id', '切分效率影响序列长度和计算成本', '特殊 token 与模板同样属于模型接口'], labHref: '/labs/?lab=tokenizer',
  },
  {
    id: 'embeddings', moduleId: 'lm-basics', order: '03.2', title: 'Embedding：Token 如何变成向量', eyebrow: 'TOKEN ID → VECTOR', duration: '20 分钟', level: '基础',
    summary: '理解 embedding lookup、表示空间以及输入输出权重的基本作用。',
    goals: ['解释 embedding table 的输入输出', '读懂 [batch, seq] 到 [batch, seq, hidden]', '避免把相似度直接等同于真实语义'],
    sections: [
      { title: 'Token id 只是索引', lead: '数字大小本身没有语义顺序。', paragraphs: ['Embedding table 可以看成一个形状为 [vocab, hidden] 的可训练矩阵。每个 token id 选择其中一行，得到 hidden 维向量。训练让这些向量逐渐适合 next-token 目标。'] },
      { title: 'Embedding lookup 改变最后一维', lead: '序列中的每个 token 都得到一个向量。', formula: { label: 'EMBEDDING SHAPE', expression: '[batch, sequence] → [batch, sequence, hidden]', explanation: '输入是整数 token ids，输出是浮点表示。batch 和 sequence 保持不变，新增加的 hidden 维承载模型内部特征。' } },
      { title: '相似度是一种测量，不是完整解释', lead: '向量相近说明在当前表示与度量下相近。', callout: 'Embedding 空间由训练数据、目标和模型共同决定。余弦相似度高不自动证明两个词在人类语义上等价，更不能单独证明因果机制。' },
    ],
    checkpoint: { question: '词表大小 50,000、hidden size 768，embedding table 的 shape 是什么？', hint: '每个词表项对应一个 hidden 向量。', options: ['[768, 50,000, 1]', '[50,000]', '[768, 768]', '[50,000, 768]'], correctIndex: 3, answer: '[50,000, 768]。输入 token id 用来选择一行，输出为 768 维表示。' },
    takeaways: ['Token id 是 embedding table 的索引', 'Embedding 把离散 id 变为连续向量', '向量相似是特定表示与度量下的结果'],
  },
  {
    id: 'next-token-objective', moduleId: 'lm-basics', order: '03.3', title: 'Next-token Prediction 与 Perplexity', eyebrow: 'PREFIX → NEXT TOKEN', duration: '25 分钟', level: '基础',
    summary: '理解自回归语言模型的训练样本、因果目标和生成过程。',
    goals: ['把一句文本转换为多组前缀—目标样本', '解释 causal language modeling', '连接 cross-entropy 与 perplexity'],
    sections: [
      { title: '一句文本提供多个训练位置', lead: '模型在每个位置预测下一个 token。', code: { language: 'text', source: '输入:  <BOS> 我 喜欢\n目标:  我    喜欢 LLM\n\n位置 1: <BOS> → 我\n位置 2: <BOS> 我 → 喜欢\n位置 3: <BOS> 我 喜欢 → LLM' }, paragraphs: ['训练时可以并行计算多个位置的 loss，但 causal mask 保证每个位置只能使用自己之前的 token。'] },
      { title: 'Teacher forcing 使用真实历史', lead: '训练时当前位置看到的是数据中的真实前缀。', paragraphs: ['生成时模型看到的前缀包含自己之前采样的 token，因此早期错误可能改变后续分布。这是训练和自由生成之间的重要差异。'] },
      { title: 'Perplexity 是平均交叉熵的指数', lead: '它衡量模型对真实序列的平均不确定程度。', formula: { label: 'PERPLEXITY', expression: 'PPL = exp(mean cross-entropy)', explanation: '在相同 tokenizer、数据与评测方式下，perplexity 越低通常表示模型给真实 token 更高概率。不同 tokenizer 的 PPL 不宜直接比较。' } },
    ],
    checkpoint: { question: '为什么不同 tokenizer 的两个模型不能只用 perplexity 直接比较？', hint: '每个模型定义的预测单位不同。', options: ['Perplexity 只适用于图像', '预测单位和序列长度边界不同', '较大词表一定有更低 perplexity', 'Perplexity 不使用 loss'], correctIndex: 1, answer: '因为 token 粒度和序列长度不同，平均每 token loss 的单位不一致。需要统一数据与 tokenization 边界，或使用更可比较的下游指标。' },
    takeaways: ['自回归模型预测每个位置的下一个 token', 'Teacher forcing 使用真实前缀', 'Perplexity 的比较依赖 tokenizer 和评测边界'],
  },
  {
    id: 'attention-qkv', moduleId: 'transformer', order: '04.1', title: 'Q、K、V 与 Scaled Attention', eyebrow: 'QUERY × KEY → WEIGHT × VALUE', duration: '30 分钟', level: '基础',
    summary: '从信息检索直觉和张量 Shape 理解一次单头 Attention。',
    goals: ['解释 Q、K、V 的不同作用', '沿 shape 推导 attention matrix', '说明缩放与 causal mask'],
    sections: [
      { title: '每个 token 同时产生 Q、K、V', lead: '三者来自同一输入表示的不同线性投影。', bullets: ['Query：当前位置正在寻找什么', 'Key：每个位置可以被怎样匹配', 'Value：匹配后真正聚合的内容'], callout: 'Q/K/V 是计算角色，不是固定的人类语义标签。不同层和 head 会学习不同匹配模式。' },
      { title: '先计算匹配分数，再加权 Value', lead: 'Q 与所有 K 做点积，Softmax 后得到权重。', formula: { label: 'SCALED DOT-PRODUCT ATTENTION', expression: 'Attention(Q,K,V) = softmax(QKᵀ / √dₖ + mask)V', explanation: 'QKᵀ 产生 [sequence, sequence] 分数矩阵；除以 √dₖ 稳定尺度；mask 屏蔽未来位置；权重再与 V 相乘回到 token 表示。' } },
      { title: 'Shape trace', lead: '单头 attention 的维度应该逐步闭合。', code: { language: 'text', source: 'Q:       [batch, seq, d_k]\nKᵀ:      [batch, d_k, seq]\nscores:  [batch, seq, seq]\nweights: [batch, seq, seq]\nV:       [batch, seq, d_v]\noutput:  [batch, seq, d_v]' }, callout: 'Causal mask 不是删除未来 token，而是在 Softmax 前把对应分数设为极小值，使其概率接近 0。' },
    ],
    checkpoint: { question: '为什么 attention score 要除以 √dₖ？', hint: '考虑点积方差随维度如何变化。', options: ['改变 Q、K、V 的 shape', '让模型看到未来 token', '稳定点积分数尺度并减少 Softmax 饱和', '减少 tokenizer 的词表大小'], correctIndex: 2, answer: '当 Q、K 各维近似独立且方差稳定时，点积方差随 dₖ 增长。除以 √dₖ 让分数尺度更稳定，减少 Softmax 过早饱和并保留有效梯度。' },
    takeaways: ['Q/K 决定匹配，V 提供被聚合内容', 'QKᵀ 产生位置之间的分数矩阵', '缩放稳定数值，mask 保持因果性'], labHref: '/labs/?lab=attention',
  },
  {
    id: 'transformer-forward', moduleId: 'transformer', order: '04.2', title: '一次完整 Transformer Forward', eyebrow: 'TOKENS → LOGITS', duration: '30 分钟', level: '基础',
    summary: '把 Tokenizer、Embedding、Attention、FFN、Residual、Norm 和输出层串成一条完整路径。',
    goals: ['按顺序解释 Transformer block', '说明 residual 与 normalization 的作用', '从 hidden states 走到 vocabulary logits'],
    sections: [
      { title: '输入从 token ids 变成 hidden states', lead: 'Tokenizer 在模型外产生 ids，embedding 在模型内产生向量。', bullets: ['文本经过 tokenizer 得到 [batch, seq] token ids', 'Embedding lookup 得到 [batch, seq, hidden]', '位置信息通过 RoPE 等方式进入 attention 计算', 'hidden states 依次通过多个 Transformer blocks'] },
      { title: '每个 block 有两个主要子层', lead: 'Attention 混合位置间信息，FFN 独立变换每个位置。', formula: { label: 'PRE-NORM BLOCK', expression: 'x ← x + Attention(Norm(x))\nx ← x + FFN(Norm(x))', explanation: 'Residual 为信息和梯度提供直接路径；Norm 控制表示尺度；Attention 在 token 之间通信；FFN 在每个 token 内扩展和变换特征。' } },
      { title: '最后输出词表 logits', lead: '最终 hidden state 被投影到 vocabulary 维度。', code: { language: 'text', source: 'token ids       [B, S]\nembeddings      [B, S, H]\nN × blocks      [B, S, H]\nLM head logits  [B, S, V]\nsoftmax(last)   [B, V]' }, paragraphs: ['训练时计算多个位置的 logits 与目标；生成时通常只使用最后位置的分布选择下一个 token，再把它追加到上下文。'], callout: '理解完整 forward 后，再学习 KV Cache、GQA、量化等优化会更自然，因为你知道它们改变了哪一步、保留了什么。' },
    ],
    checkpoint: { question: 'Attention 和 FFN 在 Transformer block 中分别混合什么信息？', hint: '一个跨位置，一个逐位置。', options: ['Attention 跨位置聚合，FFN 逐位置变换特征', '二者都只跨 batch 维混合', 'FFN 负责把文本切成 token', 'Attention 只负责改变词表大小'], correctIndex: 0, answer: 'Attention 让不同 token 位置之间交换和聚合信息；FFN 对每个位置独立应用相同的非线性变换，主要在特征维度内处理表示。' },
    takeaways: ['Embedding 把 ids 变成 hidden states', 'Attention 跨位置通信，FFN 逐位置变换', 'LM head 把 hidden states 投影为词表 logits'], labHref: '/labs/?lab=transformer',
  },
  {
    id: 'multimodal-token-flow', moduleId: 'multimodal', order: '04A.1', title: '一张图片怎样进入视觉语言模型', eyebrow: 'PIXELS → PATCHES → TOKENS', duration: '30 分钟', level: '基础',
    summary: '沿像素、视觉 token、投影层和语言 token，理解一次多模态输入的完整信息流与失败边界。',
    goals: ['解释 ViT 如何把图片变成 patch tokens', '比较 projector 与 cross-attention 融合', '把错误分成感知、对齐和生成三层'],
    sections: [
      { title: '先把图片变成视觉 token', lead: 'Vision Transformer 把图片切成 patch，再把每个 patch 映射成向量。', formula: { label: 'PATCH SEQUENCE', expression: 'image [H, W, C] → patches [N, P²C] → visual tokens [N, Dᵥ]', explanation: '固定 patch 大小时，分辨率越高，patch 数 N 越多。动态分辨率模型会保留不同尺寸或长宽比，但视觉 token 数和计算也随之变化。' }, bullets: ['Patch embedding 类似把局部像素块变成 token', '视觉编码器使用 self-attention 混合空间信息', '位置编码告诉模型 patch 的空间顺序', '视频还要表达帧顺序和时间位置'] },
      { title: '视觉表示要接入语言模型空间', lead: '视觉编码器的输出维度和分布通常与语言模型 hidden states 不同。', bullets: ['Projector 把视觉 token 映射到语言模型 hidden size', '早期融合把视觉和文本 token 放进同一序列', 'Cross-attention 让文本状态按需读取视觉状态', '压缩或重采样视觉 token 可以降成本，但可能丢失小字和细节'], callout: '“模型看到了图片”并不意味着每个细节都被保留。分辨率、patch、压缩和上下文预算共同决定可用视觉证据。' },
      { title: '多模态错误要分层定位', lead: '最终答案错误可能发生在视觉感知、跨模态对齐或语言生成。', bullets: ['感知：OCR、物体、位置或时间事件识别错误', '对齐：识别到了元素，但没有连接到问题中的指代', '生成：证据已经进入表示，却引用错误或产生无依据结论', '工具：视觉 Agent 看对了界面，但点击坐标或状态更新错误'], callout: '评测时保存原图、裁剪、视觉 token 预算、问题、答案和 grounding；不要把所有错误都叫作 hallucination。' },
    ],
    checkpoint: { question: '提高输入图片分辨率为什么不保证答案一定更好？', hint: '更多像素也会带来更多视觉 token、压缩与噪声。', options: ['高分辨率会删除文本 prompt', '视觉 token 预算、压缩和任务信息密度仍有限', '分辨率只影响音频模型', '更高分辨率一定降低计算量'], correctIndex: 1, answer: '更高分辨率可能保留小字和细节，但也增加视觉 token 与计算，模型可能继续压缩或截断；若错误来自对齐或生成，增加像素也不会修复。需要按错误切片验证收益。' },
    takeaways: ['图片通过 patch 与视觉编码器变成视觉 token', '融合层连接视觉空间与语言模型 hidden space', '多模态评测要区分感知、对齐、生成和工具执行'], resourceIds: ['qwen25-vl'],
  },
  {
    id: 'pretraining-data-scaling', moduleId: 'pretraining', order: '05.1', title: '预训练数据、计算预算与 Scaling', eyebrow: 'DATA × MODEL × COMPUTE', duration: '30 分钟', level: '基础',
    summary: '把数据质量、训练 token、模型规模与计算预算放进同一个可验证的训练计划。',
    goals: ['解释预训练数据管线的主要阶段', '区分参数规模、训练 token 与计算预算', '为正式训练设计小规模 pilot 和停止条件'],
    sections: [
      { title: '训练数据不是越多越好', lead: '清洗、去重、语言与领域配比会直接改变模型学到的分布。', bullets: ['过滤明显损坏、低质量和不合规样本', '在文档或片段层面控制重复，避免记忆与评测污染', '记录语言、代码、数学和领域数据的混合比例', '为每一步过滤保留样本审计与下游效果对照'], callout: '数据规则最终要由模型效果验证。过滤更多不自动等于数据更好。' },
      { title: '模型、数据与计算必须联动选择', lead: '固定预算下，扩大模型会减少可训练 token，增加 token 又会压缩其他实验空间。', formula: { label: 'ROUGH TRAINING COMPUTE', expression: '训练 FLOPs ≈ 6 × 参数量 N × 训练 token D', explanation: '这是用于数量级估算的近似式。真实成本还受序列长度、稀疏结构、并行效率、重计算和硬件利用率影响。' } },
      { title: '先用 pilot 验证训练链路', lead: '大规模训练前先证明数据、loss、吞吐和 checkpoint 都按预期工作。', bullets: ['用小模型或少量 step 检查 loss 趋势和数据样本', '记录吞吐、显存、数值异常和恢复时间', '提前冻结核心评测集与成功标准', '定义资源超支、训练不稳定和收益不足时的停止条件'], callout: 'Scaling law 是候选配方的起点，不是替代小规模验证和数据诊断的答案。' },
    ],
    checkpoint: { question: '固定 GPU 预算下，为什么不能只选择参数量最大的模型？', hint: '参数量会影响能训练多少 token，以及是否满足部署约束。', options: ['大模型无法使用 tokenizer', '模型规模、训练 token、实验次数和部署成本相互制约', '参数越大训练 FLOPs 越小', 'Scaling 只与数据格式有关'], correctIndex: 1, answer: '固定预算下，参数量增加会提高每个 token 的训练成本，可能导致训练 token 不足、pilot 和对照空间被挤压，还可能不满足推理部署约束。需要联合选择模型、数据、token 与评测计划。' },
    takeaways: ['数据质量和混合比例属于训练配方', '模型规模与训练 token 共同消耗计算预算', '大规模训练前需要 pilot、评测和停止条件'],
  },
  {
    id: 'sft-lora-data', moduleId: 'finetune', order: '06.1', title: 'SFT、Chat Template 与 LoRA', eyebrow: 'DATA → MASK → ADAPTER', duration: '30 分钟', level: '基础',
    summary: '理解监督微调真正更新的目标、训练样本格式，以及 LoRA 如何降低可训练参数量。',
    goals: ['读懂一条 instruction/chat 训练样本', '解释 label masking 与模板一致性', '比较全量微调、LoRA 与 QLoRA'],
    sections: [
      { title: '一条训练样本包含模板和监督边界', lead: '消息角色、特殊 token、system prompt 和 loss mask 都属于训练接口。', bullets: ['先用目标模型的 chat template 序列化消息', '通常只对 assistant 目标部分计算 loss', '训练与推理模板不一致会造成行为偏移', '先人工检查真实 token ids 和 labels，再扩大数据'], callout: '“已经转成 JSON”不代表样本正确。真正需要检查的是模型最终看到的 token 与监督位置。' },
      { title: 'LoRA 学习低秩参数增量', lead: '冻结原权重，只训练两个较小矩阵近似权重更新。', formula: { label: 'LORA UPDATE', expression: 'W′ = W + (α / r) · BA', explanation: '若 W 为 d_out × d_in，A 与 B 通过 rank r 构成低秩更新。r 越大可训练容量和显存开销通常越高，但效果不保证单调提升。' } },
      { title: '选择方法要从错误类型出发', lead: 'Prompt、RAG、LoRA 和全量微调解决的问题并不相同。', bullets: ['格式或任务说明问题：先做 Prompt 基线', '外部知识更新问题：优先评估 RAG', '稳定行为适配：比较 LoRA 与数据改进', '广泛能力更新且预算充足：再考虑全量微调'], callout: '任何微调都需要保留原能力、目标能力和退化样本三类评测。' },
    ],
    checkpoint: { question: '为什么 SFT 时需要检查 assistant token 对应的 loss mask？', hint: '模型只应在计划监督的位置承担训练损失。', options: ['它决定 GPU 型号', '它决定哪些 token 参与监督目标', '它会修改 tokenizer 词表', '它只影响推理温度'], correctIndex: 1, answer: 'Loss mask 决定哪些位置参与交叉熵。如果错误地监督 user/system 内容或遗漏 assistant 内容，模型优化的目标就与任务不一致，即使训练 loss 看起来正常。' },
    takeaways: ['模板与 loss mask 是训练目标的一部分', 'LoRA 用低秩增量减少可训练参数', '方法选择应连接错误类型与回归评测'],
  },
  {
    id: 'preference-optimization', moduleId: 'alignment', order: '07.1', title: '偏好数据、Reward Model 与 DPO / PPO / GRPO', eyebrow: 'PREFERENCES → OBJECTIVE → POLICY', duration: '35 分钟', level: '基础',
    summary: '把偏好样本、奖励信号和策略更新拆开，避免把所有后训练方法混成一个名词。',
    goals: ['解释偏好对和 Reward Model', '比较 PPO-RLHF、DPO 与 GRPO 的流程', '识别偏好偏差与 reward hacking'],
    sections: [
      { title: '偏好数据定义了优化方向', lead: '同一 prompt 下的 chosen/rejected 反映标注者和 rubric 的相对选择。', bullets: ['明确标注标准和不可判定样本', '检查长度、语气、格式等捷径偏差', '保留分歧与不同任务切片', '把数据来源与最终评测人群区分开'] },
      { title: '不同方法使用奖励信号的方式不同', lead: 'PPO-RLHF 显式训练奖励模型并在线采样；DPO 直接拟合偏好对；GRPO 用组内相对奖励构造优势。', bullets: ['PPO：流程复杂，可利用在线策略样本', 'DPO：训练更像监督学习，依赖参考模型与 β', 'GRPO：比较同一问题的多条输出，仍依赖可靠奖励', '三者都可能放大奖励函数和数据中的捷径'], callout: '流程更简单不等于对齐更好；最终判断来自冻结评测与退化分析。' },
      { title: '评测必须覆盖收益与代价', lead: '平均奖励上升可能掩盖能力退化和分布偏移。', bullets: ['报告任务效果、格式、事实性与安全切片', '检查长度和拒答率是否异常变化', '保留 SFT checkpoint 与简单 baseline', '逐样本检查高奖励但明显错误的输出'] },
    ],
    checkpoint: { question: 'DPO 不训练显式 Reward Model，是否意味着不再受偏好数据偏差影响？', hint: '训练目标仍然直接来自偏好对。', options: ['是，DPO 自动消除全部偏差', '否，偏好对、参考模型和 β 仍决定优化方向', '是，因为 DPO 不使用梯度', '否，但只影响推理速度'], correctIndex: 1, answer: '不会。DPO 省去了显式 Reward Model 和在线 PPO 流程，但训练信号仍来自偏好对，并受参考模型、β、数据覆盖和标注偏差影响。' },
    takeaways: ['偏好数据决定被奖励的行为', 'PPO、DPO、GRPO 的数据流与更新方式不同', '后训练必须检查奖励捷径和能力退化'],
  },
  {
    id: 'reasoning-training-budget', moduleId: 'reasoning', order: '07A.1', title: '推理模型：训练信号与 Thinking Budget', eyebrow: 'VERIFY → OPTIMIZE → SPEND', duration: '35 分钟', level: '基础',
    summary: '区分推理能力怎样在训练中获得、怎样被蒸馏，以及推理时增加 token 预算究竟在交换什么。',
    goals: ['解释可验证奖励为何适合数学与代码', '区分 cold-start、RL 与蒸馏', '用质量—成本曲线评测 thinking budget'],
    sections: [
      { title: '可验证任务给 RL 更明确的反馈', lead: '数学答案、代码测试和形式化证明常能自动判断结果，因此可以对同一问题采样多条轨迹并给出奖励。', bullets: ['奖励可以来自最终答案、单元测试或规则检查器', '只奖励最终结果可能产生格式捷径或偶然命中', '过程奖励需要可靠的步骤标签或 verifier', '组内采样的多样性决定相对优势是否有信号'], callout: '奖励“可验证”不等于奖励“完美”。测试覆盖不足、答案格式和数据污染仍会制造高奖励错误。' },
      { title: 'R1-Zero、R1 与蒸馏回答不同问题', lead: '纯 RL 可以探索行为，但可读性与稳定性仍可能需要数据和多阶段训练。', bullets: ['Pure RL：观察能力能否从奖励与探索中出现', 'Cold start：用少量高质量轨迹建立格式、语言和可读性', '多阶段训练：在推理专项与通用能力间校准', '蒸馏：把强模型生成的轨迹转为小模型监督数据'], callout: '蒸馏模型学到强轨迹分布，不等于复制了教师的内部推理机制；评测仍要覆盖分布外任务与错误模式。' },
      { title: 'Thinking budget 是质量与成本的控制面', lead: '给模型更多生成 token，可能增加搜索与自我修正机会，也可能带来重复、跑偏和更高延迟。', formula: { label: 'TASK UTILITY', expression: 'utility(budget) = task quality − λ · token cost − μ · latency', explanation: 'λ 和 μ 来自产品约束。应在同一任务集上画预算曲线，检查准确率、token、延迟与失败类型，而不是默认更长更好。' }, bullets: ['报告准确率随 token budget 的变化', '记录 early stop、重复和超长失败', '把 thinking 与 non-thinking 模式放在同一成本约束下比较', 'CoT 文本可用于诊断，但不自动是忠实内部原因'] },
    ],
    checkpoint: { question: '一个推理模型平均输出 token 翻倍、准确率提升 2%，能否直接说明推理更有效？', hint: '先比较预算匹配、任务切片和失败类型。', options: ['能，输出越长推理越强', '不能；要看质量—成本曲线、预算匹配和错误切片', '能，只要使用 RL', '不能，因为推理模型永远无效'], correctIndex: 1, answer: '不能直接说明。需要在统一任务和预算下比较准确率、token、延迟与失败类型，并检查收益是否只来自少数切片、更多采样或长度捷径。' },
    takeaways: ['可验证奖励适合结果能够自动检查的任务', 'Cold start、RL、多阶段训练和蒸馏承担不同作用', 'Thinking budget 必须用任务质量、token 与延迟联合校准'], resourceIds: ['deepseek-r1', 'qwen3'],
  },
  {
    id: 'serving-prefill-decode', moduleId: 'inference', order: '08.1', title: 'Prefill、Decode 与大模型服务', eyebrow: 'LATENCY × THROUGHPUT × MEMORY', duration: '30 分钟', level: '基础',
    summary: '从请求的两个计算阶段解释 KV Cache、批处理、量化和服务指标。',
    goals: ['区分 prefill 与 decode', '估算 KV Cache 的主要变量', '说明延迟、吞吐和成本的取舍'],
    sections: [
      { title: '一次生成请求有两个不同阶段', lead: 'Prefill 并行处理输入 token，Decode 每步产生一个新 token。', bullets: ['Prefill 更接近大矩阵计算，受输入长度影响', 'Decode 每步读取权重和 KV，常受显存带宽影响', 'TTFT 主要观察首 token 等待，TPOT 观察后续 token 间隔', '只报告总延迟会混淆两类瓶颈'] },
      { title: 'KV Cache 用显存换重复计算', lead: '历史 token 的 Key 和 Value 被每层保存，后续解码无需重算整个前缀。', formula: { label: 'KV MEMORY', expression: '2 × layers × tokens × kv_heads × head_dim × bytes', explanation: '2 表示 K 和 V。实际服务还要乘并发序列数，并考虑分页、碎片和框架元数据。GQA/MQA 通过减少 KV heads 降低缓存。' } },
      { title: '服务优化不是单一开关', lead: 'Continuous batching、PagedAttention、量化和投机解码作用在不同瓶颈上。', bullets: ['批处理提高设备利用率，但可能增加排队延迟', '分页管理减少 KV 碎片并支持动态请求', '量化降低权重或 KV 占用，需要质量回归', '容量设计必须同时给出 SLO、并发、上下文和输出长度分布'], callout: '离线 tokens/s 不能替代线上 P50/P95 延迟、失败率和成本。' },
    ],
    checkpoint: { question: '为什么提高 batch 往往能增加吞吐，却可能让单个用户等待更久？', hint: '请求需要等待调度，并共享计算资源。', options: ['Batch 会删除 KV Cache', '更高设备利用率伴随排队和调度等待', 'Batch 会改变 tokenizer', '吞吐和延迟永远同步改善'], correctIndex: 1, answer: '更大的动态批可以提高设备利用率和总吞吐，但请求可能等待合批，且每轮调度包含更多序列，因此单请求 TTFT 或尾延迟可能上升。' },
    takeaways: ['Prefill 与 Decode 的瓶颈不同', 'KV Cache 用显存换前缀重算', '服务设计要联合报告延迟、吞吐、质量和成本'], labHref: '/labs/?lab=kv',
  },
  {
    id: 'rag-evidence-pipeline', moduleId: 'rag', order: '09.1', title: '从检索到引用：可验证 RAG', eyebrow: 'QUERY → EVIDENCE → ANSWER', duration: '30 分钟', level: '基础',
    summary: '把文档处理、召回、重排、生成和引用拆成能够分别测量的系统。',
    goals: ['设计基础 RAG 数据流', '区分召回与生成失败', '实现引用和无答案拒答'],
    sections: [
      { title: '先定义知识和权限边界', lead: '更新频率、文档结构、访问权限和无答案行为决定索引设计。', bullets: ['保存文档、章节和片段的可追溯标识', '切块同时考虑语义完整性与召回粒度', '权限过滤必须发生在证据进入生成上下文之前', '为更新、删除和索引延迟定义可观察状态'] },
      { title: '检索通常是多阶段漏斗', lead: '高召回候选集经过融合和重排，再进入有限上下文。', bullets: ['Dense 适合语义近似，sparse 擅长精确词项', 'Hybrid 需要可解释的分数融合或候选合并', 'Reranker 在较小候选集上进行更精细比较', 'Query rewrite 要用原问题和独立评测检查是否改坏意图'] },
      { title: '答案正确不代表 RAG 正确', lead: '模型可能凭参数知识答对，但引用并不支持答案。', bullets: ['检索：Recall@k、MRR/NDCG 与 gold evidence', '上下文：相关性、冗余和权限', '生成：正确性、引用支持率和完整性', '无答案：拒答准确率与错误拒答'], callout: '每个 badcase 都应先归因到检索、上下文组织、生成或引用，而不是直接更换整个系统。' },
    ],
    checkpoint: { question: 'RAG 输出答案正确，但引用片段不支持核心结论，应该如何记录？', hint: '分别判断答案与 grounding。', options: ['整体算完全正确', '答案正确但 grounding 失败', '只要模型自信就忽略引用', '删除所有引用'], correctIndex: 1, answer: '应把答案正确性与引用支持率分开记录：答案可以判对，但 grounding 必须判失败，并进入引用选择或生成约束的 badcase。' },
    takeaways: ['RAG 从需求和权限边界开始', '召回、重排和生成需要分层评测', '引用必须能回到真正支持答案的原文'], labHref: '/labs/?lab=retrieval',
  },
  {
    id: 'agent-tools-trajectories', moduleId: 'agent', order: '10.1', title: '工具调用、状态与 Agent 轨迹', eyebrow: 'OBSERVE → DECIDE → ACT', duration: '30 分钟', level: '基础',
    summary: '把 Agent 看成带工具、状态和停止条件的决策循环，并用轨迹而不是只用最终答案评测。',
    goals: ['判断 Agent 与固定工作流的边界', '设计清晰的工具 schema 与状态', '评测轨迹、恢复和资源成本'],
    sections: [
      { title: '先判断路径是否真的需要动态决策', lead: '步骤稳定、错误成本高的任务通常更适合确定性工作流。', bullets: ['固定流程：路径可枚举、容易测试和审计', 'Agent：需要根据中间观察动态选择动作', '混合模式：模型负责局部判断，状态机负责权限与阶段', '选择依据是任务结构，不是框架流行度'] },
      { title: '工具是受约束的接口', lead: '名称、描述、参数 schema、返回值和失败语义共同决定模型能否正确调用。', bullets: ['让必填字段和枚举值清晰可辨', '区分可重试失败与确定性参数错误', '显式保存任务状态、工具结果与剩余预算', '设置最大步数、终止条件和人工接管边界'] },
      { title: '最终答案不是唯一评测对象', lead: '错误工具、越权动作或高成本绕路不能因为最后答对而被忽略。', bullets: ['任务完成率与逐步正确性', '无效调用、恢复成功率和重复循环', '延迟、token、工具费用和人工接管率', '保存可回放轨迹并按错误类型分层'], callout: '先建立几十条高质量轨迹和人工 rubric，再考虑复杂的自动 Agent judge。' },
    ],
    checkpoint: { question: 'Agent 最终答对，但调用了不应使用的工具，能否算完全成功？', hint: '轨迹本身也属于产品行为。', options: ['能，只看最终文本', '不能，应同时评估工具选择、权限、成本和轨迹', '能，因为工具调用不可记录', '只有离线任务需要轨迹'], correctIndex: 1, answer: '不能只看最终答案。错误或越权工具调用可能造成真实副作用和额外成本，应将最终结果与轨迹正确性、权限、恢复和资源使用分别评分。' },
    takeaways: ['Agent 适用于路径需要动态选择的任务', '工具 schema、状态和停止条件构成执行边界', '评测需要覆盖结果、轨迹、恢复和成本'],
  },
  {
    id: 'evaluation-rubric-judge', moduleId: 'evaluation', order: '11.1', title: 'Rubric、人工评测与 LLM-as-a-Judge', eyebrow: 'TARGET → MEASURE → AUDIT', duration: '30 分钟', level: '基础',
    summary: '从产品目标构造可复查的评测体系，并判断自动 Judge 何时可以使用。',
    goals: ['把产品目标转成指标和 rubric', '检查 Judge 的常见偏差', '建立 badcase 与人工复核闭环'],
    sections: [
      { title: '先定义什么算成功', lead: '指标必须连接真实用户任务和错误成本。', bullets: ['明确评测单元、数据来源和通过条件', '把正确性、完整性、引用、安全与风格分开', '保留不同语言、长度、难度和用户群切片', '对无法可靠判断的样本允许 no-call'] },
      { title: '自动 Judge 本身也是待评测模型', lead: '相关性高不代表逐样本决策足以替代人工。', bullets: ['与冻结的人类标签比较一致性', '交换回答顺序测试位置偏差', '控制长度、自我偏好和提示措辞', '比较多个 Judge，并检查分歧样本'], callout: '平均分相近可能掩盖关键样本上的完全相反判断。' },
      { title: 'Badcase 要进入下一轮决策', lead: '评测不是发布前的一次考试，而是持续的误差分类系统。', bullets: ['保存输入、输出、证据、标签与版本', '按错误类型而不是总分组织问题', '每次修复都运行核心回归集', '线上反馈只在明确采样和偏差边界下进入结论'] },
    ],
    checkpoint: { question: '两个 Judge 的平均分高度相关，但逐样本经常不一致，能否直接替代人工？', hint: '产品决策通常发生在具体样本和错误类型上。', options: ['可以，平均相关已经充分', '不可以，还要检查逐样本一致性、偏差和复核边界', '可以，只要 Judge 更大', '不可以，因为所有自动评测都无效'], correctIndex: 1, answer: '不能直接替代。需要检查逐样本一致性、关键错误切片、顺序和长度偏差，并定义分歧或低置信样本进入人工复核的条件。' },
    takeaways: ['指标必须连接任务目标与错误成本', 'Judge 需要人工参考和偏差压力测试', 'Badcase、回归集和 no-call 构成可靠闭环'],
  },
  {
    id: 'causal-interpretability', moduleId: 'interpretability', order: '12.1', title: '从可解码相关到因果干预', eyebrow: 'OBSERVE → INTERVENE → LIMIT', duration: '30 分钟', level: '基础',
    summary: '区分激活可视化、Probe 解码和模型实际使用某个表示的因果证据。',
    goals: ['区分相关、可解码与因果使用', '设计干预和匹配对照', '说明结论的外部效度边界'],
    sections: [
      { title: '可观察不等于被使用', lead: '高 Probe 准确率只说明信息在当前表示和读出器下可解码。', bullets: ['控制 Probe 容量和简单基线', '检查标签是否被相关特征代理', '在独立样本和层位置上验证稳定性', '不要把单个神经元命名当成机制结论'] },
      { title: '因果问题需要干预', lead: 'Ablation、patching 或 steering 改变内部状态，再观察目标行为是否随之变化。', bullets: ['预先定义干预位置、方向和行为读出', '加入随机方向、幅度匹配和非目标位置对照', '测量总体性能损伤，排除广泛破坏', '同时报告有效、无效和不可解释样本'] },
      { title: '局部结果不自动推广', lead: '一个 prompt、层、模型或任务上的效应未必在其他设置成立。', callout: '结论应精确说明模型、任务、干预、读出和复现范围，而不是宣称发现了普遍思维机制。' },
    ],
    checkpoint: { question: 'Probe 可以高准确率预测某个属性，最稳妥的结论是什么？', hint: 'Probe 测量的是可解码信息。', options: ['模型一定因果使用该属性', '该表示中存在可被此 Probe 解码的信息', '该属性由单个神经元存储', '对所有模型都成立'], correctIndex: 1, answer: '最稳妥的结论是该表示包含能被当前 Probe 解码的信息。要证明模型在行为中使用它，还需要干预、对照和行为后果。' },
    takeaways: ['可解码性不等于因果使用', '干预需要匹配对照和副作用测量', '机制结论必须限定模型、任务与样本范围'], labHref: '/labs/?lab=attention',
  },
  {
    id: 'sae-feature-dictionaries', moduleId: 'interpretability', order: '12.2', title: 'SAE、Superposition 与特征字典', eyebrow: 'ACTIVATIONS → SPARSE FEATURES → TEST', duration: '30 分钟', level: '基础',
    summary: '理解稀疏自编码器为何被用于拆解稠密激活，以及为什么“特征可命名”仍然不是机制结论。',
    goals: ['解释 superposition 与 SAE 的基本动机', '读懂重构—稀疏权衡', '把特征发现与因果验证分成两步'],
    sections: [
      { title: '为什么要从神经元转向特征字典', lead: '一个神经元可能同时响应多个概念，一个概念也可能分布在多个方向。', paragraphs: ['Superposition 假说认为，模型会把多于表示维度的特征压进同一激活空间。SAE 学习一个更大的字典，把稠密激活 x 编码为少量非零系数 f，再用这些系数近似重构 x。'], bullets: ['神经元不是天然的语义原子', '字典向量是候选表示方向，不是自动获得的真值标签', '特征命名来自激活样本、自动解释或人工检查，仍可能受选择偏差影响'] },
      { title: 'SAE 优化的是可用代理目标', lead: '训练时既希望重构激活，又希望只有少数特征被打开。', formula: { label: 'SPARSE AUTOENCODER', expression: 'f = TopK(Wₑx + bₑ),   x̂ = W_d f + b_d', explanation: 'TopK 让每个样本只激活 k 个候选特征；重构误差衡量信息保留，稀疏度衡量表示简洁。二者变好不等于下游因果解释更正确。' }, bullets: ['检查 explained variance 或重构误差', '记录 L0 / firing frequency 与 dead features', '比较不同 k、字典宽度和训练数据', '避免只挑看起来最“漂亮”的特征展示'] },
      { title: '发现候选特征后，必须回到行为', lead: 'SAE 最有价值的用法是生成可检验假设，而不是终止实验。', bullets: ['用独立样本确认选择性与稳定性', '做 feature ablation、patching 或 steering', '加入幅度匹配、随机特征和非目标行为对照', '报告重构缺口与干预的非特异性损伤'], callout: '把流程写成“字典发现 → 语义假设 → 因果干预 → 行为读出 → 外部验证”，而不是“看到可解释激活 → 宣称找到了概念”。' },
    ],
    checkpoint: { question: '一个 SAE 同时获得较低重构误差和较高稀疏度，最稳妥的结论是什么？', hint: '先区分表示代理指标与行为机制。', options: ['它已恢复模型真实且唯一的概念', '它在当前数据上获得了更好的稀疏—重构权衡', '每个特征都具有单一稳定语义', '干预这些特征一定只改变目标行为'], correctIndex: 1, answer: '这说明 SAE 在当前激活数据与评测设定下取得了更好的稀疏—重构权衡。要证明语义稳定、因果使用或机制完整性，还需要独立样本、干预、对照和下游行为评测。' },
    takeaways: ['SAE 学到的是候选特征字典', '代理指标用于筛选表示而非证明机制', '特征解释必须经过行为干预与外部验证'], resourceIds: ['sae-scaling', 'saebench', 'subspace-sae-2026'],
  },
  {
    id: 'circuit-tracing', moduleId: 'interpretability', order: '12.3', title: 'Circuit Tracing 与 Attribution Graph', eyebrow: 'REPLACE → TRACE → INTERVENE', duration: '35 分钟', level: '基础',
    summary: '从 attention map 走向跨层计算路径，并理解 attribution graph 为什么是机制假设而不是最终真相。',
    goals: ['区分 attention visualization 与 circuit tracing', '解释 replacement model 和 attribution edge', '设计能验证候选电路的干预'],
    sections: [
      { title: '电路问题问的是计算如何组合', lead: '单个注意力头的热力图只显示权重，不等于信息被如何读取、变换并影响输出。', bullets: ['节点可以是 token、feature、attention head 或输出 logit', '边描述在给定输入附近的直接影响或归因', '路径连接跨层的读取、转换与写回', '电路通常是 prompt-specific，不自动成为模型全局算法'] },
      { title: '稀疏替代模型让路径可追踪', lead: 'Cross-layer transcoder 用更稀疏的候选特征近似原模型中的 MLP 计算。', paragraphs: ['Circuit Tracing 先建立近似 replacement model，再在单个 prompt 附近线性化或分解局部影响，生成 attribution graph。这样能把密集计算压缩成可浏览的候选路径。'], bullets: ['先报告替代模型对原输出与中间激活的保真度', '记录筛边阈值和未展示的残余影响', '区分“图中没有”与“原模型没有”', '同一路径在改写 prompt 后可能重组'], callout: 'Attribution graph 的节点和边来自分析表示与近似规则；它不是从模型内部直接读出的唯一因果图。' },
      { title: '用干预验证路径，而不是用故事补齐路径', lead: '候选路径应预测删除、替换或增强某个节点后的行为变化。', bullets: ['逐节点或逐路径 ablation，检查目标 logit / 行为变化', '用 patching 测试源信息是否沿候选路径传递', '加入相同幅度的非路径节点与随机路径对照', '检查通用能力损伤、冗余路径和补偿效应'] },
    ],
    checkpoint: { question: 'Attribution graph 中没有出现某条看似重要的计算，最准确的解释是什么？', hint: '图依赖近似模型、局部输入与筛边规则。', options: ['原模型一定没有这条计算', '模型拒绝暴露内部机制', '它可能未被 replacement model 捕获或被当前阈值省略', '只要增加颜色就能恢复'], correctIndex: 2, answer: '缺失可能来自替代模型重构误差、局部线性近似、特征基底或筛边阈值。因此应检查保真度、残余影响，并通过直接干预测试原模型，而不是把“图中未显示”当成机制不存在。' },
    takeaways: ['Attention map 不是完整计算路径', 'Attribution graph 是近似模型上的候选机制', '路径主张需要在原模型行为上接受干预验证'], resourceIds: ['circuit-tracing', 'mib', 'mi-axioms'],
  },
  {
    id: 'interpretability-benchmarks', moduleId: 'interpretability', order: '12.4', title: '如何评测一个可解释性方法', eyebrow: 'PROXY → CAUSAL TASK → TRANSFER', duration: '30 分钟', level: '基础',
    summary: '用 SAEBench、MIB 与机制验证标准，把“看起来可解释”拆成表示质量、因果恢复和外部迁移。',
    goals: ['识别常见代理指标测到什么', '比较 feature 与 circuit benchmark', '为方法写出可证伪的验证矩阵'],
    sections: [
      { title: '第一层：表示代理指标', lead: '重构误差、稀疏度和自动解释分数便于大规模筛选，但不会直接回答模型如何计算。', bullets: ['Reconstruction：多少原激活信息被保留', 'Sparsity：每个样本用了多少候选特征', 'Feature density：特征是否死亡或过度频繁', 'Automated explanation：样本能否被文本标签概括'] },
      { title: '第二层：任务内因果恢复', lead: 'MIB 把目标改成恢复已知或可检验的因果变量与计算路径。', bullets: ['Circuit localization：能否精确且简洁地找出相关组件', 'Causal variable：干预表示能否按预期改变行为', 'SAEBench：同一 SAE 在多种代理与下游指标中是否稳定', '不同任务赢家不同，单一排行榜不足以概括方法质量'], callout: 'MIB 中 SAE 特征未优于神经元，是对当前任务集合的结果；它否定的是“SAE 必然更好”的捷径，不是所有 SAE 用途。' },
      { title: '第三层：验证解释能否组合与迁移', lead: '一个解释要同时说明局部近似、组件组合和换样本后的失效方式。', bullets: ['忠实度：解释预测的干预结果是否发生', '简洁度：是否包含大量无关组件', '组合性：局部解释能否组成整体行为', '外部效度：跨 prompt、任务、模型是否仍成立', '成本：需要多少标注、训练和模型访问'] },
    ],
    checkpoint: { question: '某 SAE 在重构与自动解释分数上都领先，可以直接称为最佳机制解释方法吗？', hint: '比较代理表现与因果任务表现。', options: ['可以，两个分数已经足够', '不可以，还需因果恢复、干预验证与迁移评测', '可以，只要字典更宽', '不可以，因为 SAE 没有任何价值'], correctIndex: 1, answer: '不能。它在两个代理指标上更强，但机制主张还需要任务内因果恢复、原模型干预和跨样本迁移。更合理的说法是“当前代理前沿更优，机制效用尚待验证”。' },
    takeaways: ['代理指标用于筛选，不直接证明机制', 'Feature 与 circuit 需要不同但相连的任务评测', '方法结论必须绑定任务、基底、模型与成本'], resourceIds: ['saebench', 'mib', 'mi-axioms'],
  },
  {
    id: 'cot-faithfulness-monitorability', moduleId: 'interpretability', order: '12.5', title: 'CoT Faithfulness 与 Monitorability', eyebrow: 'SAYING → CAUSE → SIGNAL', duration: '30 分钟', level: '基础',
    summary: '区分“推理文本是否忠实反映原因”与“推理文本是否暴露可检测信号”，避免把 CoT 当成内部思维录像。',
    goals: ['区分 faithfulness 与 monitorability', '解释当前实验结果支持什么', '把 CoT 监控与机制分析正确组合'],
    sections: [
      { title: '两个问题不能混为一个指标', lead: 'Faithfulness 问 CoT 是否说明真正影响答案的因素；monitorability 问观察者能否从 CoT 发现关心的行为。', bullets: ['CoT 可能不忠实，但仍泄露可监控线索', 'CoT 可能语言流畅，却省略关键影响因素', '最终答案正确不保证文字理由正确', '内部机制证据也不能仅由 CoT 自述得到'] },
      { title: '当前结果说明信号有用，但并不完整', lead: 'Anthropic 在隐藏提示任务中观察到，模型经常使用提示却不主动承认。', paragraphs: ['报告中的平均提示披露率约为 Claude 3.7 Sonnet 25%、DeepSeek R1 39%；reward-hacking 线索在部分设置中的主动说明率甚至低于 2%。这些数字是特定模型、提示和选择题设置的测量，不是自然任务中的固定常数。'], bullets: ['把实验条件和模型版本与数字一起报告', '区分模型是否使用线索、是否答对、是否在 CoT 中披露', '不要把一次不披露直接解释为有意欺骗'] },
      { title: 'Monitorability 是额外观测面', lead: 'OpenAI 的 13 类评测、24 个环境显示，CoT 通常比只看动作或输出提供更多检测信号。', bullets: ['较长推理在当前评测中往往更可监控', '能力优化可能带来 monitorability tax', '当前规模的 RL 未显示显著损害，但不保证未来尺度', '更真实行为、评测察觉与低频风险仍是开放问题'], callout: '实务上组合三层：输出/动作监控 + CoT 监控 + 内部机制分析；三者证据不同，不能互相冒充。' },
    ],
    checkpoint: { question: '一个 CoT monitor 成功识别了危险行为，能否证明 CoT 忠实记录了模型内部原因？', hint: 'Monitorability 与 faithfulness 回答不同问题。', options: ['能，检测成功等于完全忠实', '不能；它只证明当前文本包含可检测信号', '能，只要 CoT 足够长', '不能，因为 CoT 永远没有信息'], correctIndex: 1, answer: '不能。检测成功说明 CoT 包含与目标行为相关的可用信号，但不证明它完整或忠实地记录了内部因果过程。Faithfulness 需要独立设计的因果或信息披露实验。' },
    takeaways: ['CoT 不是内部思维录像', 'Faithfulness 与 monitorability 是不同坐标', 'CoT 监控应与行为和内部机制证据组合'], resourceIds: ['cot-faithfulness', 'cot-monitorability', 'circuit-tracing'],
  },
  {
    id: 'project-evidence-story', moduleId: 'project', order: '13.1', title: '把项目整理成可追问的证据链', eyebrow: 'QUESTION → DECISION → EVIDENCE', duration: '25 分钟', level: '基础',
    summary: '用问题、基线、决策、结果和边界组织项目，而不是按开发时间流水账复述。',
    goals: ['用一分钟定义项目问题和指标', '解释关键方案选择与替代项', '准备结果、成本、失败案例和个人贡献'],
    sections: [
      { title: '先讲问题，不先讲框架', lead: '面试官需要知道谁遇到了什么问题，以及什么结果才算改善。', bullets: ['用户、输入、输出和使用场景', '离线指标、线上目标和错误成本', '最简单 baseline 与当前瓶颈', '你负责的决策和交付边界'] },
      { title: '每个关键选择都要有替代方案', lead: '“用了某框架”不是技术决策。', bullets: ['为什么选择 RAG、微调、工作流或 Agent', '比较数据、计算、延迟、质量和维护成本', '说明实验控制、消融和未匹配因素', '保留失败方案和改变方向的证据'] },
      { title: '结果要能经受连续追问', lead: '准备一张指标表、一张成本表、三个 badcase 和一个系统图。', bullets: ['报告样本量、方差和评测边界', '区分整体系统收益与核心组件归因', '说明下一步以及何时不值得继续优化', '把十分钟讲解压缩成一分钟和三分钟版本'], callout: '最有说服力的项目不是没有失败，而是能证明每次决策如何由证据推动。' },
    ],
    checkpoint: { question: '项目效果优于 baseline，但计算成本也是两倍，应该怎样表达？', hint: '同时报告效果与资源，并限制归因。', options: ['只报告效果提升', '隐藏最强 baseline', '同时报告成本与效果，并提供预算匹配对照或限定结论', '直接宣称核心模块有效'], correctIndex: 2, answer: '应同时报告质量、延迟和成本；尽量加入计算或调用预算匹配的 baseline。若无法匹配，就把结论限定为当前整体系统配置的收益，不把差异全部归因于核心模块。' },
    takeaways: ['项目叙事从问题和成功标准开始', '技术选择必须能与替代方案比较', '结果、成本、失败和结论边界共同构成证据链'],
  },
];

export function lessonsForModule(moduleId: string) {
  return foundationLessons.filter((lesson) => lesson.moduleId === moduleId);
}
