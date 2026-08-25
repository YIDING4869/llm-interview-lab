import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://yiding4869.github.io/llm-interview-lab/';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'LLM Interview Lab — 把知识练成答案',
  description: '面向 LLM、Agent、后训练与推理岗位的互动面试学习实验室。',
  manifest: 'manifest.webmanifest',
  icons: {
    icon: [{ url: 'icon-192.png', type: 'image/png' }],
    apple: [{ url: 'icon-192.png', type: 'image/png' }],
  },
  openGraph: {
    title: 'LLM Interview Lab',
    description: '把知识练成面试时能讲清楚的答案。',
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    images: [{ url: 'og.png', width: 1200, height: 630, alt: 'LLM Interview Lab' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLM Interview Lab',
    description: '把知识练成面试时能讲清楚的答案。',
    images: ['og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
