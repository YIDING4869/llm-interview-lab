# LLM Interview Lab

面向 LLM、Agent、后训练与推理岗位的互动面试学习实验室。它既服务有机器学习背景的求职者，也为零基础和软件工程转 LLM 的学习者提供明确入口。

**在线体验：** [yiding4869.github.io/llm-interview-lab](https://yiding4869.github.io/llm-interview-lab/)

## 当前内容

- 零基础、软件工程转码、ML 背景三条起步路线
- 从编程基础到推理模型、多模态、系统设计与机制研究的 16 个知识模块
- 覆盖全部 16 个模块的 27 节站内主干课与章节检查题
- 每个模块的前置知识、核心概念、学习产物和面试能力
- 24 道模块检查题与递进追问题，包含动手任务和复盘提示
- 使用浏览器本地存储的四步学习进度：理解、作答、动手、复盘
- 可按阶段、人群和关键词筛选的课程、教程、博客与论文资源库
- 六条岗位方向，用于主干知识完成后的进一步选择
- 带答案结构和追问的精选面试题
- Shape、梯度、Tokenizer、Attention、完整 Transformer Forward、Sampling、KV Cache 与 RAG 八项可视化实验
- 可统一导出、备份和恢复课程进度、模块作答与全部 Notes
- 13 份可追溯公开面试流程与 52 道改写真题，支持待练队列、90 秒独立复答、岗位回答主线、版本比较与四项自评
- 响应式布局和 PWA manifest

## 信息架构

- `/`：项目首页、岗位方向、题库、可视化实验和 Notes
- `/learn/`：三类学习入口、分阶段计划和完整 LLM 知识树
- `/lessons/`：覆盖 16 个模块的站内课程、检查题与学习连接
- `/lessons/[lessonId]/`：可分享、可搜索的独立课程正文
- `/questions/`：支持关键词、分类与难度筛选的完整题库
- `/questions/[questionId]/`：可分享、可搜索的独立题目与答案结构
- `/practice/`：模块学习闭环、路线进度、检查题、动手任务和 Notes
- `/progress/`：汇总当前设备的课程、作答、模块闭环与最近学习记录
- `/interviews/`：可搜索、按方向筛选并限时作答的真题训练器，以及国内公开面经摘要、来源边界与岗位追问模式
- `/interviews/[recordId]/`：保留来源、流程和结论边界的独立面经页
- `/labs/`：八项可调节的机制与系统实验
- `/resources/`：可筛选的学习资料与每份资料对应的建议产物

课程数据集中维护在 `data/curriculum.ts`，模块练习维护在 `data/practice.ts`，公共导航与页脚位于 `components/`，页面交互分别保留在对应的 `app/` 路由目录。新增模块、题目或资料时，优先修改结构化数据，而不是在页面中重复写卡片。

## 本地开发

```bash
npm install
npm run dev
```

## 发布

仓库包含 GitHub Pages 工作流。将代码推送到 `main` 并在仓库设置中选择 GitHub Actions 作为 Pages 发布源后，网站会发布到：

`https://yiding4869.github.io/llm-interview-lab/`

## 推广链接与最小事件

建议把不同渠道都指向“3 分钟体验”，并使用独立 UTM：

- 知乎：`https://yiding4869.github.io/llm-interview-lab/practice/?module=transformer&quickstart=1&utm_source=zhihu&utm_medium=content&utm_campaign=launch_2026&utm_content=transformer_article#answer`
- 牛客：`https://yiding4869.github.io/llm-interview-lab/practice/?module=transformer&quickstart=1&utm_source=nowcoder&utm_medium=community&utm_campaign=launch_2026&utm_content=interview_post#answer`
- B 站：`https://yiding4869.github.io/llm-interview-lab/practice/?module=transformer&quickstart=1&utm_source=bilibili&utm_medium=video&utm_campaign=launch_2026&utm_content=transformer_demo#answer`
- 小红书：`https://yiding4869.github.io/llm-interview-lab/practice/?module=transformer&quickstart=1&utm_source=xiaohongshu&utm_medium=social&utm_campaign=launch_2026&utm_content=roadmap_cards#answer`

站内会生成四个不包含答案正文的最小事件：`site_enter`、`practice_start`、`practice_complete`、`lab_open`。在未配置集中分析服务时，最近 100 条事件保存在浏览器的 `llm-interview-lab-events-v1` 本地记录中；配置 Google Analytics 后，同一批事件会自动上报。

本地构建可在 `.env` 中设置 `NEXT_PUBLIC_GA_MEASUREMENT_ID`。GitHub Pages 使用仓库变量 `GA_MEASUREMENT_ID`，无需把公开 Measurement ID 写进源码。
