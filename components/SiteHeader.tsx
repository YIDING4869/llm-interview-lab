import { sitePath } from '../lib/site-path';

type SiteHeaderProps = {
  active?: 'home' | 'learn' | 'practice' | 'resources';
};

export function SiteHeader({ active = 'home' }: SiteHeaderProps) {
  const links = [
    { id: 'learn', label: '学习地图', href: sitePath('/learn/') },
    { id: 'practice', label: '学习闭环', href: sitePath('/practice/') },
    { id: 'questions', label: '面试题', href: sitePath('/#question-bank') },
    { id: 'labs', label: '可视化', href: sitePath('/#labs') },
    { id: 'resources', label: '资源库', href: sitePath('/resources/') },
    { id: 'notes', label: 'Notes', href: sitePath('/#notes') },
  ];

  return (
    <nav className="topbar" aria-label="主导航">
      <a className="brand" href={sitePath('/')} aria-label="LLM Interview Lab 首页">
        <span className="brand-mark">L</span>
        <span>LLM Interview Lab</span>
      </a>
      <div className="nav-links">
        {links.map((link) => (
          <a className={active === link.id ? 'is-active' : ''} href={link.href} key={link.id}>{link.label}</a>
        ))}
      </div>
      <a className="nav-cta" href={sitePath('/practice/')}>继续学习 <span>↗</span></a>
    </nav>
  );
}
