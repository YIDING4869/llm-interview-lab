'use client';

import { useEffect, useState } from 'react';
import { captureAttribution } from '../lib/analytics';

const issueBase = 'https://github.com/YIDING4869/llm-interview-lab/issues/new';

export function FeedbackLink() {
  const [href, setHref] = useState(issueBase);

  useEffect(() => {
    const attribution = captureAttribution();
    const campaign = [attribution.utm_source, attribution.utm_medium, attribution.utm_campaign].filter(Boolean).join(' / ') || '直接访问';
    const body = [
      '感谢你帮助改进 LLM Interview Lab。',
      '',
      `页面：${window.location.href}`,
      `渠道：${campaign}`,
      '',
      '我遇到的问题或建议：',
      '',
      '- ',
      '',
      '我的背景（可选）：零基础 / 转码 / ML 背景',
    ].join('\n');
    const params = new URLSearchParams({ title: '[反馈] ', body, labels: 'feedback' });
    queueMicrotask(() => setHref(`${issueBase}?${params.toString()}`));
  }, []);

  return <a className="feedback-fab" href={href} target="_blank" rel="noreferrer" aria-label="提交网站反馈">反馈建议 <span>↗</span></a>;
}
