import { sitePath } from '../lib/site-path';

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-brand"><span className="brand-mark">L</span><strong>LLM Interview Lab</strong></div>
      <p>Learn deeply. Explain clearly. Defend your decisions.</p>
      <a href={sitePath('/')}>返回首页 ↑</a>
    </footer>
  );
}
