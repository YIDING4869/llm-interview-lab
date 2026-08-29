'use client';

import { useState } from 'react';
import { sitePath } from '../lib/site-path';

type SiteHeaderProps = {
  active?: 'home' | 'learn' | 'lessons' | 'practice' | 'questions' | 'progress' | 'interviews' | 'mock' | 'labs' | 'resources';
};

export function SiteHeader({ active = 'home' }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const quickstartHref = sitePath('/practice/?module=transformer&quickstart=1#answer');
  const links = [
    { id: 'learn', label: '学习地图', href: sitePath('/learn/') },
    { id: 'lessons', label: '基础课', href: sitePath('/lessons/') },
    { id: 'practice', label: '学习闭环', href: sitePath('/practice/') },
    { id: 'progress', label: '我的进度', href: sitePath('/progress/') },
    { id: 'questions', label: '面试题', href: sitePath('/questions/') },
    { id: 'interviews', label: '国内面经', href: sitePath('/interviews/') },
    { id: 'mock', label: '模拟面试', href: sitePath('/mock/') },
    { id: 'labs', label: '可视化', href: sitePath('/labs/') },
    { id: 'resources', label: '资源库', href: sitePath('/resources/') },
  ];

  return (
    <nav className={`topbar${menuOpen ? ' menu-open' : ''}`} aria-label="主导航">
      <a className="brand" href={sitePath('/')} aria-label="LLM Interview Lab 首页">
        <span className="brand-mark">L</span>
        <span>LLM Interview Lab</span>
      </a>
      <div className="nav-links">
        {links.map((link) => (
          <a className={active === link.id ? 'is-active' : ''} href={link.href} key={link.id}>{link.label}</a>
        ))}
      </div>
      <a className="nav-cta" href={quickstartHref}>3 分钟体验 <span>↗</span></a>
      <button
        className="nav-menu-button"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
      </button>
      <div className="mobile-nav-panel" id="mobile-navigation">
        {links.map((link, index) => (
          <a className={active === link.id ? 'is-active' : ''} href={link.href} key={link.id} onClick={() => setMenuOpen(false)}>
            <span>{String(index + 1).padStart(2, '0')}</span>{link.label}
          </a>
        ))}
        <a className="mobile-nav-cta" href={quickstartHref} onClick={() => setMenuOpen(false)}>3 分钟开始体验 <span>→</span></a>
      </div>
    </nav>
  );
}
