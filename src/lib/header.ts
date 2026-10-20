// 头部交互统一入口：主题切换 / 内嵌搜索 / 导航选中药丸 / 内容入场动画。
// 之所以拆成模块、由 BaseLayout 中「会打包的 prefetch 脚本」import 调用，
// 是因为本项目里 Astro 对组件内的普通 <script> 经常静默不打包（prefetch 这种含外部 import 的脚本才会可靠进包）。

type SearchItem = {
  title: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
  type: string;
  date: string;
};

export function initHeader(): void {
  // ---------- 内容入场：每次 astro:page-load 给 #main 重放 .is-entering ----------
  const entranceMain = () => {
    const main = document.getElementById('main');
    if (!main) return;
    main.classList.remove('is-entering');
    void main.offsetWidth; // 强制重排以重放动画
    main.classList.add('is-entering');
  };

  // ---------- 主题切换：从点击处圆形展开 ----------
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', (e) => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sf-theme', next); } catch (err) {}
    };

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduced) {
      apply();
      return;
    }

    const { clientX: x, clientY: y } = e as MouseEvent;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = doc.startViewTransition(apply);
    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: 'cubic-bezier(0.5, 0, 0.9, 0.35)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  });

  // ---------- 内嵌搜索 ----------
  const SEARCH_INDEX: SearchItem[] = (() => {
    try {
      return JSON.parse(document.getElementById('search-data')?.textContent || '[]');
    } catch {
      return [];
    }
  })();
  const box = document.getElementById('search-box');
  const searchToggle = document.getElementById('search-toggle');
  const input = document.getElementById('site-search') as HTMLInputElement | null;
  const pop = document.getElementById('search-pop');
  const results = document.getElementById('search-results');
  const empty = document.getElementById('search-empty');

  const openSearch = () => {
    box?.classList.add('is-open');
    searchToggle?.setAttribute('aria-expanded', 'true');
    setTimeout(() => input?.focus(), 120);
  };
  const closeSearch = () => {
    box?.classList.remove('is-open');
    searchToggle?.setAttribute('aria-expanded', 'false');
    if (input) input.value = '';
    results?.setAttribute('hidden', '');
    empty?.setAttribute('hidden', '');
    pop?.setAttribute('hidden', '');
  };

  searchToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!box?.classList.contains('is-open')) openSearch();
    else if (input && !input.value.trim()) closeSearch();
    else input?.focus();
  });
  document.addEventListener('click', (e) => {
    if (box?.classList.contains('is-open') && !box.contains(e.target as Node)) closeSearch();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && box?.classList.contains('is-open')) closeSearch();
  });

  const render = (q: string) => {
    if (!results || !empty || !pop) return;
    const query = q.trim().toLowerCase();
    if (!query) {
      results.setAttribute('hidden', '');
      empty.setAttribute('hidden', '');
      pop.setAttribute('hidden', '');
      return;
    }
    const hits = SEARCH_INDEX.filter((it) => {
      const hay = (
        it.title + ' ' + it.description + ' ' + it.tags.join(' ') + ' ' + it.category + ' ' + it.type
      ).toLowerCase();
      return hay.includes(query);
    }).slice(0, 8);
    results.innerHTML = hits
      .map((it) => {
        const meta = [it.type, it.category, it.date].filter(Boolean).join(' · ');
        return `<li><a href="${it.url}"><span class="search-results__title">${it.title}</span><span class="search-results__meta">${meta}</span></a></li>`;
      })
      .join('');
    pop.removeAttribute('hidden');
    results.removeAttribute('hidden');
    empty.toggleAttribute('hidden', hits.length > 0);
  };
  input?.addEventListener('input', () => render(input.value));

  // ---------- 导航选中药丸：随 .is-active 平滑滑动到当前项 ----------
  const moveIndicator = () => {
    const nav = document.querySelector('.nav');
    const indicator = nav?.querySelector<HTMLElement>('.nav__indicator');
    const active = nav?.querySelector<HTMLElement>('.nav__link.is-active');
    if (!nav || !indicator) return;
    if (!active) {
      indicator.style.opacity = '0';
      indicator.style.width = '0px';
      return;
    }
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = `translateY(-50%) translateX(${active.offsetLeft}px)`;
    indicator.style.opacity = '1';
  };

  const syncHeader = () => {
    const path = location.pathname;
    document.querySelectorAll<HTMLAnchorElement>('.nav__link').forEach((a) => {
      const href = a.getAttribute('href') ?? '';
      const active = href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
      a.classList.toggle('is-active', active);
    });
    closeSearch();
    moveIndicator();
  };

  document.addEventListener('astro:page-load', () => {
    syncHeader();
    entranceMain();
  });

  // 首次加载与字体就绪后定位药丸（字体加载会改变链接宽度）
  syncHeader();
  entranceMain();
  window.addEventListener('resize', moveIndicator);
  if (document.fonts?.ready) document.fonts.ready.then(moveIndicator);
}
