import type { Metadata } from 'next';
import { AnalyticsBootstrap } from '../components/AnalyticsBootstrap';
import './globals.css';

const siteUrl = 'https://yiding4869.github.io/llm-interview-lab/';
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'LLM Interview Lab — 中文大模型面试学习与可视化',
  description: '从零到一学习 LLM：基础课程、面试题、国内面经、Transformer 可视化实验、前沿论文与个人 Notes。',
  manifest: 'manifest.webmanifest',
  icons: {
    icon: [{ url: 'icon-192.png', type: 'image/png' }],
    apple: [{ url: 'icon-192.png', type: 'image/png' }],
  },
  openGraph: {
    title: 'LLM Interview Lab',
    description: '从零到一学习 LLM：基础课程、面试题、国内面经、可视化实验与前沿论文。',
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    images: [{ url: 'og.png', width: 1200, height: 630, alt: 'LLM Interview Lab' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLM Interview Lab',
    description: '从零到一学习 LLM：基础课程、面试题、国内面经、可视化实验与前沿论文。',
    images: ['og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        {gaMeasurementId && <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} />}
        {gaMeasurementId && <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(gaMeasurementId)});` }} />}
      </head>
      <body><AnalyticsBootstrap />{children}</body>
    </html>
  );
}
